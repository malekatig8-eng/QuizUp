import { createFileRoute } from "@tanstack/react-router";
import { TakeQuizScreen } from "@/components/quizup/take-quiz-screen";
import { pageHead } from "@/lib/quiz";

export const Route = createFileRoute("/quiz/$id/")({
  head: () => pageHead("Take a Quiz", "Answer the questions in this QuizUp quiz."),
  component: TakeQuiz,
});

function TakeQuiz() {
  const { id } = Route.useParams();
  return <TakeQuizScreen quizId={id} />;
}
