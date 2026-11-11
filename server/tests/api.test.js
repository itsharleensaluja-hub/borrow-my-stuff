import { describe, expect, it } from "vitest"
import request from "supertest"
import { createApp } from "../index.js"

const config = {
  port: 0,
  mongoUri: "mongodb://127.0.0.1:27017/borrowbox-test",
  jwtSecret: "test-secret-that-is-long-enough-123456",
  clientUrl: "http://localhost:5173",
  nodeEnv: "test",
  cookieSecure: false,
}

describe("API shell", () => {
  it("reports the API as running", async () => {
    const response = await request(createApp(config)).get("/")
    expect(response.status).toBe(200)
    expect(response.body.message).toContain("API is running")
  })

  it("returns a consistent 404 response", async () => {
    const response = await request(createApp(config)).get("/missing")
    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({ success: false, code: "NOT_FOUND" })
  })
})
