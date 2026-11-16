export const categories = ["Programming", "Math", "General Knowledge", "Science"] as const;
export type Category = (typeof categories)[number];
export type Question = { id: string; text: string; options: string[]; correct: number | null };
export function newQuestion(): Question {
  return { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correct: null };
}
export function validateQuiz(title: string, questions: Question[]) {
  const errors: Record<string, string> = {};
  if (!title.trim()) errors['title'] = "Please enter a quiz title.";
  if (questions.length === 0) errors['questions'] = "Add at least one question.";
  questions.forEach((q) => {
    if (!q.text.trim()) errors[q.id] = "Please enter your question.";
    else if (q.options.length !== 4 || q.options.some((option) => !option.trim())) errors[q.id] = "Fill in all four answer options.";
    else if (q.correct === null || q.correct < 0 || q.correct > 3) errors[q.id] = "Select the correct answer.";
  });
  return errors;
}
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} · QuizUp` }, { name: "description", content: description }, { property: "og:title", content: `${title} · QuizUp` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}