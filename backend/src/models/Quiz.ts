import mongoose, { Schema, type HydratedDocument } from "mongoose";

export type PublicQuestion = {
  id: string;
  text: string;
  options: string[];
  correct: number;
};

export type PublicQuiz = {
  id: string;
  title: string;
  category: string;
  questions: PublicQuestion[];
  authorId: string;
  createdAt: string;
};

interface IQuestion {
  text: string;
  options: string[];
  correct: number;
}

interface IQuiz {
  title: string;
  category: mongoose.Types.ObjectId;
  questions: IQuestion[];
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    options: { type: [String], required: true },
    correct: { type: Number, required: true },
  },
  { _id: true },
);

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    questions: { type: [questionSchema], required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

quizSchema.index({ category: 1, createdAt: -1 });

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);

export function toPublicQuiz(quiz: HydratedDocument<IQuiz>): PublicQuiz {
  const plain = quiz.toObject();
  return {
    id: plain._id.toString(),
    title: plain.title,
    category: categoryName(plain.category),
    questions: plain.questions.map((question) => {
      const stored = question as IQuestion & { _id: mongoose.Types.ObjectId };
      return {
        id: stored._id.toString(),
        text: stored.text,
        options: stored.options,
        correct: stored.correct,
      };
    }),
    authorId: plain.author.toString(),
    createdAt: plain.createdAt.toISOString(),
  };
}

function categoryName(category: unknown) {
  if (category && typeof category === "object" && "name" in category && typeof category.name === "string") {
    return category.name;
  }
  return "";
}
