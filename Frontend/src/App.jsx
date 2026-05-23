import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider } from "./context/theme.context.jsx"

function App() {

  // Wake up the backend serverless function as early as possible.
  // This fires a lightweight GET request in the background so the
  // cold start + DB connection happens while the user is still
  // browsing/filling out forms — not when they click "Submit".
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    fetch(`${apiUrl}/api/warmup`).catch(() => {
      // Silently ignore — this is just a best-effort warmup
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
