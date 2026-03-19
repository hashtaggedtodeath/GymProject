import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    CreditCard, 
    CalendarCheck, 
    History, 
    CheckCircle, 
    AlertCircle,
    User,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const [membership, setMembership] = useState(null);
    const [history, setHistory] = useState({ bookings: [], payments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, hRes] = await Promise.all([
                    api.get('/client/my-membership'),
                    api.get('/client/history')
                ]);
                setMembership(mRes.data[0]);
                setHistory(hRes.data);
            } catch (err) {
                console.error("Ошибка при получении данных личного кабинета");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancel = async (scheduleId) => {
    if (!window.confirm("Отменить запись?")) return;
    try {
        // Мы отправляем scheduleId на бэкенд
        await api.post('/client/cancel-booking', { scheduleId }); 
        alert("Запись отменена");
        
        // ВАЖНО: После отмены нужно заново запросить историю данных!
        const hRes = await api.get('/client/history');
        const mRes = await api.get('/client/my-membership');
        setHistory(hRes.data);
        setMembership(mRes.data[0]);
    } catch (err) {
        alert(err.response?.data?.message || "Ошибка отмены");
    }
};

    if (loading) return <div className="p-10 text-center animate-pulse">Загрузка данных профиля...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
                    <p className="text-gray-500">Ваша активность и управление абонементом</p>
                </div>
                <Link to="/schedule" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition flex items-center shadow-lg shadow-blue-200">
                    Записаться на занятие <ArrowRight size={18} className="ml-2" />
                </Link>
            </header>

            {/* Блок Абонемента */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <CheckCircle className="text-green-500 mr-2" /> Текущий абонемент
                        </h2>
                        
                        {membership ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Тарифный план</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{membership.Name}</p>
                                    <div className="mt-4 flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg w-fit">
                                        <CalendarCheck size={16} className="mr-2 text-blue-500" />
                                        Действует до: {new Date(membership.EndDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-inner">
                                    <p className="text-blue-100 text-sm">Осталось посещений</p>
                                    <p className="text-4xl font-black mt-2">
                                        {membership.RemainingVisits ?? '∞'}
                                    </p>
                                    <p className="text-xs text-blue-200 mt-2 italic">* Используйте до истечения срока</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertCircle className="text-orange-500 mr-4" size={32} />
                                    <div>
                                        <p className="font-bold text-orange-900">Абонемент не найден</p>
                                        <p className="text-sm text-orange-700">Чтобы посещать занятия, приобретите абонемент.</p>
                                    </div>
                                </div>
                                <Link to="/buy-membership" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Купить</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Быстрая статистика */}
                <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col justify-center">
                    <User size={40} className="text-blue-400 mb-4" />
                    <p className="text-gray-400 text-sm">Всего посещений за всё время</p>
                    <p className="text-5xl font-black mt-2">{history.bookings.length}</p>
                </div>
            </section>

            {/* История посещений и платежей */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Таблица записей */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center"><History className="mr-2 text-blue-500" /> История записей</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {history.bookings.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Занятие</th>
                                        <th className="px-6 py-3">Дата</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {history.bookings.map((booking, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{booking.ServiceName}</p>
                                            <p className="text-xs text-gray-500">{booking.TrainerName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 text-xs">
                                                    {new Date(booking.StartTime).toLocaleDateString()}
                                                </span>
                                                {/* Кнопка отмены, если занятие еще не началось */}
                                                {new Date(booking.StartTime) > new Date() && (
                                                    <button 
                                                        onClick={() => handleCancel(booking.ScheduleID)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                                                    >
                                                        Отменить
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-10 text-center text-gray-400 italic">У вас пока нет записей на тренировки</p>
                        )}
                    </div>
                </div>

                {/* Таблица платежей */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="font-bold text-lg flex items-center"><CreditCard className="mr-2 text-green-500" /> Платежи</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {history.payments.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Описание</th>
                                        <th className="px-6 py-3 text-right">Сумма</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {history.payments.map((payment, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{payment.Description}</p>
                                                <p className="text-xs text-gray-400">{new Date(payment.PaymentDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">
                                                +{payment.Amount} ₽
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-10 text-center text-gray-400 italic">История платежей пуста</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}