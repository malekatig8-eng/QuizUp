import mongoose, { Schema } from "mongoose";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
};

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const User = mongoose.model<IUser>("User", userSchema);

export function toPublicUser(user: { _id: mongoose.Types.ObjectId; username: string; email: string }): PublicUser {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
}
