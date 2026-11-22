import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/create-quiz")({
  beforeLoad: () => {
    throw redirect({ to: "/quiz-types" });
  },
});
