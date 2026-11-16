import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/quiz";

export function QuestionEditor({ question, number, error, onChange, onDelete }: { question: Question; number: number; error?: string; onChange: (question: Question) => void; onDelete: () => void }) {
  return <section className="question-card" aria-label={`Question ${number}`}>
    <div className="question-top"><span className="question-number">{number}.</span><input className="quiz-input" aria-label={`Question ${number} text`} placeholder="Enter your question..." value={question.text} onChange={(event) => onChange({ ...question, text: event.target.value })} /><Button variant="ghost" size="icon" className="delete-button" title={`Delete question ${number}`} aria-label={`Delete question ${number}`} onClick={onDelete}><Trash2 /></Button></div>
    <div className="option-grid">{question.options.map((option, i) => <div className="option-row" key={i}><input type="radio" name={`correct-${question.id}`} aria-label={`Question ${number} correct answer ${String.fromCharCode(65 + i)}`} checked={question.correct === i} onChange={() => onChange({ ...question, correct: i })} /><input className="quiz-input" aria-label={`Question ${number} option ${String.fromCharCode(65 + i)}`} placeholder={`Option ${String.fromCharCode(65 + i)}`} value={option} onChange={(event) => onChange({ ...question, options: question.options.map((value, index) => index === i ? event.target.value : value) })} /></div>)}</div>
    {error ? <p role="alert" className="validation-error question-bottom">{error}</p> : <p className="question-bottom">{question.correct === null ? "Correct answer" : `Correct answer: Option ${String.fromCharCode(65 + question.correct)}`}</p>}
  </section>;
}