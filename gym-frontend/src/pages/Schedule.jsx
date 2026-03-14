import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Schedule() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get('/admin/schedule'); // Мы сделали этот роут общим для всех авторизованных
                setSessions(res.data);
            } catch (err) {
                console.error("Ошибка загрузки расписания", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const handleBook = async (scheduleId) => {
        try {
            await api.post('/client/book-session', { scheduleId });
            alert("Вы успешно записаны!");
            // Можно обновить данные, чтобы увидеть уменьшение мест
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка при записи");
        }
    };

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Расписание тренировок</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <div key={session.ScheduleID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {session.ServiceName}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {new Date(session.StartTime).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{session.HallName}</h3>
                        
                        <div className="text-gray-600 space-y-1 mb-4">
                            <p>👨‍🏫 Тренер: <span className="font-medium">{session.TrainerName}</span></p>
                            <p>⏰ Время: <span className="font-medium">
                                {new Date(session.StartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span></p>
                        </div>

                        <button 
                            onClick={() => handleBook(session.ScheduleID)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Записаться
                        </button>
                    </div>
                ))}
            </div>
            
            {sessions.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl">
                    <p className="text-gray-500">На ближайшее время тренировок не запланировано.</p>
                </div>
            )}
        </div>
    );
}