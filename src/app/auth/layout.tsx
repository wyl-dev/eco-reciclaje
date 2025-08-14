import Link from 'next/link';
import { ReactNode } from 'react';
import AuthTabs from '../../components/auth/AuthTabs';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">← Volver al Inicio</Link>
        </div>
        <div className="bg-card border shadow-lg rounded-xl overflow-hidden">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EcoReciclaje</h1>
            <p className="text-muted-foreground text-sm">Sistema inteligente de reciclaje</p>
            <AuthTabs />
          </div>
          <div className="px-8 pb-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
