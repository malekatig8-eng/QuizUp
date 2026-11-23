import { categories, type Category } from "@/lib/quiz";

export type SeedQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correct: number;
};

export type SeedQuiz = {
  id: string;
  title: string;
  category: Category;
  questions: SeedQuestion[];
};

export type SeedUser = { id: string; name: string; email: string };

export type SeedCategory = { id: string; name: string; description: string };

export const currentProfile = {
  username: "alex",
  name: "Alex Rivera",
  email: "alex@quizup.dev",
};

export const seedUsers: SeedUser[] = [
  { id: "alex", name: "Alex Rivera", email: "alex@quizup.dev" },
  { id: "mina", name: "Mina Chen", email: "mina@quizup.dev" },
  { id: "sam", name: "Sam Okonkwo", email: "sam@quizup.dev" },
];

const categoryDescriptions = [
  "Test your coding knowledge",
  "Challenge your math skills",
  "Explore a variety of topics",
  "Discover the world of science",
];

export const seedCategories: SeedCategory[] = categories.map((name, index) => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  description: categoryDescriptions[index] ?? "",
}));

export const seedQuizzes: SeedQuiz[] = [
  {
    id: "python-basics",
    title: "Python Basics",
    category: "Programming",
    questions: [
      {
        id: "py-1",
        text: "Which keyword defines a function in Python?",
        options: ["func", "def", "function", "fn"],
        correct: 1,
      },
      {
        id: "py-2",
        text: "What does len(\"hi\") return?",
        options: ["0", "1", "2", "hi"],
        correct: 2,
      },
    ],
  },
  {
    id: "quick-math",
    title: "Quick Math",
    category: "Math",
    questions: [
      {
        id: "math-1",
        text: "What is 7 × 8?",
        options: ["54", "56", "64", "48"],
        correct: 1,
      },
      {
        id: "math-2",
        text: "What is the square root of 81?",
        options: ["8", "7", "9", "11"],
        correct: 2,
      },
    ],
  },
  {
    id: "world-facts",
    title: "World Facts",
    category: "General Knowledge",
    questions: [
      {
        id: "gk-1",
        text: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct: 2,
      },
      {
        id: "gk-2",
        text: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
      },
    ],
  },
  {
    id: "simple-science",
    title: "Simple Science",
    category: "Science",
    questions: [
      {
        id: "sci-1",
        text: "What planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Mercury"],
        correct: 1,
      },
      {
        id: "sci-2",
        text: "Water freezes at what temperature in Celsius?",
        options: ["0", "32", "100", "-10"],
        correct: 0,
      },
    ],
  },
];

export function findQuiz(id: string) {
  return seedQuizzes.find((quiz) => quiz.id === id);
}
