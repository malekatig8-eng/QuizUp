import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeScreen } from "@/components/quizup/admin-home-screen";
import { pageHead } from "@/lib/quiz";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin", "Manage QuizUp users, quizzes, and categories."),
  component: AdminHomeScreen,
});
