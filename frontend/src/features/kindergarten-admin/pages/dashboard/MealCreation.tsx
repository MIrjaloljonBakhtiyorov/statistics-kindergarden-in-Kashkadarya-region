import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChefHat, 
  Save, 
  ArrowLeft,
  GripVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

export const MealCreation = () => {
  const [ingredients, setIngredients] = useState([{ name: '', qty: '', unit: 'g', notes: '' }]);
  const [steps, setSteps] = useState([{ text: '' }]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
             <ArrowLeft size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Orqaga qaytish</span>
           </button>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Yangi taom qo‘shish</h2>
           <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Professional retsept yaratish paneli</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-all">Draft</button>
          <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
            <Save size={16} />
            <span>Saqlash</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
// Left: Form Builder
        <div className="col-span-8 space-y-8">
          {/* Progress Indicator */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retsept yaratish jarayoni</p>
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">65%</p>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
             </div>
          </div>
          
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">1. Asosiy ma'lumotlar</h3>
             <div className="grid grid-cols-2 gap-6">
               <div className="col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Taom nomi</label>
                 <input type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" placeholder="Masalan: Sutli bo'tqa..." />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kategoriya</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all">
                    <option>Suyuq ovqat</option>
                    <option>Quyuq ovqat</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Yosh guruhi</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all">
                    <option>3-7 yosh</option>
                  </select>
               </div>
             </div>
          </div>

          {/* Ingredient Builder */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">2. Ingredientlar</h3>
               <button 
                onClick={() => setIngredients([...ingredients, { name: '', qty: '', unit: 'g', notes: '' }])}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-600/20"
               >
                 <Plus size={14} /> Ingredient qo'shish
               </button>
            </div>
            <div className="space-y-4">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-4 group bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all">
                   <GripVertical size={16} className="text-slate-300 cursor-grab" />
                   <input type="text" placeholder="Ingr. nomi" className="flex-1 p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold" />
                   <input type="number" placeholder="Miqdori" className="w-24 p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold" />
                   <select className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                     <option>g</option>
                     <option>kg</option>
                   </select>
                   <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-rose-600">
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prep Steps */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">3. Tayyorlash tartibi</h3>
               <button 
                onClick={() => setSteps([...steps, { text: '' }])}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-600/20"
               >
                 <Plus size={14} /> Step qo'shish
               </button>
             </div>
             <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border-2 border-indigo-100 group-hover:border-indigo-200 transition-all">{i+1}</div>
                    <textarea className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold min-h-[80px] focus:ring-4 focus:ring-indigo-100 outline-none" placeholder="Qadam tafsiloti..." />
                    <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-600 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
             </div>
          </div>


          {/* Allergy & Notes */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">4. Allergiyalar va qo'shimchalar</h3>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Allergen chips</label>
                   <div className="flex gap-2">
                     {['Sut', 'Yong\'oq', 'Tuhum', 'Baliq'].map(a => (
                       <button key={a} className="px-4 py-2 rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">{a}</button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Qo'shimcha izohlar</label>
                   <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold min-h-[80px]" placeholder="Izoh..." />
                </div>
             </div>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="col-span-4 space-y-8">
           {/* Preview Card */}
           <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                <ChefHat size={48} />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">Yangi taom</h4>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Kategoriya</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest">3-7 yosh</span>
              </div>
           </div>

           {/* Regional Ranking Panel */}
           <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <h3 className="font-black text-sm uppercase tracking-widest text-indigo-400">Bog'chalar Reytingi</h3>
                </div>
                <div className="space-y-3">
                   {[
                     { name: 'Qarshi', rank: '1', score: '98%' },
                     { name: 'Shahrisabz', rank: '2', score: '95%' },
                     { name: 'Muborak', rank: '3', score: '92%' },
                   ].map(item => (
                     <div key={item.name} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className='flex items-center gap-3'>
                            <span className='w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold'>{item.rank}</span>
                            <span className="text-xs font-bold">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400">{item.score}</span>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Batafsil reyting</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
