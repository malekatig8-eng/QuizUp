import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CreateScreen } from "@/components/quizup/create-screen";
import { categories, pageHead } from "@/lib/quiz";
const searchSchema = z.object({ category: z.enum(categories).catch("Programming").default("Programming") });
export const Route = createFileRoute("/create-quiz")({ validateSearch: searchSchema, head: () => pageHead("Create Your Quiz", "Add questions, choose correct answers, and publish your QuizUp quiz."), component: CreateQuiz });
function CreateQuiz() { const { category } = Route.useSearch(); return <CreateScreen key={category} initialCategory={category} />; }