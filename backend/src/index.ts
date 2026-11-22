import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app";
import { prepareCategories } from "./models/Category";

const uri = process.env.MONGODB_URI;
const parsedPort = Number(process.env.PORT);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 4000;

if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

try {
  await mongoose.connect(uri);
} catch (error) {
  console.error("Could not connect to MongoDB. Is it running?");
  console.error(error);
  process.exit(1);
}

try {
  await prepareCategories();
} catch (error) {
  console.error("Could not prepare quiz categories.");
  console.error(error);
  process.exit(1);
}

const app = createApp();
app.listen(port, () => {
  console.log(`QuizUp API listening on http://localhost:${port}`);
});
