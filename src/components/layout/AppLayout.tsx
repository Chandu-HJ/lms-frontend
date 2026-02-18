import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <div className="page-shell">
      <TopBar />
      <main className="container">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
};
