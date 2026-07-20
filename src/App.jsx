import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import LibraryApp from "./Pages/LibraryApp";
import "./App.css";

/**
 * App.jsx — routes via react-router-dom.
 *
 * Routes:
 *   "/"                -> Landing
 *   "/login"            -> Login (on success, lifts session into App state)
 *   "/signup"           -> Signup (creates a demo account, then logs it in)
 *   "/forgot-password"  -> ForgotPassword (static/demo flow, no real email sent)
 *   "/dashboard"        -> LibraryApp, only reachable once `session` is set —
 *                          otherwise redirects back to "/login"
 */
function App() {
  const [session, setSession] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLoginSuccess={setSession} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={setSession} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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