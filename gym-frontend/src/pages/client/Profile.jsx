import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function Profile() {
    const [membership, setMembership] = useState(null);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, tRes] = await Promise.all([
                    api.get('/client/my-membership'),
                    api.get('/admin/membership-types')
                ]);
                setMembership(mRes.data[0]);
                setTypes(tRes.data);
            } catch (err) {
                console.error("Ошибка загрузки данных профиля");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBuy = async (typeId) => {
        try {
            await api.post('/client/buy-membership', { typeId });
            alert("Абонемент успешно куплен!");
            window.location.reload(); // Обновляем данные
        } catch (err) {
            alert("Ошибка при покупке");
        }
    };

    if (loading) return <div className="text-center p-10">Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Мой профиль</h1>

            {/* Текущий абонемент */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CheckCircle className="text-green-500 mr-2" /> Текущий статус
                </h2>
                {membership ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-600">Тариф</p>
                            <p className="text-lg font-bold">{membership.Name}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-600">Осталось визитов</p>
                            <p className="text-lg font-bold">{membership.RemainingVisits ?? 'Безлимит'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl col-span-full">
                            <p className="text-sm text-gray-500">Действует до</p>
                            <p className="font-medium">{new Date(membership.EndDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 bg-gray-50 p-4 rounded-xl text-center">У вас пока нет активного абонемента</p>
                )}
            </div>

            {/* Доступные тарифы */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10">Купить абонемент</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {types.map(type => (
                    <div key={type.TypeID} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{type.Name}</h3>
                            <p className="text-3xl font-black text-blue-600 my-4">{type.Price} ₽</p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                <li className="flex items-center"><Clock size={14} className="mr-2" /> Срок: {type.DurationDays} дней</li>
                                <li className="flex items-center"><CheckCircle size={14} className="mr-2" /> Лимит: {type.VisitsLimit || 'Безлимит'}</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => handleBuy(type.TypeID)}
                            className="w-full bg-gray-900 text-white py-2 rounded-xl font-bold hover:bg-blue-600 transition"
                        >
                            Выбрать
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}