import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import trophy from "@/assets/quiz-trophy.png";
import { loginRequest, setToken, setUserId, signupRequest } from "@/lib/auth";

export function AuthScreen({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");
    const email = String(data.get("email") || "").trim();
    if (!username || !password || (signup && !email)) { setError("Please fill in all fields."); return; }
    setError("");
    setSubmitting(true);
    try {
      const result = signup ? await signupRequest({ username, email, password }) : await loginRequest({ username, password });
      setToken(result.token);
      setUserId(result.user.id);
      navigate({ to: "/quiz-types" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }
  return <><Header auth={mode} /><main className="auth-layout screen-enter">
    <section className="auth-promo"><div className="promo-content"><div><h1>Create. Share.<br />Quiz!</h1><p>Build your own quizzes and<br />challenge others.</p></div><img className="trophy-image" src={trophy} width={265} height={265} alt="Purple trophy with a star" /></div></section>
    <section className="auth-form-panel"><form className="auth-form" onSubmit={submit}>
      <h2>{signup ? "Sign Up" : "Welcome Back!"}</h2><p className="auth-subtitle">{signup ? "Join QuizUp today!" : "Log in to your account"}</p>
      <div className="field-wrap"><UserRound className="field-icon" /><input className="quiz-input auth-input" name="username" aria-label={signup ? "Username" : "Username or Email"} placeholder={signup ? "Username" : "Username or Email"} autoComplete="username" required /></div>
      {signup && <div className="field-wrap"><Mail className="field-icon" /><input className="quiz-input auth-input" name="email" type="email" aria-label="Email address" placeholder="Email address" autoComplete="email" required /></div>}
      <div className="field-wrap"><LockKeyhole className="field-icon" /><input className="quiz-input auth-input" name="password" type={showPassword ? "text" : "password"} aria-label="Password" placeholder="Password" autoComplete={signup ? "new-password" : "current-password"} required /><Button type="button" variant="ghost" size="icon" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>
      {error && <p role="alert" className="validation-error">{error}</p>}
      <Button variant="quiz" className="auth-submit" type="submit" disabled={submitting}>{signup ? "Sign Up" : "Log In"}</Button>
      {signup && <><div className="auth-divider">or</div><Button type="button" variant="quizOutline" className="google-button" onClick={() => { toast("Google sign-in is simulated for this preview."); navigate({ to: "/quiz-types" }); }}><span className="google-mark" aria-hidden="true">G</span>Continue with Google</Button></>}
      <p className="auth-footer">{signup ? "Already have an account?" : "Don't have an account?"} <Link to={signup ? "/login" : "/signup"} className="text-link">{signup ? "Log in" : "Sign Up"}</Link></p>
    </form></section>
  </main></>;
}