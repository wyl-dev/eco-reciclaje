


import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamicType = 'force-dynamic';

export default async function DashboardPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    redirect('/auth/login?redirect=/dashboard');
  }
  const payload = verifyToken(token);
  if (!payload) {
    (await cookies()).delete('auth_token');
    redirect('/auth/login?redirect=/dashboard');
  }

  // Pasar el rol y nombre de usuario al dashboard client component
  return (
    <div className="space-y-4">
      <DashboardClient role={payload.role} username={payload.uid} />
    </div>
  );
}
