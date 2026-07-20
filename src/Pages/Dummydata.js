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

// ---- Add a new demo account at runtime (used by Signup.jsx) ----
// Mutates the arrays above so a freshly-signed-up user can immediately log in
// and see an (empty) borrowed-books list, all within the same session.
export function registerUser({ name, email, password, role }) {
  const id = `${role === "librarian" ? "lib" : "u"}${Date.now()}`;
  const newUser = { id, role, name, email, password };
  DUMMY_USERS.push(newUser);
  if (role === "user") {
    DUMMY_BORROWERS.push({ id, name, email, records: [] });
  }
  return newUser;
}

// ---- Check if an email is already taken (used by Signup.jsx) ----
export function emailExists(email) {
  return DUMMY_USERS.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

// ---- Book catalog ----
export const DUMMY_BOOKS = [
  {
    id: 1, title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery",
    isbn: "978-1250301697", total: 5, available: 3,
    description: "Alicia Berenson shoots her husband and then never speaks another word. Her silence turns her into a media sensation, and a criminal psychotherapist becomes obsessed with uncovering the truth. As he digs into her past, he finds the case is far stranger than it first appears. A tense, twist-filled psychological thriller told from two perspectives."
  },
  {
    id: 2, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction",
    isbn: "978-0062316097", total: 2, available: 0,
    description: "A sweeping look at how Homo sapiens came to dominate the planet, from the Cognitive Revolution through the Agricultural and Scientific Revolutions. Harari examines how shared myths, money, and empires allowed humans to cooperate at scale. Along the way he questions what progress has really cost us. A big-picture read that reframes familiar history."
  },
  {
    id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy",
    isbn: "978-0345339683", total: 4, available: 4,
    description: "Bilbo Baggins, a comfort-loving hobbit, is swept into an unexpected adventure with a wizard and thirteen dwarves seeking to reclaim treasure guarded by a dragon. Along the way he faces trolls, goblins, and a fateful riddle contest in the dark. It's a warm, classic prelude to The Lord of the Rings. Ideal for readers new to fantasy."
  },
  {
    id: 4, title: "Educated", author: "Tara Westover", genre: "Biography",
    isbn: "978-0399590504", total: 3, available: 1,
    description: "Tara Westover grew up in rural Idaho with survivalist parents who kept her out of school. Through sheer determination, she taught herself enough to enter university, eventually earning a PhD from Cambridge. The memoir traces the painful cost of that transformation on her family bonds. A powerful story about the power, and price, of learning."
  },
  {
    id: 5, title: "Project Hail Mary", author: "Andy Weir", genre: "Sci-Fi",
    isbn: "978-0593135204", total: 2, available: 1,
    description: "Ryland Grace wakes up alone on a spacecraft with no memory of how he got there or why. Piece by piece, he realizes he's humanity's last hope to save Earth from an extinction-level threat. What follows is a science-heavy, often funny survival story with an unforgettable twist. From the author of The Martian."
  },
  {
    id: 6, title: "Atomic Habits", author: "James Clear", genre: "Non-Fiction",
    isbn: "978-0735211292", total: 4, available: 0,
    description: "A practical guide to building good habits and breaking bad ones through small, consistent changes. Clear argues that identity-level shifts, not willpower, drive lasting behavior change. The book breaks habit formation into four simple laws you can apply immediately. A favorite for anyone trying to build a better daily routine."
  },
  {
    id: 7, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction",
    isbn: "978-0743273565", total: 5, available: 5,
    description: "Set in the Jazz Age, the novel follows the mysterious millionaire Jay Gatsby and his obsessive love for Daisy Buchanan. Narrator Nick Carraway watches as wealth, ambition, and illusion collide on Long Island. It's a sharp critique of the American Dream wrapped in gorgeous prose. A short novel with an enduring reputation."
  },
  {
    id: 8, title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery",
    isbn: "978-0307588371", total: 3, available: 2,
    description: "On their fifth wedding anniversary, Amy Dunne disappears, and suspicion quickly falls on her husband Nick. Told through alternating, increasingly unreliable perspectives, the story dismantles the picture-perfect marriage piece by piece. Flynn's twist reshaped what readers expect from a domestic thriller. Dark, sharp, and hard to put down."
  },
  {
    id: 9, title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography",
    isbn: "978-1451648539", total: 2, available: 1,
    description: "Based on more than forty interviews with Jobs himself, this biography traces his path from a garage startup to building one of the world's most valuable companies. Isaacson doesn't shy away from Jobs's difficult, demanding personality alongside his creative brilliance. It's a candid look at obsession, design, and ambition. A definitive account of a defining figure in tech."
  },
  {
    id: 10, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi",
    isbn: "978-0441013593", total: 3, available: 0,
    description: "On the desert planet Arrakis, young Paul Atreides is thrust into a war over the galaxy's most valuable resource. Politics, prophecy, and ecology intertwine as Paul's family is betrayed and he must find allies among the planet's native Fremen. It's widely regarded as one of the most influential science fiction novels ever written. Dense, ambitious world-building."
  },
  {
    id: 11, title: "Homo Deus", author: "Yuval Noah Harari", genre: "Non-Fiction",
    isbn: "978-0062464316", total: 3, available: 2,
    description: "A follow-up to Sapiens, this book looks forward instead of back, asking what humanity's next big project might be. Harari explores artificial intelligence, biotechnology, and the possible end of death, disease, and even free will as we know them. It's a provocative, sometimes unsettling look at where our species is headed. Big questions, clearly argued."
  },
  {
    id: 12, title: "The Martian", author: "Andy Weir", genre: "Sci-Fi",
    isbn: "978-0553418026", total: 3, available: 1,
    description: "Astronaut Mark Watney is stranded alone on Mars after his crew presumes him dead and leaves without him. With limited supplies and no way to communicate, he has to improvise his way to survival using science, sarcasm, and sheer stubbornness. It's a tense, technically grounded story that's also frequently laugh-out-loud funny. The book behind the hit film."
  },
  {
    id: 13, title: "Dune Messiah", author: "Frank Herbert", genre: "Sci-Fi",
    isbn: "978-0441172696", total: 2, available: 2,
    description: "Twelve years after the events of Dune, Paul Atreides now rules as emperor, but the holy war fought in his name has cost billions of lives. The sequel is darker and more introspective, examining the cost of power and prophecy fulfilled. It complicates the hero's journey from the first book. Best read as a direct continuation of Dune."
  },
];

// ---- Short author profiles, keyed by exact author name used in DUMMY_BOOKS ----
export const AUTHOR_BIOS = {
  "Alex Michaelides": "Alex Michaelides is a British-Cypriot author and screenwriter. Before turning to fiction, he wrote screenplays and studied psychotherapy, which shows in his tightly-plotted psychological thrillers. The Silent Patient was his debut novel and became an instant bestseller.",
  "Yuval Noah Harari": "Yuval Noah Harari is an Israeli historian and professor known for accessible, big-idea nonfiction about the history and future of our species. His books Sapiens and Homo Deus have been translated into dozens of languages and are widely read by general audiences and policymakers alike.",
  "J.R.R. Tolkien": "J.R.R. Tolkien was an English writer and philologist best known for creating Middle-earth in The Hobbit and The Lord of the Rings. A professor at Oxford, he drew on his deep knowledge of mythology and language to build one of fiction's most influential fantasy worlds.",
  "Tara Westover": "Tara Westover is an American author whose memoir Educated recounts her unconventional upbringing and path to higher education. She holds a PhD from Cambridge University and writes about family, identity, and the transformative power of learning.",
  "Andy Weir": "Andy Weir is an American novelist known for meticulously researched, science-heavy fiction with a strong streak of humor. A former software engineer, he self-published The Martian before it became a bestseller and a major film.",
  "James Clear": "James Clear is an author and speaker focused on habits, decision-making, and continuous improvement. Atomic Habits distilled years of writing on behavioral science into one of the best-selling self-improvement books of the past decade.",
  "F. Scott Fitzgerald": "F. Scott Fitzgerald was an American novelist and short story writer, widely regarded as one of the great chroniclers of the Jazz Age. The Great Gatsby, though modestly received in his lifetime, is now considered a cornerstone of American literature.",
  "Gillian Flynn": "Gillian Flynn is an American author and former television critic known for dark, psychologically complex thrillers. Gone Girl became a cultural phenomenon and is credited with popularizing the modern 'unreliable narrator' domestic thriller.",
  "Walter Isaacson": "Walter Isaacson is an American author and journalist known for biographies of major figures in science, technology, and history, including Steve Jobs, Einstein, and Leonardo da Vinci. He was previously the editor of Time magazine and CEO of CNN.",
  "Frank Herbert": "Frank Herbert was an American science fiction writer best known for Dune, widely considered one of the genre's greatest achievements. His work is known for deep world-building and thoughtful exploration of politics, religion, and ecology.",
};

// ---- Borrow records, grouped by user id (matches DUMMY_USERS ids above) ----
// Each record now carries a `bookId` (matching an id in DUMMY_BOOKS above) so
// LibraryApp.jsx can always restock the right title on return, with no
// title-matching fallback needed.
export const DUMMY_BORROWERS = [
  {
    id: "u1", name: "Aditi Sharma", email: "aditi@mail.com",
    records: [
      { id: "r1", bookId: 2, title: "Sapiens", borrowed: "2026-06-20", due: "2026-07-04", returned: null },
      { id: "r2", bookId: 6, title: "Atomic Habits", borrowed: "2026-07-10", due: "2026-07-24", returned: null },
      { id: "r3", bookId: 7, title: "The Great Gatsby", borrowed: "2026-05-01", due: "2026-05-15", returned: "2026-05-13" },
    ],
  },
  {
    id: "u2", name: "Rohan Patil", email: "rohan@mail.com",
    records: [
      { id: "r4", bookId: 10, title: "Dune", borrowed: "2026-07-01", due: "2026-07-15", returned: null },
    ],
  },
  {
    id: "u3", name: "Meera Iyer", email: "meera@mail.com",
    records: [
      { id: "r5", bookId: 4, title: "Educated", borrowed: "2026-07-15", due: "2026-07-29", returned: null },
      { id: "r6", bookId: 3, title: "The Hobbit", borrowed: "2026-06-01", due: "2026-06-15", returned: "2026-06-14" },
    ],
  },
  {
    id: "u4", name: "Karan Mehta", email: "karan@mail.com",
    records: [
      { id: "r7", bookId: 5, title: "Project Hail Mary", borrowed: "2026-07-05", due: "2026-07-19", returned: null },
    ],
  },
];