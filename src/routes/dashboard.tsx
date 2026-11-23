import { createFileRoute } from "@tanstack/react-router";
import { DashboardScreen } from "@/components/quizup/dashboard-screen";
import { pageHead } from "@/lib/quiz";

export const Route = createFileRoute("/dashboard")({
  head: () => pageHead("Your Dashboard", "See your QuizUp quizzes and jump back in."),
  component: DashboardScreen,
});
