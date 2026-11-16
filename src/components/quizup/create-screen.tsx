import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Plus, Send, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { QuestionEditor } from "./question-editor";
import { categories, newQuestion, validateQuiz, type Category, type Question } from "@/lib/quiz";

export function CreateScreen({ initialCategory }: { initialCategory: Category }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [questions, setQuestions] = useState<Question[]>([{ id: "first", text: "", options: ["", "", "", ""], correct: null }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  function publish() {
    const validation = validateQuiz(title, questions);
    setErrors(validation);
    if (Object.keys(validation).length) { toast.error("Please complete the highlighted fields."); return; }
    setPublished(true);
    toast.success("Your quiz is published!");
  }
  return <><Header /><main className="page-main editor-main screen-enter">
    <Button asChild variant="quizOutline" className="back-button"><Link to="/quiz-types"><ArrowLeft />Back</Link></Button>
    {published ? <section className="success-panel"><div className="success-icon"><Check size={36} /></div><h2>Your quiz is published!</h2><p>{title} · {category} · {questions.length} {questions.length === 1 ? "question" : "questions"}</p><Button asChild variant="quiz"><Link to="/quiz-types">Create another quiz<ArrowRight /></Link></Button><p>This preview keeps your quiz only while this page is open.</p><Button variant="link" onClick={() => setPublished(false)}>Back to editing</Button></section> : <>
      <div className="page-heading"><h1>Create Your Quiz</h1><p>Add a title, choose a category and create your questions</p></div>
      <div className="editor-fields"><div><label className="field-label" htmlFor="quiz-title">Quiz Title</label><input id="quiz-title" className="quiz-input" placeholder="e.g. Python Basics" value={title} aria-invalid={Boolean(errors.title)} onChange={(event) => { setTitle(event.target.value); setErrors((old) => ({ ...old, title: "" })); }} />{errors.title && <p role="alert" className="validation-error">{errors.title}</p>}</div>
      <div><label className="field-label" htmlFor="quiz-category">Category</label><div className="select-wrap"><select id="quiz-category" className="quiz-input" value={category} onChange={(event) => { const next = categories.find((value) => value === event.target.value); if (next) setCategory(next); }}>{categories.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown /></div></div></div>
      <div className="questions-header"><h2 className="field-label">Questions</h2><span className="question-count">{questions.length} {questions.length === 1 ? "question" : "questions"}</span></div>
      {questions.map((question, i) => <QuestionEditor key={question.id} question={question} number={i + 1} error={errors[question.id]} onChange={(next) => { setQuestions((old) => old.map((q) => q.id === next.id ? next : q)); setErrors((old) => ({ ...old, [next.id]: "" })); }} onDelete={() => setQuestions((old) => old.filter((q) => q.id !== question.id))} />)}
      {errors.questions && <p role="alert" className="validation-error">{errors.questions}</p>}
      <Button variant="quizOutline" className="add-question" onClick={() => { setQuestions((old) => [...old, newQuestion()]); setErrors((old) => ({ ...old, questions: "" })); }}><Plus />Add Question</Button>
      <div className="publish-row"><Button variant="quiz" className="publish-button" onClick={publish}><Send />Publish Quiz</Button></div>
    </>}
  </main></>;
}