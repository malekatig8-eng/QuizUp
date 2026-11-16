import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/quizup/auth-screen";
import { pageHead } from "@/lib/quiz";
export const Route = createFileRoute("/signup")({ head: () => pageHead("Create an Account", "Sign up for QuizUp and start creating your own quizzes."), component: Signup });
function Signup() { return <AuthScreen mode="signup" />; }