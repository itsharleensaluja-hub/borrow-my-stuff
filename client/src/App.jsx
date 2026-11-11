import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RolesPage from "./pages/RolesPage";
import ListingsPage from "./pages/ListingsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import AskHelpPage from "./pages/AskHelpPage";
import DashboardPage from "./pages/DashboardPage";
import ListItemPage from "./pages/ListItemPage";
import { useAuth } from "./context/useAuth";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route
          path="/ask-help"
          element={
            <ProtectedRoute>
              <AskHelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-item"
          element={
            <ProtectedRoute>
              <ListItemPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
