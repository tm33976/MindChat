import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindChat — AI Assistant',
  description: 'MindChat — Your intelligent AI assistant powered by advanced language models',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='9' fill='%2300d4ff' opacity='.15'/><path d='M8 20 Q8 12 16 12 Q24 12 24 20' stroke='%2300d4ff' stroke-width='2' fill='none' stroke-linecap='round'/><circle cx='16' cy='10' r='2.5' fill='%2300d4ff'/></svg>" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}