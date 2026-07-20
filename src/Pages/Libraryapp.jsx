import React, { useState, useMemo } from "react";
import {
  BookOpen, Search, LogOut, User, Users, LibraryBig, Plus, Pencil,
  Trash2, CheckCircle2, AlertTriangle, Clock3, X, Mail, Lock,
  ArrowRight, ArrowLeft, UserCog, ClipboardList, Filter
} from "lucide-react";
import { DUMMY_BOOKS, DUMMY_BORROWERS, AUTHOR_BIOS } from "./dummyData";

/* ---------------------------------------------------------
   MOCK DATA — replace with real API calls later
--------------------------------------------------------- */

const TODAY = new Date("2026-07-19");

const GENRES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Mystery", "Biography", "Fantasy"];


/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function recordStatus(rec) {
  if (rec.returned) return "returned";
  const due = new Date(rec.due);
  return due < TODAY ? "overdue" : "active";
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function App({ initialSession = null }) {
  const [session, setSession] = useState(initialSession); // { role: 'user'|'librarian', user: {...} }
  const [books, setBooks] = useState(DUMMY_BOOKS);
  const [borrowers] = useState(DUMMY_BORROWERS);

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
          onLogout={() => setSession(null)}
        />
      ) : (
        <LibrarianDashboard
          books={books}
          setBooks={setBooks}
          borrowers={borrowers}
          onLogout={() => setSession(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH SCREEN (Login / Signup, role switch)
--------------------------------------------------------- */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("user"); // user | librarian
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function submit(e) {
    e.preventDefault();
    const demoUser =
      role === "user"
        ? { id: "u1", name: form.name || "Aditi Sharma", email: form.email || "aditi@mail.com" }
        : { id: "lib1", name: form.name || "Mr. Deshpande", email: form.email || "librarian@shelfwise.in" };
    onLogin({ role, user: demoUser });
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
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Log in
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
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

            <button type="submit" className="btn-primary full">
              {mode === "login" ? "Log in" : "Create account"} as {role === "user" ? "Reader" : "Librarian"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-line">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button className="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   DUE STAMP — signature component
--------------------------------------------------------- */

function DueStamp({ label = "DUE", date, tone = "active", tilt = -6, small = false }) {
  return (
    <div className={`due-stamp tone-${tone} ${small ? "sm" : ""}`} style={{ "--tilt": `${tilt}deg` }}>
      <span className="stamp-label">{label}</span>
      <span className="stamp-date">{date}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   SHARED: TOP NAV (catalog-drawer tabs)
--------------------------------------------------------- */

function CatalogNav({ tabs, active, onChange, name, roleLabel, onLogout }) {
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
   USER DASHBOARD
--------------------------------------------------------- */

function UserDashboard({ currentUser, books, borrowers, onLogout }) {
  const [tab, setTab] = useState("browse");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);

  const myRecords = useMemo(() => {
    const me = borrowers.find((b) => b.id === currentUser.id) || borrowers[0];
    return me.records;
  }, [borrowers, currentUser]);

  const filteredBooks = books.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = genre === "All" || b.genre === genre;
    return matchesQuery && matchesGenre;
  });

  const current = myRecords.filter((r) => !r.returned);
  const history = myRecords.filter((r) => r.returned);
  const overdueCount = current.filter((r) => recordStatus(r) === "overdue").length;

  return (
    <div className="dash">
      <CatalogNav
        tabs={[
          { key: "browse", label: "Browse books", icon: <BookOpen size={16} /> },
          { key: "mine", label: "My borrowed books", icon: <ClipboardList size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
        name={currentUser.name}
        roleLabel="Reader"
        onLogout={onLogout}
      />

      <main className="dash-body">
        {tab === "browse" && (
          <>
            <div className="section-head">
              <h2>Browse the catalog</h2>
              <p>{filteredBooks.length} of {books.length} titles shown</p>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Search by title or author…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="genre-pills">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    className={`pill ${genre === g ? "active" : ""}`}
                    onClick={() => setGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="book-grid">
              {filteredBooks.map((b) => (
                <BookCard key={b.id} book={b} onSelect={() => setSelectedBook(b)} />
              ))}
              {filteredBooks.length === 0 && (
                <EmptyState text="No titles match that search. Try a different keyword or genre." />
              )}
            </div>
          </>
        )}

        {tab === "mine" && (
          <>
            <div className="section-head">
              <h2>My borrowed books</h2>
              <p>
                {current.length} currently out
                {overdueCount > 0 && <span className="overdue-flag"> · {overdueCount} overdue</span>}
              </p>
            </div>

            <h3 className="subhead">Currently borrowed</h3>
            {current.length === 0 && <EmptyState text="Nothing checked out right now — browse the catalog to borrow a title." />}
            <div className="record-list">
              {current.map((r) => (
                <RecordRow key={r.id} record={r} />
              ))}
            </div>

            <h3 className="subhead">Past returns</h3>
            {history.length === 0 && <EmptyState text="Return history will appear here once you've returned a book." />}
            <div className="record-list">
              {history.map((r) => (
                <RecordRow key={r.id} record={r} />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          allBooks={books}
          onClose={() => setSelectedBook(null)}
          onSelectBook={(b) => setSelectedBook(b)}
        />
      )}
    </div>
  );
}

function BookCard({ book, onSelect }) {
  const isAvailable = book.available > 0;
  return (
    <div className="book-card" onClick={onSelect} role="button" tabIndex={0}>
      <div className="book-spine" aria-hidden="true">
        <span>{book.genre}</span>
      </div>
      <div className="book-info">
        <h4>{book.title}</h4>
        <p className="author">{book.author}</p>
        <p className="isbn">ISBN {book.isbn}</p>
        <div className="book-foot">
          <span className={`avail-badge ${isAvailable ? "yes" : "no"}`}>
            {isAvailable ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
            {isAvailable ? `${book.available} available` : "All copies out"}
          </span>
          <button
            className="btn-small"
            disabled={!isAvailable}
            onClick={(e) => e.stopPropagation()}
          >
            {isAvailable ? "Borrow" : "Join waitlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookDetailModal({ book, allBooks, onClose, onSelectBook }) {
  const bio = AUTHOR_BIOS[book.author];
  const moreByAuthor = allBooks.filter((b) => b.author === book.author && b.id !== book.id);
  const isAvailable = book.available > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{book.title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="book-modal-body">
          <div className="book-modal-top">
            <span className="tag">{book.genre}</span>
            <span className={`avail-badge ${isAvailable ? "yes" : "no"}`}>
              {isAvailable ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
              {isAvailable ? `${book.available} available` : "All copies out"}
            </span>
          </div>

          <p className="book-modal-author">by {book.author}</p>
          <p className="book-modal-isbn">ISBN {book.isbn}</p>

          <p className="book-modal-desc">{book.description || "No description available for this title yet."}</p>

          <button className="btn-small modal-borrow" disabled={!isAvailable}>
            {isAvailable ? "Borrow this book" : "Join waitlist"}
          </button>

          <div className="author-section">
            <h4>About the author</h4>
            <p className="author-bio">{bio || `No profile available yet for ${book.author}.`}</p>
          </div>

          {moreByAuthor.length > 0 && (
            <div className="author-section">
              <h4>More by {book.author}</h4>
              <div className="more-books-list">
                {moreByAuthor.map((b) => (
                  <button key={b.id} className="more-book-row" onClick={() => onSelectBook(b)}>
                    <span className="more-book-title">{b.title}</span>
                    <span className={`avail-badge sm ${b.available > 0 ? "yes" : "no"}`}>
                      {b.available > 0 ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                      {b.available > 0 ? `${b.available} available` : "Out"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordRow({ record }) {
  const status = recordStatus(record);
  const stampDate = new Date(record.due).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase();
  return (
    <div className={`record-row status-${status}`}>
      <div className="record-main">
        <h4>{record.title}</h4>
        <div className="record-meta">
          <span>Borrowed {fmtDate(record.borrowed)}</span>
          <span className="dot">·</span>
          {record.returned ? (
            <span>Returned {fmtDate(record.returned)}</span>
          ) : (
            <span>Due {fmtDate(record.due)}</span>
          )}
        </div>
      </div>
      <div className="record-side">
        {record.returned ? (
          <span className="status-chip returned"><CheckCircle2 size={13} /> Returned</span>
        ) : (
          <>
            <DueStamp
              date={stampDate}
              label={status === "overdue" ? "LATE" : "DUE"}
              tone={status}
              tilt={status === "overdue" ? 7 : -6}
              small
            />
            {status === "overdue" && (
              <span className="status-chip overdue">
                <AlertTriangle size={13} /> {daysBetween(record.due, TODAY)} days overdue
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LIBRARIAN DASHBOARD
--------------------------------------------------------- */

function LibrarianDashboard({ books, setBooks, borrowers, onLogout }) {
  const [tab, setTab] = useState("books");
  const [filter, setFilter] = useState("all"); // all | overdue
  const [showAdd, setShowAdd] = useState(false);
  const [bookQuery, setBookQuery] = useState("");

  const allRecordsFlat = borrowers.flatMap((b) =>
    b.records.map((r) => ({ ...r, borrowerName: b.name, borrowerEmail: b.email, status: recordStatus(r) }))
  );
  const visibleRecords = filter === "overdue" ? allRecordsFlat.filter((r) => r.status === "overdue") : allRecordsFlat;
  const overdueTotal = allRecordsFlat.filter((r) => r.status === "overdue").length;

  const visibleBooks = books.filter((b) => {
    const q = bookQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
    );
  });

  function toggleAvailability(id) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, available: b.available > 0 ? 0 : Math.max(1, b.total) } : b
      )
    );
  }

  function removeBook(id) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="dash">
      <CatalogNav
        tabs={[
          { key: "books", label: "Manage books", icon: <BookOpen size={16} /> },
          { key: "borrowers", label: "All borrowers", icon: <Users size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
        name="Mr. Deshpande"
        roleLabel="Librarian"
        onLogout={onLogout}
      />

      <main className="dash-body">
        {tab === "books" && (
          <>
            <div className="section-head row">
              <div>
                <h2>Manage the catalog</h2>
                <p>{visibleBooks.length} of {books.length} titles shown</p>
              </div>
              <button className="btn-primary" onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add book
              </button>
            </div>

            <div className="search-box lib-search">
              <Search size={16} />
              <input
                placeholder="Search by title, author, genre, or ISBN…"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
              />
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Copies</th>
                    <th>Status</th>
                    <th aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBooks.map((b) => (
                    <tr key={b.id}>
                      <td className="strong">{b.title}</td>
                      <td>{b.author}</td>
                      <td><span className="tag">{b.genre}</span></td>
                      <td className="mono">{b.available}/{b.total}</td>
                      <td>
                        <span className={`avail-badge ${b.available > 0 ? "yes" : "no"}`}>
                          {b.available > 0 ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                          {b.available > 0 ? "Available" : "Fully out"}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button className="icon-btn" title="Toggle availability" onClick={() => toggleAvailability(b.id)}>
                          <Pencil size={14} />
                        </button>
                        <button className="icon-btn danger" title="Remove book" onClick={() => removeBook(b.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibleBooks.length === 0 && (
                    <tr><td colSpan={6}><EmptyState text="No titles match that search." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "borrowers" && (
          <>
            <div className="section-head row">
              <div>
                <h2>All borrowers</h2>
                <p>
                  {allRecordsFlat.length} loan records
                  {overdueTotal > 0 && <span className="overdue-flag"> · {overdueTotal} overdue</span>}
                </p>
              </div>
              <div className="filter-toggle">
                <Filter size={14} />
                <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
                <button className={filter === "overdue" ? "active" : ""} onClick={() => setFilter("overdue")}>Overdue only</button>
              </div>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Reader</th>
                    <th>Book</th>
                    <th>Borrowed</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="reader-cell">
                          <span className="strong">{r.borrowerName}</span>
                          <span className="muted">{r.borrowerEmail}</span>
                        </div>
                      </td>
                      <td>{r.title}</td>
                      <td className="mono">{fmtDate(r.borrowed)}</td>
                      <td className="mono">{fmtDate(r.due)}</td>
                      <td>
                        {r.status === "returned" && <span className="status-chip returned"><CheckCircle2 size={13} /> Returned</span>}
                        {r.status === "active" && <span className="status-chip active"><Clock3 size={13} /> On loan</span>}
                        {r.status === "overdue" && (
                          <span className="status-chip overdue">
                            <AlertTriangle size={13} /> {daysBetween(r.due, TODAY)}d overdue
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {visibleRecords.length === 0 && (
                    <tr><td colSpan={5}><EmptyState text="No overdue loans right now." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} onAdd={(book) => setBooks((p) => [...p, book])} books={books} />}
    </div>
  );
}

function AddBookModal({ onClose, onAdd, books }) {
  const [form, setForm] = useState({ title: "", author: "", genre: "Fiction", total: 1 });

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    onAdd({
      id: Math.max(0, ...books.map((b) => b.id)) + 1,
      title: form.title,
      author: form.author,
      genre: form.genre,
      isbn: "978-0000000000",
      total: Number(form.total) || 1,
      available: Number(form.total) || 1,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add a new book</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span>Title</span>
            <div className="input-wrap">
              <input placeholder="Book title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </label>
          <label className="field">
            <span>Author</span>
            <div className="input-wrap">
              <input placeholder="Author name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
          </label>
          <label className="field">
            <span>Genre</span>
            <div className="input-wrap">
              <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                {GENRES.filter((g) => g !== "All").map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </label>
          <label className="field">
            <span>Total copies</span>
            <div className="input-wrap">
              <input type="number" min="1" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
            </div>
          </label>
          <button type="submit" className="btn-primary full">Add to catalog</button>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <ArrowLeft size={0} />
      <p>{text}</p>
    </div>
  );
}

/* ---------------------------------------------------------
   GLOBAL STYLE
--------------------------------------------------------- */

function GlobalStyle() {
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
        padding: 7px 12px; font-size: 12.5px; font-weight: 700;
      }
      .btn-small:disabled { background: var(--parchment-deep); color: var(--ink-soft); cursor: not-allowed; }

      /* ---------- RECORD LIST (user's borrowed books) ---------- */
      .record-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 6px; }
      .record-row {
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
        background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--sage);
        border-radius: 4px; padding: 16px 18px;
      }
      .record-row.status-overdue { border-left-color: var(--rust); }
      .record-row.status-returned { border-left-color: var(--line); opacity: 0.85; }
      .record-main h4 { font-size: 15px; margin-bottom: 4px; }
      .record-meta { font-size: 12.5px; color: var(--ink-soft); display: flex; gap: 8px; }
      .record-side { display: flex; align-items: center; gap: 12px; }

      .status-chip {
        display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
        padding: 5px 10px; border-radius: 999px; white-space: nowrap;
      }
      .status-chip.returned { background: var(--parchment-deep); color: var(--ink-soft); }
      .status-chip.active { background: var(--sage-light); color: #3E4C2F; }
      .status-chip.overdue { background: var(--rust-light); color: var(--rust); }

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