import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { districts, getDistrictNameKey } from '../../../../constants';
import KashkadaryaMap from './KashkadaryaMap';
import StatsGrid from './StatsGrid';
import DistrictDetailModal from '../modals/DistrictDetailModal';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Trophy, Medal } from 'lucide-react';
import { kindergartenApi } from '@/shared/api';
import { getMahallasByDistrict, type MahallaOption } from '../../../kindergarten-admin/data/qashqadaryoMahallas';

const RANK_COLORS = [
  "#f59e0b", "#94a3b8", "#b45309",
  "#6366f1","#10b981","#0ea5e9","#ec4899","#8b5cf6",
  "#f97316","#14b8a6","#a3e635","#e11d48","#0891b2","#7c3aed","#059669","#d97706",
];

interface TumanStatistikasiProps {
  CustomTooltip?: any;
}

type KindergartenRow = {
  district?: string;
  mahalla?: string;
  mahallaCode?: string;
  mahalla_code?: string;
  name?: string;
  type?: string;
  systemId?: string;
  system_id?: string;
  currentChildren?: number | string;
  current_children?: number | string;
  children?: number | string;
  capacity?: number | string;
  status?: string;
  address?: string;
};

const DISTRICT_ALIASES = [
  { name: "Qarshi sh.", fullName: "Qarshi shahri", aliases: ["qarshi sh", "qarshi shahri"] },
  { name: "Shahrisabz sh.", fullName: "Shahrisabz shahri", aliases: ["shahrisabz sh", "shahrisabz shahri"] },
  { name: "Qarshi t.", fullName: "Qarshi tumani", aliases: ["qarshi t", "qarshi tumani"] },
  { name: "Shahrisabz t.", fullName: "Shahrisabz tumani", aliases: ["shahrisabz t", "shahrisabz tumani"] },
  { name: "Kitob t.", fullName: "Kitob tumani", aliases: ["kitob", "kitob t", "kitob tumani"] },
  { name: "Koson t.", fullName: "Koson tumani", aliases: ["koson", "koson t", "koson tumani"] },
  { name: "Muborak t.", fullName: "Muborak tumani", aliases: ["muborak", "muborak t", "muborak tumani"] },
  { name: "G'uzor t.", fullName: "G'uzor tumani", aliases: ["g'uzor", "g'uzor t", "g'uzor tumani", "g‘uzor", "g‘uzor t", "g‘uzor tumani"] },
  { name: "Nishon t.", fullName: "Nishon tumani", aliases: ["nishon", "nishon t", "nishon tumani"] },
  { name: "Dehqonobod t.", fullName: "Dehqonobod tumani", aliases: ["dehqonobod", "dehqonobod t", "dehqonobod tumani"] },
  { name: "Qamashi t.", fullName: "Qamashi tumani", aliases: ["qamashi", "qamashi t", "qamashi tumani"] },
  { name: "Chiroqchi t.", fullName: "Chiroqchi tumani", aliases: ["chiroqchi", "chiroqchi t", "chiroqchi tumani"] },
  { name: "Kasbi t.", fullName: "Kasbi tumani", aliases: ["kasbi", "kasbi t", "kasbi tumani"] },
  { name: "Mirishkor t.", fullName: "Mirishkor tumani", aliases: ["mirishkor", "mirishkor t", "mirishkor tumani"] },
  { name: "Yakkabog' t.", fullName: "Yakkabog' tumani", aliases: ["yakkabog'", "yakkabog' t", "yakkabog' tumani", "yakkabog‘", "yakkabog‘ t", "yakkabog‘ tumani"] },
  { name: "Ko'kdala t.", fullName: "Ko'kdala tumani", aliases: ["ko'kdala", "ko'kdala t", "ko'kdala tumani", "ko‘kdala", "ko‘kdala t", "ko‘kdala tumani"] },
];

