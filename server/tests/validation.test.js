import { describe, expect, it } from "vitest"
import { positiveNumber } from "../middleware/validate.js"
import { canTransitionBooking } from "../services/bookingState.js"

describe("validation", () => {
  it.each([-1, 0, Number.NaN, Number.POSITIVE_INFINITY, "not-a-number"])(
    "rejects invalid numbers: %s",
    (value) => expect(() => positiveNumber(value, "price")).toThrow()
  )

  it("accepts finite positive numbers", () => {
    expect(positiveNumber("12.50", "price")).toBe(12.5)
  })
})

describe("booking state transitions", () => {
  it("allows only the documented workflow", () => {
    expect(canTransitionBooking("pending", "confirmed")).toBe(true)
    expect(canTransitionBooking("confirmed", "active")).toBe(true)
    expect(canTransitionBooking("active", "completed")).toBe(true)
    expect(canTransitionBooking("completed", "active")).toBe(false)
    expect(canTransitionBooking("cancelled", "confirmed")).toBe(false)
  })
})
