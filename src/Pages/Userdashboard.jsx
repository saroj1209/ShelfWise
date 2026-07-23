import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen, Search, ClipboardList, CheckCircle2, AlertTriangle,
  Clock3, X, Bell, Hourglass,
} from "lucide-react";
import { CatalogNav, DueStamp, EmptyState } from "./LibraryShared";
import { GENRES, TODAY, fmtDate, recordStatus, daysBetween, msLeft, fmtCountdown } from "./libraryHelpers";
import { AUTHOR_BIOS } from "./Dummydata";

/* ---------------------------------------------------------
   USER DASHBOARD (Reader)

   Two things happen when a reader clicks "Borrow" / "Join waitlist":
   - If a copy is available, one copy is put ON HOLD for this reader for
     24 real hours (a live countdown shows on the card, in "My borrowed
     books", and in the detail modal). The hold shows up in the admin's
     "Borrow requests" queue. If the admin approves in time, it becomes a
     real loan. If 24h pass with no action, the hold auto-releases and the
     copy is unlocked for everyone again (handled in the root App).
   - If no copy is available, the same "hold" entry is created but doesn't
     reserve a physical copy — it just registers the reader's interest.
     The moment a copy frees up (return / cancel / reject elsewhere), a
     toast notifies them and their entry flips into "ready to borrow".
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

  // Wraps onBorrow so the reader gets an immediate confirmation toast,
  // distinct depending on whether a copy was actually reserved and put
  // on the 24h clock, or whether they just joined the waitlist.
  function handleBorrow(book) {
    onBorrow(book);
    setNotifications((prev) => [
      ...prev,
      book.available > 0
        ? {
            id: `${book.id}-held-${Date.now()}`,
            bookId: book.id,
            type: "held",
            title: book.title,
            message: "is on hold for you — the librarian has 24 hours to approve it.",
          }
        : {
            id: `${book.id}-joined-${Date.now()}`,
            bookId: book.id,
            type: "joined",
            title: book.title,
            message: "added to your waitlist — we'll notify you when it's available.",
          },
    ]);
  }

  // Cancelling a pending hold releases the copy right away instead of
  // waiting out the full 24h window — but since the reader might already
  // have another book out, offer them the exchange idea before they commit.
  function handleCancelWithPrompt(hold) {
    const confirmed = window.confirm(
      `Cancel your request for "${hold.bookTitle}"?\n\nTip: instead of cancelling, you can return one of your currently borrowed books and exchange it for this one.`
    );
    if (confirmed) onCancelHold(hold.id);
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
            <div
              key={n.id}
              className={`notif-toast ${
                n.type === "joined" ? "notif-joined" : n.type === "held" ? "notif-held" : "notif-available"
              }`}
            >
              {n.type === "available" ? (
                <Bell size={15} className="notif-icon" />
              ) : n.type === "held" ? (
                <Hourglass size={15} className="notif-icon" />
              ) : (
                <CheckCircle2 size={15} className="notif-icon" />
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
                  onCancelWithPrompt={handleCancelWithPrompt}
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
                <h3 className="subhead">
                  Pending &amp; waitlisted <span className="subhead-note">a hold reserves a copy for 24h while the librarian reviews it</span>
                </h3>
                <div className="record-list">
                  {myHolds.map((h) => {
                    const relatedBook = books.find((b) => b.id === h.bookId);
                    // A reserved hold always shows its countdown, no matter
                    // what the book's live stock looks like (another copy
                    // might still be sitting on the shelf). Only a genuine
                    // waitlist hold (never reserved a copy) flips over to
                    // "ready to borrow" once the book has stock again.
                    const isNowAvailable = !h.reserved && !!relatedBook && relatedBook.available > 0;
                    return (
                      <HoldRow
                        key={h.id}
                        hold={h}
                        now={now}
                        isAvailable={isNowAvailable}
                        onCancel={() => handleCancelWithPrompt(h)}
                        onCancelDirect={() => onCancelHold(h.id)}
                        onBorrow={relatedBook ? () => handleBorrow(relatedBook) : undefined}
                      />
                    );
                  })}
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
          onCancelWithPrompt={handleCancelWithPrompt}
        />
      )}
    </div>
  );
}

/**
 * Pending-hold row shown in "My borrowed books".
 * - Reserved hold (a copy was actually taken off the shelf): shows the
 *   live red countdown until the librarian's approval window runs out,
 *   with a confirm-before-cancel button.
 * - Waitlist-only hold (no copy was taken yet): the original simple
 *   design — a plain "On waitlist" checkmark, a direct Cancel with no
 *   prompt, and a "Borrow" button once a copy actually frees up.
 */
