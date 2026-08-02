import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LibraryBig, User, UserCog, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * Signup.jsx
 * Standalone signup page. Route it at "/signup" in App.jsx.
 *
 * Props:
 *  - onSignupSuccess(session) -> called with { role, user } once the account
 *    is created, so App.jsx can lift the session and unlock "/dashboard".
 */
export default function Signup({ onSignupSuccess = () => {} }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // user | librarian
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function submit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setError("");
    setSuccess("");

    fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Signup failed");
      }
      return res.json();
    })
    .then(() => {
      setSuccess(role === "librarian"
        ? "Librarian account created successfully. You can sign in from the librarian tab now."
        : "Account created successfully! Redirecting you to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    })
    .catch((err) => {
      setError(err.message);
    });
  }

  return (
    <div className="signup-root">
      <GlobalStyle />

      <div className="signup-wrap">
        <button className="back-link" onClick={() => navigate("/")}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="signup-card">
          <div className="signup-brand">
            <div className="brand-mark"><LibraryBig size={20} /></div>
            <span>Shelfwise</span>
          </div>

          <h1>Create your account</h1>
          <p className="sub">Join as a reader to start borrowing, or as a librarian to manage the shelf.</p>

          <div className="role-toggle" role="tablist" aria-label="Choose role">
            <button
              role="tab"
              aria-selected={role === "user"}
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
              type="button"
            >
              <User size={16} /> Reader
            </button>
            <button
              role="tab"
              aria-selected={role === "librarian"}
              className={role === "librarian" ? "active" : ""}
              onClick={() => setRole("librarian")}
              type="button"
            >
              <UserCog size={16} /> Librarian
            </button>
          </div>

          <form onSubmit={submit} className="signup-form">
            <label className="field">
              <span>Full name</span>
              <div className="input-wrap">
                <User size={15} />
                <input
                  type="text"
                  placeholder="e.g. Aditi Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </label>
            <label className="field">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={15} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </label>
            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <Lock size={15} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </label>
            <label className="field">
              <span>Confirm password</span>
              <div className="input-wrap">
                <Lock size={15} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
            </label>

            {role === "librarian" && (
              <p className="hint">New librarian accounts are reviewed before shelf-management access is granted.</p>
            )}

            {error && <p className="error-line">{error}</p>}
            {success && <p className="success-line">{success}</p>}

            <button type="submit" className="btn-primary full">
              Create account as {role === "user" ? "Reader" : "Librarian"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-line">
            Already have an account?{" "}
            <button className="link" onClick={() => navigate("/login")}>
              Log in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:wght@400;500;600&display=swap');

      .signup-root {
        --ink: #262819;
        --ink-soft: #5B5D48;
        --parchment: #EFE8D3;
        --parchment-deep: #E3D8B8;
        --card: #FBF7EC;
        --forest: #1F3B30;
        --forest-deep: #142A22;
        --brass: #B8863A;
        --line: #D9CCA6;

        font-family: 'Source Serif 4', Georgia, serif;
        color: var(--ink);
        background: var(--parchment);
        min-height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .signup-root *, .signup-root *::before, .signup-root *::after { box-sizing: border-box; }
      .signup-root h1 { font-family: 'Fraunces', serif; color: var(--forest-deep); margin: 0; }
      .signup-root button { font-family: inherit; cursor: pointer; }

      .signup-wrap { width: 100%; max-width: 440px; padding: 24px 20px; }
      .back-link {
        display: flex; align-items: center; gap: 6px; background: none; border: none;
        color: var(--ink-soft); font-size: 13.5px; margin-bottom: 16px; padding: 0;
      }
      .back-link:hover { color: var(--forest-deep); }

      .signup-card {
        background: var(--card); border: 1px solid var(--line); border-radius: 5px;
        padding: 36px 32px; box-shadow: 0 24px 48px -28px rgba(20,42,34,0.35);
      }
      .signup-brand {
        display: flex; align-items: center; gap: 9px; font-family: 'Fraunces', serif;
        font-weight: 600; font-size: 16px; color: var(--forest-deep); margin-bottom: 22px;
      }
      .brand-mark {
        width: 30px; height: 30px; border-radius: 3px; background: var(--brass); color: var(--forest-deep);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .signup-card h1 { font-size: 24px; margin-bottom: 6px; }
      .sub { color: var(--ink-soft); font-size: 14px; margin: 0 0 22px; line-height: 1.5; }

      .role-toggle {
        display: flex; gap: 6px; background: var(--parchment-deep);
        padding: 4px; border-radius: 999px; margin-bottom: 22px; width: fit-content;
      }
      .role-toggle button {
        border: none; background: transparent; padding: 8px 16px; border-radius: 999px;
        font-size: 13px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; font-weight: 500;
      }
      .role-toggle button.active { background: var(--forest); color: #fff; }

      .signup-form { display: flex; flex-direction: column; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field > span { font-size: 12.5px; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
      .input-wrap {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid var(--line); border-radius: 3px; padding: 11px 12px;
        background: #fff; color: var(--ink-soft);
      }
      .input-wrap:focus-within { border-color: var(--brass); box-shadow: 0 0 0 3px rgba(184,134,58,0.15); }
      .input-wrap input { border: none; outline: none; width: 100%; font-size: 14.5px; color: var(--ink); background: transparent; }
      .hint { font-size: 12.5px; color: var(--ink-soft); margin: -6px 0 0; }

      .error-line {
        margin: -4px 0 0; font-size: 13px; color: #9C3B2E; background: #F1DAD3;
        border-radius: 3px; padding: 9px 12px;
      }
      .success-line {
        margin: -4px 0 0; font-size: 13px; color: #1F3B30; background: #D2E7DF;
        border-radius: 3px; padding: 9px 12px;
      }

      .btn-primary {
        background: var(--forest); color: #fff; border: none; border-radius: 3px;
        padding: 12px 18px; font-size: 14.5px; font-weight: 600; display: flex; align-items: center;
        justify-content: center; gap: 8px; transition: background .15s ease;
      }
      .btn-primary:hover { background: var(--forest-deep); }
      .btn-primary.full { width: 100%; margin-top: 6px; }

      .switch-line { margin-top: 22px; font-size: 13.5px; color: var(--ink-soft); text-align: center; }
      .link { background: none; border: none; color: var(--brass); font-weight: 600; text-decoration: underline; padding: 0; }
    `}</style>
  );
}