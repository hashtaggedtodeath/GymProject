import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
    Clock, 
    User, 
    MapPin, 
    CheckCircle, 
    AlertCircle, 
    Users,
    CalendarDays
} from 'lucide-react';

export default function Schedule() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Вынесли получение данных в useCallback, чтобы избежать лишних рендеров
    const fetchSchedule = useCallback(async () => {
        try {
            const res = await api.get('/admin/schedule');
            setSessions(res.data);
            setError('');
        } catch (err) {
            console.error("Ошибка загрузки:", err);
            setError('Не удалось загрузить расписание');
        } finally {
            setLoading(false); // Обязательно выключаем загрузку
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleBook = async (scheduleId) => {
        try {
            const res = await api.post('/client/book-session', { scheduleId });
            if (res.status === 201 || res.status === 200) {
                alert("Вы успешно записаны!");
                await fetchSchedule(); 
            }
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка при записи");
        }
    };

    const handleCancel = async (scheduleId) => {
        if (!window.confirm("Вы уверены, что хотите отменить запись?")) return;
        
        try {
            const res = await api.post('/client/cancel-booking', { scheduleId });
            if (res.status === 200) {
                alert("Запись отменена");
                await fetchSchedule(); 
            }
        } catch (err) {
            console.error("Ошибка отмены:", err);
            alert(err.response?.data?.message || "Ошибка при отмене");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 max-w-lg mx-auto mt-10">
            <AlertCircle className="mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={fetchSchedule} className="mt-4 text-blue-600 underline">Попробовать снова</button>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <CalendarDays className="text-blue-600" /> Расписание занятий
                </h1>
                <p className="text-gray-500 mt-2">Выбирайте удобное время и записывайтесь на тренировки</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <div 
                        key={session.ScheduleID} 
                        className={`bg-white rounded-3xl p-6 border transition-all duration-300 ${
                            session.IsBooked > 0 
                            ? 'border-green-200 shadow-sm ring-1 ring-green-100' 
                            : 'border-gray-100 shadow-md hover:shadow-xl'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {session.ServiceName}
                            </span>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(session.StartTime).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center text-gray-700">
                                <Clock size={18} className="mr-3 text-blue-500" />
                                <span className="font-semibold text-lg">
                                    {new Date(session.StartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                    {' — '}
                                    {new Date(session.EndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                                <User size={16} className="mr-3" />
                                <span>Тренер: {session.TrainerName}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                                <MapPin size={16} className="mr-3" />
                                <span>Зал: {session.HallName}</span>
                            </div>
                            <div className="flex items-center text-gray-600 pt-2 border-t border-gray-50">
                                <Users size={16} className="mr-3" />
                                <span className="text-sm font-bold">Мест: {session.EnrolledCount} / {session.MaxClients}</span>
                            </div>
                        </div>

                        {session.IsBooked > 0 ? (
                            <div className="space-y-2">
                                <div className="bg-green-50 border border-green-200 text-green-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    <CheckCircle size={20} /> Вы записаны
                                </div>
                                <button 
                                    onClick={() => handleCancel(session.ScheduleID)}
                                    className="w-full text-red-500 text-sm font-semibold hover:underline"
                                >
                                    Отменить запись
                                </button>
                            </div>
                        ) : session.EnrolledCount >= session.MaxClients ? (
                            <button disabled className="w-full bg-gray-50 text-gray-400 py-3 rounded-2xl font-bold border border-gray-100">
                                Мест нет
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleBook(session.ScheduleID)}
                                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                            >
                                Записаться
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {sessions.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic">На ближайшее время занятий нет</p>
                </div>
            )}
        </div>
    );
}