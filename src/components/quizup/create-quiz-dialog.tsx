import { useEffect, useState } from "react";
import { ChevronDown, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionEditor } from "./question-editor";
import { addQuiz } from "@/lib/saved-quizzes";
import { newQuestion, validateQuiz, type Category, type Question } from "@/lib/quiz";
import { addQuizType, useQuizTypes } from "@/lib/quiz-types";

const newTypeValue = "__new__";

export function CreateQuizDialog({ open, onOpenChange, defaultCategory }: { open: boolean; onOpenChange: (open: boolean) => void; defaultCategory: Category }) {
  const { types: quizTypes } = useQuizTypes();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([newQuestion()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCategory(defaultCategory);
    setAddingType(false);
    setNewTypeName("");
    setQuestions([newQuestion()]);
    setErrors({});
  }, [open, defaultCategory]);

  function chooseType(value: string) {
    if (value === newTypeValue) {
      setAddingType(true);
      setErrors((old) => ({ ...old, category: "" }));
      return;
    }
    setAddingType(false);
    setCategory(value);
  }

  async function confirmNewType() {
    try {
      const created = await addQuizType(newTypeName);
      setCategory(created.name);
      setAddingType(false);
      setNewTypeName("");
      setErrors((old) => ({ ...old, category: "" }));
    } catch (caught) {
      setErrors((old) => ({ ...old, category: caught instanceof Error ? caught.message : "Something went wrong." }));
    }
  }

  async function publish() {
    const validation = validateQuiz(title, questions);
    let chosen = category;
    if (addingType) {
      try {
        const created = await addQuizType(newTypeName);
        chosen = created.name;
        setCategory(created.name);
        setAddingType(false);
        setNewTypeName("");
      } catch (caught) {
        validation["category"] = caught instanceof Error ? caught.message : "Something went wrong.";
      }
    }
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    addQuiz({ title, category: chosen, questions })
      .then(() => {
        toast.success("Your quiz is published!");
        onOpenChange(false);
      })
      .catch((caught: unknown) => {
        toast.error(caught instanceof Error ? caught.message : "Something went wrong.");
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="create-dialog">
        <DialogHeader>
          <DialogTitle>Create Your Quiz</DialogTitle>
          <DialogDescription>Add a title, choose a type or create a new one, and write the questions.</DialogDescription>
        </DialogHeader>
        <div className="editor-fields">
          <div>
            <label className="field-label" htmlFor="quiz-title">Quiz Title</label>
            <input id="quiz-title" className="quiz-input" placeholder="e.g. Python Basics" value={title} aria-invalid={Boolean(errors["title"])} onChange={(event) => { setTitle(event.target.value); setErrors((old) => ({ ...old, title: "" })); }} />
            {errors["title"] && <p role="alert" className="validation-error">{errors["title"]}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="quiz-category">Type</label>
            <div className="select-wrap">
              <select id="quiz-category" className="quiz-input" value={addingType ? newTypeValue : category} onChange={(event) => chooseType(event.target.value)}>
                {!quizTypes.some((type) => type.name === category) && <option value={category}>{category}</option>}
                {quizTypes.map((type) => <option key={type.id} value={type.name}>{type.name}</option>)}
                <option value={newTypeValue}>Add a new type</option>
              </select>
              <ChevronDown />
            </div>
            {addingType && <div className="type-add"><input className="quiz-input" aria-label="New type name" placeholder="e.g. History" value={newTypeName} onChange={(event) => { setNewTypeName(event.target.value); setErrors((old) => ({ ...old, category: "" })); }} /><Button type="button" variant="quizOutline" onClick={confirmNewType}>Add type</Button></div>}
            {errors["category"] && <p role="alert" className="validation-error">{errors["category"]}</p>}
          </div>
        </div>
        <div className="questions-header">
          <h2 className="field-label">Questions</h2>
          <span className="question-count">{questions.length} {questions.length === 1 ? "question" : "questions"}</span>
        </div>
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            number={index + 1}
            error={errors[question.id]}
            onChange={(next) => { setQuestions((old) => old.map((item) => item.id === next.id ? next : item)); setErrors((old) => ({ ...old, [next.id]: "" })); }}
            onDelete={() => setQuestions((old) => old.filter((item) => item.id !== question.id))}
          />
        ))}
        {errors["questions"] && <p role="alert" className="validation-error">{errors["questions"]}</p>}
        <Button variant="quizOutline" className="add-question" onClick={() => { setQuestions((old) => [...old, newQuestion()]); setErrors((old) => ({ ...old, questions: "" })); }}><Plus />Add Question</Button>
        <div className="publish-row"><Button variant="quiz" className="publish-button" onClick={publish}><Send />Publish Quiz</Button></div>
      </DialogContent>
    </Dialog>
  );
}
