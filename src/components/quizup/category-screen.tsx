import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CodeXml, Calculator, Globe2, FlaskConical, ChevronRight, Sparkles, Tag, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUserId } from "@/lib/auth";
import { deleteQuizType, renameQuizType, useQuizTypes, type QuizType } from "@/lib/quiz-types";
import { Header } from "./header";

const icons: Record<string, typeof Tag> = {
  Programming: CodeXml,
  Math: Calculator,
  "General Knowledge": Globe2,
  Science: FlaskConical,
};

const descriptions: Record<string, string> = {
  Programming: "Browse programming quizzes",
  Math: "Browse math quizzes",
  "General Knowledge": "Browse general knowledge quizzes",
  Science: "Browse science quizzes",
};

export function CategoryScreen() {
  const { types, error } = useQuizTypes();
  const [userId, setUserId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<QuizType | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState("");
  useEffect(() => setUserId(getUserId()), []);

  function openRename(type: QuizType) {
    setRenaming(type);
    setRenameName(type.name);
    setRenameError("");
  }

  async function saveRename() {
    if (!renaming) return;
    const trimmed = renameName.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      setRenameError("Please enter a type name.");
      return;
    }
    if (trimmed.length > 40) {
      setRenameError("Type name must be 40 characters or fewer.");
      return;
    }
    try {
      await renameQuizType(renaming.id, trimmed);
      toast.success("Type renamed.");
      setRenaming(null);
    } catch (caught) {
      setRenameError(caught instanceof Error ? caught.message : "Something went wrong.");
    }
  }

  async function remove(type: QuizType) {
    if (!window.confirm(`Delete "${type.name}"?`)) return;
    try {
      await deleteQuizType(type.id);
      toast.success("Type deleted.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Something went wrong.");
    }
  }

  return (
    <>
      <Header create />
      <main className="page-main screen-enter">
        <div className="page-heading">
          <h1>Choose a Quiz Type</h1>
          <p>Open a type to see the quizzes inside it</p>
        </div>
        {error && types.length === 0 ? (
          <p className="quiz-empty">{error}</p>
        ) : (
          <div className="category-grid">
            {types.map((type) => {
              const Icon = icons[type.name] ?? Tag;
              const description = descriptions[type.name] ?? `Browse ${type.name} quizzes`;
              const canManage = !type.builtIn && type.authorId === userId;
              return (
                <article key={type.id} className="category-card">
                  <Link to="/quiz-types" search={{ category: type.name }} className="category-card-link">
                    <span className="category-icon"><Icon /></span>
                    <div>
                      <h2 className="category-title">{type.name}</h2>
                      <p className="category-description">{description}</p>
                    </div>
                  </Link>
                  {canManage && (
                    <div className="category-actions">
                      <Button variant="ghost" size="icon" aria-label={`Rename ${type.name}`} onClick={() => openRename(type)}><Pencil /></Button>
                      <Button variant="ghost" size="icon" className="quiz-delete" aria-label={`Delete ${type.name}`} onClick={() => remove(type)}><Trash2 /></Button>
                    </div>
                  )}
                  <Link to="/quiz-types" search={{ category: type.name }} className="category-card-open" aria-label={`Open ${type.name}`}>
                    <ChevronRight className="category-chevron" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
        <p className="category-footer"><Sparkles size={15} />A little curiosity. A lot of possibilities.</p>
      </main>
      <Dialog open={renaming !== null} onOpenChange={(open) => { if (!open) setRenaming(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename type</DialogTitle>
            <DialogDescription>Choose a new name for this type.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void saveRename(); }}>
            <label className="field-label" htmlFor="rename-type">Type name</label>
            <input id="rename-type" className="quiz-input" value={renameName} aria-invalid={Boolean(renameError)} onChange={(event) => { setRenameName(event.target.value); setRenameError(""); }} />
            {renameError && <p role="alert" className="validation-error">{renameError}</p>}
            <div className="publish-row rename-save"><Button type="submit" variant="quiz" className="publish-button">Save</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
