import { createFileRoute } from "@tanstack/react-router";
import { AdminListScreen } from "@/components/quizup/admin-list-screen";
import { pageHead } from "@/lib/quiz";
import { seedUsers } from "@/lib/seed";

export const Route = createFileRoute("/admin/users")({
  head: () => pageHead("Manage Users", "Edit or remove sample QuizUp users."),
  component: ManageUsers,
});

function ManageUsers() {
  return (
    <AdminListScreen
      heading="Manage Users"
      subtitle="Changes stay on this page until you leave it"
      titleLabel="Name"
      detailLabel="Email"
      rows={seedUsers.map((user) => ({ id: user.id, title: user.name, detail: user.email }))}
    />
  );
}
