import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { 
    Users, 
    DollarSign, 
    Calendar, 
    TrendingUp, 
    ChevronRight,
    Activity
} from 'lucide-react';

export default function AdminDashboard() {
    // Инициализация состояния с безопасными значениями по умолчанию
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeClients: 0,
        todaySessions: 0,
        revenueData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/admin/stats');
                // Приводим данные к нужному формату, защищаясь от null/undefined
                setStats({
                    totalRevenue: Number(res.data.totalRevenue) || 0,
                    activeClients: Number(res.data.activeClients) || 0,
                    todaySessions: Number(res.data.todaySessions) || 0,
                    revenueData: res.data.revenueData || []
                });
            } catch (err) {
                console.error("Ошибка при загрузке статистики админа:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Массив для отрисовки верхних карточек
    const statCards = [
        { 
            name: 'Общий доход', 
            value: `${stats.totalRevenue.toLocaleString()} ₽`, 
            icon: DollarSign, 
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        { 
            name: 'Активные клиенты', 
            value: stats.activeClients, 
            icon: Users, 
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        { 
            name: 'Тренировок сегодня', 
            value: stats.todaySessions, 
            icon: Calendar, 
            color: 'bg-purple-500',
            textColor: 'text-purple-600'
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Заголовок */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Панель управления</h1>
                    <p className="text-gray-500 font-medium">Обзор ключевых показателей вашего зала</p>
                </div>
                <div className="hidden md:block bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-sm font-bold text-gray-400 px-2 uppercase">Live Status</span>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                </div>
            </header>
            
            {/* Сетка основных карточек */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <div key={card.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}>
                                <card.icon size={24} />
                            </div>
                            <Activity size={16} className="text-gray-200 group-hover:text-gray-300 transition-colors" />
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{card.name}</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Секция с полосками доходов по категориям */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <TrendingUp className="mr-3 text-blue-600" size={24} />
                        Доходы по категориям тарифов
                    </h2>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Статистика продаж</span>
                </div>

                <div className="space-y-8">
                    {stats.revenueData && stats.revenueData.length > 0 ? (
                        stats.revenueData.map((type) => {
                            // Безопасный расчет процента (макс 100%)
                            const percentage = stats.totalRevenue > 0 
                                ? Math.min((Number(type.TotalRevenue) / Number(stats.totalRevenue)) * 100, 100) 
                                : 0;

                            return (
                                <div key={type.Name} className="group">
                                    <div className="flex justify-between items-end text-sm mb-3">
                                        <div>
                                            <span className="font-bold text-gray-800 block">{type.Name}</span>
                                            <span className="text-xs text-gray-400">Доля в прибыли: {percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-blue-600 text-lg">
                                                {Number(type.TotalRevenue).toLocaleString()} ₽
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Контейнер полоски с overflow-hidden чтобы не вылетало */}
                                    <div className="w-full bg-gray-50 rounded-full h-4 border border-gray-100 overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                            style={{ width: `${percentage}%` }}
                                        >
                                            {/* Эффект свечения на полоске */}
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_3s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                                <DollarSign size={32} />
                            </div>
                            <p className="text-gray-400 font-medium italic">Данных о продажах пока не поступало</p>
                            <p className="text-gray-300 text-sm mt-1 uppercase tracking-tighter font-bold">Waiting for transactions...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
            {/* Карточка Расписания */}
            <Link 
                to="/admin/schedule" 
                className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2rem] text-white flex justify-between items-center group cursor-pointer overflow-hidden relative transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <div className="relative z-10">
                    <h3 className="text-xl font-bold">Управление расписанием</h3>
                    <p className="text-blue-100 mt-1 opacity-80 font-medium">Добавьте новые тренировки на неделю</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md relative z-10 group-hover:bg-white group-hover:text-blue-600 transition-all">
                    <ChevronRight size={24} />
                </div>
                {/* Декоративный элемент фона */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            </Link>

            {/* Карточка Отчетов */}
            <Link 
                to="/admin/reports" 
                className="bg-white p-8 rounded-[2rem] border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Отчеты и выгрузка</h3>
                    <p className="text-gray-400 mt-1 font-medium text-sm italic">Экспорт данных в PDF / Excel</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <Activity size={24} />
                </div>
            </Link>

        </div>
        </div>
    );
}