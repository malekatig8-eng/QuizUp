import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import trophy from "@/assets/quiz-trophy.png";

export function AuthScreen({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!String(data.get("username") || "").trim() || !String(data.get("password") || "").trim()) { setError("Please fill in all fields."); return; }
    setError("");
    navigate({ to: "/quiz-types" });
  }
  return <><Header auth={mode} /><main className="auth-layout screen-enter">
    <section className="auth-promo"><div className="promo-content"><div><h1>Create. Share.<br />Quiz!</h1><p>Build your own quizzes and<br />challenge others.</p></div><img className="trophy-image" src={trophy} width={265} height={265} alt="Purple trophy with a star" /></div></section>
    <section className="auth-form-panel"><form className="auth-form" onSubmit={submit}>
      <h2>{signup ? "Sign Up" : "Welcome Back!"}</h2><p className="auth-subtitle">{signup ? "Join QuizUp today!" : "Log in to your account"}</p>
      <div className="field-wrap"><UserRound className="field-icon" /><input className="quiz-input auth-input" name="username" aria-label={signup ? "Username" : "Username or Email"} placeholder={signup ? "Username" : "Username or Email"} autoComplete="username" required /></div>
      {signup && <div className="field-wrap"><Mail className="field-icon" /><input className="quiz-input auth-input" name="email" type="email" aria-label="Email address" placeholder="Email address" autoComplete="email" required /></div>}
      <div className="field-wrap"><LockKeyhole className="field-icon" /><input className="quiz-input auth-input" name="password" type={showPassword ? "text" : "password"} aria-label="Password" placeholder="Password" autoComplete={signup ? "new-password" : "current-password"} required /><Button type="button" variant="ghost" size="icon" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>
      {error && <p role="alert" className="validation-error">{error}</p>}
      <Button variant="quiz" className="auth-submit" type="submit">{signup ? "Sign Up" : "Log In"}</Button>
      {signup && <><div className="auth-divider">or</div><Button type="button" variant="quizOutline" className="google-button" onClick={() => { toast("Google sign-in is simulated for this preview."); navigate({ to: "/quiz-types" }); }}><span className="google-mark" aria-hidden="true">G</span>Continue with Google</Button></>}
      <p className="auth-footer">{signup ? "Already have an account?" : "Don't have an account?"} <Link to={signup ? "/login" : "/signup"} className="text-link">{signup ? "Log in" : "Sign Up"}</Link></p>
    </form></section>
  </main></>;
}