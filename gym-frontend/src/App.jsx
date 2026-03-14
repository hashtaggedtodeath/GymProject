import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Schedule from './pages/Schedule';
import Register from './pages/Register';

// Защищенный роут (только для авторизованных)
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
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

                    {/* Редирект с главной */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;