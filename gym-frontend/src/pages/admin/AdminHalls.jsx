import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, MapPin, Users } from 'lucide-react';

export default function AdminHalls() {
    const [halls, setHalls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', capacity: '' });

    const fetchHalls = async () => {
        const res = await api.get('/admin/halls');
        setHalls(res.data);
    };

    useEffect(() => { fetchHalls(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/halls', formData);
            setShowForm(false);
            setFormData({ name: '', capacity: '' });
            fetchHalls();
        } catch (err) { alert("Ошибка при создании"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Удалить зал?")) return;
        try {
            await api.delete(`/admin/halls/${id}`);
            fetchHalls();
        } catch (err) { alert(err.response.data.error); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">Залы и локации</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center shadow-lg hover:bg-purple-700 transition">
                    <Plus size={18} className="mr-2"/> Добавить зал
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-purple-50 space-y-4 max-w-xl mx-auto">
                    <input className="w-full p-3 border rounded-xl" placeholder="Название зала" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input type="number" className="w-full p-3 border rounded-xl" placeholder="Вместимость (чел)" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-xl">Отмена</button>
                        <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Сохранить</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {halls.map(h => (
                    <div key={h.HallID} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 text-center relative">
                        <button onClick={() => handleDelete(h.HallID)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
                            <Trash2 size={16} />
                        </button>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">{h.Name}</h3>
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                            <Users size={14} /> Вместимость: {h.Capacity}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}