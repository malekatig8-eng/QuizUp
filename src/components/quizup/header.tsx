import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, UserRound, Plus, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header({ auth, create = false }: { auth?: "signup" | "login"; create?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return <header className="app-header">
    <Link to={auth ? "/" : "/quiz-types"} className="logo" aria-label="QuizUp home"><GraduationCap /><span>QuizUp</span></Link>
    <div className="header-right">
      {auth ? <><span className="header-prompt">{auth === "signup" ? "Already have an account?" : "Don't have an account?"}</span><Link className="text-link" to={auth === "signup" ? "/login" : "/signup"}>{auth === "signup" ? "Log in" : "Sign Up"}</Link></> : <>
        {create && <Button asChild variant="quiz" className="header-create"><Link to="/quiz-types"><Plus />Create Your Quiz</Link></Button>}
        <div className="relative"><Button variant="ghost" size="icon" className="avatar-button" aria-label="Account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><UserRound /></Button>
          {menuOpen && <div className="avatar-menu">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); navigate({ to: "/dashboard" }); }}><LayoutDashboard />Dashboard</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); navigate({ to: "/profile" }); }}><UserRound />Profile</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); navigate({ to: "/admin" }); }}><Shield />Admin</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); navigate({ to: "/login" }); }}><LogOut />Log out</Button>
          </div>}
        </div>
      </>}
    </div>
  </header>;
}