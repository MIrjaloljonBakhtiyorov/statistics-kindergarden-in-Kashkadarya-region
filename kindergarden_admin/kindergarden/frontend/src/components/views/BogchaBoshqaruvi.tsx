import React, { useState } from 'react';
import BogchaList from '../../features/bogcha/components/BogchaList';
import BogchaCreateWizard from '../../features/bogcha/components/BogchaCreateWizard';
import { BogchaFormData } from '../../features/bogcha/types/bogcha.types';

// Boshlang'ich mock ma'lumotlar
const initialBogchalar = [
  { id: 1, nomi: '1-sonli "Nilufar" MTT', turi: 'Davlat', tuman: 'Qarshi sh.', direktor: 'Xolmatova N.', bolalar: 215, faol: true },
  { id: 2, nomi: '12-sonli "Bahor" MTT', turi: 'Oilaviy', tuman: 'Muborak t.', direktor: 'Toshmatov J.', bolalar: 48, faol: true },
  { id: 3, nomi: '"Kamolot" xususiy MTT', turi: 'Nodavlat', tuman: 'Shahrisabz sh.', direktor: 'Ergasheva M.', bolalar: 32, faol: false },
  { id: 4, nomi: '5-sonli "Gulbahor" MTT', turi: 'Davlat', tuman: 'Qarshi t.', direktor: 'Nazarov A.', bolalar: 190, faol: true },
];

const BogchaBoshqaruvi: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [bogchalar, setBogchalar] = useState(initialBogchalar);

  const handleSave = (yangiBogcha: BogchaFormData) => {
    const turiLabel = yangiBogcha.turi === 'DAVLAT' ? 'Davlat' : 
                      yangiBogcha.turi === 'NODAVLAT' ? 'Nodavlat' : 
                      yangiBogcha.turi === 'OILAVIY' ? 'Oilaviy' : 'Tashkilot';

    const newBogcha = {
      id: Date.now(),
      nomi: yangiBogcha.nomi || 'Yangi MTT',
      turi: turiLabel,
      tuman: yangiBogcha.tuman || 'Noma\'lum',
      direktor: yangiBogcha.direktorIsmi || 'Kiritilmagan',
      bolalar: yangiBogcha.bolalarJami || 0,
      faol: true
    };
    
    setBogchalar([newBogcha, ...bogchalar]);
    setShowWizard(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <BogchaList onAdd={() => setShowWizard(true)} bogchalar={bogchalar} />
      {showWizard && <BogchaCreateWizard onClose={() => setShowWizard(false)} onSave={handleSave} />}
    </div>
  );
};

export default BogchaBoshqaruvi;
