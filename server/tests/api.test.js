import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../index.js";

const config = {
  port: 0,
  mongoUri: "mongodb://127.0.0.1:27017/borrowbox-test",
  jwtSecret: "test-secret-that-is-long-enough-123456",
  clientUrl: "http://localhost:5173/",
  nodeEnv: "test",
  cookieSecure: false,
};

describe("API shell", () => {
  it("normalizes the configured CORS origin", async () => {
    const response = await request(createApp(config))
      .options("/api/auth/register")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not emit a trailing slash in production CORS responses", async () => {
    const response = await request(
      createApp({
        ...config,
        clientUrl: "https://borrow-my-stuff.vercel.app/",
        nodeEnv: "production",
        cookieSecure: true,
      }),
    )
      .options("/api/auth/me")
      .set("Origin", "https://borrow-my-stuff.vercel.app")
      .set("Access-Control-Request-Method", "GET");
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://borrow-my-stuff.vercel.app",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("reports the API as running", async () => {
    const response = await request(createApp(config)).get("/");
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("API is running");
  });

  it("returns a consistent 404 response", async () => {
    const response = await request(createApp(config)).get("/missing");
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, code: "NOT_FOUND" });
  });
});
