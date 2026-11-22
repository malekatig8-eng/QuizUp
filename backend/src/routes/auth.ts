import bcrypt from "bcrypt";
import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { requireAuth, signToken } from "../middleware/requireAuth";
import { User, toPublicUser } from "../models/User";

const signupSchema = z.object({
  username: z.string().trim().min(1, "Please enter a username.").max(32, "Username must be 32 characters or fewer."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, "Please enter your username or email."),
  password: z.string().min(1, "Please enter your password."),
});

const usernameCollation = { locale: "en", strength: 2 } as const;

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncRoute(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }

    const { username, email, password } = parsed.data;
    const usernameTaken = await User.findOne({ username }).collation(usernameCollation);
    if (usernameTaken) {
      res.status(409).json({ message: "That username is already taken." });
      return;
    }

    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      res.status(409).json({ message: "That email is already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, email, passwordHash });
      res.status(201).json({ token: signToken(user.id), user: toPublicUser(user) });
    } catch (error) {
      if (isDuplicateKey(error)) {
        res.status(409).json({ message: "That username or email is already registered." });
        return;
      }
      throw error;
    }
  }),
);

function isDuplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }

    const { username, password } = parsed.data;
    const user = await User.findOne({
      $or: [{ email: username.toLowerCase() }, { username }],
    }).collation(usernameCollation);

    const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !matches) {
      res.status(401).json({ message: "Incorrect username or password." });
      return;
    }

    res.json({ token: signToken(user.id), user: toPublicUser(user) });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
      res.status(401).json({ message: "Please log in." });
      return;
    }
    res.json({ user: toPublicUser(user) });
  }),
);
