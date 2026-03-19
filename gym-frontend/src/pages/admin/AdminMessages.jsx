import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MessageSquare, Trash2, User, Mail, Phone, Calendar, Search } from 'lucide-react';

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/admin/messages');
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить это обращение?")) return;
        try {
            await api.delete(`/admin/messages/${id}`);
            fetchMessages();
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const filteredMessages = messages.filter(m => 
        m.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.MessageText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Загрузка сообщений...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-blue-600" /> Обращения пользователей
                </h1>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Поиск по отправителю или тексту..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredMessages.length > 0 ? filteredMessages.map((m) => (
                    <div key={m.MessageID} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            {/* Данные отправителя */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-blue-500" />
                                    <span className="font-bold text-gray-900">{m.ClientName}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1"><Mail size={14} /> {m.ClientEmail}</div>
                                    <div className="flex items-center gap-1"><Phone size={14} /> {m.ClientPhone || 'Нет телефона'}</div>
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(m.CreatedAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(m.MessageID)}
                                className="text-red-400 hover:text-red-600 self-start p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        
                        {/* Текст сообщения */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed italic">
                            "{m.MessageText}"
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                        Сообщений пока нет
                    </div>
                )}
            </div>
        </div>
    );
}