const normalizeDistrict = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019`]/g, "'")
  .replace(/\./g, '')
  .replace(/\s+/g, ' ');

const districtAliasMap = new Map<string, string>(
  DISTRICT_ALIASES.flatMap((district): Array<[string, string]> => [
    [normalizeDistrict(district.name), district.name],
    ...district.aliases.map((alias): [string, string] => [normalizeDistrict(alias), district.name]),
  ])
);

const districtFullNameMap = new Map<string, string>(
  DISTRICT_ALIASES.flatMap((district): Array<[string, string]> => [
    [normalizeDistrict(district.name), district.fullName],
    [normalizeDistrict(district.fullName), district.fullName],
    ...district.aliases.map((alias): [string, string] => [normalizeDistrict(alias), district.fullName]),
  ])
);

const resolveDistrictName = (value: unknown) => {
  const normalized = normalizeDistrict(value);
  return districtAliasMap.get(normalized) || String(value || "Noma'lum hudud").trim() || "Noma'lum hudud";
};

const resolveDistrictFullName = (value: unknown) => {
  const normalized = normalizeDistrict(value);
  return districtFullNameMap.get(normalized) || String(value || "Noma'lum hudud").trim() || "Noma'lum hudud";
};

const normalizeMahalla = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019`]/g, "'")
  .replace(/\s+/g, ' ');

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const makeMahallaKey = (mahalla: MahallaOption) => normalizeMahalla(mahalla.name);

