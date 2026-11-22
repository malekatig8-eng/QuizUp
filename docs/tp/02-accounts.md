# TP 2 — Accounts

Do the exercises before you read the correction. Keep working in your practice folder from practical 1. Leave the QuizUp `backend/` folder as it is until you want to compare.

## Goal

A person can sign up, log in, and ask "who am I?". The password in MongoDB is a hash. A later request proves who is calling by sending a token.

## What you already have

Practical 1: Express on port 4000, MongoDB connected, CORS, and the JSON error handler. `JWT_SECRET` is already in `.env`.

Install the libraries this practical uses:

```bash
npm install bcrypt jsonwebtoken zod
npm install -D @types/bcrypt @types/jsonwebtoken
```

Zod checks the body and gives you the first error message. bcrypt hashes passwords. jsonwebtoken signs and checks the login ticket.

## Ideas you need

**The `users` collection** has one document per account: `username`, `email`, `passwordHash`, plus `createdAt` and `updatedAt`. The document's `_id` is the user id. The answer sent to the browser is smaller: `id`, `username`, `email`. The hash never leaves the server.

**A hash** is a scrambled form of the password. You can check a later attempt against it. You cannot open the hash and read the password back. bcrypt cost `10` means the scramble is slow on purpose, which makes guessing harder.

**Unique, without caring about capitals.** `Ada` and `ada` are the same username. MongoDB does that with a unique index and collation `{ locale: "en", strength: 2 }`. Email is stored in lowercase, so a normal unique index is enough.

**A token** is a signed string. The payload holds `sub` (the user id). It expires in 7 days. The signature uses `JWT_SECRET` and the algorithm `HS256`. Anyone can read the payload. Only someone who knows the secret can create a valid signature. The browser will later send it as `Authorization: Bearer <token>`.

**Status numbers used here**

| Situation | Status | Message |
|---|---|---|
| Account created | 201 | the token and the public user |
| Body is invalid | 400 | the first Zod message, for example `Password must be at least 8 characters.` |
| Username already used | 409 | `That username is already taken.` |
| Email already used | 409 | `That email is already registered.` |
| Login failed | 401 | `Incorrect username or password.` |
| Missing or bad token | 401 | `Please log in.` |

Use the same wrong-password message when the user does not exist. A different message would tell an attacker which emails are registered.

## Exercise 1 — The user model

Create `src/models/User.ts`.

- Fields: `username` (trimmed, required), `email` (trimmed, required, unique, stored lowercase), `passwordHash` (required).
- `{ timestamps: true }` so mongoose adds the two dates.
- A unique index on `username` with the collation above.
- `toPublicUser` returns `{ id, username, email }` and turns `_id` into a string.

The model name `"User"` makes the collection `users`.

**Check.** You cannot see this from HTTP yet. After exercise 2, Compass shows the document, and `passwordHash` starts with `$2b$` or `$2a$`. The typed password is not in the document.

## Exercise 2 — Sign up

Create `src/routes/auth.ts` and mount it in `createApp()` with `app.use("/api/auth", authRouter)`. Mount it **before** the error handler.

`POST /api/auth/signup` body: `{ username, email, password }`.

Rules:

- Username: trimmed, 1 to 32 characters. Empty: `Please enter a username.` Too long: `Username must be 32 characters or fewer.`
- Email: trimmed, must be an email. Otherwise: `Please enter a valid email address.`
- Password: at least 8 characters. Otherwise: `Password must be at least 8 characters.`
- If the username exists, ignoring capitals: `409` and `That username is already taken.`
- If the email exists: `409` and `That email is already registered.`
- Hash the password with bcrypt cost 10. Save `passwordHash`, never `password`.
- Answer `201` with `{ token, user }`. `user` is the public shape.

If two signups race and MongoDB throws duplicate key `11000`, answer `409` with `That username or email is already registered.`

Route handlers that use `await` must catch errors and pass them to `next`, or a rejected promise becomes a crash. A small `asyncRoute` wrapper does that.

