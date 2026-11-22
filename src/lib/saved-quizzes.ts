import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";
import type { Category, Question } from "@/lib/quiz";

export const QUIZ_CHANGE_EVENT = "quizup-quizzes-changed";

export type SavedQuiz = {
  id: string;
  title: string;
  category: Category;
  questions: Question[];
  authorId: string;
  createdAt: string;
};

export async function addQuiz(quiz: { title: string; category: Category; questions: Question[] }) {
  const data = await apiFetch("/api/quizzes", {
    method: "POST",
    auth: true,
    body: {
      title: quiz.title,
      category: quiz.category,
      questions: quiz.questions.map((question) => ({
        text: question.text,
        options: question.options,
        correct: question.correct,
      })),
    },
  });
  const saved = quizFrom(data);
  if (!saved) throw new Error("Something went wrong.");
  window.dispatchEvent(new Event(QUIZ_CHANGE_EVENT));
  return saved;
}

export async function deleteQuiz(id: string) {
  await apiFetch(`/api/quizzes/${id}`, { method: "DELETE", auth: true });
  window.dispatchEvent(new Event(QUIZ_CHANGE_EVENT));
}

export function useSavedQuizzes(category: string) {
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      const query = new URLSearchParams({ category });
      apiFetch(`/api/quizzes?${query.toString()}`)
        .then((data) => {
          if (cancelled) return;
          setQuizzes(quizzesFrom(data));
          setError("");
          setReady(true);
        })
        .catch((caught: unknown) => {
          if (cancelled) return;
          setError(caught instanceof Error ? caught.message : "Something went wrong.");
          setReady(true);
        });
    };
    refresh();
    window.addEventListener(QUIZ_CHANGE_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(QUIZ_CHANGE_EVENT, refresh);
    };
  }, [category]);
  return { quizzes, ready, error };
}

export function useQuiz(id: string) {
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    apiFetch(`/api/quizzes/${id}`)
      .then((data) => {
        if (cancelled) return;
        setQuiz(quizFrom(data));
        setError("");
        setReady(true);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        const message = caught instanceof Error ? caught.message : "Something went wrong.";
        setQuiz(null);
        setError(message === "Quiz not found." ? "" : message);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return { quiz, ready, error };
}

function quizzesFrom(data: unknown) {
  if (!data || typeof data !== "object" || !("quizzes" in data) || !Array.isArray(data.quizzes)) return [];
  return data.quizzes.filter(isSavedQuiz);
}

function quizFrom(data: unknown) {
  if (!data || typeof data !== "object" || !("quiz" in data)) return null;
  return isSavedQuiz(data.quiz) ? data.quiz : null;
}

function isSavedQuiz(value: unknown): value is SavedQuiz {
  if (!value || typeof value !== "object") return false;
  if (!("id" in value) || typeof value.id !== "string") return false;
  if (!("title" in value) || typeof value.title !== "string") return false;
  if (!("category" in value) || typeof value.category !== "string" || !value.category.trim()) return false;
  if (!("authorId" in value) || typeof value.authorId !== "string") return false;
  if (!("createdAt" in value) || typeof value.createdAt !== "string") return false;
  if (!("questions" in value) || !Array.isArray(value.questions) || !value.questions.every(isQuestion)) return false;
  return true;
}

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  if (!("id" in value) || typeof value.id !== "string") return false;
  if (!("text" in value) || typeof value.text !== "string") return false;
  if (!("correct" in value) || typeof value.correct !== "number") return false;
  if (!("options" in value) || !Array.isArray(value.options) || !value.options.every((option) => typeof option === "string")) return false;
  return true;
}
