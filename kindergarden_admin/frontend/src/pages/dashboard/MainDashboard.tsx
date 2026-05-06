import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Qarshi sh.', jami: 4000, faol: 3800 },
  { name: 'Koson', jami: 3000, faol: 2800 },
  { name: 'G‘uzor', jami: 2000, faol: 1900 },
  { name: 'Chiroqchi', jami: 2780, faol: 2500 },
  { name: 'Kitob', jami: 2400, faol: 2300 },
  { name: 'Shahrisabz', jami: 3200, faol: 3000 },
  { name: 'Muborak', jami: 1500, faol: 1450 },
];

export const MainDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-[#f8fafc] min-h-screen"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">Kashkadarya MTT boshqaruvi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Sifat va davomat monitoring tizimi</p>
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 py-6 sm:py-2">
          <Plus size={18} className="mr-2 sm:hidden lg:inline" /> Yangi bog‘cha qo‘shish
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Jami bog‘chalar", value: "1,240", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Jami bolalar", value: "145,230", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Davomat darajasi", value: "94.2%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Muammoli bog‘chalar", value: "23", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl shadow-sm border-slate-100 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] sm:text-[11px] text-slate-500 font-black uppercase tracking-widest">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-4 h-4 sm:w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} />
                <span>+2.4% o'sish</span>
              </div>
            </CardContent>
            {/* Background design element */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${stat.color.replace('text-', 'bg-')}`} />
          </Card>
        ))}
      </div>

      <Card className="rounded-[32px] shadow-xl shadow-slate-200/50 border-slate-100 overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Hududlar bo‘yicha tahlil</CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium">Viloyat bog‘chalari faoliyati monitoringi (Real-time)</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="h-[250px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="jami" name="Jami bog‘chalar" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar dataKey="faol" name="Faol bog‘chalar" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
      </Card>
    </motion.div>
  );
};
