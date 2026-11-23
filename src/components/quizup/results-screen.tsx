import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { findQuiz } from "@/lib/seed";

export function ResultsScreen({ quizId, score, total }: { quizId: string; score: number; total: number }) {
  const quiz = findQuiz(quizId);

  return (
    <>
      <Header />
      <main className="page-main editor-main screen-enter">
        <section className="success-panel">
          <div className="success-icon">
            <Check size={36} />
          </div>
          <h2>Quiz complete</h2>
          <p>
            {quiz ? `${quiz.title} · ` : ""}
            You scored {score} out of {total}
          </p>
          <Button asChild variant="quiz">
            <Link to="/quizzes">Browse quizzes</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
