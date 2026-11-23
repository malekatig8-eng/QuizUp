import { createFileRoute } from "@tanstack/react-router";
import { AdminListScreen } from "@/components/quizup/admin-list-screen";
import { pageHead } from "@/lib/quiz";
import { seedCategories } from "@/lib/seed";

export const Route = createFileRoute("/admin/categories")({
  head: () => pageHead("Manage Categories", "Edit or remove sample QuizUp categories."),
  component: ManageCategories,
});

function ManageCategories() {
  return (
    <AdminListScreen
      heading="Manage Categories"
      subtitle="Changes stay on this page until you leave it"
      titleLabel="Name"
      detailLabel="Description"
      rows={seedCategories.map((category) => ({ id: category.id, title: category.name, detail: category.description }))}
    />
  );
}
