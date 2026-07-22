import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen, Search, ClipboardList, CheckCircle2, AlertTriangle,
  Clock3, X, Bell,
} from "lucide-react";
import { CatalogNav, DueStamp, EmptyState } from "./LibraryShared";
import { GENRES, TODAY, fmtDate, recordStatus, daysBetween } from "./libraryHelpers";
import { AUTHOR_BIOS } from "./Dummydata";

/* ---------------------------------------------------------
   USER DASHBOARD (Reader)
--------------------------------------------------------- */

export default function UserDashboard({ currentUser, books, borrowers, holds, now, onLogout, onBorrow, onCancelHold, onReturn }) {
  const [tab, setTab] = useState("browse");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);

  const myRecords = useMemo(() => {
    const me = borrowers.find((b) => b.id === currentUser.id);
    return me ? me.records : [];
  }, [borrowers, currentUser]);

  const myHolds = useMemo(
    () => holds.filter((h) => h.userId === currentUser.id),
    [holds, currentUser]
  );

  /* -----------------------------------------------------
     Waitlist availability notifications
     Watches books this user is on the waitlist for, and
     raises a dismissible toast the moment a copy frees up.
  ----------------------------------------------------- */
  const [notifications, setNotifications] = useState([]);
  const prevAvailability = useRef({});

  useEffect(() => {
    const justFreedUp = [];

    books.forEach((b) => {
      const wasOut = prevAvailability.current[b.id] === 0;
      const isNowAvailable = b.available > 0;
      const hasMyHold = holds.some((h) => h.bookId === b.id && h.userId === currentUser.id);

      if (wasOut && isNowAvailable && hasMyHold) {
        justFreedUp.push(b);
      }
      prevAvailability.current[b.id] = b.available;
    });

    if (justFreedUp.length > 0) {
      setNotifications((prev) => [
        ...prev,
        ...justFreedUp.map((b) => ({
          id: `${b.id}-avail-${Date.now()}`,
          bookId: b.id,
          type: "available",
          title: b.title,
          message: "is now available to borrow.",
        })),
      ]);
    }
  }, [books, holds, currentUser.id]);

  function dismissNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  // Wraps onBorrow so joining a waitlist gets an immediate checkmark
  // confirmation, on top of the later "it's available" notification.
  function handleBorrow(book) {
    onBorrow(book);
    if (book.available <= 0) {
      setNotifications((prev) => [
        ...prev,
        {
          id: `${book.id}-joined-${Date.now()}`,
          bookId: book.id,
          type: "joined",
          title: book.title,
          message: "added to your waitlist — we'll notify you when it's available.",
        },
      ]);
    }
  }

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
      <NotifStyle />

      {notifications.length > 0 && (
        <div className="notif-stack">
          {notifications.map((n) => (
            <div key={n.id} className={`notif-toast ${n.type === "joined" ? "notif-joined" : "notif-available"}`}>
              {n.type === "joined" ? (
                <CheckCircle2 size={15} className="notif-icon" />
              ) : (
                <Bell size={15} className="notif-icon" />
              )}
              <div className="notif-text">
                <strong>{n.title}</strong> {n.message}
              </div>
              <button
                className="notif-dismiss"
                onClick={() => dismissNotification(n.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <CatalogNav
        tabs={[
          { key: "browse", label: "Browse books", icon: <BookOpen size={16} /> },
          {
            key: "mine",
            label: "My borrowed books",
            icon: <ClipboardList size={16} />,
            badge: myHolds.length,
          },
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
                <BookCard
                  key={b.id}
                  book={b}
                  onSelect={() => setSelectedBook(b)}
                  currentUser={currentUser}
                  holds={holds}
                  now={now}
                  onBorrow={handleBorrow}
                  onCancelHold={onCancelHold}
                />
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

            {myHolds.length > 0 && (
              <>
                <h3 className="subhead">On waitlist</h3>
                <div className="record-list">
                  {myHolds.map((h) => (
                    <HoldRow key={h.id} hold={h} onCancel={() => onCancelHold(h.id)} />
                  ))}
                </div>
              </>
            )}

            <h3 className="subhead">Currently borrowed</h3>
            {current.length === 0 && <EmptyState text="Nothing checked out right now — browse the catalog to borrow a title." />}
            <div className="record-list">
              {current.map((r) => (
                <RecordRow key={r.id} record={r} onReturn={() => onReturn(r)} />
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
          currentUser={currentUser}
          holds={holds}
          now={now}
          onBorrow={handleBorrow}
          onCancelHold={onCancelHold}
        />
      )}
    </div>
  );
}

/* Pending-hold row shown to the requester, with a cancel option */
function HoldRow({ hold, onCancel }) {
  return (
    <div className="record-row status-hold">
      <div className="record-main">
        <h4>{hold.bookTitle}</h4>
        <div className="record-meta">
          <span>Requested {new Date(hold.requestedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
      <div className="record-side">
        <span className="status-chip onwaitlist"><CheckCircle2 size={13} /> On waitlist</span>
        <button className="btn-small btn-cancel" onClick={onCancel}>Cancel request</button>
      </div>
    </div>
  );
}

function BookCard({ book, onSelect, currentUser, holds, now, onBorrow, onCancelHold }) {
  const isAvailable = book.available > 0;
  const myHold = holds.find((h) => h.bookId === book.id && h.userId === currentUser.id);

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
          {myHold ? (
            <button
              className="btn-small btn-onwaitlist"
              onClick={(e) => { e.stopPropagation(); onCancelHold(myHold.id); }}
            >
              <CheckCircle2 size={13} /> On waitlist
            </button>
          ) : (
            <>
              <span className={`avail-badge ${isAvailable ? "yes" : "no"}`}>
                {isAvailable ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                {isAvailable ? `${book.available} available` : "All copies out"}
              </span>
              <button
                className="btn-small"
                onClick={(e) => { e.stopPropagation(); onBorrow(book); }}
              >
                {isAvailable ? "Borrow" : "Join waitlist"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookDetailModal({ book, allBooks, onClose, onSelectBook, currentUser, holds, now, onBorrow, onCancelHold }) {
  const bio = AUTHOR_BIOS[book.author];
  const moreByAuthor = allBooks.filter((b) => b.author === book.author && b.id !== book.id);
  const isAvailable = book.available > 0;
  const myHold = holds.find((h) => h.bookId === book.id && h.userId === currentUser.id);

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
            {myHold ? (
              <span className="avail-badge onwaitlist"><CheckCircle2 size={13} /> On waitlist</span>
            ) : (
              <span className={`avail-badge ${isAvailable ? "yes" : "no"}`}>
                {isAvailable ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                {isAvailable ? `${book.available} available` : "All copies out"}
              </span>
            )}
          </div>

          <p className="book-modal-author">by {book.author}</p>
          <p className="book-modal-isbn">ISBN {book.isbn}</p>

          <p className="book-modal-desc">{book.description || "No description available for this title yet."}</p>

          {myHold ? (
            <button className="btn-small btn-onwaitlist modal-borrow" onClick={() => onCancelHold(myHold.id)}>
              <CheckCircle2 size={13} /> On waitlist
            </button>
          ) : (
            <button className="btn-small modal-borrow" onClick={() => onBorrow(book)}>
              {isAvailable ? "Borrow this book" : "Join waitlist"}
            </button>
          )}

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

function RecordRow({ record, onReturn }) {
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
            {onReturn && (
              <button className="btn-small btn-return" onClick={onReturn}>Return</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* Scoped styles for the waitlist-availability toast stack */
function NotifStyle() {
  return (
    <style>{`
      .notif-stack {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 340px;
      }
      .notif-toast {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: #1F3B30;
        color: #F2ECD9;
        border: 1px solid rgba(184,134,58,0.5);
        border-radius: 6px;
        padding: 12px 14px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.18);
        animation: notif-in .25s ease;
      }
      .notif-icon { flex-shrink: 0; margin-top: 2px; color: #E0B876; }
      .notif-joined .notif-icon { color: #7FC29B; }
      .notif-joined { border-color: rgba(127,194,155,0.5); }
      .btn-onwaitlist,
      .avail-badge.onwaitlist,
      .status-chip.onwaitlist {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #7FC29B;
        border: 1px solid #7FC29B;
        color: #142A22;
      }
      .btn-onwaitlist:hover { background: #6FB48B; border-color: #6FB48B; }
      .notif-text { font-size: 13.5px; line-height: 1.4; flex: 1; }
      .notif-text strong { font-weight: 600; }
      .notif-dismiss {
        background: transparent;
        border: none;
        color: rgba(242,236,217,0.7);
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .notif-dismiss:hover { color: #F2ECD9; }
      @keyframes notif-in {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
