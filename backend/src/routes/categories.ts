import { Router, type RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { Category, findCategoryByName, sortCategories, toPublicCategory } from "../models/Category";
import { Quiz } from "../models/Quiz";

const nameSchema = z.object({
  name: z
    .string({ required_error: "Please enter a type name.", invalid_type_error: "Please enter a type name." })
    .trim()
    .min(1, "Please enter a type name.")
    .max(40, "Type name must be 40 characters or fewer.")
    .transform((value) => value.replace(/\s+/g, " ")),
});

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function isDuplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function findCategory(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Category.findById(id);
}

export const categoryRouter = Router();

categoryRouter.get(
  "/",
  asyncRoute(async (_req, res) => {
    const categories = sortCategories(await Category.find());
    res.json({ categories: categories.map(toPublicCategory) });
  }),
);

categoryRouter.post(
  "/",
  requireAuth,
  asyncRoute(async (req, res) => {
    const parsed = nameSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }
    const existing = await findCategoryByName(parsed.data.name);
    if (existing) {
      res.status(409).json({ message: "That type already exists." });
      return;
    }
    try {
      const category = await Category.create({
        name: parsed.data.name,
        builtIn: false,
        createdBy: res.locals.userId,
      });
      res.status(201).json({ category: toPublicCategory(category) });
    } catch (error) {
      if (isDuplicateKey(error)) {
        res.status(409).json({ message: "That type already exists." });
        return;
      }
      throw error;
    }
  }),
);

categoryRouter.patch(
  "/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const category = await findCategory(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Type not found." });
      return;
    }
    if (category.builtIn) {
      res.status(403).json({ message: "Built-in types cannot be changed." });
      return;
    }
    if (category.createdBy?.toString() !== res.locals.userId) {
      res.status(403).json({ message: "You can only edit your own types." });
      return;
    }
    const parsed = nameSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }
    const taken = await findCategoryByName(parsed.data.name);
    if (taken && taken.id !== category.id) {
      res.status(409).json({ message: "That type already exists." });
      return;
    }
    category.name = parsed.data.name;
    try {
      await category.save();
    } catch (error) {
      if (isDuplicateKey(error)) {
        res.status(409).json({ message: "That type already exists." });
        return;
      }
      throw error;
    }
    res.json({ category: toPublicCategory(category) });
  }),
);

categoryRouter.delete(
  "/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const category = await findCategory(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Type not found." });
      return;
    }
    if (category.builtIn) {
      res.status(403).json({ message: "Built-in types cannot be deleted." });
      return;
    }
    if (category.createdBy?.toString() !== res.locals.userId) {
      res.status(403).json({ message: "You can only delete your own types." });
      return;
    }
    const used = await Quiz.countDocuments({ category: category._id });
    if (used > 0) {
      res.status(409).json({ message: "Delete the quizzes in this type first." });
      return;
    }
    await category.deleteOne();
    res.status(204).send();
  }),
);
