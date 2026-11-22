import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CategoryScreen } from "@/components/quizup/category-screen";
import { PlayQuizScreen } from "@/components/quizup/play-quiz-screen";
import { QuizListScreen } from "@/components/quizup/quiz-list-screen";
import { pageHead } from "@/lib/quiz";

const searchSchema = z.object({
  category: z.string().trim().min(1).optional().catch(undefined),
  quiz: z.string().trim().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/quiz-types")({
  validateSearch: searchSchema,
  head: () => pageHead("Choose a Quiz Type", "Browse programming, math, general knowledge, and science quizzes on QuizUp."),
  component: QuizTypes,
});

function QuizTypes() {
  const { category, quiz } = Route.useSearch();
  if (category && quiz) return <PlayQuizScreen category={category} quizId={quiz} />;
  if (category) return <QuizListScreen category={category} />;
  return <CategoryScreen />;
}