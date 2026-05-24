import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import RoomsPage from './pages/RoomsPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import ExcelPage from './pages/ExcelPage.jsx';
import AIInsightsPage from './pages/AIInsightsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CateringPage from './pages/CateringPage.jsx';
import HousingPage from './pages/HousingPage.jsx';
import NetworkPage from './pages/NetworkPage.jsx';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="students"    element={<StudentsPage />} />
          <Route path="rooms"       element={<RoomsPage />} />
          <Route path="tickets"     element={<TicketsPage />} />
          <Route path="excel"       element={<ExcelPage />} />
          <Route path="ai-insights" element={<AIInsightsPage />} />
          <Route path="catering"    element={<CateringPage />} />
          <Route path="housing"     element={<HousingPage />} />
          <Route path="network"     element={<NetworkPage />} />
          <Route path="settings"    element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
