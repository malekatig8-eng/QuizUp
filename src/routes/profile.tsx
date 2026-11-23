import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/components/quizup/profile-screen";
import { pageHead } from "@/lib/quiz";

export const Route = createFileRoute("/profile")({
  head: () => pageHead("Your Profile", "View and update your QuizUp profile."),
  component: ProfileScreen,
});
