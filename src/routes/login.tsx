import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/quizup/auth-screen";
import { pageHead } from "@/lib/quiz";
export const Route = createFileRoute("/login")({ head: () => pageHead("Welcome Back", "Log in to QuizUp and turn your knowledge into a quiz."), component: Login });
function Login() { return <AuthScreen mode="login" />; }