import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { categoryRouter } from "./routes/categories";
import { quizRouter } from "./routes/quizzes";

function isJsonParseError(error: unknown) {
  return error instanceof SyntaxError && "status" in error && error.status === 400;
}

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
];

export function createApp() {
  const app = express();
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/quizzes", quizRouter);
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    if (isJsonParseError(error)) {
      res.status(400).json({ message: "Request body must be JSON." });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  });
  return app;
}
