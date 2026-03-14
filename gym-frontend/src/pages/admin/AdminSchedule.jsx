import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react';

export default function AdminSchedule() {
    const [schedule, setSchedule] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [halls, setHalls] = useState([]);
    const [services, setServices] = useState([]);
    
    const [showForm, setShowForm] = useState(false);
    const [newSession, setNewSession] = useState({
        trainerId: '', hallId: '', serviceId: '', startTime: '', endTime: '', maxClients: 15
    });

    useEffect(() => {
        const loadData = async () => {
            const [sRes, tRes, hRes, srvRes] = await Promise.all([
                api.get('/admin/schedule'),
                api.get('/admin/trainers'),
                api.get('/admin/halls'),
                api.get('/admin/services')
            ]);
            setSchedule(sRes.data);
            setTrainers(tRes.data);
            setHalls(hRes.data);
            setServices(srvRes.data);
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/schedule', newSession);
            alert("Занятие добавлено!");
            window.location.reload();
        } catch (err) {
            alert("Ошибка при создании занятия");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Управление расписанием</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center shadow-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" /> Добавить занятие
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Услуга</label>
                        <select className="w-full p-2 border rounded-lg" required onChange={e => setNewSession({...newSession, serviceId: e.target.value})}>
                            <option value="">Выберите услугу</option>
                            {services.map(s => <option key={s.ServiceID} value={s.ServiceID}>{s.Name}</option>)}
                        </select>

                        <label className="block text-sm font-medium">Тренер</label>
                        <select className="w-full p-2 border rounded-lg" required onChange={e => setNewSession({...newSession, trainerId: e.target.value})}>
                            <option value="">Выберите тренера</option>
                            {trainers.map(t => <option key={t.TrainerID} value={t.TrainerID}>{t.FullName}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Зал</label>
                        <select className="w-full p-2 border rounded-lg" required onChange={e => setNewSession({...newSession, hallId: e.target.value})}>
                            <option value="">Выберите зал</option>
                            {halls.map(h => <option key={h.HallID} value={h.HallID}>{h.Name}</option>)}
                        </select>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium">Начало</label>
                                <input type="datetime-local" className="w-full p-2 border rounded-lg" required onChange={e => setNewSession({...newSession, startTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Конец</label>
                                <input type="datetime-local" className="w-full p-2 border rounded-lg" required onChange={e => setNewSession({...newSession, endTime: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-xl">Отмена</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Создать</button>
                    </div>
                </form>
            )}

            {/* Таблица текущего расписания */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold">Время</th>
                            <th className="px-6 py-4 text-sm font-bold">Тренировка</th>
                            <th className="px-6 py-4 text-sm font-bold">Зал / Тренер</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {schedule.map(s => (
                            <tr key={s.ScheduleID}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm font-medium">
                                        <Clock size={14} className="mr-2 text-blue-500" />
                                        {new Date(s.StartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(s.StartTime).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{s.ServiceName}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center"><MapPin size={14} className="mr-2" /> {s.HallName}</div>
                                    <div className="flex items-center"><User size={14} className="mr-2" /> {s.TrainerName}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}