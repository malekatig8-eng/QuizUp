import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/auth";
import { Header } from "./header";
import { deleteQuiz, useSavedQuizzes } from "@/lib/saved-quizzes";
import type { Category } from "@/lib/quiz";

export function QuizListScreen({ category }: { category: Category }) {
  const { quizzes, ready, error } = useSavedQuizzes(category);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => setUserId(getUserId()), []);
  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteQuiz(id);
      toast.success("Quiz deleted.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Something went wrong.");
    }
  }
  return (
    <>
      <Header create defaultCategory={category} />
      <main className="page-main screen-enter">
        <Button asChild variant="quizOutline" className="back-button"><Link to="/quiz-types"><ArrowLeft />Back</Link></Button>
        <div className="page-heading">
          <h1>{category}</h1>
          <p>Quizzes of this type</p>
        </div>
        {!ready ? null : error ? (
          <p className="quiz-empty">{error}</p>
        ) : quizzes.length === 0 ? (
          <p className="quiz-empty">No quizzes here yet. Use Create Your Quiz to add one.</p>
        ) : (
          <div className="quiz-list">
            {quizzes.map((quiz) => (
              <article key={quiz.id} className="quiz-card">
                <Link to="/quiz-types" search={{ category, quiz: quiz.id }} className="quiz-card-link">
                  <h2>{quiz.title}</h2>
                  <p>{quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}</p>
                </Link>
                {quiz.authorId === userId && <Button variant="ghost" size="icon" className="quiz-delete" aria-label={`Delete ${quiz.title}`} onClick={() => remove(quiz.id, quiz.title)}><Trash2 /></Button>}
                <Link to="/quiz-types" search={{ category, quiz: quiz.id }} className="quiz-card-open" aria-label={`Open ${quiz.title}`}><ChevronRight className="category-chevron" /></Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
