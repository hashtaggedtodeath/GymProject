import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Schedule from './pages/Schedule';
import Register from './pages/Register';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/client/Profile';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminReports from './pages/admin/AdminReports';
import BuyMembership from './pages/client/BuyMembership';
import AdminUsers from './pages/admin/AdminUsers';
import Support from './pages/client/Support';
import AdminMemberships from './pages/admin/AdminMemberships';
import AdminMessages from './pages/admin/AdminMessages';
import AdminServices from './pages/admin/AdminServices';
import AdminHalls from './pages/admin/AdminHalls';

// Защищенный роут (только для авторизованных)
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'Admin') return <Navigate to="/dashboard" />;
    return <MainLayout>{children}</MainLayout>;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    
                    
                    <Route path="/schedule" element={
                        <PrivateRoute>
                            <Schedule />
                        </PrivateRoute>
                    } />
                    <Route path="/buy-membership" element={
                        <PrivateRoute>
                            <BuyMembership />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/*" element={
                        <AdminRoute>
                          <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/trainers" element={<AdminTrainers />} />
                            <Route path="/schedule" element={<AdminSchedule />} />
                            <Route path="/reports" element={<AdminReports />} />
                            <Route path="/users" element={<AdminUsers />} />
                            <Route path="/memberships" element={<AdminMemberships />} />
                            <Route path="/messages" element={<AdminMessages />} />
                            <Route path="/services" element={<AdminServices />} />
                            <Route path="/halls" element={<AdminHalls />} />
                          </Routes>
                        </AdminRoute>
                    } />
                    {/* Редирект с главной */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
                    <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;