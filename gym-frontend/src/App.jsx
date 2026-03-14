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
                    
                    {/* Клиентские роуты */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <h1 className="text-2xl font-bold">Личный кабинет</h1>
                            <p>Тут скоро будет инфо об абонементе</p>
                        </PrivateRoute>
                    } />
                    <Route path="/schedule" element={
                        <PrivateRoute>
                            <Schedule />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/*" element={
                        <AdminRoute>
                          <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/trainers" element={<AdminTrainers />} />
                            <Route path="/schedule" element={<AdminSchedule />} />
                          </Routes>
                        </AdminRoute>
                    } />
                    {/* Редирект с главной */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;