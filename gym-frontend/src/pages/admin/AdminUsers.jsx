import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Trash2, User, Phone, Mail, ShieldAlert } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить клиента и все его данные? Это действие необратимо.")) {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(u => 
        u.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Управление клиентами</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Поиск по имени или email..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4">Клиент</th>
                            <th className="px-6 py-4">Контакты</th>
                            <th className="px-6 py-4">Абонемент</th>
                            <th className="px-6 py-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.UserID} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{u.FullName}</div>
                                    <div className="text-xs text-gray-400">Регистрация: {new Date(u.CreatedAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 text-sm space-y-1">
                                    <div className="flex items-center text-gray-600"><Mail size={14} className="mr-2"/> {u.Email}</div>
                                    <div className="flex items-center text-gray-600"><Phone size={14} className="mr-2"/> {u.Phone || '—'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {u.MembershipName ? (
                                        <div>
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                                {u.MembershipName}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">До: {new Date(u.EndDate).toLocaleDateString()}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">Нет абонемента</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(u.UserID)} className="text-red-400 hover:text-red-600 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-gray-400">Клиенты не найдены</div>
                )}
            </div>
        </div>
    );
}