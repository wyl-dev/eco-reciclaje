import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if(!token) {
    redirect('/auth/login?redirect=/dashboard');
  }
  const payload = verifyToken(token);
  if(!payload) {
    // Cookie inválida -> limpiar y redirigir
    (await cookies()).delete('auth_token');
    redirect('/auth/login?redirect=/dashboard');
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Bienvenido al panel de control.</p>
      <div className="text-xs text-muted-foreground">Usuario ID: {payload.uid} · Rol: {payload.role}</div>
    </div>
  );
}
