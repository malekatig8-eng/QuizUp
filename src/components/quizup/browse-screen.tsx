import { Link } from "@tanstack/react-router";
import { Calculator, ChevronRight, CodeXml, FlaskConical, Globe2 } from "lucide-react";
import { Header } from "./header";
import { seedQuizzes } from "@/lib/seed";
import type { Category } from "@/lib/quiz";

const icons: Record<Category, typeof CodeXml> = {
  Programming: CodeXml,
  Math: Calculator,
  "General Knowledge": Globe2,
  Science: FlaskConical,
};

export function BrowseScreen() {
  return (
    <>
      <Header />
      <main className="page-main screen-enter">
        <div className="page-heading">
          <h1>Browse Quizzes</h1>
          <p>Choose a quiz and answer one question at a time</p>
        </div>
        <div className="category-grid">
          {seedQuizzes.map((quiz) => {
            const Icon = icons[quiz.category];
            return (
              <Link key={quiz.id} to="/quiz/$id" params={{ id: quiz.id }} className="category-card">
                <span className="category-icon">
                  <Icon />
                </span>
                <div>
                  <h2 className="category-title">{quiz.title}</h2>
                  <p className="category-description">
                    {quiz.category} · {quiz.questions.length} questions
                  </p>
                </div>
                <ChevronRight className="category-chevron" />
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
