'use client';

import { useMemo, useState } from 'react';
import {
  Calculator,
  CircleHelp,
  ExternalLink,
  Landmark,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { calculatePayroll, PAYROLL_2026, roundTenge } from '@/lib/payroll';

const MAX_MONEY_DIGITS = 12;

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(
    roundTenge(value),
  );
}

function tenge(value: number) {
  return `${formatMoney(value)} ₸`;
}

function parseMoney(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? formatMoney(Number(digits)) : '';
}

type ResultRowProps = {
  label: string;
  value: number;
  negative?: boolean;
  hint?: string;
  strong?: boolean;
};

function ResultRow({ label, value, negative, hint, strong }: ResultRowProps) {
  const normalized = roundTenge(value);
  const renderedValue =
    negative && normalized > 0 ? `−${tenge(normalized)}` : tenge(normalized);

  return (
    <div className="flex items-start justify-between gap-5 py-3">
      <div>
        <span
          className={`block text-sm leading-5 ${strong ? 'font-semibold text-slate-900' : 'text-slate-600'}`}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs leading-4 text-slate-500">
            {hint}
          </span>
        )}
      </div>
      <strong
        className={`shrink-0 text-right text-sm tabular-nums ${strong ? 'text-slate-950' : 'font-semibold text-slate-900'}`}
      >
        {renderedValue}
      </strong>
    </div>
  );
}

