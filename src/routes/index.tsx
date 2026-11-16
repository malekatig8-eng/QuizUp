import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/quizup/auth-screen";
import { pageHead } from "@/lib/quiz";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => pageHead("Sign Up", "Join QuizUp to create quizzes and challenge others."),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <AuthScreen mode="signup" />;
}
