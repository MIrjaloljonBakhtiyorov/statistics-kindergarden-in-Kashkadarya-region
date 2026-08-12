import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  School,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { LocationPicker } from '@/shared/components/LocationPicker';
import { KINDERGARTEN_TYPE_LABELS, type KindergartenTypeValue } from '@/shared/lib/kindergartenTypes';
import { useNotification } from '../../../context/NotificationContext';
import { useParentPortalLanguage } from '../i18n/parentPortalI18n';

type NearbyKindergarten = {
  id: string;
  name: string;
  type?: KindergartenTypeValue | string;
  district?: string;
  address?: string;
  phone?: string;
  slug?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  distanceKm: number;
  workingDays?: string[];
  monthlyFee?: number;
  advantages?: string[];
  advantagesText?: string;
  capacity?: number;
  childrenCount?: number;
  freeSeats?: number | null;
  isCurrent?: boolean;
};

const radiusOptions = [
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 50, label: '50 km+' },
];

const formatRadiusLabel = (value: number) => (value >= 50 ? '50 km+' : `${value} km`);

const dayLabels: Record<string, string> = {
  monday: 'Dushanba',
  tuesday: 'Seshanba',
  wednesday: 'Chorshanba',
  thursday: 'Payshanba',
  friday: 'Juma',
  saturday: 'Shanba',
  sunday: 'Yakshanba',
};

const formatAmount = (value?: number) => {
  const amount = Number(value || 0);
  return amount > 0 ? `${amount.toLocaleString('uz-UZ')} so'm` : "Ko'rsatilmagan";
};

const formatDistance = (value: number) => {
  if (!Number.isFinite(value)) return '--';
  if (value < 0.02) return '20 m ichida';
  if (value < 1) return `${Math.max(10, Math.round(value * 1000 / 10) * 10)} m uzoqlikda`;
  return `${value.toFixed(value < 10 ? 1 : 0)} km uzoqlikda`;
};

const distanceKmBetween = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const earthRadiusKm = 6371;
  const toRad = (degree: number) => degree * Math.PI / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatWorkingDays = (days?: string[]) => {
  const values = Array.isArray(days) ? days : [];
  if (values.length === 0) return "Ko'rsatilmagan";
  const workweek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  if (workweek.every((day) => values.includes(day)) && values.length === 5) return 'Dushanba-Juma';
  return values.map((day) => dayLabels[day] || day).join(', ');
};

const getTypeLabel = (type?: string) => {
  const key = String(type || '') as KindergartenTypeValue;
  return KINDERGARTEN_TYPE_LABELS[key] || "Bog'cha";
};

const isUsableLocation = (lat: number | null, lng: number | null) =>
  lat != null && lng != null && !(Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001);

