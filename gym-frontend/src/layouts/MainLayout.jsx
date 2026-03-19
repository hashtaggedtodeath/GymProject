import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

   

    const navItems = user?.role === 'Admin' 
        ? [
            { name: 'Дашборд', path: '/admin' }, 
            { name: 'Расписание', path: '/admin/schedule' }, 
            { name: 'Тренеры', path: '/admin/trainers' }, 
            { name: 'Отчеты', path: '/admin/reports' }
        ]
        : [
            { name: 'Мой профиль', path: '/dashboard' }, 
            { name: 'Записаться', path: '/schedule' },
            { name: 'Купить абонемент', path: '/buy-membership' } 
         ];
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-blue-600">GYM-PRO</Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            {navItems.map(item => (
                                <Link key={item.path} to={item.path} className="text-gray-600 hover:text-blue-600 px-3 py-2">{item.name}</Link>
                            ))}
                            <button onClick={logout} className="flex items-center text-red-500 px-3 py-2"><LogOut size={18} className="mr-1"/> Выход</button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t px-2 pt-2 pb-3 space-y-1">
                        {navItems.map(item => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-600">{item.name}</Link>
                        ))}
                        <button onClick={logout} className="w-full text-left px-3 py-2 text-red-500">Выход</button>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}