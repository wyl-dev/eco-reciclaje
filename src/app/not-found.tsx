"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound(){
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700 text-3xl font-bold">404</div>
          <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
          <p className="text-sm text-muted-foreground">La página que buscas no existe o fue movida. Puedes volver atrás o ir al inicio.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleBack} className="sm:w-auto w-full">Volver atrás</Button>
          <Button variant="outline" asChild className="sm:w-auto w-full"><Link href="/">Ir al Inicio</Link></Button>
        </div>
      </div>
    </div>
  );
}
