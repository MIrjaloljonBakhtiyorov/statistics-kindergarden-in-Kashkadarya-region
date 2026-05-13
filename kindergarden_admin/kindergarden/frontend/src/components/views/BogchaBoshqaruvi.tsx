import React, { useState } from 'react';
import BogchaList from '../../features/bogcha/components/BogchaList';
import BogchaCreateWizard from '../../features/bogcha/components/BogchaCreateWizard';

const BogchaBoshqaruvi: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <BogchaList onAdd={() => setShowWizard(true)} />
      {showWizard && <BogchaCreateWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
};

export default BogchaBoshqaruvi;
