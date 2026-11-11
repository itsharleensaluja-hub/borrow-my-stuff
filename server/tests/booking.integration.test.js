import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createApp } from "../index.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Booking from "../models/Booking.js";

const runIntegration = Boolean(process.env.TEST_MONGO_URI);

describe.skipIf(!runIntegration)("booking concurrency integration", () => {
  const config = {
    port: 0,
    mongoUri: process.env.TEST_MONGO_URI,
    jwtSecret: "test-secret-that-is-long-enough-123456",
    clientUrl: "http://localhost:5173",
    nodeEnv: "test",
    cookieSecure: false,
  };
  const app = createApp(config);
  let owner;
  let borrower;
  let item;

  beforeAll(async () => {
    process.env.JWT_SECRET = config.jwtSecret;
    await mongoose.connect(config.mongoUri);
    owner = await User.create({
      name: "Owner",
      email: "owner@vitap.ac.in",
      password: "password123",
    });
    borrower = await User.create({
      name: "Borrower",
      email: "borrower@vitap.ac.in",
      password: "password123",
    });
    item = await Item.create({
      title: "Test calculator",
      description: "Test item",
      category: "Electronics",
      type: "borrow",
      price: 10,
      owner: owner._id,
    });
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await Item.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it("allows only one concurrent booking", async () => {
    const token = jwt.sign({ id: borrower._id }, config.jwtSecret);
    const body = {
      itemId: item._id.toString(),
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    };
    const responses = await Promise.all([
      request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(body),
      request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(body),
    ]);
    expect(
      responses.filter((response) => response.status === 201),
    ).toHaveLength(1);
    expect(
      responses.filter((response) => response.status === 409),
    ).toHaveLength(1);
  });
});
