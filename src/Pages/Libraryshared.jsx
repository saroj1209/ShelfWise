import React from "react";
import { LibraryBig, LogOut, ArrowLeft } from "lucide-react";

/* ---------------------------------------------------------
   DUE STAMP — signature component
--------------------------------------------------------- */

export function DueStamp({ label = "DUE", date, tone = "active", tilt = -6, small = false }) {
  return (
    <div className={`due-stamp tone-${tone} ${small ? "sm" : ""}`} style={{ "--tilt": `${tilt}deg` }}>
      <span className="stamp-label">{label}</span>
      <span className="stamp-date">{date}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   TOP NAV (catalog-drawer tabs) — used by both dashboards
--------------------------------------------------------- */

export function CatalogNav({ tabs, active, onChange, name, roleLabel, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark small"><LibraryBig size={18} /></div>
        <span>Shelfwise</span>
      </div>
      <nav className="tab-drawer">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`drawer-tab ${active === t.key ? "active" : ""}`}
            onClick={() => onChange(t.key)}
          >
            {t.icon}
            {t.label}
            {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="topbar-user">
        <div className="who">
          <span className="who-name">{name}</span>
          <span className="who-role">{roleLabel}</span>
        </div>
        <button className="btn-ghost" onClick={onLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------
   EMPTY STATE
--------------------------------------------------------- */

export function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <ArrowLeft size={0} />
      <p>{text}</p>
    </div>
  );
}

/* ---------------------------------------------------------
   GLOBAL STYLE — all app CSS lives here so both dashboards
   (and the auth screen) share one stylesheet.
--------------------------------------------------------- */

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

      .lms-root {
        --ink: #262819;
        --ink-soft: #5B5D48;
        --parchment: #EFE8D3;
        --parchment-deep: #E3D8B8;
        --card: #FBF7EC;
        --forest: #1F3B30;
        --forest-deep: #142A22;
        --brass: #B8863A;
        --brass-light: #E0B876;
        --rust: #9C3B2E;
        --rust-light: #F1DAD3;
        --sage: #6E7F5C;
        --sage-light: #E1E8D6;
        --amber: #A66A1E;
        --amber-light: #F3E1C2;
        --line: #D9CCA6;

        font-family: 'Source Serif 4', Georgia, serif;
        color: var(--ink);
        background: var(--parchment);
        min-height: 100vh;
        width: 100%;
        box-sizing: border-box;
      }
      .lms-root *, .lms-root *::before, .lms-root *::after { box-sizing: border-box; }
      .lms-root h1, .lms-root h2, .lms-root h3, .lms-root h4 {
        font-family: 'Fraunces', serif;
        color: var(--forest-deep);
        margin: 0;
      }
      .lms-root button { font-family: inherit; cursor: pointer; }
      .lms-root input, .lms-root select { font-family: 'Source Serif 4', serif; }
      .mono { font-family: 'IBM Plex Mono', monospace; font-size: 13px; }

      /* ---------- AUTH SCREEN ---------- */
      .auth-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
        background:
          radial-gradient(circle at 15% 10%, rgba(184,134,58,0.10), transparent 45%),
          var(--parchment);
      }
      .auth-card-frame {
        width: 100%;
        max-width: 940px;
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 4px;
        box-shadow: 0 24px 48px -24px rgba(20,42,34,0.35);
        overflow: hidden;
      }
      .auth-left {
        background: var(--forest);
        color: #F2ECD9;
        padding: 48px 40px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .auth-left h1 {
        color: #FBF7EC;
        font-weight: 600;
        font-size: 28px;
        line-height: 1.25;
      }
      .auth-left p { color: #C9CFB8; line-height: 1.6; font-size: 15px; max-width: 34ch; }
      .brand { display: flex; align-items: center; gap: 10px; font-family: 'Fraunces', serif; font-weight: 600; font-size: 18px; letter-spacing: 0.02em; }
      .brand-mark {
        width: 34px; height: 34px; border-radius: 3px;
        background: var(--brass); color: var(--forest-deep);
        display: flex; align-items: center; justify-content: center;
      }
      .brand-mark.small { width: 28px; height: 28px; }
      .stamp-decor { margin-top: auto; align-self: flex-start; }

      .auth-right { padding: 44px 40px; display: flex; flex-direction: column; }
      .role-toggle {
        display: flex; gap: 6px; background: var(--parchment-deep);
        padding: 4px; border-radius: 999px; margin-bottom: 20px; width: fit-content;
      }
      .role-toggle button {
        border: none; background: transparent; padding: 8px 16px; border-radius: 999px;
        font-size: 13px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px;
        font-weight: 500;
      }
      .role-toggle button.active { background: var(--forest); color: #fff; }

      .mode-tabs { display: flex; gap: 24px; border-bottom: 1px solid var(--line); margin-bottom: 26px; }
      .mode-tabs button {
        border: none; background: none; padding: 0 0 12px; font-size: 15px; color: var(--ink-soft);
        border-bottom: 2px solid transparent; font-weight: 500;
      }
      .mode-tabs button.active { color: var(--forest-deep); border-color: var(--brass); }

      .auth-form { display: flex; flex-direction: column; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field > span { font-size: 12.5px; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
      .input-wrap {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid var(--line); border-radius: 3px; padding: 11px 12px;
        background: #fff; color: var(--ink-soft);
      }
      .input-wrap:focus-within { border-color: var(--brass); box-shadow: 0 0 0 3px rgba(184,134,58,0.15); }
      .input-wrap input, .input-wrap select { border: none; outline: none; width: 100%; font-size: 14.5px; color: var(--ink); background: transparent; }
      .hint { font-size: 12.5px; color: var(--ink-soft); margin: -6px 0 0; }
      .form-error {
        display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--rust);
        background: var(--rust-light); padding: 9px 12px; border-radius: 3px; margin: -4px 0 0;
      }

      .btn-primary {
        background: var(--forest); color: #fff; border: none; border-radius: 3px;
        padding: 12px 18px; font-size: 14.5px; font-weight: 600; display: flex; align-items: center;
        justify-content: center; gap: 8px; transition: background .15s ease;
      }
      .btn-primary:hover { background: var(--forest-deep); }
      .btn-primary.full { width: 100%; margin-top: 6px; }
      .switch-line { margin-top: 20px; font-size: 13.5px; color: var(--ink-soft); text-align: center; }
      .link { background: none; border: none; color: var(--brass); font-weight: 600; text-decoration: underline; padding: 0; }

      /* ---------- DUE STAMP (signature element) ---------- */
      .due-stamp {
        display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
        width: 76px; height: 76px; border-radius: 50%;
        border: 2.5px dashed currentColor;
        transform: rotate(var(--tilt, -6deg));
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 0.06em;
      }
      .due-stamp.sm { width: 58px; height: 58px; }
      .due-stamp .stamp-label { font-size: 11px; font-weight: 700; }
      .due-stamp.sm .stamp-label { font-size: 9px; }
      .due-stamp .stamp-date { font-size: 12px; font-weight: 600; }
      .due-stamp.sm .stamp-date { font-size: 10px; }
      .tone-active { color: var(--sage); }
      .tone-overdue { color: var(--rust); }
      .tone-returned { color: var(--ink-soft); }

      /* ---------- TOP NAV ---------- */
      .dash { min-height: 100vh; }
      .topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 32px; background: var(--forest); color: #F2ECD9;
        position: sticky; top: 0; z-index: 10; gap: 20px; flex-wrap: wrap;
      }
      .topbar-brand { display: flex; align-items: center; gap: 8px; font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; }
      .tab-drawer { display: flex; gap: 4px; background: var(--forest-deep); padding: 4px; border-radius: 6px; }
      .drawer-tab {
        border: none; background: transparent; color: #C9CFB8; padding: 9px 16px; border-radius: 4px;
        font-size: 13.5px; font-weight: 500; display: flex; align-items: center; gap: 7px;
      }
      .drawer-tab.active { background: var(--brass); color: var(--forest-deep); font-weight: 600; }
      .tab-badge {
        background: var(--rust); color: #fff; font-size: 11px; font-weight: 700;
        min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .drawer-tab.active .tab-badge { background: var(--forest-deep); color: #fff; }
      .topbar-user { display: flex; align-items: center; gap: 14px; }
      .who { display: flex; flex-direction: column; text-align: right; line-height: 1.25; }
      .who-name { font-size: 13.5px; font-weight: 600; }
      .who-role { font-size: 11.5px; color: #B9C0A2; text-transform: uppercase; letter-spacing: 0.05em; }
      .btn-ghost {
        display: flex; align-items: center; gap: 6px; background: transparent;
        border: 1px solid rgba(242,236,217,0.3); color: #F2ECD9; padding: 8px 12px; border-radius: 4px; font-size: 13px;
      }
      .btn-ghost:hover { background: rgba(242,236,217,0.08); }

      /* ---------- DASH BODY ---------- */
      .dash-body { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }
      .section-head { margin-bottom: 22px; }
      .section-head.row { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
      .section-head h2 { font-size: 24px; margin-bottom: 4px; }
      .section-head p { margin: 0; color: var(--ink-soft); font-size: 14px; }
      .overdue-flag { color: var(--rust); font-weight: 600; }
      .subhead { font-size: 15px; margin: 30px 0 12px; color: var(--forest-deep); }
      .subhead-note { font-size: 12px; color: var(--ink-soft); font-family: 'Source Serif 4', serif; font-weight: 400; margin-left: 8px; }

      .toolbar { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
      .search-box {
        display: flex; align-items: center; gap: 10px; background: var(--card);
        border: 1px solid var(--line); border-radius: 3px; padding: 10px 14px; max-width: 420px; color: var(--ink-soft);
      }
      .search-box.lib-search { margin-bottom: 18px; }
      .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: var(--ink); }
      .genre-pills { display: flex; gap: 8px; flex-wrap: wrap; }
      .pill {
        border: 1px solid var(--line); background: var(--card); color: var(--ink-soft);
        padding: 6px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500;
      }
      .pill.active { background: var(--forest); color: #fff; border-color: var(--forest); }

      /* ---------- BOOK GRID / CARD ---------- */
      .book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 16px; }
      .book-card {
        background: var(--card); border: 1px solid var(--line); border-radius: 4px; overflow: hidden;
        display: flex; flex-direction: column; transition: transform .15s ease, box-shadow .15s ease;
        cursor: pointer;
      }
      .book-card:hover { transform: translateY(-3px); box-shadow: 0 14px 26px -18px rgba(20,42,34,0.45); }
      .book-spine {
        background: var(--forest); color: #E0B876; font-family: 'IBM Plex Mono', monospace;
        font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 14px;
      }
      .book-info { padding: 16px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
      .book-info h4 { font-size: 15.5px; line-height: 1.3; }
      .author { color: var(--ink-soft); font-size: 13.5px; margin: 0; }
      .isbn { color: var(--ink-soft); font-size: 11.5px; font-family: 'IBM Plex Mono', monospace; margin: 2px 0 10px; opacity: 0.75; }
      .book-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; }

      .avail-badge {
        display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
        padding: 4px 9px; border-radius: 999px;
      }
      .avail-badge.yes { background: var(--sage-light); color: #3E4C2F; }
      .avail-badge.no { background: #EFE3D0; color: var(--brass); }

      .btn-small {
        background: var(--brass); color: var(--forest-deep); border: none; border-radius: 3px;
        padding: 7px 12px; font-size: 12.5px; font-weight: 700; white-space: nowrap;
      }
      .btn-small:disabled { background: var(--parchment-deep); color: var(--ink-soft); cursor: not-allowed; }
      .btn-small.btn-cancel { background: var(--rust-light); color: var(--rust); }
      .btn-small.btn-return { background: var(--sage-light); color: #3E4C2F; }

      /* ---------- RECORD LIST (user's borrowed books) ---------- */
      .record-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 6px; }
      .record-row {
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
        background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--sage);
        border-radius: 4px; padding: 16px 18px;
      }
      .record-row.status-overdue { border-left-color: var(--rust); }
      .record-row.status-returned { border-left-color: var(--line); opacity: 0.85; }
      .record-row.status-hold { border-left-color: var(--amber); }
      .record-main h4 { font-size: 15px; margin-bottom: 4px; }
      .record-meta { font-size: 12.5px; color: var(--ink-soft); display: flex; gap: 8px; align-items: center; }
      .record-side { display: flex; align-items: center; gap: 12px; }
      .hold-countdown { display: inline-flex; align-items: center; gap: 4px; color: var(--rust); font-weight: 700; }

      .status-chip {
        display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
        padding: 5px 10px; border-radius: 999px; white-space: nowrap;
      }
      .status-chip.returned { background: var(--parchment-deep); color: var(--ink-soft); }
      .status-chip.active { background: var(--sage-light); color: #3E4C2F; }
      .status-chip.overdue { background: var(--rust-light); color: var(--rust); }
      .status-chip.hold { background: var(--amber-light); color: var(--amber); }
      .status-chip.hold-timer { background: var(--rust-light); color: var(--rust); font-weight: 700; }
      .status-chip.onwaitlist,
      .avail-badge.onwaitlist,
      .btn-onwaitlist {
        display: inline-flex; align-items: center; gap: 5px;
        background: #7FC29B; border: 1px solid #7FC29B; color: #142A22;
      }
      .btn-onwaitlist:hover { background: #6FB48B; border-color: #6FB48B; }

      /* ---------- TABLE (librarian) ---------- */
      .table-card { background: var(--card); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
      table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      thead tr { background: var(--parchment-deep); }
      th { text-align: left; padding: 12px 16px; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); font-weight: 600; }
      td { padding: 13px 16px; border-top: 1px solid var(--line); vertical-align: middle; }
      td.strong { font-weight: 600; color: var(--forest-deep); }
      .muted { color: var(--ink-soft); font-size: 12px; display: block; }
      .reader-cell { display: flex; flex-direction: column; gap: 2px; }
      .tag { background: var(--parchment-deep); color: var(--ink-soft); padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 600; }
      .row-actions { display: flex; gap: 6px; }
      .icon-btn {
        border: 1px solid var(--line); background: #fff; border-radius: 3px; padding: 6px; color: var(--ink-soft);
        display: inline-flex; align-items: center; justify-content: center;
      }
      .icon-btn:hover { border-color: var(--brass); color: var(--brass); }
      .icon-btn.danger:hover { border-color: var(--rust); color: var(--rust); }
      .icon-btn.approve { color: var(--sage); border-color: var(--sage-light); }
      .icon-btn.approve:hover { border-color: var(--sage); background: var(--sage-light); }

      .stepper { display: inline-flex; align-items: center; gap: 8px; }
      .stepper-btn { padding: 5px; }
      .stepper-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .stepper-btn:disabled:hover { border-color: var(--line); color: var(--ink-soft); }
      .stepper-value { min-width: 44px; text-align: center; }

      .filter-toggle { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); font-size: 13px; }
      .filter-toggle button { border: 1px solid var(--line); background: var(--card); padding: 6px 12px; border-radius: 999px; font-size: 12.5px; color: var(--ink-soft); font-weight: 500; }
      .filter-toggle button.active { background: var(--forest); color: #fff; border-color: var(--forest); }

      .empty-state { padding: 30px 10px; text-align: center; color: var(--ink-soft); font-size: 14px; grid-column: 1 / -1; }

      /* ---------- MODAL ---------- */
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(20,42,34,0.45); display: flex;
        align-items: center; justify-content: center; padding: 20px; z-index: 50;
      }
      .modal { background: var(--card); border-radius: 5px; padding: 26px; width: 100%; max-width: 420px; border: 1px solid var(--line); }
      .modal.book-modal { max-width: 480px; max-height: 85vh; overflow-y: auto; }
      .book-modal-body { display: flex; flex-direction: column; gap: 10px; }
      .book-modal-top { display: flex; align-items: center; gap: 8px; }
      .book-modal-author { font-size: 14.5px; color: var(--forest-deep); font-weight: 600; margin: 4px 0 0; }
      .book-modal-isbn { font-size: 12px; font-family: 'IBM Plex Mono', monospace; color: var(--ink-soft); opacity: 0.8; margin: 0; }
      .book-modal-desc { font-size: 14px; line-height: 1.65; color: var(--ink); margin: 8px 0 4px; }
      .modal-borrow { align-self: flex-start; padding: 9px 16px; margin-bottom: 6px; }
      .author-section { border-top: 1px solid var(--line); padding-top: 14px; margin-top: 6px; }
      .author-section h4 { font-size: 13.5px; color: var(--forest-deep); margin-bottom: 8px; }
      .author-bio { font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); margin: 0; }
      .more-books-list { display: flex; flex-direction: column; gap: 6px; }
      .more-book-row {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        background: var(--parchment-deep); border: none; border-radius: 3px; padding: 9px 12px;
        font-size: 13.5px; color: var(--ink); text-align: left;
      }
      .more-book-row:hover { background: var(--line); }
      .more-book-title { font-weight: 600; }
      .avail-badge.sm { font-size: 11px; padding: 3px 7px; }
      .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
      .modal-head h3 { font-size: 18px; }

      @media (max-width: 760px) {
        .auth-card-frame { grid-template-columns: 1fr; }
        .auth-left { padding: 32px 26px; }
        .stamp-decor { display: none; }
        .topbar { flex-direction: column; align-items: flex-start; }
        .tab-drawer { width: 100%; overflow-x: auto; }
      }
    `}</style>
  );
}