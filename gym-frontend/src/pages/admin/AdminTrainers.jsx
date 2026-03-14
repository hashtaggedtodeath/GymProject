import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, UserPlus } from 'lucide-react';

export default function AdminTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newTrainer, setNewTrainer] = useState({ fullName: '', specialization: '', bio: '' });

    const fetchTrainers = async () => {
        const res = await api.get('/admin/trainers');
        setTrainers(res.data);
    };

    useEffect(() => { fetchTrainers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/admin/trainers', newTrainer);
        setShowForm(false);
        fetchTrainers();
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить тренера?')) {
            await api.delete(`/admin/trainers/${id}`);
            fetchTrainers();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Тренеры</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} className="mr-2" /> Добавить
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
                    <input 
                        className="w-full p-2 border rounded" 
                        placeholder="ФИО тренера" 
                        required
                        onChange={e => setNewTrainer({...newTrainer, fullName: e.target.value})}
                    />
                    <input 
                        className="w-full p-2 border rounded" 
                        placeholder="Специализация" 
                        onChange={e => setNewTrainer({...newTrainer, specialization: e.target.value})}
                    />
                    <button className="bg-green-600 text-white px-4 py-2 rounded shadow">Сохранить</button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Имя</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {trainers.map(t => (
                            <tr key={t.TrainerID} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold">{t.FullName}</p>
                                    <p className="text-sm text-gray-500">{t.Specialization}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(t.TrainerID)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}