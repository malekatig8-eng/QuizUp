import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";

export type AdminRow = { id: string; title: string; detail: string };

export function AdminListScreen({
  heading,
  subtitle,
  titleLabel,
  detailLabel,
  rows,
}: {
  heading: string;
  subtitle: string;
  titleLabel: string;
  detailLabel: string;
  rows: AdminRow[];
}) {
  const [items, setItems] = useState(rows);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");

  function startEdit(row: AdminRow) {
    setEditingId(row.id);
    setTitle(row.title);
    setDetail(row.detail);
    setError("");
  }

  function save(id: string) {
    if (!title.trim() || !detail.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setItems((current) => current.map((row) => (row.id === id ? { ...row, title: title.trim(), detail: detail.trim() } : row)));
    setEditingId(null);
    setError("");
  }

  return (
    <>
      <Header />
      <main className="page-main editor-main screen-enter">
        <Button asChild variant="quizOutline" className="back-button">
          <Link to="/admin">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <div className="page-heading">
          <h1>{heading}</h1>
          <p>{subtitle}</p>
        </div>
        {items.length === 0 && <p className="category-description">Nothing left in this list.</p>}
        {items.map((row) => (
          <section className="question-card" key={row.id}>
            {editingId === row.id ? (
              <>
                <div className="field-wrap">
                  <label className="field-label" htmlFor={`${row.id}-title`}>
                    {titleLabel}
                  </label>
                  <input id={`${row.id}-title`} className="quiz-input" value={title} onChange={(event) => setTitle(event.target.value)} />
                </div>
                <div className="field-wrap">
                  <label className="field-label" htmlFor={`${row.id}-detail`}>
                    {detailLabel}
                  </label>
                  <input id={`${row.id}-detail`} className="quiz-input" value={detail} onChange={(event) => setDetail(event.target.value)} />
                </div>
                {error && (
                  <p role="alert" className="validation-error">
                    {error}
                  </p>
                )}
                <div className="question-top">
                  <Button variant="quiz" onClick={() => save(row.id)}>
                    Save
                  </Button>
                  <Button variant="quizOutline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="question-top">
                <div className="min-w-0 flex-1">
                  <h2 className="category-title">{row.title}</h2>
                  <p className="category-description">{row.detail}</p>
                </div>
                <Button variant="ghost" onClick={() => startEdit(row)}>
                  Edit
                </Button>
                <Button variant="ghost" className="delete-button" onClick={() => setItems((current) => current.filter((item) => item.id !== row.id))}>
                  Delete
                </Button>
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
