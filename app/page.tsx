'use client';

import { useMemo, useState } from 'react';
import { Calculator, CircleHelp, Landmark, WalletCards } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const MRP = 4_325;
const MZP = 85_000;
const DEDUCTION = 30 * MRP;
const SOCIAL_CAP = 7 * MZP;

const formatMoney = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(value));
const tenge = (value: number) => `${formatMoney(value)} ₸`;

function ResultRow({ label, value, subtle = false }: { label: string; value: number; subtle?: boolean }) {
  return <div className={`flex items-baseline justify-between gap-4 py-3 ${subtle ? 'text-slate-500' : 'text-slate-700'}`}><span className="text-sm leading-5">{label}</span><strong className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-950">{tenge(value)}</strong></div>;
}

export default function Home() {
  const [grossText, setGrossText] = useState('1 000 000');
  const [bornBefore1975, setBornBefore1975] = useState(false);
  const [isResident, setIsResident] = useState(true);
  const gross = Number(grossText.replace(/\D/g, '')) || 0;
  const result = useMemo(() => {
    const opv = gross * 0.1;
    const vosms = gross * 0.02;
    const ipnBase = isResident ? Math.max(0, gross - opv - vosms - DEDUCTION) : gross;
    const ipn = ipnBase * 0.1;
    const net = gross - opv - vosms - ipn;
    const opvr = bornBefore1975 ? 0 : gross * 0.035;
    const socialContributions = Math.min(gross, SOCIAL_CAP) * 0.05;
    const employerOsms = gross * 0.03;
    const socialTax = Math.max(0, gross - opv - vosms) * 0.06;
    const employerAdditions = opvr + socialContributions + employerOsms + socialTax;
    return { opv, vosms, ipnBase, ipn, net, opvr, socialContributions, employerOsms, socialTax, employerAdditions, totalCost: gross + employerAdditions };
  }, [gross, bornBefore1975, isResident]);
  function updateGross(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    setGrossText(digits ? formatMoney(Number(digits)) : '');
  }
  return <main className="min-h-screen bg-[#eef3f7] text-slate-950"><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header className="mb-7 flex items-center gap-3 sm:mb-10"><div className="grid size-11 place-items-center rounded-2xl bg-[#0d5c63] text-white shadow-sm"><Calculator className="size-5" aria-hidden="true" /></div><div><p className="text-sm font-semibold tracking-wide text-[#0d5c63]">КАЗАХСТАН · 2026</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Калькулятор ФОТ</h1></div></header>
    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
      <div className="rounded-3xl bg-[#0f2537] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8"><p className="text-sm font-medium text-teal-200">Иностранный сотрудник — гражданин России</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Рассчитайте стоимость сотрудника</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">Введите начисленную зарплату до удержаний. Расчёт пересчитывается сразу.</p>
        <label className="mt-8 block" htmlFor="gross"><span className="mb-2 block text-sm font-medium text-slate-200">Gross-зарплата, ₸</span><div className="relative"><input id="gross" value={grossText} onChange={(event) => updateGross(event.target.value)} inputMode="numeric" aria-describedby="gross-help" className="w-full rounded-2xl border border-white/15 bg-white px-5 py-4 pr-12 text-2xl font-bold tabular-nums text-slate-950 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-300/25"/><span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 font-semibold text-slate-500">₸</span></div><span id="gross-help" className="mt-2 block text-xs text-slate-400">Только целые тенге</span></label>
        <label className="mt-7 block" htmlFor="resident-status"><span className="mb-2 block text-sm font-medium text-slate-200">Статус для ИПН</span><select id="resident-status" value={isResident ? 'resident' : 'nonresident'} onChange={(event) => setIsResident(event.target.value === 'resident')} className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/25"><option value="resident">Налоговый резидент РК</option><option value="nonresident">Налоговый нерезидент РК</option></select><span className="mt-2 block text-xs leading-5 text-slate-300">Для нерезидента ИПН удерживается по ставке 10% без налоговых вычетов.</span></label>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"><Checkbox checked={bornBefore1975} onCheckedChange={(checked) => setBornBefore1975(Boolean(checked))} className="mt-0.5 border-slate-400 bg-white data-checked:border-teal-300 data-checked:bg-teal-300 data-checked:text-[#0f2537]"/><span><span className="block text-sm font-semibold">Сотрудник родился до 01.01.1975</span><span className="mt-1 block text-xs leading-5 text-slate-300">При включении ОПВР работодателя не начисляются.</span></span></label>
        <div className="mt-7 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4 text-sm leading-6 text-teal-50"><CircleHelp className="mr-2 inline size-4 align-[-2px] text-teal-200" aria-hidden="true"/>Расчёт носит информационный характер и не учитывает персональные вычеты, льготы и особенности договора.</div></div>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-sm font-medium text-slate-500">Сотрудник получит на руки</p><output className="mt-1 block text-3xl font-bold tracking-tight text-[#0d5c63] sm:text-4xl">{tenge(result.net)}</output></div><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#0d5c63]"><WalletCards className="size-6" aria-hidden="true"/></div></div><div className="mt-2 divide-y divide-slate-100"><ResultRow label="Gross-зарплата" value={gross}/><ResultRow label="ОПВ · 10%" value={-result.opv} subtle/><ResultRow label="ВОСМС · 2%" value={-result.vosms} subtle/>{isResident && <ResultRow label="Базовый вычет · 30 МРП" value={-DEDUCTION} subtle/>}<ResultRow label={isResident ? 'База для ИПН' : 'База для ИПН нерезидента'} value={result.ipnBase} subtle/><ResultRow label="ИПН · 10%" value={-result.ipn} subtle/></div></div>
    </section>
    <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Landmark className="size-5" aria-hidden="true"/></div><div><h2 className="font-bold">Начисления работодателя</h2><p className="text-sm text-slate-500">Сверх Gross-зарплаты</p></div></div><div className="text-left sm:text-right"><p className="text-sm text-slate-500">Полная стоимость работодателю</p><output className="text-2xl font-bold tracking-tight text-[#0d5c63]">{tenge(result.totalCost)}</output></div></div><div className="mt-2 grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0"><div className="md:pr-8"><ResultRow label={`ОПВР · ${bornBefore1975 ? 'не начисляются' : '3,5%'}`} value={result.opvr}/><ResultRow label="Социальные отчисления · 5%" value={result.socialContributions}/></div><div className="md:pl-8"><ResultRow label="ОСМС работодателя · 3%" value={result.employerOsms}/><ResultRow label="Социальный налог · 6%" value={result.socialTax}/></div></div><div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"><span className="font-semibold text-slate-700">Нагрузка сверх Gross</span><strong className="text-lg tabular-nums text-slate-950">{tenge(result.employerAdditions)}</strong></div></section>
    <section className="mt-5 grid gap-5 md:grid-cols-2"><article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="font-bold">Допущения</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>Гражданин России, стандартный трудовой договор в Казахстане.</li><li>МРП: {formatMoney(MRP)} ₸; базовый вычет: {formatMoney(DEDUCTION)} ₸ в месяц.</li><li>МЗП: {formatMoney(MZP)} ₸; лимит базы соцотчислений: {formatMoney(SOCIAL_CAP)} ₸.</li><li>Резидент: применяются ОПВ, ВОСМС и базовый вычет при расчёте ИПН; нерезидент: вычеты не применяются.</li></ul></article><article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="font-bold">Формулы</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>ИПН резидента = max(0, Gross − ОПВ − ВОСМС − 30 МРП) × 10%.</li><li>ИПН нерезидента = Gross × 10% без вычетов.</li><li>Соцотчисления = min(Gross, 7 × МЗП) × 5%.</li><li>Стоимость = Gross + ОПВР + соцотчисления + ОСМС + соцналог.</li></ul></article></section>
  </div></main>;
}