export const NearbyKindergartensSection = ({ parentData, childId, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const { phrase } = useParentPortalLanguage();
  const [radiusKm, setRadiusKm] = useState(5);
  const [homeAddress, setHomeAddress] = useState('');
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [items, setItems] = useState<NearbyKindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef<{ lat: number | null; lng: number | null } | null>(null);

  useEffect(() => {
    setHomeAddress(parentData?.address || '');
    const nextLat = parentData?.homeLat ?? parentData?.home_lat ?? null;
    const nextLng = parentData?.homeLng ?? parentData?.home_lng ?? null;
    if (isUsableLocation(nextLat, nextLng)) {
      setHomeLat(nextLat);
      setHomeLng(nextLng);
    } else {
      setHomeLat(null);
      setHomeLng(null);
    }
  }, [parentData]);

  useEffect(() => {
    if (!childId) return;
    let mounted = true;
    setLoading(true);

    apiClient.get(`/parent-portal/nearby-kindergartens/${childId}`, { params: { radiusKm } })
      .then((response) => {
        if (!mounted) return;
        const data = response.data || {};
        if (data.home) {
          setHomeAddress(data.home.address || parentData?.address || '');
          setHomeLat(data.home.lat ?? null);
          setHomeLng(data.home.lng ?? null);
        }
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [childId, parentData?.address, radiusKm]);

  const hasHomeLocation = isUsableLocation(homeLat, homeLng);
  const locationStatusLabel = saving ? 'Saqlanmoqda' : hasHomeLocation ? 'Belgilangan' : 'Belgilanmagan';
  const filteredItems = items;
  const kindergartenMapMarkers = filteredItems
    .filter((item) => isUsableLocation(item.locationLat ?? null, item.locationLng ?? null))
    .map((item) => ({
      id: item.id,
      lat: item.locationLat ?? null,
      lng: item.locationLng ?? null,
      label: item.name || phrase("Bog'cha"),
    }));

  const getDisplayDistanceKm = (item: NearbyKindergarten) => {
    if (
      hasHomeLocation &&
      isUsableLocation(item.locationLat ?? null, item.locationLng ?? null)
    ) {
      return distanceKmBetween(homeLat as number, homeLng as number, item.locationLat as number, item.locationLng as number);
    }
    return item.distanceKm;
  };

  const saveHomeLocation = async (nextLat = homeLat, nextLng = homeLng) => {
    if (!childId) return;
    if (savingRef.current) {
      pendingSaveRef.current = { lat: nextLat, lng: nextLng };
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const savedLat = isUsableLocation(nextLat, nextLng) ? nextLat : null;
    const savedLng = isUsableLocation(nextLat, nextLng) ? nextLng : null;

    try {
      const response = await apiClient.put(`/parent-portal/profile/${childId}`, {
        address: homeAddress,
        homeLat: savedLat,
        homeLng: savedLng,
      });
      if (response.data) {
        setHomeAddress(response.data.address || homeAddress);
        setHomeLat(response.data.homeLat ?? response.data.home_lat ?? savedLat);
        setHomeLng(response.data.homeLng ?? response.data.home_lng ?? savedLng);
      }
      await onUpdate?.(response.data);
      const nearbyResponse = await apiClient.get(`/parent-portal/nearby-kindergartens/${childId}`, { params: { radiusKm } });
      setItems(Array.isArray(nearbyResponse.data?.items) ? nearbyResponse.data.items : []);
      showNotification(phrase("Uy lokatsiyasi saqlandi"), 'success');
    } catch (error: any) {
      showNotification(error?.response?.data?.error || phrase("Lokatsiyani saqlashda xatolik yuz berdi"), 'error');
    } finally {
      savingRef.current = false;
      setSaving(false);
      const pendingSave = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (
        pendingSave &&
        (pendingSave.lat !== savedLat || pendingSave.lng !== savedLng)
      ) {
        void saveHomeLocation(pendingSave.lat, pendingSave.lng);
      }
    }
  };

  return (
    <div className="kg-page kg-parent-section kg-nearby-typography space-y-3 pb-3">
      <section className="relative overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 shadow-sm md:px-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-blue-900 to-emerald-500" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <MapPin size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{phrase("Yaqin bog'chalar")}</p>
              <h3 className="text-[21px] font-black leading-tight text-brand-depth md:text-[24px]">{phrase('Uy atrofidagi MTTlarni tanlash')}</h3>
              <p className="mt-0.5 max-w-2xl text-[12px] font-bold leading-relaxed text-brand-muted md:text-[13px]">
                {phrase("Bolaning uy joyini belgilang, tizim radius ichidagi bog'chalarni masofa bo'yicha chiqaradi.")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="min-w-[92px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{phrase('Radius')}</p>
              <p className="text-[16px] font-black leading-tight text-slate-950">{formatRadiusLabel(radiusKm)}</p>
            </div>
            <div className="min-w-[92px] rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{phrase('Topildi')}</p>
              <p className="text-[16px] font-black leading-tight text-emerald-700">{filteredItems.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
        <section className="self-start rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{phrase('Bolaning uyi')}</p>
              <h4 className="mt-0.5 text-lg font-black leading-tight text-slate-950">{phrase('Manzil va lokatsiya')}</h4>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
              saving
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                : hasHomeLocation
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
            }`}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} {phrase(locationStatusLabel)}
            </span>
          </div>

          <label className="block">
            <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-600">{phrase('Uy manzili')}</span>
            <input
              value={homeAddress}
              onChange={(event) => setHomeAddress(event.target.value)}
              onBlur={() => saveHomeLocation()}
              placeholder={phrase("Masalan: Qarshi shahri, Mustaqillik ko'chasi")}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100/70"
            />
          </label>

          <LocationPicker
            lat={hasHomeLocation ? homeLat : null}
            lng={hasHomeLocation ? homeLng : null}
            label={phrase('Uy lokatsiyasi')}
            markerLabel={phrase('Uy')}
            extraMarkers={kindergartenMapMarkers}
            showCoordinates={false}
            showCoordinateInputs={false}
            expandable
            modalTitle={phrase('Bolaning uy lokatsiyasini belgilang')}
            mapClassName="h-[275px] sm:h-[330px]"
            className="mt-3 rounded-xl border-slate-200 bg-slate-50/50 p-3 shadow-none"
            onChange={(value) => {
              setHomeLat(value.lat);
              setHomeLng(value.lng);
              void saveHomeLocation(value.lat, value.lng);
            }}
          />
        </section>

        <section className="min-h-[520px] rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{phrase('Qidirish')}</p>
              <h4 className="mt-0.5 text-xl font-black leading-tight text-slate-950">{phrase("Radius ichidagi bog'chalar")}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {radiusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRadiusKm(option.value)}
                  className={`h-9 min-w-[54px] rounded-xl px-3 text-[11px] font-black transition-all ${
                    radiusKm === option.value
                      ? 'bg-slate-950 text-white shadow-sm shadow-slate-950/20'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm">
                  <Loader2 size={17} className="animate-spin text-emerald-600" />
                  {phrase("Yaqin bog'chalar yuklanmoqda")}
                </div>
              </div>
            ) : !hasHomeLocation ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-center">
                <MapPin className="mx-auto text-amber-500" size={30} />
                <p className="mt-3 text-sm font-black text-slate-950">{phrase('Avval bolaning uy lokatsiyasini belgilang')}</p>
                <p className="mx-auto mt-1 max-w-md text-xs font-bold leading-relaxed text-slate-600">
                  {phrase("Xaritadan uy joyi tanlang va saqlang, keyin masofa bo'yicha bog'chalar chiqadi.")}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <School className="mx-auto text-slate-300" size={30} />
                <p className="mt-3 text-sm font-black text-slate-950">{phrase("Bu radiusda bog'cha topilmadi")}</p>
                <p className="mx-auto mt-1 max-w-md text-xs font-bold leading-relaxed text-slate-500">
                  {phrase("Radiusni kattalashtiring yoki bog'cha profilida lokatsiya kiritilganini tekshiring.")}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const mapsUrl = item.locationLat != null && item.locationLng != null
                  ? `https://www.google.com/maps?q=${item.locationLat},${item.locationLng}`
                  : '';

                return (
                  <article
                    key={item.id}
                    className={`group relative overflow-hidden rounded-[1.15rem] border bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_44px_rgba(15,23,42,0.09)] md:p-5 ${
                      item.isCurrent ? 'border-blue-200 ring-4 ring-blue-50/80' : 'border-slate-200'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 via-blue-500 to-slate-950 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[11px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                            <Navigation size={12} /> {phrase(formatDistance(getDisplayDistanceKm(item)))}
                          </span>
                          <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-3 text-[10px] font-black uppercase tracking-wide text-slate-600">
                            {phrase(getTypeLabel(item.type))}
                          </span>
                          {item.isCurrent ? (
                            <span className="inline-flex h-7 items-center rounded-full bg-blue-50 px-3 text-[10px] font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                              {phrase("Hozirgi bog'cha")}
                            </span>
                          ) : null}
                        </div>
                        <h5 className="mt-3 max-w-2xl text-[19px] font-black leading-[1.12] text-slate-950 md:text-[21px]">{item.name}</h5>
                        <p className="mt-1 text-[13px] font-black leading-relaxed text-emerald-700">
                          {phrase(`Uyingizdan taxminan ${formatDistance(getDisplayDistanceKm(item))}`)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-relaxed text-slate-600">
                          {item.address || item.district || phrase("Manzil ko'rsatilmagan")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-950 shadow-sm">
                        <CalendarDays size={14} className="text-slate-500" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">{phrase('Ish kunlari')}</span>
                        <span>{phrase(formatWorkingDays(item.workingDays))}</span>
                      </span>
                      <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-950 shadow-sm">
                        <Wallet size={14} className="text-slate-500" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">{phrase("To'lov")}</span>
                        <span>{phrase(formatAmount(item.monthlyFee))}</span>
                      </span>
                      <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-950 shadow-sm">
                        <School size={14} className="text-slate-500" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">{phrase("Bo'sh joy")}</span>
                        <span>{phrase(item.freeSeats == null ? "Ko'rsatilmagan" : `${item.freeSeats} ta`)}</span>
                      </span>
                    </div>

                    {(item.advantages?.length || item.advantagesText || mapsUrl) ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                          {(item.advantages?.length || item.advantagesText) ? (
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{phrase('Qulayliklar')}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-1.5">
                            {(item.advantages || []).slice(0, 4).map((advantage) => (
                              <span key={advantage} className="inline-flex min-h-7 items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700 ring-1 ring-violet-100">
                                <Sparkles size={11} /> {phrase(advantage)}
                              </span>
                            ))}
                            {item.advantagesText ? (
                              <span className="line-clamp-1 self-center text-[12px] font-bold text-slate-500">{phrase(item.advantagesText)}</span>
                            ) : null}
                          </div>
                        </div>
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {phrase('Xaritada')} <ExternalLink size={12} />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NearbyKindergartensSection;
