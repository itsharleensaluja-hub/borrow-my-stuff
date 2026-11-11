import { afterAll, beforeAll, afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createApp } from "../index.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Gig from "../models/Gig.js";
import Booking from "../models/Booking.js";
import { uploadDirectory } from "../middleware/uploadMiddleware.js";

const config = {
  port: 0,
  mongoUri: "",
  jwtSecret: "test-secret-that-is-long-enough-123456",
  clientUrl: "http://localhost:5173",
  nodeEnv: "test",
  cookieSecure: false,
  authRateLimit: 1000,
};

describe("workflow integration", () => {
  let replSet;
  let app;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
      binary: { version: "6.0.14" },
      replSet: { count: 1 },
    });
    config.mongoUri = replSet.getUri();
    await mongoose.connect(config.mongoUri);
    app = createApp(config);
  }, 300000);

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Gig.deleteMany({}),
      Booking.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (replSet) await replSet.stop();
  }, 120000);

  it("registers and logs in only with a domain-restricted email", async () => {
    const invalid = await request(app).post("/api/auth/register").send({
      name: "Outside",
      email: "outside@example.com",
      password: "password123",
    });
    expect(invalid.status).toBe(400);

    const registered = await request(app).post("/api/auth/register").send({
      name: "Student",
      email: "student@vitap.ac.in",
      password: "password123",
    });
    expect(registered.status).toBe(201);

    const loggedIn = await request(app).post("/api/auth/login").send({
      email: "student@vitap.ac.in",
      password: "password123",
    });
    expect(loggedIn.status).toBe(200);
    expect(loggedIn.headers["set-cookie"]).toBeDefined();
  });

  it("rejects lookalike domains and reports duplicate accounts clearly", async () => {
    const lookalike = await request(app).post("/api/auth/register").send({
      name: "Lookalike",
      email: "student@notvitap.ac.in",
      password: "password123",
    });
    expect(lookalike.status).toBe(400);
    expect(lookalike.body.code).toBe("COLLEGE_EMAIL_REQUIRED");

    await request(app).post("/api/auth/register").send({
      name: "Existing",
      email: "existing@vitap.ac.in",
      password: "password123",
    });
    const duplicate = await request(app).post("/api/auth/register").send({
      name: "Existing Again",
      email: " EXISTING@VITAP.AC.IN ",
      password: "password123",
    });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.code).toBe("USER_EXISTS");
  });

  it("rejects cookie-authenticated mutations without CSRF", async () => {
    const user = await User.create({
      name: "Student",
      email: "student@vitap.ac.in",
      password: "password123",
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "password123" });
    const response = await request(app)
      .put("/api/auth/roles")
      .set("Cookie", login.headers["set-cookie"])
      .send({ roles: ["lender"] });
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: "CSRF_FAILED",
    });
  });

  it("allows only one borrower to win a concurrent booking", async () => {
    const [owner, borrowerOne, borrowerTwo] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "One",
        email: "one@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Two",
        email: "two@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Calculator",
      description: "Useful",
      category: "Electronics",
      type: "borrow",
      price: 10,
      owner: owner._id,
    });
    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 2 * 86400000).toISOString();
    const responses = await Promise.all(
      [borrowerOne, borrowerTwo].map(async (borrower) => {
        const tokenResponse = await request(app)
          .post("/api/auth/login")
          .send({ email: borrower.email, password: "password123" });
        return request(app)
          .post("/api/bookings")
          .set("Cookie", tokenResponse.headers["set-cookie"])
          .set(
            "X-CSRF-Token",
            tokenResponse.headers["set-cookie"]
              .find((value) => value.startsWith("borrowbox_csrf="))
              ?.split("=")[1]
              ?.split(";")[0] || "",
          )
          .send({ itemId: item._id, startDate: start, endDate: end });
      }),
    );
    expect(
      responses.filter((response) => response.status === 201),
    ).toHaveLength(1);
    expect(await mongoose.model("Booking").countDocuments({ item: item._id })).toBe(1);
  });

  it("allows non-overlapping booking dates while rejecting overlaps", async () => {
    const [owner, firstBorrower, secondBorrower] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner-dates@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "First",
        email: "first-dates@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Second",
        email: "second-dates@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Projector",
      description: "Useful",
      category: "Electronics",
      type: "borrow",
      price: 10,
      owner: owner._id,
    });

    const authenticate = async (user) => {
      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "password123" });
      return {
        cookie: login.headers["set-cookie"],
        csrf: login.headers["set-cookie"]
          .find((value) => value.startsWith("borrowbox_csrf="))
          ?.split("=")[1]
          ?.split(";")[0] || "",
      };
    };
    const [firstAuth, secondAuth] = await Promise.all([
      authenticate(firstBorrower),
      authenticate(secondBorrower),
    ]);
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(0, 0, 0, 0);
    const firstEnd = new Date(start);
    firstEnd.setDate(firstEnd.getDate() + 2);
    const secondStart = new Date(firstEnd);
    secondStart.setDate(secondStart.getDate() + 2);
    const secondEnd = new Date(secondStart);
    secondEnd.setDate(secondEnd.getDate() + 2);

    const firstBooking = await request(app)
      .post("/api/bookings")
      .set("Cookie", firstAuth.cookie)
      .set("X-CSRF-Token", firstAuth.csrf)
      .send({
        itemId: item._id,
        startDate: start.toISOString(),
        endDate: firstEnd.toISOString(),
      });
    const secondBooking = await request(app)
      .post("/api/bookings")
      .set("Cookie", secondAuth.cookie)
      .set("X-CSRF-Token", secondAuth.csrf)
      .send({
        itemId: item._id,
        startDate: secondStart.toISOString(),
        endDate: secondEnd.toISOString(),
      });
    expect(firstBooking.status).toBe(201);
    expect(secondBooking.status).toBe(201);

    const overlap = await request(app)
      .post("/api/bookings")
      .set("Cookie", secondAuth.cookie)
      .set("X-CSRF-Token", secondAuth.csrf)
      .send({
        itemId: item._id,
        startDate: start.toISOString(),
        endDate: firstEnd.toISOString(),
      });
    expect(overlap.status).toBe(409);
    expect(overlap.body.code).toBe("BOOKING_DATE_CONFLICT");
  });

  it("rejects same-day booking dates", async () => {
    const [owner, borrower] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner-sameday@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Borrower",
        email: "borrower-sameday@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Notebook",
      description: "Useful",
      category: "Books",
      type: "borrow",
      price: 5,
      owner: owner._id,
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: borrower.email, password: "password123" });
    const csrf = login.headers["set-cookie"]
      .find((value) => value.startsWith("borrowbox_csrf="))
      ?.split("=")[1]
      ?.split(";")[0] || "";
    const date = new Date(Date.now() + 86400000).toISOString();
    const response = await request(app)
      .post("/api/bookings")
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .send({ itemId: item._id, startDate: date, endDate: date });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_DATE_RANGE");
  });

  it("calculates hourly pricing from full date-only calendar days", async () => {
    const [owner, borrower] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner-hourly@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Borrower",
        email: "borrower-hourly@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Lab kit",
      description: "Useful",
      category: "Other",
      type: "borrow",
      price: 2,
      per: "hour",
      owner: owner._id,
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: borrower.email, password: "password123" });
    const csrf = login.headers["set-cookie"]
      .find((value) => value.startsWith("borrowbox_csrf="))
      ?.split("=")[1]
      ?.split(";")[0] || "";
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 2 * 86400000);
    const response = await request(app)
      .post("/api/bookings")
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .send({
        itemId: item._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    expect(response.status).toBe(201);
    expect(response.body.totalPrice).toBe(96);
  });

  it("prevents deleting an item with an active booking", async () => {
    const [owner, borrower] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner-delete@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Borrower",
        email: "borrower-delete@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Camera",
      description: "Useful",
      category: "Electronics",
      type: "borrow",
      price: 20,
      owner: owner._id,
    });
    const login = async (user) => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "password123" });
      return {
        cookie: response.headers["set-cookie"],
        csrf: response.headers["set-cookie"]
          .find((value) => value.startsWith("borrowbox_csrf="))
          ?.split("=")[1]
          ?.split(";")[0] || "",
      };
    };
    const borrowerAuth = await login(borrower);
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 86400000);
    const booking = await request(app)
      .post("/api/bookings")
      .set("Cookie", borrowerAuth.cookie)
      .set("X-CSRF-Token", borrowerAuth.csrf)
      .send({
        itemId: item._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    expect(booking.status).toBe(201);
    const ownerAuth = await login(owner);
    const deletion = await request(app)
      .delete(`/api/items/${item._id}`)
      .set("Cookie", ownerAuth.cookie)
      .set("X-CSRF-Token", ownerAuth.csrf);
    expect(deletion.status).toBe(409);
    expect(deletion.body.code).toBe("ITEM_HAS_ACTIVE_BOOKINGS");
  });

  it("searches item descriptions and persists multiple roles", async () => {
    const user = await User.create({
      name: "Searcher",
      email: "searcher@vitap.ac.in",
      password: "password123",
    });
    await Item.create({
      title: "Plain title",
      description: "A quiet scientific calculator",
      category: "Electronics",
      type: "borrow",
      price: 10,
      owner: user._id,
    });
    const search = await request(app)
      .get("/api/items")
      .query({ search: "scientific", meta: "true" });
    expect(search.status).toBe(200);
    expect(search.body.items).toHaveLength(1);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "password123" });
    const csrf = login.headers["set-cookie"]
      .find((value) => value.startsWith("borrowbox_csrf="))
      ?.split("=")[1]
      ?.split(";")[0] || "";
    const roles = await request(app)
      .put("/api/auth/roles")
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .send({ roles: ["borrower", "lender"] });
    expect(roles.status).toBe(200);
    expect(roles.body.roles).toEqual(["borrower", "lender"]);
  });

  it("replaces and deletes item images without leaving upload files behind", async () => {
    const owner = await User.create({
      name: "Image owner",
      email: "image-owner@vitap.ac.in",
      password: "password123",
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: owner.email, password: "password123" });
    const csrf = login.headers["set-cookie"]
      .find((value) => value.startsWith("borrowbox_csrf="))
      ?.split("=")[1]
      ?.split(";")[0] || "";
    const create = await request(app)
      .post("/api/items")
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .field("title", "Uploaded book")
      .field("description", "A useful book")
      .field("category", "Books")
      .field("type", "borrow")
      .field("price", "5")
      .field("per", "day")
      .attach("images", Buffer.from("old-image"), {
        filename: "old.jpg",
        contentType: "image/jpeg",
      });
    expect(create.status).toBe(201);
    const oldUrl = create.body.images[0].url;
    const oldPath = `${uploadDirectory}\\${oldUrl.split("/").pop()}`;
    expect(await fs.stat(oldPath)).toBeTruthy();

    const update = await request(app)
      .put(`/api/items/${create.body._id}`)
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .field("title", "Uploaded book updated")
      .attach("images", Buffer.from("new-image"), {
        filename: "new.jpg",
        contentType: "image/jpeg",
      });
    expect(update.status).toBe(200);
    const newUrl = update.body.images[0].url;
    const newPath = `${uploadDirectory}\\${newUrl.split("/").pop()}`;
    await expect(fs.stat(oldPath)).rejects.toThrow();
    expect(await fs.stat(newPath)).toBeTruthy();

    const deletion = await request(app)
      .delete(`/api/items/${create.body._id}`)
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf);
    expect(deletion.status).toBe(200);
    await expect(fs.stat(newPath)).rejects.toThrow();
  });

  it("allows only one user to accept an open gig and enforces ownership", async () => {
    const [poster, first, second] = await Promise.all([
      User.create({
        name: "Poster",
        email: "poster@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "First",
        email: "first@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Second",
        email: "second@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const gig = await Gig.create({
      title: "Deliver notes",
      description: "Please help",
      category: "Delivery",
      budget: 20,
      postedBy: poster._id,
    });
    const auth = async (user) => {
      const loggedIn = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "password123" });
      return {
        cookie: loggedIn.headers["set-cookie"],
        csrf:
          loggedIn.headers["set-cookie"]
            .find((value) => value.startsWith("borrowbox_csrf="))
            ?.split("=")[1]
            ?.split(";")[0] || "",
      };
    };
    const [firstAuth, secondAuth] = await Promise.all([
      auth(first),
      auth(second),
    ]);
    const accepts = await Promise.all(
      [firstAuth, secondAuth].map((session) =>
        request(app)
          .put(`/api/gigs/${gig._id}/accept`)
          .set("Cookie", session.cookie)
          .set("X-CSRF-Token", session.csrf),
      ),
    );
    expect(accepts.filter((response) => response.status === 200)).toHaveLength(
      1,
    );
    expect(accepts.filter((response) => response.status === 409)).toHaveLength(
      1,
    );

    const posterAuth = await auth(poster);
    const complete = await request(app)
      .put(`/api/gigs/${gig._id}/complete`)
      .set("Cookie", posterAuth.cookie)
      .set("X-CSRF-Token", posterAuth.csrf);
    expect(complete.status).toBe(200);
    const outsider = await request(app)
      .put(`/api/gigs/${gig._id}/complete`)
      .set("Cookie", firstAuth.cookie)
      .set("X-CSRF-Token", firstAuth.csrf);
    expect(outsider.status).toBe(403);
  });

  it("completes a gig atomically", async () => {
    const [poster, accepted] = await Promise.all([
      User.create({
        name: "Poster",
        email: "poster-complete@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Accepted",
        email: "accepted-complete@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const gig = await Gig.create({
      title: "Atomic completion",
      description: "Please help",
      category: "Other",
      budget: 10,
      postedBy: poster._id,
      acceptedBy: accepted._id,
      status: "in-progress",
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: poster.email, password: "password123" });
    const csrf = login.headers["set-cookie"]
      .find((value) => value.startsWith("borrowbox_csrf="))
      ?.split("=")[1]
      ?.split(";")[0] || "";
    const completions = await Promise.all(
      [1, 2].map(() =>
        request(app)
          .put(`/api/gigs/${gig._id}/complete`)
          .set("Cookie", login.headers["set-cookie"])
          .set("X-CSRF-Token", csrf),
      ),
    );
    expect(completions.filter((response) => response.status === 200)).toHaveLength(1);
    expect(completions.filter((response) => response.status === 409)).toHaveLength(1);
  });

  it("returns 403 for item ownership failures", async () => {
    const [owner, outsider] = await Promise.all([
      User.create({
        name: "Owner",
        email: "owner@vitap.ac.in",
        password: "password123",
      }),
      User.create({
        name: "Outsider",
        email: "outsider@vitap.ac.in",
        password: "password123",
      }),
    ]);
    const item = await Item.create({
      title: "Book",
      description: "Useful",
      category: "Books",
      type: "borrow",
      price: 5,
      owner: owner._id,
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: outsider.email, password: "password123" });
    const csrf =
      login.headers["set-cookie"]
        .find((value) => value.startsWith("borrowbox_csrf="))
        ?.split("=")[1]
        ?.split(";")[0] || "";
    const response = await request(app)
      .put(`/api/items/${item._id}`)
      .set("Cookie", login.headers["set-cookie"])
      .set("X-CSRF-Token", csrf)
      .send({ title: "Changed" });
    expect(response.status).toBe(403);
  });
});
