import React from "react";
import { useNavigate } from "react-router-dom";
import { LibraryBig, ArrowRight } from "lucide-react";
import landingBg from "../assets/landing-bg.jpg";

/**
 * Landing.jsx — now navigates via react-router-dom instead of callback props.
 * Route it at "/" in App.jsx.
 */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <GlobalStyle />

      <div className="landing-hero" style={{ backgroundImage: `url(${landingBg})` }}>
        <div className="landing-scrim" />

        <header className="landing-nav">
          <div className="landing-brand">
            <div className="brand-mark"><LibraryBig size={20} /></div>
            <span>Shelfwise</span>
          </div>

          <nav className="landing-nav-buttons">
            <button className="nav-btn" onClick={() => navigate("/")}>Home</button>
            <button className="nav-btn" onClick={() => navigate("/support")}>Support</button>
          </nav>
        </header>

        <div className="landing-content">
          <span className="landing-eyebrow">Your library, organized</span>
          <h1>Every shelf, every reader,<br />one due date at a time.</h1>
          <p>
            Browse the full catalog, track what you've borrowed, and never miss a return —
            or, if you run the desk, keep every shelf and every reader in view.
          </p>
          <div className="landing-cta">
            <button className="nav-btn primary lg" onClick={() => navigate("/signup")}>
              Get started <ArrowRight size={16} />
            </button>
            <button className="nav-btn ghost lg" onClick={() => navigate("/login")}>
              I already have an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:wght@400;500;600&display=swap');

      /* Reset default browser margins so the full-bleed hero has no white
         gaps along the top/side edges (the classic 8px body margin culprit). */
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100%;
      }

      .landing-root {
        --ink-light: #F2ECD9;
        --forest: #1F3B30;
        --forest-deep: #142A22;
        --brass: #B8863A;
        --brass-light: #E0B876;

        font-family: 'Source Serif 4', Georgia, serif;
        width: 100%;
        margin: 0;
      }
      .landing-root *, .landing-root *::before, .landing-root *::after { box-sizing: border-box; }
      .landing-root h1 { font-family: 'Fraunces', serif; margin: 0; }
      .landing-root button { font-family: inherit; cursor: pointer; }

      .landing-hero {
        position: relative;
        width: 100%;
        min-height: 100vh;
        background-size: cover;
        background-position: center 60%;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        margin: 0;
      }
      .landing-scrim {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(20,42,34,0.88) 0%, rgba(20,42,34,0.55) 28%, rgba(20,42,34,0.35) 55%, rgba(20,42,34,0.65) 100%);
      }

      .landing-nav {
        position: relative; z-index: 1;
        display: flex; align-items: center; justify-content: space-between;
        padding: 22px 40px; gap: 20px; flex-wrap: wrap;
      }
      .landing-brand {
        display: flex; align-items: center; gap: 9px; color: var(--ink-light);
        font-family: 'Fraunces', serif; font-weight: 600; font-size: 18px;
      }
      .brand-mark {
        width: 32px; height: 32px; border-radius: 3px; background: var(--brass); color: var(--forest-deep);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .landing-nav-buttons { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

      .nav-btn {
        background: transparent; border: 1px solid rgba(242,236,217,0.35); color: var(--ink-light);
        padding: 9px 16px; border-radius: 4px; font-size: 13.5px; font-weight: 500;
        display: inline-flex; align-items: center; gap: 7px; transition: background .15s ease, border-color .15s ease;
      }
      .nav-btn:hover { background: rgba(242,236,217,0.1); }
      .nav-btn.primary {
        background: var(--brass); border-color: var(--brass); color: var(--forest-deep); font-weight: 700;
      }
      .nav-btn.primary:hover { background: var(--brass-light); border-color: var(--brass-light); }
      .nav-btn.ghost { border-color: rgba(242,236,217,0.5); }
      .nav-btn.lg { padding: 13px 22px; font-size: 15px; }

      .landing-content {
        position: relative; z-index: 1;
        flex: 1; display: flex; flex-direction: column; justify-content: center;
        max-width: 640px; padding: 40px 40px 100px;
        color: var(--ink-light);
      }
      .landing-eyebrow {
        display: inline-block; font-family: 'IBM Plex Mono', monospace, monospace;
        font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--brass-light);
        border: 1px solid rgba(224,184,118,0.5); padding: 5px 11px; border-radius: 999px;
        margin-bottom: 18px; width: fit-content;
      }
      .landing-content h1 { color: #FBF7EC; font-size: 44px; line-height: 1.2; font-weight: 600; margin-bottom: 16px; }
      .landing-content p { color: #D6DBC4; font-size: 16px; line-height: 1.65; max-width: 46ch; margin-bottom: 30px; }
      .landing-cta { display: flex; gap: 14px; flex-wrap: wrap; }

      @media (max-width: 680px) {
        .landing-content h1 { font-size: 32px; }
        .landing-nav { padding: 18px 22px; }
        .landing-content { padding: 30px 22px 70px; }
      }
    `}</style>
  );
}