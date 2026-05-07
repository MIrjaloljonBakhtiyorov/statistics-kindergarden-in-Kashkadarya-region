import React, { useState } from 'react';
import { districts } from '../../constants';
import KashkadaryaMap from './KashkadaryaMap';
import StatsGrid from './StatsGrid';
import DistrictDetailModal from '../modals/DistrictDetailModal';

interface TumanStatistikasiProps {
  CustomTooltip: any;
}

const TumanStatistikasi: React.FC<TumanStatistikasiProps> = ({ CustomTooltip }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <div className="space-y-8 md:space-y-12">
      <StatsGrid />

      <div className="w-full">
        {/* Interactive Map */}
        <div className="w-full space-y-10">
          <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden h-full min-h-[600px] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            
            <div className="relative z-10 flex-1 flex items-center justify-center bg-slate-50/50 rounded-[4rem] border border-slate-100 p-10">
              <KashkadaryaMap 
                selectedDistrict={selectedDistrict} 
                setSelectedDistrict={setSelectedDistrict} 
              />
            </div>
          </div>
        </div>
      </div>

      <DistrictDetailModal 
        district={districts.find(d => d.name === selectedDistrict)} 
        onClose={() => setSelectedDistrict(null)}
      />
    </div>
  );
};

export default TumanStatistikasi;
