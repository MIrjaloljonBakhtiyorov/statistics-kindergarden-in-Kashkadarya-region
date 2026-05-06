import React from 'react';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="max-w-[1400px] mx-auto px-4 md:px-8 pb-12">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border border-indigo-400/20">R</div>
           <div className="flex flex-col">
             <h3 className="text-base leading-none select-none flex items-baseline">
               <span className="text-aqlvoy-3d text-sm">RAQAMLI</span>
               <span className="text-oshpaz-bubbly text-xs ml-1">MTT</span>
             </h3>
           </div>
        </div>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center md:text-right">&copy; 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
