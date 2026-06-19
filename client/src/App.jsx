import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminItems from './pages/admin/Items';
import ApproveRequests from './pages/admin/ApproveRequests';
import ConfirmReturns from './pages/admin/ConfirmReturns';
import AdminHistory from './pages/admin/History';
import ItemTracking from './pages/admin/ItemTracking';
import AdminUsers from './pages/admin/Users';
import AdminReservations from './pages/admin/Reservations';
import AdminBugReports from './pages/admin/BugReports';
import Scanner from './pages/borrower/Scanner';
import MyBorrows from './pages/borrower/MyBorrows';
import MyHistory from './pages/borrower/MyHistory';
import RequestStatus from './pages/borrower/RequestStatus';
import MyReservations from './pages/borrower/MyReservations';
import MyBugReports from './pages/borrower/MyBugReports';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/borrower'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstallPrompt />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><Layout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="approve" element={<ApproveRequests />} />
            <Route path="returns" element={<ConfirmReturns />} />
            <Route path="history" element={<AdminHistory />} />
            <Route path="tracking" element={<ItemTracking />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="bug-reports" element={<AdminBugReports />} />
          </Route>

          <Route path="/borrower" element={
            <ProtectedRoute requiredRole="borrower"><Layout /></ProtectedRoute>
          }>
            <Route index element={<Scanner />} />
            <Route path="my-borrows" element={<MyBorrows />} />
            <Route path="history" element={<MyHistory />} />
            <Route path="requests" element={<RequestStatus />} />
            <Route path="reservations" element={<MyReservations />} />
            <Route path="bug-reports" element={<MyBugReports />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
