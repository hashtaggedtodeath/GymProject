import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/reports/stats/revenue').then(res => {
            // Упрощенно считаем общую сумму для примера
            const total = res.data.reduce((sum, item) => sum + item.TotalRevenue, 0);
            setStats({ totalRevenue: total, types: res.data });
        });
    }, []);

    const statCards = [
        { name: 'Общий доход', value: `${stats?.totalRevenue || 0} ₽`, icon: DollarSign, color: 'bg-green-500' },
        { name: 'Активные клиенты', value: '124', icon: Users, color: 'bg-blue-500' },
        { name: 'Тренировок сегодня', value: '8', icon: Calendar, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Панель управления</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <div key={card.name} className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                        <div className={`${card.color} p-3 rounded-lg text-white`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{card.name}</p>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4">Доходы по категориям</h2>
                <div className="space-y-4">
                    {stats?.types.map(type => (
                        <div key={type.Name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{type.Name}</span>
                                <span className="font-bold">{type.TotalRevenue} ₽</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}