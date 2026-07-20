import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LibraryBig, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { emailExists } from "./dummyData";

/**
 * ForgotPassword.jsx
 * Standalone "forgot password" page. Route it at "/forgot-password" in App.jsx.
 * This is a static/demo flow — it doesn't send a real email, it just checks
 * whether the email matches a DUMMY_USERS account and shows a confirmation.
 * Swap the fake `setTimeout` for a real API call when you wire up the backend.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | not-found

  function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setTimeout(() => {
      setStatus(emailExists(email) ? "sent" : "not-found");
    }, 600);
  }

  return (
    <div className="fp-root">
      <GlobalStyle />

      <div className="fp-wrap">
        <button className="back-link" onClick={() => navigate("/login")}>
          <ArrowLeft size={15} /> Back to login
        </button>

        <div className="fp-card">
          <div className="fp-brand">
            <div className="brand-mark"><LibraryBig size={20} /></div>
            <span>Shelfwise</span>
          </div>

          {status !== "sent" ? (
            <>
              <h1>Reset your password</h1>
              <p className="sub">
                Enter the email on your account and we'll send you a link to reset your password.
              </p>

              <form onSubmit={submit} className="fp-form">
                <label className="field">
                  <span>Email</span>
                  <div className="input-wrap">
                    <Mail size={15} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </label>

                {status === "not-found" && (
                  <p className="error-line">
                    We couldn't find an account with that email. Check the spelling or sign up instead.
                  </p>
                )}

                <button type="submit" className="btn-primary full" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send reset link"}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="fp-success">
              <div className="success-icon"><CheckCircle2 size={22} /></div>
              <h1>Check your inbox</h1>
              <p className="sub">
                If an account exists for <strong>{email}</strong>, a password reset link is on its way.
              </p>
              <button className="btn-primary full" onClick={() => navigate("/login")}>
                Back to login <ArrowRight size={16} />
              </button>
            </div>
          )}

          <p className="switch-line">
            Remembered it?{" "}
            <button className="link" onClick={() => navigate("/login")}>
              Log in
            </button>
            {" · "}
            <button className="link" onClick={() => navigate("/signup")}>
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

      .fp-root {
        --ink: #262819;
        --ink-soft: #5B5D48;
        --parchment: #EFE8D3;
        --card: #FBF7EC;
        --forest: #1F3B30;
        --forest-deep: #142A22;
        --brass: #B8863A;
        --line: #D9CCA6;
        --sage-light: #E1E8D6;

        font-family: 'Source Serif 4', Georgia, serif;
        color: var(--ink);
        background: var(--parchment);
        min-height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fp-root *, .fp-root *::before, .fp-root *::after { box-sizing: border-box; }
      .fp-root h1 { font-family: 'Fraunces', serif; color: var(--forest-deep); margin: 0; }
      .fp-root button { font-family: inherit; cursor: pointer; }

      .fp-wrap { width: 100%; max-width: 420px; padding: 24px 20px; }
      .back-link {
        display: flex; align-items: center; gap: 6px; background: none; border: none;
        color: var(--ink-soft); font-size: 13.5px; margin-bottom: 16px; padding: 0;
      }
      .back-link:hover { color: var(--forest-deep); }

      .fp-card {
        background: var(--card); border: 1px solid var(--line); border-radius: 5px;
        padding: 36px 32px; box-shadow: 0 24px 48px -28px rgba(20,42,34,0.35);
      }
      .fp-brand {
        display: flex; align-items: center; gap: 9px; font-family: 'Fraunces', serif;
        font-weight: 600; font-size: 16px; color: var(--forest-deep); margin-bottom: 22px;
      }
      .brand-mark {
        width: 30px; height: 30px; border-radius: 3px; background: var(--brass); color: var(--forest-deep);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .fp-card h1 { font-size: 22px; margin-bottom: 6px; }
      .sub { color: var(--ink-soft); font-size: 14px; margin: 0 0 22px; line-height: 1.55; }

      .fp-form { display: flex; flex-direction: column; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field > span { font-size: 12.5px; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
      .input-wrap {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid var(--line); border-radius: 3px; padding: 11px 12px;
        background: #fff; color: var(--ink-soft);
      }
      .input-wrap:focus-within { border-color: var(--brass); box-shadow: 0 0 0 3px rgba(184,134,58,0.15); }
      .input-wrap input { border: none; outline: none; width: 100%; font-size: 14.5px; color: var(--ink); background: transparent; }

      .error-line {
        margin: -4px 0 0; font-size: 13px; color: #9C3B2E; background: #F1DAD3;
        border-radius: 3px; padding: 9px 12px;
      }

      .btn-primary {
        background: var(--forest); color: #fff; border: none; border-radius: 3px;
        padding: 12px 18px; font-size: 14.5px; font-weight: 600; display: flex; align-items: center;
        justify-content: center; gap: 8px; transition: background .15s ease;
      }
      .btn-primary:hover { background: var(--forest-deep); }
      .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
      .btn-primary.full { width: 100%; margin-top: 6px; }

      .fp-success { text-align: center; }
      .fp-success .sub { max-width: 32ch; margin-left: auto; margin-right: auto; }
      .success-icon {
        width: 46px; height: 46px; border-radius: 50%; background: var(--sage-light); color: #3E4C2F;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
      }

      .switch-line { margin-top: 22px; font-size: 13.5px; color: var(--ink-soft); text-align: center; }
      .link { background: none; border: none; color: var(--brass); font-weight: 600; text-decoration: underline; padding: 0; }
    `}</style>
  );
}