function HoldRow({ hold, now, isAvailable, onCancel, onCancelDirect, onBorrow }) {
  if (hold.reserved) {
    const remaining = msLeft(hold.requestedAt, now);
    return (
      <div className="record-row status-hold">
        <div className="record-main">
          <h4>{hold.bookTitle}</h4>
          <div className="record-meta">
            <span>Requested {new Date(hold.requestedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="dot">·</span>
            <span className="hold-countdown"><Hourglass size={12} /> {fmtCountdown(remaining)}</span>
          </div>
        </div>
        <div className="record-side">
          <span className="status-chip hold"><Clock3 size={13} /> Awaiting approval</span>
          <button className="btn-small btn-cancel" onClick={onCancel}>Cancel request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="record-row status-hold">
      <div className="record-main">
        <h4>{hold.bookTitle}</h4>
        <div className="record-meta">
          <span>Requested {new Date(hold.requestedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
      <div className="record-side">
        {isAvailable ? (
          <button className="btn-small" onClick={onBorrow}>Borrow</button>
        ) : (
          <>
            <span className="status-chip onwaitlist"><CheckCircle2 size={13} /> On waitlist</span>
            <button className="btn-small btn-cancel" onClick={onCancelDirect}>Cancel request</button>
          </>
        )}
      </div>
    </div>
  );
}

function BookCard({ book, onSelect, currentUser, holds, now, onBorrow, onCancelHold, onCancelWithPrompt }) {
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
          {myHold && myHold.reserved ? (
            <>
              <span className="status-chip hold-timer">
                <Hourglass size={13} /> {fmtCountdown(msLeft(myHold.requestedAt, now))}
              </span>
              <button
                className="btn-small btn-cancel"
                onClick={(e) => { e.stopPropagation(); onCancelWithPrompt(myHold); }}
              >
                Cancel
              </button>
            </>
          ) : myHold && !myHold.reserved ? (
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

function BookDetailModal({ book, allBooks, onClose, onSelectBook, currentUser, holds, now, onBorrow, onCancelHold, onCancelWithPrompt }) {
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
            {myHold && myHold.reserved ? (
              <span className="status-chip hold-timer">
                <Hourglass size={13} /> {fmtCountdown(msLeft(myHold.requestedAt, now))}
              </span>
            ) : myHold && !myHold.reserved ? (
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

          {myHold && myHold.reserved && (
            <p className="modal-due-note">
              This copy is held for you until the librarian approves it — {fmtCountdown(msLeft(myHold.requestedAt, now))}.
            </p>
          )}

          {myHold && myHold.reserved ? (
            <button className="btn-small btn-cancel modal-borrow" onClick={() => onCancelWithPrompt(myHold)}>
              Cancel request
            </button>
          ) : myHold && !myHold.reserved ? (
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

/* Scoped styles for the waitlist/hold toast stack */
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
      .notif-held .notif-icon { color: #E0B876; }
      .notif-held { border-color: rgba(184,134,58,0.6); }
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
      .modal-due-note { font-size: 13px; color: var(--ink-soft, #5B5D48); margin: 0; }
      @keyframes notif-in {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}