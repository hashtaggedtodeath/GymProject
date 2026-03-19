import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CreditCard } from 'lucide-react';

export default function AdminMemberships() {
    const [types, setTypes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '', visits: '' });

    useEffect(() => { fetchTypes(); }, []);

    const fetchTypes = async () => {
        const res = await api.get('/admin/membership-types');
        setTypes(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/admin/membership-types', formData);
        setShowForm(false);
        fetchTypes();
    };

    const handleDelete = async (id) => {
        if (confirm("Удалить этот тип абонемента?")) {
            try {
                await api.delete(`/admin/membership-types/${id}`);
                fetchTypes();
            } catch (err) { alert(err.response.data.error); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Управление абонементами</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center">
                    <Plus size={18} className="mr-2"/> Новый абонемент
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input className="p-2 border rounded-lg" placeholder="Название (напр. VIP)" required onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input type="number" className="p-2 border rounded-lg" placeholder="Цена (руб)" required onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input type="number" className="p-2 border rounded-lg" placeholder="Дней" required onChange={e => setFormData({...formData, duration: e.target.value})} />
                    <input type="number" className="p-2 border rounded-lg" placeholder="Лимит визитов" onChange={e => setFormData({...formData, visits: e.target.value})} />
                    <button className="md:col-span-4 bg-green-600 text-white py-2 rounded-xl font-bold">Сохранить</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {types.map(t => (
                    <div key={t.TypeID} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{t.Name}</p>
                            <p className="text-blue-600 font-bold">{t.Price} ₽</p>
                            <p className="text-xs text-gray-400">{t.DurationDays} дней / {t.VisitsLimit || 'Безлимит'} визитов</p>
                        </div>
                        <button onClick={() => handleDelete(t.TypeID)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}