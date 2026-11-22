import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { useQuiz } from "@/lib/saved-quizzes";
import type { Category } from "@/lib/quiz";

export function PlayQuizScreen({ category, quizId }: { category: Category; quizId: string }) {
  const { quiz: loaded, ready, error } = useQuiz(quizId);
  const quiz = loaded && loaded.category.toLowerCase() === category.toLowerCase() ? loaded : null;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  if (!ready) {
    return <><Header create defaultCategory={category} /><main className="page-main" /></>;
  }

  if (!quiz) {
    return (
      <>
        <Header create defaultCategory={category} />
        <main className="page-main screen-enter">
          <Button asChild variant="quizOutline" className="back-button"><Link to="/quiz-types" search={{ category }}><ArrowLeft />Back</Link></Button>
          <p className="quiz-empty">{error || "This quiz could not be found."}</p>
        </main>
      </>
    );
  }

  const question = quiz.questions[index];
  const total = quiz.questions.length;
  const score = quiz.questions.filter((item) => answers[item.id] === item.correct).length;

  function choose(optionIndex: number) {
    if (!question) return;
    setAnswers((old) => ({ ...old, [question.id]: optionIndex }));
  }

  function finish() {
    if (!question || answers[question.id] === undefined) return;
    setFinished(true);
  }

  return (
    <>
      <Header create defaultCategory={category} />
      <main className="page-main screen-enter">
        <Button asChild variant="quizOutline" className="back-button"><Link to="/quiz-types" search={{ category }}><ArrowLeft />Back</Link></Button>
        {finished ? (
          <section className="success-panel">
            <div className="success-icon"><Check size={36} /></div>
            <h2>You scored {score} / {total}</h2>
            <p>{quiz.title}</p>
            <div className="play-review">
              {quiz.questions.map((item, itemIndex) => {
                const picked = answers[item.id];
                const correct = item.correct !== null && picked === item.correct;
                const pickedText = picked === undefined ? "No answer" : item.options[picked] ?? "No answer";
                return (
                  <p key={item.id} className={correct ? "play-right" : "play-wrong"}>
                    {itemIndex + 1}. {item.text} — {correct ? "Correct" : `Your answer: ${pickedText}`}
                  </p>
                );
              })}
            </div>
            <Button variant="quiz" onClick={() => { setFinished(false); setIndex(0); setAnswers({}); }}>Try again</Button>
          </section>
        ) : question ? (
          <>
            <div className="page-heading">
              <h1>{quiz.title}</h1>
              <p>Question {index + 1} of {total}</p>
            </div>
            <h2 className="play-question">{question.text}</h2>
            <div className="play-options">
              {question.options.map((option, optionIndex) => (
                <button key={optionIndex} type="button" className={answers[question.id] === optionIndex ? "play-option selected" : "play-option"} onClick={() => choose(optionIndex)}>
                  <span className="play-letter">{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </button>
              ))}
            </div>
            <div className="play-nav">
              {index > 0 && <Button variant="quizOutline" onClick={() => setIndex(index - 1)}><ArrowLeft />Previous</Button>}
              {index < total - 1 ? (
                <Button variant="quiz" disabled={answers[question.id] === undefined} onClick={() => setIndex(index + 1)}>Next<ArrowRight /></Button>
              ) : (
                <Button variant="quiz" disabled={answers[question.id] === undefined} onClick={finish}>Finish</Button>
              )}
            </div>
          </>
        ) : (
          <p className="quiz-empty">This quiz has no questions.</p>
        )}
      </main>
    </>
  );
}
