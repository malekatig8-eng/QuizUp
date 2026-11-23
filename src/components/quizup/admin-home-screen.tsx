import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Tags, Users } from "lucide-react";
import { Header } from "./header";
import { seedCategories, seedQuizzes, seedUsers } from "@/lib/seed";

export function AdminHomeScreen() {
  const cards = [
    { to: "/admin/users" as const, icon: Users, title: "Manage users", detail: `${seedUsers.length} people in this preview` },
    { to: "/admin/quizzes" as const, icon: BookOpen, title: "Manage quizzes", detail: `${seedQuizzes.length} sample quizzes` },
    { to: "/admin/categories" as const, icon: Tags, title: "Manage categories", detail: `${seedCategories.length} quiz categories` },
  ];

  return (
    <>
      <Header />
      <main className="page-main screen-enter">
        <div className="page-heading">
          <h1>Admin</h1>
          <p>Update the sample users, quizzes, and categories for this session</p>
        </div>
        <div className="category-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.to} to={card.to} className="category-card">
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