const TumanStatistikasi: React.FC<TumanStatistikasiProps> = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [kindergartens, setKindergartens] = useState<KindergartenRow[]>([]);
  const { t } = useTranslation();
  const districtName = (name: string) => t(getDistrictNameKey(name), { defaultValue: name });

  useEffect(() => {
    let mounted = true;
    kindergartenApi.getAll()
      .then((res) => {
        if (mounted) setKindergartens(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setKindergartens([]);
      });

    return () => { mounted = false; };
  }, []);

  const ranked = useMemo(() =>
    {
      if (!kindergartens.length) {
        return [...districts]
          .map(d => ({ name: d.name, nameLabel: districtName(d.name), count: d.count || 0, attendance: d.attendance || 0 }))
          .sort((a, b) => b.count - a.count);
      }

      const counts = new Map<string, number>();
      kindergartens.forEach((kg) => {
        const name = resolveDistrictName(kg.district);
        counts.set(name, (counts.get(name) || 0) + 1);
      });

      return Array.from(counts.entries())
        .map(([name, count]) => ({
          name,
          nameLabel: districtName(name),
          count,
          attendance: districts.find((district) => district.name === name)?.attendance || 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
    [kindergartens, t]
  );

  const totalMTT = ranked.reduce((s, d) => s + d.count, 0);
  const maxCount = ranked[0]?.count || 1;

  const selectedDistrictData = useMemo(() => {
    if (!selectedDistrict) return null;

    const displayName = resolveDistrictName(selectedDistrict);
    const fullName = resolveDistrictFullName(selectedDistrict);
    const fallbackDistrict = districts.find((district) =>
      district.name === displayName || resolveDistrictFullName(district.name) === fullName
    );
    const rows = kindergartens.filter((kg) => resolveDistrictFullName(kg.district) === fullName);
    const knownMahallas = getMahallasByDistrict(fullName);
    const knownMahallaMap = new Map(knownMahallas.map((mahalla) => [makeMahallaKey(mahalla), mahalla]));
    const mahallaRows = new Map<string, {
      name: string;
      code?: string;
      count: number;
      children: number;
      capacity: number;
      kindergartens: KindergartenRow[];
    }>();

    knownMahallas.forEach((mahalla) => {
      mahallaRows.set(mahalla.name, {
        name: mahalla.name,
        code: mahalla.code,
        count: 0,
        children: 0,
        capacity: 0,
        kindergartens: [],
      });
    });

    rows.forEach((kg) => {
      const rawMahalla = String(kg.mahalla || '').trim();
      const knownMahalla = knownMahallaMap.get(normalizeMahalla(rawMahalla));
      const key = knownMahalla?.name || rawMahalla || "Mahalla kiritilmagan";
      const existing = mahallaRows.get(key) || {
        name: key,
        code: knownMahalla?.code || kg.mahallaCode || kg.mahalla_code,
        count: 0,
        children: 0,
        capacity: 0,
        kindergartens: [],
      };

      existing.count += 1;
      existing.children += toNumber(kg.currentChildren ?? kg.current_children ?? kg.children);
      existing.capacity += toNumber(kg.capacity);
      existing.kindergartens.push(kg);
      mahallaRows.set(key, existing);
    });

    const liveTypeRows = new Map<string, { name: string; count: number; children: number }>();
    rows.forEach((kg) => {
      const typeName = String(kg.type || "Turi kiritilmagan").trim();
      const current = liveTypeRows.get(typeName) || { name: typeName, count: 0, children: 0 };
      current.count += 1;
      current.children += toNumber(kg.currentChildren ?? kg.current_children ?? kg.children);
      liveTypeRows.set(typeName, current);
    });

    const liveChildren = rows.reduce((sum, kg) => sum + toNumber(kg.currentChildren ?? kg.current_children ?? kg.children), 0);
    const liveDetails = rows.length > 0 ? {
      ...(fallbackDistrict?.details || {
        totalChildren3to7: 0,
        coveragePercentage: fallbackDistrict?.attendance || 0,
      }),
      totalMTT: rows.length,
      totalCoveredChildren: liveChildren,
      types: Array.from(liveTypeRows.values()).sort((a, b) => b.count - a.count),
    } : fallbackDistrict?.details;

    return {
      ...fallbackDistrict,
      name: fallbackDistrict?.name || displayName,
      fullName,
      count: rows.length || fallbackDistrict?.count || 0,
      attendance: fallbackDistrict?.attendance || 0,
      details: liveDetails,
      kindergartens: rows,
      mahallas: Array.from(mahallaRows.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    };
  }, [selectedDistrict, kindergartens]);

  return (
    <div className="space-y-6 md:space-y-10 lg:space-y-12">
      <StatsGrid />

      {/* Interactive Map */}
      <div className="w-full">
        <div className="bg-white p-4 sm:p-6 lg:p-10 xl:p-14 rounded-[2rem] lg:rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col h-[62vh] min-h-[420px] md:h-[70vh] lg:h-[calc(100vh-8rem)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="relative z-10 flex-1 flex items-center justify-center bg-slate-50/50 rounded-[1.5rem] lg:rounded-[4rem] border border-slate-100 p-3 sm:p-6 lg:p-10">
            <KashkadaryaMap
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
            />
          </div>
        </div>
      </div>

      {/* ── BOG'CHALAR SONI REYTINGI ── */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-0.5">{t('district.rating')}</p>
              <h3 className="text-[14px] font-black text-slate-900 leading-tight">
                {t('district.byMtt')}
              </h3>
            </div>
          </div>
          <div className="text-left sm:text-right flex flex-col gap-2">
            <p className="text-2xl font-black text-slate-900">
              {totalMTT} <span className="text-sm font-bold text-slate-400">{t('common.mttCount')}</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{t('district.totalRegion')}</p>
            <select
              value={selectedDistrict || ''}
              onChange={(event) => setSelectedDistrict(event.target.value || null)}
              className="w-full sm:w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="">Hudud tanlash</option>
              {ranked.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.nameLabel} - {district.count}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* top-3 podium */}
        <div className="px-3 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-50">
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
            {/* 2nd */}
            {ranked[1] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
                className="min-w-0 flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "#f1f5f9" }}>
                  <Medal className="h-[18px] w-[18px] sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-3 sm:pb-4 pt-3" style={{ height: 96, background: "linear-gradient(180deg,#e2e8f0,#f1f5f9)" }}>
                  <p className="text-lg sm:text-xl font-black text-slate-700">{ranked[1].count}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wide">{t('common.mttCount')}</p>
                </div>
                <p className="w-full text-[10px] sm:text-xs font-black text-slate-700 text-center mt-2 leading-tight line-clamp-2">{ranked[1].nameLabel}</p>
              </motion.div>
            )}
            {/* 1st */}
            {ranked[0] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} viewport={{ once: true }}
                className="min-w-0 flex flex-col items-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                  <Trophy className="h-[22px] w-[22px] sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-3 sm:pb-4 pt-3 shadow-md" style={{ height: 122, background: "linear-gradient(180deg,#fef3c7,#fde68a)" }}>
                  <p className="text-2xl sm:text-3xl font-black text-amber-800">{ranked[0].count}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-amber-600 uppercase tracking-wide">{t('common.mttCount')}</p>
                </div>
                <p className="w-full text-[11px] sm:text-sm font-black text-slate-900 text-center mt-2 leading-tight line-clamp-2">{ranked[0].nameLabel}</p>
              </motion.div>
            )}
            {/* 3rd */}
            {ranked[2] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} viewport={{ once: true }}
                className="min-w-0 flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "#fef3c7" }}>
                  <Medal className="h-[18px] w-[18px] sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-3 sm:pb-4 pt-3" style={{ height: 82, background: "linear-gradient(180deg,#fef3c7,#fef9c3)" }}>
                  <p className="text-lg sm:text-xl font-black text-amber-700">{ranked[2].count}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-amber-500 uppercase tracking-wide">{t('common.mttCount')}</p>
                </div>
                <p className="w-full text-[10px] sm:text-xs font-black text-slate-700 text-center mt-2 leading-tight line-clamp-2">{ranked[2].nameLabel}</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
          {/* Bar chart */}
          <div className="p-2.5 sm:p-5 lg:p-6 h-[330px] sm:h-[420px] lg:h-[480px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={ranked} layout="vertical" margin={{ top: 0, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
                <YAxis type="category" dataKey="nameLabel" axisLine={false} tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} width={88} />
                <Tooltip
                  cursor={{ fill: "rgba(245,158,11,0.05)" }}
                  wrapperStyle={{ outline: 'none', maxWidth: 190 }}
                  allowEscapeViewBox={{ x: false, y: true }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const rank = ranked.findIndex(r => r.name === d.name) + 1;
                      return (
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", maxWidth: 178 }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, whiteSpace: "normal" }}>
                            #{rank} - {d.nameLabel}
                          </p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                            <span style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{d.count}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{t('common.mttCount')}</span>
                          </div>
                          <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
                            {((d.count / totalMTT) * 100).toFixed(1)}% {t('common.ofTotalMtt')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={16}
                  fill="#6366f1"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list */}
          <div className="p-3 sm:p-5 overflow-y-auto custom-scrollbar max-h-[420px] lg:max-h-[480px]">
            <div className="space-y-2">
              {ranked.map((d, i) => {
                const pct = (d.count / maxCount) * 100;
                const color = i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : RANK_COLORS[i];
                const sharePct = ((d.count / totalMTT) * 100).toFixed(1);
                return (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDistrict(d.name)}
                  >
                    {/* rank badge */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-black"
                      style={{
                        background: i < 3 ? color + "20" : "#f8fafc",
                        color: i < 3 ? color : "#94a3b8",
                        border: `1px solid ${i < 3 ? color + "30" : "#e2e8f0"}`,
                      }}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between gap-1 mb-1.5">
                        <p className="text-[12px] font-black text-slate-800 truncate">{d.nameLabel}</p>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="text-[12px] font-black text-slate-900">{d.count}</span>
                          <span className="text-[12px] font-semibold text-slate-400">{t('common.countUnit')}</span>
                          <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color + "15", color }}>
                            {sharePct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.03, ease: "easeOut" }}
                          viewport={{ once: true }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DistrictDetailModal
        district={selectedDistrictData}
        onClose={() => setSelectedDistrict(null)}
      />
    </div>
  );
};

export default TumanStatistikasi;