**Check.** With the server running, save this as `try.mjs` in the practice folder and run `node try.mjs`. Change the body between checks.

```js
const response = await fetch("http://localhost:4000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "ada",
    email: "ada@example.com",
    password: "password123",
  }),
});
console.log(response.status, await response.text());
```

- Password `short` → `400` and `Password must be at least 8 characters.`
- The body above → `201`, a `token` string, and `user` without `passwordHash`.
- The same body again → `409` and `That username is already taken.`
- Same username with different capitals, new email → `409` as well.

## Exercise 3 — Log in

`POST /api/auth/login` body: `{ username, password }`. The `username` field accepts the username **or** the email.

- Missing username: `Please enter your username or email.`
- Missing password: `Please enter your password.`
- Find the user with `$or`: email equal to the input in lowercase, or username equal to the input. Use the same collation as the username index so `Ada` finds `ada`.
- Compare the typed password with `passwordHash` using bcrypt. If there is no user, or the password does not match: `401` and `Incorrect username or password.`
- Success: `200` with `{ token, user }`.

**Check.** Log in with `ada@example.com` and `password123` → `200`. Log in with `ADA` and the same password → `200`. Wrong password → `401` and `Incorrect username or password.`

## Exercise 4 — The ticket, and "who am I?"

Create `src/middleware/requireAuth.ts`.

- `signToken(userId)` puts `{ sub: userId }` in a token, algorithm `HS256`, expiry `7d`, secret from `JWT_SECRET`. Throw if the secret is missing.
- `requireAuth` reads `Authorization`. It must start with `Bearer `. Verify the token. `payload.sub` must be a string. Save it on `res.locals.userId` and call `next()`. Any failure: `401` and `Please log in.` Do not call `next()` after you have already answered.

`GET /api/auth/me` uses `requireAuth`. Load the user by `res.locals.userId`. If the user was deleted, `401` and `Please log in.` Otherwise `200` and `{ user }`.

**Check.** Call `/api/auth/me` with no header → `401`. Call it with `Authorization: Bearer <token from login>` → `200` and the same username. Change one character of the token → `401`.

## What you can skip

Do not return `passwordHash`. Do not trust a user id sent in the body. The id comes from the token.

---

# Correction

The finished files are [backend/src/models/User.ts](../../backend/src/models/User.ts), [backend/src/routes/auth.ts](../../backend/src/routes/auth.ts), and [backend/src/middleware/requireAuth.ts](../../backend/src/middleware/requireAuth.ts).

The public user is a choice. Mongoose would happily send the whole document, including the hash. `toPublicUser` is the list of fields the browser is allowed to see.

```ts
export function toPublicUser(user: { _id: mongoose.Types.ObjectId; username: string; email: string }) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
}
```

The username index is separate from the field declaration because the collation has to live on the index:

```ts
userSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
```

Signup checks the two uniques **before** hashing, so a taken name does not pay for a slow hash. The `11000` catch is still there for the race where both checks passed and both inserts run.

```ts
const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, passwordHash });
res.status(201).json({ token: signToken(user.id), user: toPublicUser(user) });
```

Login searches both fields in one query. The email side is lowercased because that is how emails are stored. The username side relies on the collation.

```ts
const user = await User.findOne({
  $or: [{ email: username.toLowerCase() }, { username }],
}).collation(usernameCollation);

const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
if (!user || !matches) {
  res.status(401).json({ message: "Incorrect username or password." });
  return;
}
```

`requireAuth` cuts the `Bearer ` prefix (seven characters, including the space) and checks the signature. `res.locals.userId` is how the rest of the API learns who is calling. Quiz and category routes in the next practicals read that same value. They never read an id from the JSON body.

```ts
export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "7d" });
}
```

`asyncRoute` is small and easy to miss. Without it, `await User.create(...)` throwing a duplicate key never reaches your `catch` if you forgot it, and never reaches the error handler in `app.ts` either. Express 4 does not catch a rejected promise by itself.

```ts
function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
```

Next practical: save a quiz. The author is `res.locals.userId`, the person in the token.
