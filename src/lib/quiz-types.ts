import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";
import { QUIZ_CHANGE_EVENT } from "@/lib/saved-quizzes";

export const TYPE_CHANGE_EVENT = "quizup-types-changed";

export type QuizType = {
  id: string;
  name: string;
  builtIn: boolean;
  authorId: string | null;
};

export function useQuizTypes() {
  const [types, setTypes] = useState<QuizType[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      listQuizTypes()
        .then((next) => {
          if (cancelled) return;
          setTypes(next);
          setError("");
        })
        .catch((caught: unknown) => {
          if (cancelled) return;
          setError(caught instanceof Error ? caught.message : "Something went wrong.");
        });
    };
    refresh();
    window.addEventListener(TYPE_CHANGE_EVENT, refresh);
    window.addEventListener(QUIZ_CHANGE_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(TYPE_CHANGE_EVENT, refresh);
      window.removeEventListener(QUIZ_CHANGE_EVENT, refresh);
    };
  }, []);
  return { types, error };
}

export async function addQuizType(name: string) {
  const data = await apiFetch("/api/categories", { method: "POST", auth: true, body: { name } });
  const created = categoryFrom(data);
  if (!created) throw new Error("Something went wrong.");
  window.dispatchEvent(new Event(TYPE_CHANGE_EVENT));
  return created;
}

export async function renameQuizType(id: string, name: string) {
  const data = await apiFetch(`/api/categories/${id}`, { method: "PATCH", auth: true, body: { name } });
  const renamed = categoryFrom(data);
  if (!renamed) throw new Error("Something went wrong.");
  window.dispatchEvent(new Event(TYPE_CHANGE_EVENT));
  window.dispatchEvent(new Event(QUIZ_CHANGE_EVENT));
  return renamed;
}

export async function deleteQuizType(id: string) {
  await apiFetch(`/api/categories/${id}`, { method: "DELETE", auth: true });
  window.dispatchEvent(new Event(TYPE_CHANGE_EVENT));
}

async function listQuizTypes() {
  const data = await apiFetch("/api/categories");
  if (!data || typeof data !== "object" || !("categories" in data) || !Array.isArray(data.categories)) return [];
  return data.categories.filter(isQuizType);
}

function categoryFrom(data: unknown) {
  if (!data || typeof data !== "object" || !("category" in data)) return null;
  return isQuizType(data.category) ? data.category : null;
}

function isQuizType(value: unknown): value is QuizType {
  if (!value || typeof value !== "object") return false;
  if (!("id" in value) || typeof value.id !== "string") return false;
  if (!("name" in value) || typeof value.name !== "string" || !value.name.trim()) return false;
  if (!("builtIn" in value) || typeof value.builtIn !== "boolean") return false;
  if (!("authorId" in value) || (value.authorId !== null && typeof value.authorId !== "string")) return false;
  return true;
}
