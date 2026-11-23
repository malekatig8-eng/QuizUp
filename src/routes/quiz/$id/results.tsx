import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResultsScreen } from "@/components/quizup/results-screen";
import { pageHead } from "@/lib/quiz";

const searchSchema = z.object({
  score: z.number().int().nonnegative().catch(0),
  total: z.number().int().nonnegative().catch(0),
});

export const Route = createFileRoute("/quiz/$id/results")({
  validateSearch: searchSchema,
  head: () => pageHead("Quiz Results", "See how you scored on this QuizUp quiz."),
  component: QuizResults,
});

function QuizResults() {
  const { id } = Route.useParams();
  const { score, total } = Route.useSearch();
  return <ResultsScreen quizId={id} score={score} total={total} />;
}