function MoneyInput({
  id,
  label,
  value,
  onChange,
  help,
  prominent = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
  prominent?: boolean;
}) {
  const [error, setError] = useState('');

  function updateValue(nextValue: string) {
    const digits = nextValue.replace(/\D/g, '');
    if (digits.length > MAX_MONEY_DIGITS) {
      setError('Максимум 999 999 999 999 ₸');
      return;
    }
    setError('');
    onChange(formatMoneyInput(nextValue));
  }

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <span className="relative block">
        <input
          id={id}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          inputMode="numeric"
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-2xl border bg-white pr-12 font-bold tabular-nums text-slate-950 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-300/25 ${prominent ? 'px-5 py-4 text-2xl' : 'px-4 py-3 text-base'} ${error ? 'border-rose-400' : 'border-white/15'}`}
        />
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
          ₸
        </span>
      </span>
      <span
        id={`${id}-help`}
        className="mt-2 block text-xs leading-5 text-slate-400"
      >
        {help}
      </span>
      {error && (
        <span
          id={`${id}-error`}
          className="mt-1 block text-xs font-medium text-rose-300"
        >
          {error}
        </span>
      )}
    </label>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof WalletCards;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
        <Icon className="size-4 text-teal-200" aria-hidden="true" />
        {label}
      </div>
      <output className="mt-2 block text-xl font-bold tracking-tight text-white sm:text-2xl">
        {tenge(value)}
      </output>
    </div>
  );
}

export function PayrollCalculator() {
  const [grossText, setGrossText] = useState('1 000 000');
  const [taxableIncomeText, setTaxableIncomeText] = useState('');
  const [bornBefore1975, setBornBefore1975] = useState(false);
  const [isResident, setIsResident] = useState(true);

  const gross = parseMoney(grossText);
  const taxableIncomeBeforeMonth = parseMoney(taxableIncomeText);
  const result = useMemo(
    () =>
      calculatePayroll({
        gross,
        isResident,
        bornBefore1975,
        taxableIncomeBeforeMonth,
      }),
    [gross, isResident, bornBefore1975, taxableIncomeBeforeMonth],
  );

  const higherRateApplied = result.ipnAt15Base > 0;

  return (
    <main className="min-h-screen bg-[#edf3f6] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#0d5c63] text-white shadow-sm">
              <Calculator className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#0d5c63]">
                КАЗАХСТАН · 2026
              </p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Калькулятор ФОТ
              </h1>
            </div>
          </div>
          <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 sm:inline-flex">
            Проверено 07.09.2026
          </span>
        </header>

        <section className="grid items-stretch gap-5 lg:grid-cols-2">
          <div className="flex h-full flex-col rounded-3xl bg-[#0f2537] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
            <p className="text-sm font-medium text-teal-200">
              Гражданин России · трудовой договор в РК
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Стоимость сотрудника
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Введите начисленную зарплату до удержаний.
            </p>

            <div className="mt-6">
              <MoneyInput
                id="gross"
                label="Gross-зарплата, ₸"
                value={grossText}
                onChange={setGrossText}
                help="Целые тенге, пересчёт выполняется автоматически"
                prominent
              />
            </div>

            <div
              className="mt-5 grid grid-cols-2 gap-3"
              aria-label="Главные результаты"
            >
              <Kpi label="На руки" value={result.net} icon={WalletCards} />
              <Kpi label="Стоимость" value={result.totalCost} icon={Landmark} />
            </div>

            <section
              className="mt-5 rounded-2xl border border-white/10 bg-white/5"
              aria-labelledby="calculation-parameters-heading"
            >
              <h3
                id="calculation-parameters-heading"
                className="border-b border-white/10 px-4 py-3 text-sm font-semibold"
              >
                Параметры расчёта
              </h3>
              <div className="space-y-5 p-4">
                <label className="block" htmlFor="resident-status">
                  <span className="mb-2 block text-sm font-medium text-slate-200">
                    Статус для ИПН
                  </span>
                  <select
                    id="resident-status"
                    value={isResident ? 'resident' : 'nonresident'}
                    onChange={(event) =>
                      setIsResident(event.target.value === 'resident')
                    }
                    className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/25"
                  >
                    <option value="resident">Налоговый резидент РК</option>
                    <option value="nonresident">Налоговый нерезидент РК</option>
                  </select>
                  <span className="mt-2 block text-xs leading-5 text-slate-300">
                    {isResident
                      ? 'Применяется базовый вычет до 30 МРП.'
                      : 'Налоговые вычеты не применяются.'}
                  </span>
                </label>

                <MoneyInput
                  id="taxable-income-ytd"
                  label="Налогооблагаемый доход до этого месяца, ₸"
                  value={taxableIncomeText}
                  onChange={setTaxableIncomeText}
                  help="Нужен для годовой шкалы ИПН 10% / 15%; оставьте пустым для первого месяца"
                />

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/20 p-3">
                  <Checkbox
                    id="born-before-1975"
                    checked={bornBefore1975}
                    onCheckedChange={(checked) =>
                      setBornBefore1975(Boolean(checked))
                    }
                    className="mt-0.5 border-slate-400 bg-white data-checked:border-teal-300 data-checked:bg-teal-300 data-checked:text-[#0f2537]"
                  />
                  <label htmlFor="born-before-1975" className="cursor-pointer">
                    <span className="block text-sm font-semibold">
                      Сотрудник родился до 01.01.1975
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-300">
                      ОПВР работодателя не начисляются.
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4 text-sm leading-6 text-teal-50 lg:mt-auto">
              <CircleHelp
                className="mr-2 inline size-4 align-[-2px] text-teal-200"
                aria-hidden="true"
              />
              Предварительная оценка без персональных льгот и особенностей
              договора.
            </div>
          </div>

          <div className="h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-7">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Расшифровка результата
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Удержания и начисления
                </h2>
              </div>
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#0d5c63]">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <section aria-labelledby="employee-result-heading">
                <div className="flex items-end justify-between gap-4">
                  <h3 id="employee-result-heading" className="font-bold">
                    Сотрудник
                  </h3>
                  <output className="text-xl font-bold tracking-tight text-[#0d5c63]">
                    {tenge(result.net)}
                  </output>
                </div>
                <div className="mt-2 divide-y divide-slate-100">
                  <ResultRow
                    label="Gross-зарплата"
                    value={result.gross}
                    strong
                  />
                  <ResultRow
                    label="ОПВ · 10%"
                    hint="База не более 50 МЗП"
                    value={result.opv}
                    negative
                  />
                  <ResultRow
                    label="ВОСМС · 2%"
                    hint="База не более 20 МЗП"
                    value={result.vosms}
                    negative
                  />
                  {isResident && (
                    <ResultRow
                      label="Применённый базовый вычет"
                      hint={`Не более 30 МРП · ${tenge(PAYROLL_2026.basicDeduction)}`}
                      value={result.appliedDeduction}
                      negative
                    />
                  )}
                  <ResultRow label="База для ИПН" value={result.ipnBase} />
                  <ResultRow
                    label={`ИПН · ${higherRateApplied ? '10% / 15%' : '10%'}`}
                    value={result.ipn}
                    negative
                  />
                </div>
              </section>

              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-5 ${higherRateApplied ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
              >
                {higherRateApplied
                  ? `По ставке 15% облагается ${tenge(result.ipnAt15Base)} текущей базы.`
                  : `До годового порога ставки 15% осталось ${tenge(result.remainingBeforeHigherRate)}.`}
              </div>

              <section
                className="mt-7 border-t border-slate-200 pt-6"
                aria-labelledby="employer-result-heading"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 id="employer-result-heading" className="font-bold">
                      Работодатель
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Начисления сверх Gross
                    </p>
                  </div>
                  <output className="text-xl font-bold tracking-tight text-[#0d5c63]">
                    {tenge(result.totalCost)}
                  </output>
                </div>
                <div className="mt-2 divide-y divide-slate-100">
                  <ResultRow
                    label={`ОПВР · ${bornBefore1975 ? 'не начисляются' : '3,5%'}`}
                    hint={bornBefore1975 ? undefined : 'База от 1 до 50 МЗП'}
                    value={result.opvr}
                  />
                  <ResultRow
                    label="Социальные отчисления · 5%"
                    hint="База не более 7 МЗП"
                    value={result.socialContributions}
                  />
                  <ResultRow
                    label="ОСМС работодателя · 3%"
                    hint="База не более 40 МЗП"
                    value={result.employerOsms}
                  />
                  <ResultRow
                    label="Социальный налог · 6%"
                    value={result.socialTax}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#eef7f7] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Нагрузка сверх Gross
                  </span>
                  <strong className="tabular-nums text-slate-950">
                    {tenge(result.employerAdditions)}
                  </strong>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <section
            className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            aria-labelledby="assumptions-heading"
          >
            <h2 id="assumptions-heading" className="p-5 font-bold">
              Допущения
            </h2>
            <ul className="space-y-2 border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-600">
              <li>
                Гражданин России, стандартный трудовой договор в Казахстане.
              </li>
              <li>
                МРП — {tenge(PAYROLL_2026.mrp)}; МЗП — {tenge(PAYROLL_2026.mzp)}
                .
              </li>
              <li>Вычет применяется только налоговому резиденту РК.</li>
              <li>
                Каждый платёж округляется до целого тенге до расчёта итогов.
              </li>
            </ul>
          </section>

          <section
            className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            aria-labelledby="formulas-heading"
          >
            <h2 id="formulas-heading" className="p-5 font-bold">
              Формулы и пределы
            </h2>
            <ul className="space-y-2 border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-600">
              <li>
                ИПН: 10% до 8 500 МРП годовой базы, затем 15% с превышения.
              </li>
              <li>ОПВ и ОПВР: предел базы 50 МЗП.</li>
              <li>ВОСМС: 20 МЗП; ОСМС работодателя: 40 МЗП.</li>
              <li>Социальные отчисления: не более 7 МЗП.</li>
            </ul>
          </section>
        </section>

        <footer className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 text-xs leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Расчёт информационный. Для начисления зарплаты используйте данные
            бухгалтера.
          </p>
          <nav
            className="flex flex-wrap gap-x-4 gap-y-2"
            aria-label="Официальные источники"
          >
            <a
              className="inline-flex items-center gap-1 font-semibold text-[#0d5c63] hover:underline"
              href="https://www.gov.kz/memleket/entities/minfin/documents/details/1030415?lang=ru"
              target="_blank"
              rel="noreferrer"
            >
              ИПН <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-1 font-semibold text-[#0d5c63] hover:underline"
              href="https://www.gov.kz/situations/332/intro?lang=ru"
              target="_blank"
              rel="noreferrer"
            >
              ОПВ <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-1 font-semibold text-[#0d5c63] hover:underline"
              href="https://www.gov.kz/memleket/entities/aktobe-irgiz/press/article/details/222718"
              target="_blank"
              rel="noreferrer"
            >
              ОПВР <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-1 font-semibold text-[#0d5c63] hover:underline"
              href="https://www.gov.kz/memleket/entities/minfin/press/article/details/235407"
              target="_blank"
              rel="noreferrer"
            >
              ОСМС <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
