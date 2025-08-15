export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ConfiguracionHorarios from '@/components/admin/ConfiguracionHorarios';

export default async function ConfiguracionHorariosPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Horarios</h1>
        <p className="text-gray-600 mt-2">
          Configura los días de recolección de residuos orgánicos por localidad
        </p>
      </div>

      <ConfiguracionHorarios />
    </div>
  );
}
