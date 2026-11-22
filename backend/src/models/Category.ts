import mongoose, { Schema } from "mongoose";

export const builtInCategoryNames = ["Programming", "Math", "General Knowledge", "Science"] as const;

export const categoryCollation = { locale: "en", strength: 2 } as const;

export type PublicCategory = {
  id: string;
  name: string;
  builtIn: boolean;
  authorId: string | null;
};

export interface ICategory {
  name: string;
  builtIn: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    builtIn: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1 }, { unique: true, collation: categoryCollation });

export const Category = mongoose.model<ICategory>("Category", categorySchema);

export function toPublicCategory(category: {
  _id: mongoose.Types.ObjectId;
  name: string;
  builtIn: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
}): PublicCategory {
  return {
    id: category._id.toString(),
    name: category.name,
    builtIn: category.builtIn,
    authorId: category.createdBy ? category.createdBy.toString() : null,
  };
}

export function findCategoryByName(name: string) {
  return Category.findOne({ name }).collation(categoryCollation);
}

export function sortCategories<T extends { name: string; builtIn: boolean }>(categories: T[]) {
  const order = new Map<string, number>(builtInCategoryNames.map((name, index) => [name, index]));
  return [...categories].sort((left, right) => {
    if (left.builtIn !== right.builtIn) return left.builtIn ? -1 : 1;
    if (left.builtIn && right.builtIn) return (order.get(left.name) ?? 99) - (order.get(right.name) ?? 99);
    return left.name.localeCompare(right.name, "en", { sensitivity: "base" });
  });
}

export async function prepareCategories() {
  for (const name of builtInCategoryNames) {
    const existing = await findCategoryByName(name);
    if (!existing) {
      await Category.create({ name, builtIn: true });
      continue;
    }
    if (!existing.builtIn || existing.createdBy) {
      await Category.updateOne({ _id: existing._id }, { $set: { builtIn: true, name }, $unset: { createdBy: "" } });
    }
  }

  const quizzes = mongoose.connection.collection("quizzes");
  const legacy = await quizzes.find({ category: { $type: "string" } }).sort({ createdAt: 1 }).toArray();
  for (const quiz of legacy) {
    const name = typeof quiz["category"] === "string" ? quiz["category"].trim().replace(/\s+/g, " ") : "";
    if (!name) continue;
    let category = await findCategoryByName(name);
    if (!category) {
      const author = quiz["author"];
      const createdBy = mongoose.isValidObjectId(author) ? new mongoose.Types.ObjectId(String(author)) : undefined;
      category = await Category.create({ name, builtIn: false, ...(createdBy ? { createdBy } : {}) });
    }
    await quizzes.updateOne({ _id: quiz["_id"] }, { $set: { category: category._id } });
  }
}
