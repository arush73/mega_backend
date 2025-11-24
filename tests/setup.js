import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const TEST_DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const TEST_DB_NAME = "teambuilder_test";

export const connectTestDB = async () => {
  try {
    await mongoose.connect(`${TEST_DB_URI}/${TEST_DB_NAME}`);
  } catch (error) {
    console.error("Test DB connection failed:", error);
    process.exit(1);
  }
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
