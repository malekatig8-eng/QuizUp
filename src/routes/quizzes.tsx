import { createFileRoute } from "@tanstack/react-router";
import { BrowseScreen } from "@/components/quizup/browse-screen";
import { pageHead } from "@/lib/quiz";

export const Route = createFileRoute("/quizzes")({
  head: () => pageHead("Browse Quizzes", "Choose a QuizUp quiz and start answering."),
  component: BrowseScreen,
});
