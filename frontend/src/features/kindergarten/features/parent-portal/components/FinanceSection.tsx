import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  Receipt,
  Wallet
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

const formatAmount = (amount = 0) => `${Number(amount || 0).toLocaleString('uz-UZ')} UZS`;

const formatDate = (value?: string) => {
  if (!value) return 'Sana kiritilmagan';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const FinanceSection = ({ data }: any) => {
  const { showNotification } = useNotification();
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const latestPayment = payments[0];
  const receiptCount = payments.length;
  const currentInvoiceNumber = latestPayment?.invoice_number || latestPayment?.invoiceNo || (latestPayment?.id ? `INV-${String(latestPayment.id).slice(0, 8).toUpperCase()}` : 'INV tayyor emas');

  const invoices = payments.map((payment: any, index: number) => ({
    id: payment.invoice_number || payment.invoiceNo || `INV-${String(payment.id || index + 1).slice(0, 8).toUpperCase()}`,
    date: payment.date || payment.created_at,
    amount: Number(payment.amount || 0),
    status: payment.status || 'To\'langan',
    receiptId: payment.receipt_number || payment.receiptNo || `KV-${String(payment.id || index + 1).slice(0, 8).toUpperCase()}`
  }));

  const handlePaymentSoon = () => {
    showNotification("Bog'cha to'lovini amalga oshirish imkoniyati tez orada qo'shiladi.", 'info');
  };

  return (
    <div className="kg-parent-section space-y-4 pb-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-r from-white via-rose-50/70 to-pink-50/80 p-5 shadow-sm md:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
        <div className="pointer-events-none absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-pink-100/70 blur-2xl"></div>
        <div className="pointer-events-none absolute right-8 top-6 h-24 w-24 rounded-full border border-rose-200/70"></div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-rose-100 bg-white text-rose-500 shadow-sm">
              <Wallet size={26} />
            </div>
            <div className="min-w-0">
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700">
                <Receipt size={13} /> Bog'cha to'lovlari
              </p>
              <h4 className="text-[24px] font-extrabold leading-tight text-brand-depth md:text-[30px]">To'lov va invoyslar</h4>
              <p className="mt-1 text-[13px] font-medium text-brand-muted md:text-sm">
                Oylik invoyslar, oxirgi to'lovlar va kvitansiyalar shu yerda jamlanadi.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 sm:min-w-[280px]">
            <div className="min-w-0 rounded-3xl border border-white/80 bg-white/85 px-3 py-3 shadow-sm backdrop-blur sm:px-4">
              <p className="text-[11px] font-semibold text-brand-muted">Umumiy to'langan</p>
              <p className="mt-1 break-words text-base font-extrabold leading-tight text-brand-depth sm:text-lg">{formatAmount(totalPaid)}</p>
            </div>
            <div className="min-w-0 rounded-3xl border border-white/80 bg-white/85 px-3 py-3 shadow-sm backdrop-blur sm:px-4">
              <p className="text-[11px] font-semibold text-brand-muted">Kvitansiyalar</p>
              <p className="mt-1 text-lg font-extrabold text-brand-depth">{receiptCount} ta</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePaymentSoon}
        className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-500 to-pink-500 p-5 text-left text-white shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.005] active:scale-[0.995]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-shimmer" />
        <div className="relative z-10 flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/15">
            <CreditCard size={23} />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-extrabold leading-tight">Bog'cha to'lovini amalga oshirish</span>
            <span className="mt-1 block text-[13px] font-semibold text-white/75">Click, Payme yoki karta orqali to'lash imkoniyati tayyorlanmoqda.</span>
          </span>
        </div>
        <span className="relative z-10 hidden rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold text-white sm:inline-flex">
          Tez orada
        </span>
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
            <FileText size={21} />
          </div>
          <p className="text-[12px] font-semibold text-brand-muted">Joriy invoys raqami</p>
          <p className="mt-1 text-xl font-extrabold text-brand-depth">{currentInvoiceNumber}</p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-brand-muted">
            Bog'cha tomonidan chiqarilgan oxirgi invoys yoki to'lov hujjati.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 text-pink-600">
            <CreditCard size={21} />
          </div>
          <p className="text-[12px] font-semibold text-brand-muted">Oxirgi to'lov</p>
          <p className="mt-1 text-xl font-extrabold text-brand-depth">{latestPayment ? formatAmount(latestPayment.amount) : 'To\'lov yo\'q'}</p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-brand-muted">
            {latestPayment ? `${formatDate(latestPayment.date || latestPayment.created_at)} kuni qabul qilingan.` : 'Hozircha to\'lov qaydi topilmadi.'}
          </p>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-600">
            <CheckCircle2 size={21} />
          </div>
          <p className="text-[12px] font-semibold text-brand-muted">To'lov holati</p>
          <p className="mt-1 text-xl font-extrabold text-brand-depth">{payments.length ? 'Faol' : 'Ma\'lumot yo\'q'}</p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-brand-muted">
            To'lovlar kiritilganda invoys, summa va kvitansiya holati avtomatik ko'rinadi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm xl:col-span-8">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <ClipboardList size={19} />
              </div>
              <div>
                <h5 className="text-lg font-extrabold text-brand-depth">Invoyslar ro'yxati</h5>
                <p className="text-[12px] font-medium text-brand-muted">Bog'cha to'lov hujjatlari</p>
              </div>
            </div>
          </div>

          {invoices.length ? (
            <div className="overflow-x-auto">
              <table className="kg-finance-table w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border bg-white text-[12px] font-bold text-brand-muted">
                    <th className="px-5 py-4">Invoys</th>
                    <th className="px-5 py-4">Sana</th>
                    <th className="px-5 py-4">Summa</th>
                    <th className="px-5 py-4">Holat</th>
                    <th className="px-5 py-4 text-right">Kvitansiya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-rose-50/35">
                      <td data-label="Invoys" className="px-5 py-4 text-sm font-extrabold text-rose-600">{invoice.id}</td>
                      <td data-label="Sana" className="px-5 py-4 text-sm font-bold text-brand-depth">{formatDate(invoice.date)}</td>
                      <td data-label="Summa" className="px-5 py-4 text-sm font-extrabold text-brand-depth">{formatAmount(invoice.amount)}</td>
                      <td data-label="Holat" className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                          {invoice.status}
                        </span>
                      </td>
                      <td data-label="Kvitansiya" className="px-5 py-4 text-right">
                        <button className="inline-flex items-center gap-2 rounded-2xl border border-brand-border bg-white px-3 py-2 text-[12px] font-bold text-brand-depth transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600">
                          <Download size={14} /> {invoice.receiptId}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                <Receipt size={26} />
              </div>
              <h5 className="text-lg font-extrabold text-brand-depth">Invoyslar topilmadi</h5>
              <p className="mt-1 max-w-md text-[13px] font-medium leading-relaxed text-brand-muted">
                Bog'cha tomonidan invoys yoki to'lov qaydi kiritilgach, hujjatlar shu yerda ko'rinadi.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-white text-amber-600">
              <AlertCircle size={21} />
            </div>
            <h5 className="text-lg font-extrabold text-brand-depth">Muhim ma'lumot</h5>
            <p className="mt-2 text-[13px] font-semibold leading-relaxed text-amber-900/80">
              Invoys raqami orqali bog'cha to'lovi aniqlanadi. To'lovdan so'ng kvitansiyani saqlab qo'ying.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
            <h5 className="text-lg font-extrabold text-brand-depth">Kvitansiyalar</h5>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-brand-muted">
              Har bir tasdiqlangan to'lov uchun kvitansiya raqami shakllanadi. Keyingi bosqichda uni yuklab olish imkoniyati ulanadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
