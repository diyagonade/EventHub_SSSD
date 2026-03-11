import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SSEProvider } from "./context/SSEContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";
import { Spinner } from "react-bootstrap";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === "ORGANIZER" ? "/organizer" : "/dashboard"}
      replace
    />
  );
}

function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className="pb-5">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute role="USER">
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute role="ORGANIZER">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/create"
            element={
              <ProtectedRoute role="ORGANIZER">
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute role="ORGANIZER">
                <EditEventPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SSEProvider>
          <AppLayout />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            pauseOnHover
          />
        </SSEProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
