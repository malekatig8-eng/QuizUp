import { createFileRoute } from "@tanstack/react-router";
import { CategoryScreen } from "@/components/quizup/category-screen";
import { pageHead } from "@/lib/quiz";
export const Route = createFileRoute("/quiz-types")({ head: () => pageHead("Choose a Quiz Type", "Create a programming, math, general knowledge, or science quiz with QuizUp."), component: CategoryScreen });