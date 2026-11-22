import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, UserRound, Plus, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateQuizDialog } from "./create-quiz-dialog";
import type { Category } from "@/lib/quiz";

export function Header({ auth, create = false, defaultCategory = "Programming" }: { auth?: "signup" | "login"; create?: boolean; defaultCategory?: Category }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  return <header className="app-header">
    <Link to={auth ? "/" : "/quiz-types"} className="logo" aria-label="QuizUp home"><GraduationCap /><span>QuizUp</span></Link>
    <div className="header-right">
      {auth ? <><span className="header-prompt">{auth === "signup" ? "Already have an account?" : "Don't have an account?"}</span><Link className="text-link" to={auth === "signup" ? "/login" : "/signup"}>{auth === "signup" ? "Log in" : "Sign Up"}</Link></> : <>
        {create && <Button variant="quiz" className="header-create" onClick={() => setCreateOpen(true)}><Plus />Create Your Quiz</Button>}
        {create && <CreateQuizDialog open={createOpen} onOpenChange={setCreateOpen} defaultCategory={defaultCategory} />}
        <div className="relative"><Button variant="ghost" size="icon" className="avatar-button" aria-label="Account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><UserRound /></Button>
          {menuOpen && <div className="avatar-menu"><Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); navigate({ to: "/login" }); }}><LogOut />Log out</Button></div>}
        </div>
      </>}
    </div>
  </header>;
}