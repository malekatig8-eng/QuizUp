import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { currentProfile } from "@/lib/seed";

export function ProfileScreen() {
  const [username, setUsername] = useState(currentProfile.username);
  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email);
  const [error, setError] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !name.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    toast.success("Profile saved for this page.");
  }

  return (
    <>
      <Header />
      <main className="page-main editor-main screen-enter">
        <div className="page-heading">
          <h1>Your Profile</h1>
          <p>This preview keeps your profile only while this page is open</p>
        </div>
        <form className="auth-form" onSubmit={save}>
          <div className="field-wrap">
            <label className="field-label" htmlFor="profile-username">
              Username
            </label>
            <input id="profile-username" className="quiz-input" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div className="field-wrap">
            <label className="field-label" htmlFor="profile-name">
              Name
            </label>
            <input id="profile-name" className="quiz-input" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="field-wrap">
            <label className="field-label" htmlFor="profile-email">
              Email
            </label>
            <input id="profile-email" className="quiz-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          {error && (
            <p role="alert" className="validation-error">
              {error}
            </p>
          )}
          <Button variant="quiz" className="auth-submit" type="submit">
            Save profile
          </Button>
        </form>
      </main>
    </>
  );
}
