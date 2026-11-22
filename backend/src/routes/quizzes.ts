import { Router, type RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { findCategoryByName } from "../models/Category";
import { Quiz, toPublicQuiz } from "../models/Quiz";

const questionSchema = z.object({
  text: z.string().trim().min(1, "Please enter your question."),
  options: z.tuple([
    z.string().trim().min(1, "Fill in all four answer options."),
    z.string().trim().min(1, "Fill in all four answer options."),
    z.string().trim().min(1, "Fill in all four answer options."),
    z.string().trim().min(1, "Fill in all four answer options."),
  ]),
  correct: z.number().int().min(0, "Select the correct answer.").max(3, "Select the correct answer."),
});

const quizSchema = z.object({
  title: z.string().trim().min(1, "Please enter a quiz title.").max(80, "Quiz title must be 80 characters or fewer."),
  category: z.string().trim().min(1, "Please choose a type.").max(40, "Type name must be 40 characters or fewer."),
  questions: z.array(questionSchema).min(1, "Add at least one question."),
});

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

async function findQuiz(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Quiz.findById(id);
}

export const quizRouter = Router();

quizRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const categoryName = typeof req.query.category === "string" ? req.query.category.trim() : "";
    if (!categoryName) {
      const quizzes = await Quiz.find().sort({ createdAt: -1 }).populate("category");
      res.json({ quizzes: quizzes.map(toPublicQuiz) });
      return;
    }
    const category = await findCategoryByName(categoryName);
    if (!category) {
      res.json({ quizzes: [] });
      return;
    }
    const quizzes = await Quiz.find({ category: category._id }).sort({ createdAt: -1 }).populate("category");
    res.json({ quizzes: quizzes.map(toPublicQuiz) });
  }),
);

quizRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const quiz = await findQuiz(req.params.id);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found." });
      return;
    }
    await quiz.populate("category");
    res.json({ quiz: toPublicQuiz(quiz) });
  }),
);

quizRouter.post(
  "/",
  requireAuth,
  asyncRoute(async (req, res) => {
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }
    const category = await findCategoryByName(parsed.data.category);
    if (!category) {
      res.status(400).json({ message: "Please choose a type." });
      return;
    }
    const quiz = await Quiz.create({
      title: parsed.data.title,
      category: category._id,
      questions: parsed.data.questions,
      author: res.locals.userId,
    });
    await quiz.populate("category");
    res.status(201).json({ quiz: toPublicQuiz(quiz) });
  }),
);

quizRouter.patch(
  "/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const quiz = await findQuiz(req.params.id);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found." });
      return;
    }
    if (quiz.author.toString() !== res.locals.userId) {
      res.status(403).json({ message: "You can only edit your own quizzes." });
      return;
    }
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: firstIssue(parsed.error) });
      return;
    }
    const category = await findCategoryByName(parsed.data.category);
    if (!category) {
      res.status(400).json({ message: "Please choose a type." });
      return;
    }
    quiz.title = parsed.data.title;
    quiz.category = category._id;
    quiz.questions = parsed.data.questions;
    await quiz.save();
    await quiz.populate("category");
    res.json({ quiz: toPublicQuiz(quiz) });
  }),
);

quizRouter.delete(
  "/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const quiz = await findQuiz(req.params.id);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found." });
      return;
    }
    if (quiz.author.toString() !== res.locals.userId) {
      res.status(403).json({ message: "You can only delete your own quizzes." });
      return;
    }
    await quiz.deleteOne();
    res.status(204).send();
  }),
);
