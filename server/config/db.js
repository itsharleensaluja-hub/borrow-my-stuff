import mongoose from "mongoose"

export const connectDB = async (mongoUri) => {
  const conn = await mongoose.connect(mongoUri)
  console.log(`MongoDB Connected: ${conn.connection.host}`)
  return conn
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
}

export default connectDB