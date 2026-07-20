import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Pages/Landing.jsx";
import Login from "./Pages/Login.jsx";
import LibraryApp from "./Pages/Libraryapp.jsx";
import "./App.css";

/**
 * App.jsx — now using react-router-dom instead of manual screen-state switching.
 *
 * Routes:
 *   "/"          -> Landing
 *   "/login"     -> Login (on success, lifts session into App state, then
 *                   redirects to "/dashboard")
 *   "/signup"    -> reuses LibraryApp's own auth screen (its signup tab) for now
 *   "/dashboard" -> LibraryApp, but only reachable once `session` is set —
 *                   otherwise redirects back to "/login"
 */
function App() {
  const [session, setSession] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLoginSuccess={setSession} />} />
        <Route path="/signup" element={<LibraryApp />} />
        <Route
          path="/dashboard"
          element={
            session ? (
              <LibraryApp initialSession={session} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;