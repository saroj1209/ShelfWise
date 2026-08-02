import React, { useState } from "react";
import {
  BookOpen, Users, Plus, Minus, Trash2, CheckCircle2, AlertTriangle,
  Clock3, X, ClipboardList, Filter, Hourglass, Check, Ban, Search,
} from "lucide-react";
import { CatalogNav, EmptyState } from "./LibraryShared";
import { GENRES, TODAY, fmtDate, recordStatus, daysBetween, msLeft, fmtCountdown } from "./libraryHelpers";

/* ---------------------------------------------------------
   ADMIN DASHBOARD (Librarian)
--------------------------------------------------------- */

export default function AdminDashboard({ currentUser, books, setBooks, borrowers, holds, now, onLogout, onApproveHold, onRejectHold }) {
  const [tab, setTab] = useState("requests");
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

  function adjustAvailable(id, delta) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, available: Math.max(0, Math.min(b.total, b.available + delta)) } : b
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
          { key: "requests", label: "Borrow requests", icon: <Hourglass size={16} />, badge: holds.length },
        ]}
        active={tab}
        onChange={setTab}
        name={currentUser?.name || "Librarian"}
        roleLabel="Librarian"
        onLogout={onLogout}
      />

      <main className="dash-body">
        {tab === "requests" && (
          <>
            <div className="section-head">
              <h2>Borrow requests</h2>
              <p>{holds.length} pending · each hold releases automatically after 24 hours if not approved</p>
            </div>

            {holds.length === 0 ? (
              <EmptyState text="No pending borrow requests right now." />
            ) : (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Reader</th>
                      <th>Book</th>
                      <th>Requested</th>
                      <th>Time left</th>
                      <th aria-label="Actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {holds.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <div className="reader-cell">
                            <span className="strong">{h.userName}</span>
                            <span className="muted">{h.userEmail}</span>
                          </div>
                        </td>
                        <td>
                          <span className="strong">{h.bookTitle}</span>
                          <span className="muted">{h.bookAuthor}</span>
                        </td>
                        <td className="mono">
                          {new Date(h.requestedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td>
                          <span className="status-chip hold-timer"><Hourglass size={13} /> {fmtCountdown(msLeft(h.requestedAt, now))}</span>
                        </td>
                        <td className="row-actions">
                          <button className="icon-btn approve" title="Approve request" onClick={() => onApproveHold(h.id)}>
                            <Check size={14} />
                          </button>
                          <button className="icon-btn danger" title="Reject request" onClick={() => onRejectHold(h.id)}>
                            <Ban size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

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
                      <td className="mono">
                        <div className="stepper">
                          <button
                            className="icon-btn stepper-btn"
                            title="Take one copy off the shelf"
                            onClick={() => adjustAvailable(b.id, -1)}
                            disabled={b.available <= 0}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="stepper-value">{b.available}/{b.total}</span>
                          <button
                            className="icon-btn stepper-btn"
                            title="Add one copy back to the shelf"
                            onClick={() => adjustAvailable(b.id, 1)}
                            disabled={b.available >= b.total}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`avail-badge ${b.available > 0 ? "yes" : "no"}`}>
                          {b.available > 0 ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                          {b.available > 0 ? "Available" : "Fully out"}
                        </span>
                      </td>
                      <td className="row-actions">
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