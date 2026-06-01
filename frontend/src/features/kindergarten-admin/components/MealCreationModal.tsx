import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Utensils, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Save,
  Database
} from 'lucide-react';
import { clsx } from 'clsx';

interface MealCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealCreationModal: React.FC<MealCreationModalProps> = ({ isOpen, onClose }) => {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [dragActive, setDragActive] = useState(false);

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => {
    const newIng = ingredients.filter((_, i) => i !== index);
    setIngredients(newIng.length ? newIng : ['']);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 sm:p-3 bg-indigo-600 rounded-xl sm:rounded-2xl text-white shrink-0">
                <Plus size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Yangi taom</h2>
                <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 text-indigo-600">Taomlar bazasi</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 sm:p-3 hover:bg-slate-200 rounded-xl sm:rounded-2xl transition-colors text-slate-400"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              
              {/* Left Column: Basic Info & Media */}
              <div className="space-y-6 sm:space-y-8">
                {/* Taom Nomi & Kategoriya */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Utensils size={12} className="text-indigo-600" /> Nomi
                    </label>
                    <input 
                      type="text" 
                      placeholder="Taom nomi..."
                      className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Database size={12} className="text-indigo-600" /> Kategoriya
                    </label>
                    <select className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-xs sm:text-sm appearance-none cursor-pointer">
                      <option>Sho'rvalar</option>
                      <option>Quyuq taomlar</option>
                      <option>Parhez taomlar</option>
                      <option>Salatlar</option>
                      <option>Ichimliklar</option>
                      <option>Desertlar</option>
                      <option>Non mahsulotlari</option>
                    </select>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={12} className="text-indigo-600" /> Rasm
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center hover:border-indigo-400 transition-all bg-slate-50 group cursor-pointer">
                      <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-1 sm:mb-2 sm:w-6 sm:h-6" size={20} />
                      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Yuklash</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Video size={12} className="text-indigo-600" /> YouTube
                    </label>
                    <div className="relative h-full">
                       <input 
                         type="text" 
                         placeholder="Link..."
                         className="w-full h-[64px] sm:h-full px-4 sm:px-6 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl sm:rounded-3xl focus:outline-none font-medium text-[10px] sm:text-xs"
                       />
                       <Video className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-rose-400 sm:w-5 sm:h-5" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} className="text-indigo-600" /> Tayyorlanishi
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Batafsil yozing..."
                    className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 font-medium text-xs sm:text-sm resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Ingredients */}
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Database size={12} className="text-indigo-600" /> Mahsulotlar
                    </label>
                    <button 
                      onClick={addIngredient}
                      className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {ingredients.map((_, idx) => (
                      <div key={idx} className="flex gap-2 sm:gap-3">
                        <input 
                          type="text" 
                          placeholder={`${idx + 1}-mahsulot...`}
                          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none text-xs sm:text-sm font-bold"
                        />
                        <button 
                          onClick={() => removeIngredient(idx)}
                          className="p-2 sm:p-3 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-8 bg-indigo-50 rounded-2xl sm:rounded-[32px] border border-indigo-100 space-y-2 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-xs font-black text-indigo-900 uppercase tracking-widest">Eslatma:</h4>
                  <p className="text-[10px] sm:text-xs text-indigo-700/70 leading-relaxed font-medium">
                    Yangi taom qo'shilgandan so'ng, u AI nazoratidan o'tadi va bazaga saqlanadi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border border-slate-200 text-slate-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Bekor qilish
            </button>
            <button 
              onClick={() => {
                toast.success("Yangi taom bazaga muvaffaqiyatli qo'shildi! ✅");
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              Saqlash
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
