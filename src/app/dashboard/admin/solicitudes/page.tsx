export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GestionSolicitudes from '@/components/admin/GestionSolicitudes';

export default async function SolicitudesAdminPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Solicitudes</h1>
        <p className="text-gray-600 mt-2">
          Administra todas las solicitudes de recolección del sistema
        </p>
      </div>

      <GestionSolicitudes />
    </div>
  );
}
