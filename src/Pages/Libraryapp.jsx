import React, { useState, useEffect } from "react";
import {
  LibraryBig, User, UserCog, Mail, Lock, ArrowRight, AlertTriangle,
} from "lucide-react";
import { GlobalStyle, DueStamp } from "./LibraryShared";
import { TODAY, HOLD_DURATION_MS, uid, msLeft } from "./libraryHelpers";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import { authFetch, getToken } from "../libraryApi";
import { io } from "socket.io-client";

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function App({ initialSession = null, onLogout = () => {} }) {
  const [session, setSession] = useState(initialSession); // { role: 'user'|'librarian', user: {...} }
  const [books, setBooks] = useState([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [borrowers, setBorrowers] = useState([]);
  const [holds, setHolds] = useState([]); // pending borrow requests awaiting librarian approval
  const [now, setNow] = useState(Date.now());
  const [socket, setSocket] = useState(null);
  const [adminHistory, setAdminHistory] = useState([]);

  // tick every 30s so countdowns stay fresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  function applyLibraryState(data) {
    if (!data) return;
    setBooks(Array.isArray(data.books) ? data.books : []);
    setHolds(Array.isArray(data.holds) ? data.holds : []);
    setBorrowers(Array.isArray(data.borrowers) ? data.borrowers : []);
    setBooksLoaded(true);
  }

  useEffect(() => {
    if (!session) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const newSocket = io("http://localhost:3000", {
      auth: { token: getToken() },
      withCredentials: true,
      transports: ["websocket"]
    });

    newSocket.on("library_state_update", (data) => {
      applyLibraryState(data);
    });

    setSocket(newSocket);

    // Initial fetch to ensure data is loaded quickly
    authFetch("/library/state")
      .then((res) => res.ok ? res.json() : null)
      .then(applyLibraryState)
      .catch(() => setBooksLoaded(true));

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  // Fetch full borrow history for admin
  useEffect(() => {
    if (session?.role === "librarian") {
      authFetch("/library/history/all")
        .then(res => res.ok ? res.json() : [])
        .then(data => setAdminHistory(data))
        .catch(err => console.error("Failed to load history", err));
    }
  }, [session, holds, borrowers]);

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

    const hold = {
      id: uid("hold"), bookId: book.id, bookTitle: book.title, bookAuthor: book.author,
      userId: user.id, userName: user.name, userEmail: user.email, requestedAt: Date.now(), reserved,
    };
    authFetch("/library/holds", { method: "POST", body: JSON.stringify(hold) })
      .then((response) => response.ok ? response.json() : null)
      .then(applyLibraryState);
  }

  function cancelHold(holdId) {
    const hold = holds.find((h) => h.id === holdId);
    if (!hold) return;
    authFetch(`/library/holds/${holdId}`, { method: "DELETE" })
      .then((response) => response.ok ? response.json() : null)
      .then(applyLibraryState);
  }

  function approveHold(holdId) {
    const hold = holds.find((h) => h.id === holdId);
    if (!hold) return;
    authFetch(`/library/holds/${holdId}/approve`, { method: "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then(applyLibraryState);
    // stock was already reserved when the hold was placed, so no further
    // subtraction here — the copy simply changes from "on hold" to "on loan".
  }

  function handleBookStockChange(nextBooks) {
    const previousAvailability = new Map();
    books.forEach((book) => previousAvailability.set(book.id, book.available));

    nextBooks.forEach((book) => {
      const previous = previousAvailability.get(book.id) ?? 0;
      if (previous <= 0 && book.available > 0) {
        const waitlistHolders = holds.filter((hold) => hold.bookId === book.id && !hold.reserved);
        waitlistHolders.forEach((hold) => {
          window.dispatchEvent(new CustomEvent("shelfwise:availability", {
            detail: { userId: hold.userId, bookId: book.id, title: book.title },
          }));
        });
      }
    });
  }

  function rejectHold(holdId) {
    authFetch(`/library/holds/${holdId}/reject`, { method: "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then(applyLibraryState);
  }

  function returnBook(record) {
    authFetch(`/library/records/${record.id}/return`, {
      method: "POST",
      body: JSON.stringify({ bookId: record.bookId }),
    }).then((response) => response.ok ? response.json() : null).then(applyLibraryState);
  }

  function adjustBookAvailability(bookId, delta) {
    authFetch(`/library/books/${bookId}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ delta }),
    }).then((response) => response.ok ? response.json() : null).then(applyLibraryState);
  }

  function removeBook(bookId) {
    authFetch(`/library/books/${bookId}`, { method: "DELETE" })
      .then((response) => response.ok ? response.json() : null)
      .then(applyLibraryState);
  }

  function addBook(book) {
    authFetch("/library/books", {
      method: "POST",
      body: JSON.stringify(book),
    }).then((response) => response.ok ? response.json() : null).then(applyLibraryState);
  }

  if (!booksLoaded && !session) {
    return (
      <div className="lms-root">
        <GlobalStyle />
        <div className="auth-wrap">
          <div className="auth-card-frame">
            <div className="auth-left">
              <div className="brand">
                <div className="brand-mark"><LibraryBig size={22} /></div>
                <span>Shelfwise</span>
              </div>
              <h1>Loading your library catalog…</h1>
              <p>We’re connecting to the live book service using your Google Books API key.</p>
            </div>
          </div>
        </div>
      </div>
    );
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
          onLogout={onLogout}
          onBorrow={(book) => requestBorrow(book, session.user)}
          onCancelHold={cancelHold}
          onReturn={returnBook}
        />
      ) : (
        <AdminDashboard
          currentUser={session.user}
          books={books}
          setBooks={setBooks}
          onAdjustBook={adjustBookAvailability}
          onRemoveBook={removeBook}
          onAddBook={addBook}
          borrowers={borrowers}
          adminHistory={adminHistory}
          holds={holds}
          now={now}
          onLogout={onLogout}
          onApproveHold={approveHold}
          onRejectHold={rejectHold}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH SCREEN (Login / Signup, role switch)
   Uses the backend authentication endpoints for login and signup.
--------------------------------------------------------- */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("user"); // user | librarian
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        const res = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Login failed");
        }

        const profileRes = await fetch("http://localhost:3000/users/me", { credentials: "include" });
        if (!profileRes.ok) throw new Error("Unable to load your profile");
        const user = await profileRes.json();

        if (user.role !== role) {
          throw new Error(`That account is registered as a ${user.role === "librarian" ? "Librarian" : "Reader"}.`);
        }

        onLogin({ role: user.role, user: { id: user._id, name: user.name, email: user.email } });
      } else {
        if (!form.name.trim() || !form.email.trim() || !form.password) {
          throw new Error("Fill in every field to create an account.");
        }

        const res = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password, role }),
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Signup failed");
        }

        onLogin({ role, user: { id: `new-${Date.now()}`, name: form.name.trim(), email: form.email.trim() } });
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
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

            <button type="submit" className="btn-primary full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"} as {role === "user" ? "Reader" : "Librarian"}
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