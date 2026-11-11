export const bookingTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
}

export const canTransitionBooking = (from, to) =>
  bookingTransitions[from]?.includes(to) || false
