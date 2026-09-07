import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Калькулятор ФОТ Казахстан — 2026',
  description:
    'Расчёт Net, налогов, социальных платежей и полной стоимости гражданина России, работающего в Казахстане.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
