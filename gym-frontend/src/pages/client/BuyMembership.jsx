import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard,Zap } from 'lucide-react';

export default function BuyMembership() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/admin/membership-types')
            .then(res => setTypes(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleBuy = async (typeId) => {
        try {
            await api.post('/client/buy-membership', { typeId });
            alert('Абонемент успешно оформлен! Теперь вы можете записываться на тренировки.');
            navigate('/dashboard'); // Возвращаем в профиль
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка при покупке');
        }
    };

    if (loading) return <div className="p-10 text-center">Загрузка тарифов...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Выберите ваш тариф</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {types.map((type) => (
                    <div key={type.TypeID} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col hover:scale-105 transition-transform">
                        <div className="bg-blue-600 p-6 text-white text-center">
                            <h3 className="text-xl font-bold uppercase tracking-widest">{type.Name}</h3>
                            <div className="mt-4">
                                <span className="text-4xl font-black">{type.Price} ₽</span>
                            </div>
                        </div>
                        
                        <div className="p-8 flex-grow">
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} />
                                    Действует {type.DurationDays} дней
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} />
                                    {type.VisitsLimit ? `${type.VisitsLimit} занятий` : 'Безлимитные посещения'}
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check className="text-green-500 mr-2" size={20} />
                                    Доступ во все залы
                                </li>
                            </ul>
                            
                            <button 
                                onClick={() => handleBuy(type.TypeID)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                            >
                                <CreditCard size={18} /> Купить сейчас
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}