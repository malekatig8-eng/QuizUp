import { createFileRoute } from "@tanstack/react-router";
import { AdminListScreen } from "@/components/quizup/admin-list-screen";
import { pageHead } from "@/lib/quiz";
import { seedQuizzes } from "@/lib/seed";

export const Route = createFileRoute("/admin/quizzes")({
  head: () => pageHead("Manage Quizzes", "Edit or remove sample QuizUp quizzes."),
  component: ManageQuizzes,
});

function ManageQuizzes() {
  return (
    <AdminListScreen
      heading="Manage Quizzes"
      subtitle="Changes stay on this page until you leave it"
      titleLabel="Title"
      detailLabel="Category"
      rows={seedQuizzes.map((quiz) => ({ id: quiz.id, title: quiz.title, detail: quiz.category }))}
    />
  );
}
