import React, { useState } from "react";
import { LibraryBig, User, UserCog, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * Login.jsx
 * Standalone login page (separate from signup).
 *
 * Props:
 *  - onLoginSuccess(session)  -> called with { role: 'user' | 'librarian', user: {...} }
 *                                once the form is submitted. Wire this to hand off
 *                                into LibraryApp via its `initialSession` prop.
 *  - onSwitchToSignup()       -> called when the user clicks "Create one"
 *  - onBack()                 -> called when the user clicks the back link (e.g. to Landing)
 */
export default function Login({
  onLoginSuccess = () => {},
  onSwitchToSignup = () => {},
  onBack = () => {},
}) {
  const [role, setRole] = useState("user"); // user | librarian
  const [form, setForm] = useState({ email: "", password: "" });

  function submit(e) {
    e.preventDefault();
    const demoUser =
      role === "user"
        ? { id: "u1", name: "Aditi Sharma", email: form.email || "aditi@mail.com" }
        : { id: "lib1", name: "Mr. Deshpande", email: form.email || "librarian@shelfwise.in" };
    onLoginSuccess({ role, user: demoUser });
  }

  return (
    <div className="login-root">
      <GlobalStyle />

      <div className="login-wrap">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="login-card">
          <div className="login-brand">
            <div className="brand-mark"><LibraryBig size={20} /></div>
            <span>Shelfwise</span>
          </div>

          <h1>Welcome back</h1>
          <p className="sub">Log in to pick up right where you left off.</p>

          <div className="role-toggle" role="tablist" aria-label="Choose role">
            <button
              role="tab"
              aria-selected={role === "user"}
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              <User size={16} /> Reader
            </button>
            <button
              role="tab"
              aria-selected={role === "librarian"}
              className={role === "librarian" ? "active" : ""}
              onClick={() => setRole("librarian")}
            >
              <UserCog size={16} /> Librarian
            </button>
          </div>

          <form onSubmit={submit} className="login-form">
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </label>

            <button type="submit" className="btn-primary full">
              Log in as {role === "user" ? "Reader" : "Librarian"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-line">
            New here?{" "}
            <button className="link" onClick={onSwitchToSignup}>
              Create an account
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

      .login-root {
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
      .login-root *, .login-root *::before, .login-root *::after { box-sizing: border-box; }
      .login-root h1 { font-family: 'Fraunces', serif; color: var(--forest-deep); margin: 0; }
      .login-root button { font-family: inherit; cursor: pointer; }

      .login-wrap { width: 100%; max-width: 420px; padding: 24px 20px; }
      .back-link {
        display: flex; align-items: center; gap: 6px; background: none; border: none;
        color: var(--ink-soft); font-size: 13.5px; margin-bottom: 16px; padding: 0;
      }
      .back-link:hover { color: var(--forest-deep); }

      .login-card {
        background: var(--card); border: 1px solid var(--line); border-radius: 5px;
        padding: 36px 32px; box-shadow: 0 24px 48px -28px rgba(20,42,34,0.35);
      }
      .login-brand {
        display: flex; align-items: center; gap: 9px; font-family: 'Fraunces', serif;
        font-weight: 600; font-size: 16px; color: var(--forest-deep); margin-bottom: 22px;
      }
      .brand-mark {
        width: 30px; height: 30px; border-radius: 3px; background: var(--brass); color: var(--forest-deep);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .login-card h1 { font-size: 24px; margin-bottom: 6px; }
      .sub { color: var(--ink-soft); font-size: 14px; margin: 0 0 22px; }

      .role-toggle {
        display: flex; gap: 6px; background: var(--parchment-deep);
        padding: 4px; border-radius: 999px; margin-bottom: 22px; width: fit-content;
      }
      .role-toggle button {
        border: none; background: transparent; padding: 8px 16px; border-radius: 999px;
        font-size: 13px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; font-weight: 500;
      }
      .role-toggle button.active { background: var(--forest); color: #fff; }

      .login-form { display: flex; flex-direction: column; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field > span { font-size: 12.5px; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
      .input-wrap {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid var(--line); border-radius: 3px; padding: 11px 12px;
        background: #fff; color: var(--ink-soft);
      }
      .input-wrap:focus-within { border-color: var(--brass); box-shadow: 0 0 0 3px rgba(184,134,58,0.15); }
      .input-wrap input { border: none; outline: none; width: 100%; font-size: 14.5px; color: var(--ink); background: transparent; }

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