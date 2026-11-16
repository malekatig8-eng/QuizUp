import { describe, expect, it } from "vitest";
import { validateQuiz, type Question } from "@/lib/quiz";
const valid: Question = { id: "q1", text: "What is 2 + 2?", options: ["1", "2", "3", "4"], correct: 3 };
describe("Quiz publishing", () => {
  it("requires a filled title", () => { expect(validateQuiz("  ", [valid])['title']).toBeDefined(); });
  it("requires text for every question", () => { expect(validateQuiz("Math", [valid, { ...valid, id: "q2", text: "" }])['q2']).toBeDefined(); });
  it("requires four completed options", () => { expect(validateQuiz("Math", [{ ...valid, options: ["1", "2", "3"] }])['q1']).toBeDefined(); expect(validateQuiz("Math", [{ ...valid, options: ["1", "2", "3", " "] }])['q1']).toBeDefined(); });
  it("requires a selected correct answer", () => { expect(validateQuiz("Math", [{ ...valid, correct: null }])['q1']).toBeDefined(); });
  it("requires at least one question", () => { expect(validateQuiz("Math", [])['questions']).toBeDefined(); });
  it("accepts a complete quiz", () => { expect(validateQuiz("Math", [valid])).toEqual({}); });
});