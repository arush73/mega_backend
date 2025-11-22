import dotenv from "dotenv"
dotenv.config()

import connectDB from "./utils/db.js"
import logger from "./logger/winston.logger.js"
import app from "./app.js"
import { httpServer } from "./app.js"

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    logger.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }`
    );
    logger.info("⚙️  Server is running on port: " + process.env.PORT);
  });
};

const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0] || 0;

if (majorNodeVersion >= 14) {
  try {
    await connectDB();
    startServer();
  } catch (err) {
    logger.error("Mongo db connect error: ", err);
  }
} else {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      logger.error("Mongo db connect error: ", err);
    });
}
