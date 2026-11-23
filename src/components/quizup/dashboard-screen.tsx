import { Link } from "@tanstack/react-router";
import { BookOpen, LayoutDashboard, Tags, UserRound, ChevronRight } from "lucide-react";
import { Header } from "./header";
import { seedCategories, seedQuizzes } from "@/lib/seed";

export function DashboardScreen() {
  const cards = [
    { to: "/quizzes" as const, icon: BookOpen, title: "Browse quizzes", detail: `${seedQuizzes.length} quizzes ready to take` },
    { to: "/profile" as const, icon: UserRound, title: "Your profile", detail: "View the name and email saved on this page" },
    { to: "/quiz-types" as const, icon: LayoutDashboard, title: "Create a quiz", detail: "Start from the quiz types you already use" },
    { to: "/admin" as const, icon: Tags, title: "Admin", detail: `${seedCategories.length} categories to manage` },
  ];

  return (
    <>
      <Header />
      <main className="page-main screen-enter">
        <div className="page-heading">
          <h1>Your Dashboard</h1>
          <p>Pick up a quiz or jump back into creating one</p>
        </div>
        <div className="category-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.to} className="category-card">
                <span className="category-icon">
                  <Icon />
                </span>
                <div>
                  <h2 className="category-title">{card.title}</h2>
                  <p className="category-description">{card.detail}</p>
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
