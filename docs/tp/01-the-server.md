# TP 1 — The server

This is the first practical. Do the exercises before you read the correction at the end.

Practice in a **new folder**, for example `quizup-api-practice`, somewhere outside this project. The folder `backend/` in QuizUp is already finished. If you edit it while you learn, you can break the website.

When an exercise matches the finished project, the correction names the real file so you can compare.

## Goal

Run a second program next to the website. The website is the pages. This program is the API: it receives requests and answers with JSON.

When it starts, the terminal shows:

```text
QuizUp API listening on http://localhost:4000
```

## What you are building on

Nothing from the backend yet. The purple pages already exist in `src/`. They will call `http://localhost:4000` later. This practical only starts that second program.

## Ideas you need

**Two programs.** The frontend (Vite) and the backend (Express) run in two terminals. They talk over HTTP. A request has a method (`GET`, `POST`) and a path (`/api/auth/signup`). The answer has a status number and, usually, a JSON body.

**A collection is MongoDB's word for a table.** You do not create one in this practical. You only connect, so Compass can open the database `quizup`.

**Environment variables** live in a file named `.env`. The program reads them at startup. The real password of the database and the secret used to sign login tickets stay in that file. Do not commit it.

**CORS** is the browser rule that blocks a page on port 8081 from calling a program on port 4000, unless the API explicitly allows those pages. Postman and `node` are not browsers, so they are allowed anyway. The website still needs the allow-list.

**JSON middleware** reads the request body and turns it into `req.body`. If the body is not valid JSON, Express throws. Your error handler turns that into status 400 and the message `Request body must be JSON.` Any other unexpected error becomes status 500 and `Something went wrong.`

## Setup

Create the practice folder and run these commands inside it.

```bash
npm init -y
npm install express mongoose cors dotenv
npm install -D typescript tsx @types/node @types/express @types/cors
```

In `package.json`, set `"type": "module"` and add:

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "start": "tsx src/index.ts"
}
```

Add a `tsconfig.json` like the one in `backend/tsconfig.json` of this project: `strict`, `module` `ESNext`, `moduleResolution` `Bundler`, `rootDir` `src`.

Create `.env`:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/quizup
JWT_SECRET=dev-only-change-me
PORT=4000
```

`JWT_SECRET` is not used until the next practical. The server already refuses to start when it is missing, so put it in now. Use a long random value on a real server. This value is only for your machine.

MongoDB must already be running on port 27017. Compass connects with `mongodb://127.0.0.1:27017`.

## Exercise 1 — Refuse to start without the two secrets

Create `src/index.ts`. Load `.env` first. Read `MONGODB_URI` and `JWT_SECRET`. If either one is missing, print a clear line and exit. Read `PORT`. If it is missing or not a positive number, use `4000`.

**Check.** Rename `MONGODB_URI` in `.env` for a moment and start the program. It stops with `MONGODB_URI is not set`. Put the name back.

## Exercise 2 — Connect to MongoDB, then listen

After the checks, connect with mongoose. If the connection fails, print `Could not connect to MongoDB. Is it running?` and exit. Only then call `listen`.

The listen callback prints `QuizUp API listening on http://localhost:4000` (use the port variable, not a hardcoded number only).

Keep the Express app in `src/app.ts` as a function `createApp()`, and call it from `index.ts` after MongoDB connects. That split lets you test the app later without opening a port.

**Check.** With MongoDB running, `npm run dev` prints the listening line and does not exit. Stop MongoDB and start again: you get the connection message, not the listening line.

## Exercise 3 — Allow the website, and read JSON

In `createApp()`:

- Allow the origins `http://localhost:8080`, `http://localhost:8081`, and the same two with `127.0.0.1`.
- Use `express.json()` so a JSON body becomes `req.body`.
- Add an error handler at the end. A JSON parse error (a `SyntaxError` whose `status` is 400) answers `400` with `{ "message": "Request body must be JSON." }`. Anything else answers `500` with `{ "message": "Something went wrong." }` and the error is printed in the terminal. If the response was already sent, do nothing.

You do not need a real route yet. A broken JSON body still goes through `express.json()` and reaches the error handler.

**Check.** Leave the server running. From the practice folder:

```bash
node --input-type=module -e "const r = await fetch('http://localhost:4000/api/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); console.log(r.status, await r.text())"
```

You should see status `400` and `Request body must be JSON.` The path can be anything. The broken `{` is what matters.

Send `{}` instead. There is no route, so Express answers `404` with an HTML page. That is fine for this practical. The next one adds real routes.

## What you can skip

Do not add users, quizzes, or categories yet. Do not import `prepareCategories`. That function appears in the finished `backend/src/index.ts` because practical 4 creates the four built-in types at startup.

---

# Correction

Compare this with your practice folder. The same pieces live in [backend/src/index.ts](../../backend/src/index.ts) and [backend/src/app.ts](../../backend/src/app.ts). Those files also mount the routers from the later practicals, and `index.ts` calls `prepareCategories()` after connecting. Ignore those lines until practical 4.

`index.ts` reads the environment, connects, then listens. The order matters: a request must not arrive before MongoDB is ready.

```ts
import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app";

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

const app = createApp();
app.listen(port, () => {
  console.log(`QuizUp API listening on http://localhost:${port}`);
});
```

`app.ts` builds the app and returns it. `cors` only allows the Vite addresses. The error handler is last, because Express only uses it after a previous step calls `next(error)`. `express.json()` does that when the body is not JSON.

```ts
import cors from "cors";
import express from "express";

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
```

The leading underscores on `_req` and `_next` mean "Express requires this argument, and this function does not use it."

Next practical: save an account, and never store the password as the person typed it.
