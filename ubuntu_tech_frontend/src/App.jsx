import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout.jsx";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sessions from "./pages/Sessions.jsx";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminModules from "./pages/admin/AdminModules.jsx";
import AdminModuleDetail from "./pages/admin/AdminModuleDetail.jsx";
import AdminLearners from "./pages/admin/AdminLearners.jsx";
import AdminLearnerDetail from "./pages/admin/AdminLearnerDetail.jsx";
import AdminDevoirs from "./pages/admin/AdminDevoirs.jsx";
import AdminSessions from "./pages/admin/AdminSessions.jsx";

export default function App() {
  return (
    <Routes>
      {/* Pages publiques : Navbar + Footer marketing */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/connexion" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/inscription" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/mot-de-passe-oublie" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
      <Route
        path="/reinitialiser-mot-de-passe/:uid/:token"
        element={<PublicLayout><ResetPassword /></PublicLayout>}
      />

      {/* Espace connecté : sidebar applicative */}
      <Route element={<AppShell />}>
        <Route
          path="/cours"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cours/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tableau-de-bord"
          element={
            <ProtectedRoute roles={["apprenant"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules"
          element={
            <ProtectedRoute roles={["admin", "formateur"]}>
              <AdminModules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules/:id"
          element={
            <ProtectedRoute roles={["admin", "formateur"]}>
              <AdminModuleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/apprenants"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLearners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/apprenants/:id"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLearnerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute roles={["apprenant"]}>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/devoirs"
          element={
            <ProtectedRoute roles={["admin", "formateur"]}>
              <AdminDevoirs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute roles={["admin", "formateur"]}>
              <AdminSessions />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
