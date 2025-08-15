import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardContent from '@/components/portal/DashboardContent';

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

  // Obtener datos completos del usuario
  const user = await prisma.usuario.findUnique({
    where: { id: payload.uid },
    include: {
      suscripcion: true,
      solicitudes: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      puntos: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!user) {
    (await cookies()).delete('auth_token');
    redirect('/auth/login');
  }

  return <DashboardContent user={user} />;
}
