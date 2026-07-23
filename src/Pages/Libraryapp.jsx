import React, { useState, useEffect } from "react";
import {
  LibraryBig, User, UserCog, Mail, Lock, ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  DUMMY_BOOKS, DUMMY_BORROWERS,
  DUMMY_USERS, registerUser, emailExists,
} from "./Dummydata";
import { GlobalStyle, DueStamp } from "./LibraryShared";
import { TODAY, HOLD_DURATION_MS, uid, msLeft } from "./libraryHelpers";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function App({ initialSession = null }) {
  const [session, setSession] = useState(initialSession); // { role: 'user'|'librarian', user: {...} }
  const [books, setBooks] = useState(DUMMY_BOOKS);
  const [borrowers, setBorrowers] = useState(DUMMY_BORROWERS);
  const [holds, setHolds] = useState([]); // pending borrow requests awaiting librarian approval
  const [now, setNow] = useState(Date.now());

  // tick every 30s so countdowns stay fresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // auto-release any hold that's been sitting for 24h without approval
  useEffect(() => {
    const expired = holds.filter((h) => msLeft(h.requestedAt, now) === 0);
    if (expired.length === 0) return;
    setHolds((prev) => prev.filter((h) => msLeft(h.requestedAt, now) > 0));
    setBooks((prev) =>
      prev.map((b) => {
        const releasedCount = expired.filter((h) => h.bookId === b.id && h.reserved).length;
        return releasedCount > 0 ? { ...b, available: b.available + releasedCount } : b;
      })
    );
  }, [now, holds]);

  function requestBorrow(book, user) {
    // Guard against double-clicks / stale UI creating a second hold for the
    // same reader on the same book before the button has a chance to swap
    // into its "pending" state.
    const alreadyHasHold = holds.some((h) => h.bookId === book.id && h.userId === user.id);
    if (alreadyHasHold) return;

    // Was a physical copy actually taken off the shelf for this hold?
    // Recorded once, here, and never re-derived from live stock later —
    // that's what the countdown display and the +1-on-release logic rely
    // on, so a book with several copies doesn't wrongly look "available
    // again" the moment one of them gets reserved.
    const reserved = book.available > 0;

    setBooks((prev) =>
      prev.map((b) => (b.id === book.id && b.available > 0 ? { ...b, available: b.available - 1 } : b))
    );
    setHolds((prev) => [
      ...prev,
      {
        id: uid("hold"),
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        requestedAt: Date.now(),
        reserved,
      },
    ]);
  }

  function cancelHold(holdId) {
    const hold = holds.find((h) => h.id === holdId);
    if (!hold) return;
    setHolds((prev) => prev.filter((h) => h.id !== holdId));
    // Only give a copy back if this hold had actually taken one — a
    // waitlist-only hold (book was already out when requested) never
    // reserved anything, so cancelling it shouldn't inflate the count.
    if (hold.reserved) {
      setBooks((prev) => prev.map((b) => (b.id === hold.bookId ? { ...b, available: b.available + 1 } : b)));
    }
  }

  function approveHold(holdId) {
    const hold = holds.find((h) => h.id === holdId);
    if (!hold) return;
    setHolds((prev) => prev.filter((h) => h.id !== holdId));

    const borrowedISO = TODAY.toISOString().slice(0, 10);
    const dueDate = new Date(TODAY);
    dueDate.setDate(dueDate.getDate() + 14);
    const newRecord = {
      id: uid("rec"),
      bookId: hold.bookId,
      title: hold.bookTitle,
      borrowed: borrowedISO,
      due: dueDate.toISOString().slice(0, 10),
      returned: null,
    };

    setBorrowers((prev) => {
      const exists = prev.some((b) => b.id === hold.userId);
      if (exists) {
        return prev.map((b) =>
          b.id === hold.userId ? { ...b, records: [newRecord, ...b.records] } : b
        );
      }
      return [
        ...prev,
        { id: hold.userId, name: hold.userName, email: hold.userEmail, records: [newRecord] },
      ];
    });
    // stock was already reserved when the hold was placed, so no further
    // subtraction here — the copy simply changes from "on hold" to "on loan".
  }

  function rejectHold(holdId) {
    cancelHold(holdId); // same effect: release the reserved copy back to the shelf
  }

  function returnBook(record) {
    setBorrowers((prev) =>
      prev.map((b) => ({
        ...b,
        records: b.records.map((r) =>
          r.id === record.id ? { ...r, returned: TODAY.toISOString().slice(0, 10) } : r
        ),
      }))
    );
    if (record.bookId != null) {
      setBooks((prev) =>
        prev.map((b) => (b.id === record.bookId ? { ...b, available: b.available + 1 } : b))
      );
    }
  }

  return (
    <div className="lms-root">
      <GlobalStyle />
      {!session ? (
        <AuthScreen onLogin={setSession} />
      ) : session.role === "user" ? (
        <UserDashboard
          currentUser={session.user}
          books={books}
          borrowers={borrowers}
          holds={holds}
          now={now}
          onLogout={() => setSession(null)}
          onBorrow={(book) => requestBorrow(book, session.user)}
          onCancelHold={cancelHold}
          onReturn={returnBook}
        />
      ) : (
        <AdminDashboard
          books={books}
          setBooks={setBooks}
          borrowers={borrowers}
          holds={holds}
          now={now}
          onLogout={() => setSession(null)}
          onApproveHold={approveHold}
          onRejectHold={rejectHold}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH SCREEN (Login / Signup, role switch)
   Validates against DUMMY_USERS from Dummydata.js. If your project
   already has separate Login.jsx / Signup.jsx pages wired into routing,
   port this validation logic over there instead of using this screen.
--------------------------------------------------------- */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("user"); // user | librarian
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const match = DUMMY_USERS.find(
        (u) => u.email.trim().toLowerCase() === form.email.trim().toLowerCase() && u.password === form.password
      );
      if (!match) { setError("No account matches that email and password."); return; }
      if (match.role !== role) {
        setError(`That email is registered as a ${match.role === "librarian" ? "Librarian" : "Reader"} — switch tabs above and try again.`);
        return;
      }
      onLogin({ role: match.role, user: { id: match.id, name: match.name, email: match.email } });
    } else {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Fill in every field to create an account.");
        return;
      }
      if (emailExists(form.email)) { setError("An account with that email already exists."); return; }
      const created = registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role });
      onLogin({ role: created.role, user: { id: created.id, name: created.name, email: created.email } });
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card-frame">
        <div className="auth-left">
          <div className="brand">
            <div className="brand-mark"><LibraryBig size={22} /></div>
            <span>Shelfwise</span>
          </div>
          <h1>Every book has a due date.<br />Every reader has a record.</h1>
          <p>
            Browse the catalog, track what you've borrowed, and never miss a return —
            or, if you run the desk, keep every shelf and every reader in view.
          </p>
          <div className="stamp-decor" aria-hidden="true">
            <DueStamp label="DUE" date="19 JUL" tone="active" tilt={-9} />
          </div>
        </div>

        <div className="auth-right">
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

          <div className="mode-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>
              Log in
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && (
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
            )}
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

            {mode === "signup" && role === "librarian" && (
              <p className="hint">New librarian accounts are reviewed before shelf-management access is granted.</p>
            )}

            {error && <p className="form-error"><AlertTriangle size={13} /> {error}</p>}

            <button type="submit" className="btn-primary full">
              {mode === "login" ? "Log in" : "Create account"} as {role === "user" ? "Reader" : "Librarian"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-line">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}