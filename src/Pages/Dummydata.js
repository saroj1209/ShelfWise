/**
 * dummyData.js — shared mock data for the whole app.
 * Import DUMMY_USERS in Login.jsx to validate/lookup accounts.
 * Import DUMMY_BOOKS / DUMMY_BORROWERS in LibraryApp.jsx if you want to
 * swap out its internal INITIAL_BOOKS / INITIAL_BORROWERS with this file
 * instead of keeping two separate copies.
 */

// ---- Login accounts (email + password just need to match for this demo) ----
export const DUMMY_USERS = [
  { id: "u1", role: "user", name: "Aditi Sharma", email: "aditi@mail.com", password: "password123" },
  { id: "u2", role: "user", name: "Rohan Patil", email: "rohan@mail.com", password: "password123" },
  { id: "u3", role: "user", name: "Meera Iyer", email: "meera@mail.com", password: "password123" },
  { id: "u4", role: "user", name: "Karan Mehta", email: "karan@mail.com", password: "password123" },
  { id: "lib1", role: "librarian", name: "Mr. Deshpande", email: "librarian@shelfwise.in", password: "admin123" },
];

// ---- Book catalog ----
export const DUMMY_BOOKS = [
  { id: 1, title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery", isbn: "978-1250301697", total: 5, available: 3 },
  { id: 2, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", isbn: "978-0062316097", total: 2, available: 0 },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", isbn: "978-0345339683", total: 4, available: 4 },
  { id: 4, title: "Educated", author: "Tara Westover", genre: "Biography", isbn: "978-0399590504", total: 3, available: 1 },
  { id: 5, title: "Project Hail Mary", author: "Andy Weir", genre: "Sci-Fi", isbn: "978-0593135204", total: 2, available: 1 },
  { id: 6, title: "Atomic Habits", author: "James Clear", genre: "Non-Fiction", isbn: "978-0735211292", total: 4, available: 0 },
  { id: 7, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", isbn: "978-0743273565", total: 5, available: 5 },
  { id: 8, title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery", isbn: "978-0307588371", total: 3, available: 2 },
  { id: 9, title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", isbn: "978-1451648539", total: 2, available: 1 },
  { id: 10, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", isbn: "978-0441013593", total: 3, available: 0 },
];

// ---- Borrow records, grouped by user id (matches DUMMY_USERS ids above) ----
export const DUMMY_BORROWERS = [
  {
    id: "u1", name: "Aditi Sharma", email: "aditi@mail.com",
    records: [
      { id: "r1", title: "Sapiens", borrowed: "2026-06-20", due: "2026-07-04", returned: null },
      { id: "r2", title: "Atomic Habits", borrowed: "2026-07-10", due: "2026-07-24", returned: null },
      { id: "r3", title: "The Great Gatsby", borrowed: "2026-05-01", due: "2026-05-15", returned: "2026-05-13" },
    ],
  },
  {
    id: "u2", name: "Rohan Patil", email: "rohan@mail.com",
    records: [
      { id: "r4", title: "Dune", borrowed: "2026-07-01", due: "2026-07-15", returned: null },
    ],
  },
  {
    id: "u3", name: "Meera Iyer", email: "meera@mail.com",
    records: [
      { id: "r5", title: "Educated", borrowed: "2026-07-15", due: "2026-07-29", returned: null },
      { id: "r6", title: "The Hobbit", borrowed: "2026-06-01", due: "2026-06-15", returned: "2026-06-14" },
    ],
  },
  {
    id: "u4", name: "Karan Mehta", email: "karan@mail.com",
    records: [
      { id: "r7", title: "Project Hail Mary", borrowed: "2026-07-05", due: "2026-07-19", returned: null },
    ],
  },
];