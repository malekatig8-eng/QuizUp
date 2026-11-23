import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { findQuiz } from "@/lib/seed";

export function TakeQuizScreen({ quizId }: { quizId: string }) {
  const quiz = findQuiz(quizId);
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  if (!quiz) {
    return (
      <>
        <Header />
        <main className="page-main editor-main screen-enter">
          <div className="page-heading">
            <h1>Quiz not found</h1>
            <p>This preview only includes the sample quizzes.</p>
          </div>
          <div className="publish-row">
            <Button asChild variant="quiz">
              <Link to="/quizzes">Browse quizzes</Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  const question = quiz.questions[index];
  if (!question) return null;

  function submitAnswer() {
    if (!quiz || !question) return;
    if (selected === null) {
      setError("Select an answer.");
      return;
    }
    const nextScore = score + (selected === question.correct ? 1 : 0);
    const last = index === quiz.questions.length - 1;
    if (last) {
      navigate({
        to: "/quiz/$id/results",
        params: { id: quiz.id },
        search: { score: nextScore, total: quiz.questions.length },
      });
      return;
    }
    setScore(nextScore);
    setIndex(index + 1);
    setSelected(null);
    setError("");
  }

  return (
    <>
      <Header />
      <main className="page-main editor-main screen-enter">
        <Button asChild variant="quizOutline" className="back-button">
          <Link to="/quizzes">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <div className="page-heading">
          <h1>{quiz.title}</h1>
          <p>
            {quiz.category} · Question {index + 1} of {quiz.questions.length}
          </p>
        </div>
        <section className="question-card" aria-label={`Question ${index + 1}`}>
          <h2 className="category-title">{question.text}</h2>
          <div className="option-grid">
            {question.options.map((option, optionIndex) => (
              <label className="option-row" key={option}>
                <input
                  type="radio"
                  name={question.id}
                  checked={selected === optionIndex}
                  onChange={() => {
                    setSelected(optionIndex);
                    setError("");
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {error && (
            <p role="alert" className="validation-error question-bottom">
              {error}
            </p>
          )}
        </section>
        <div className="publish-row">
          <Button variant="quiz" className="publish-button" onClick={submitAnswer}>
            {index === quiz.questions.length - 1 ? "See results" : "Next"}
          </Button>
        </div>
      </main>
    </>
  );
}
