import { useState } from 'react';
import api from '../../api/axios';
import { Send, MessageSquare } from 'lucide-react';

export default function Support() {
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/client/support', { message: msg });
            setSent(true);
            setMsg('');
        } catch (err) { alert("Ошибка отправки"); }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl text-white">
                    <MessageSquare size={24} />
                </div>
                <h1 className="text-2xl font-bold">Связь с администрацией</h1>
            </div>

            {sent ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center">
                    <p className="font-bold">Спасибо! Ваше обращение принято.</p>
                    <p className="text-sm">Менеджер свяжется с вами по телефону или email.</p>
                    <button onClick={() => setSent(false)} className="mt-4 underline text-sm">Отправить еще одно</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-gray-500 text-sm">Опишите вашу проблему, жалобу или предложение по работе зала.</p>
                    <textarea 
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl h-40 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Ваше сообщение..."
                        value={msg}
                        required
                        onChange={(e) => setMsg(e.target.value)}
                    ></textarea>
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                        <Send size={18} /> Отправить сообщение
                    </button>
                </form>
            )}
        </div>
    );
}