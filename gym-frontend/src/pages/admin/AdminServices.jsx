import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Tag } from 'lucide-react';


export default function AdminServices() {
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: '' });

    const fetchServices = async () => {
        const res = await api.get('/admin/services');
        setServices(res.data);
    };

    useEffect(() => { fetchServices(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/services', formData);
            setShowForm(false);
            setFormData({ name: '', description: '', price: '' });
            fetchServices();
        } catch (err) { alert("Ошибка при создании"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Удалить услугу?")) return;
        try {
            await api.delete(`/admin/services/${id}`);
            fetchServices();
        } catch (err) { alert(err.response.data.error); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">Услуги и направления</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center shadow-lg hover:bg-blue-700 transition">
                    <Plus size={18} className="mr-2"/> Добавить услугу
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-3 border rounded-xl" placeholder="Название услуги" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input type="number" className="p-3 border rounded-xl" placeholder="Базовая цена" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <textarea className="w-full p-3 border rounded-xl" placeholder="Описание услуги" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-xl">Отмена</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Сохранить</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(s => (
                    <div key={s.ServiceID} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-gray-900 text-lg">{s.Name}</h3>
                                <button onClick={() => handleDelete(s.ServiceID)} className="text-gray-300 hover:text-red-500 transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{s.Description}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                                <Tag size={14} /> {s.BasePrice} ₽
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}