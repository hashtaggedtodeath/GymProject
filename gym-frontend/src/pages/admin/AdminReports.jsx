import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { FileDown, TrendingUp, Users, Award } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminReports() {
    const [revenueData, setRevenueData] = useState([]);
    const [serviceData, setServiceData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [revRes, servRes] = await Promise.all([
                    api.get('/reports/stats/revenue'),
                    api.get('/reports/stats/services')
                ]);
                setRevenueData(revRes.data);
                setServiceData(servRes.data);
            } catch (err) {
                console.error("Ошибка загрузки аналитики");
            }
        };
        fetchStats();
    }, []);

    const handleExport = async (type) => {
        const url = `/reports/export/${type}`;
        try {
            const response = await api.get(url, { responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Ошибка при скачивании файла");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Аналитика и Отчеты</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleExport('excel')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <FileDown size={18} className="mr-2" /> Excel
                    </button>
                    <button 
                        onClick={() => handleExport('pdf')}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                    >
                        <FileDown size={18} className="mr-2" /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* График доходов */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-blue-600" /> Доходы по тарифам
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="Name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="TotalRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Доход (₽)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* График популярности услуг */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Award className="mr-2 text-purple-600" /> Популярность услуг
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    dataKey="BookingsCount"
                                    nameKey="Name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Таблица активности */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center text-gray-800">
                        <Users className="mr-2 text-orange-500" /> Сводка продаж
                    </h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Название тарифа</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Кол-во продаж</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Общая сумма</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {revenueData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium">{item.Name}</td>
                                <td className="px-6 py-4">{item.SalesCount}</td>
                                <td className="px-6 py-4 font-bold text-blue-600">{item.TotalRevenue} ₽</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}