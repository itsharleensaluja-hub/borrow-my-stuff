import { afterAll, beforeAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createApp } from "../index.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Gig from "../models/Gig.js";

const config = {
  port: 0,
  mongoUri: "",
  jwtSecret: "test-secret-that-is-long-enough-123456",
  clientUrl: "http://localhost:5173",
  nodeEnv: "test",
  cookieSecure: false,
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
    expect(outsider.status).toBe(404);
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
