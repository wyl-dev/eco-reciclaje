import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SolicitudRecoleccionForm from '@/components/recolecciones/SolicitudRecoleccionForm';
import MisSolicitudes from '@/components/recolecciones/MisSolicitudes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function RecoleccionesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'USUARIO') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recolecciones</h1>
        <p className="text-gray-600 mt-2">
          Programa y gestiona las recolecciones de tus residuos
        </p>
      </div>

      <Tabs defaultValue="nueva" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nueva">Nueva Solicitud</TabsTrigger>
          <TabsTrigger value="mis-solicitudes">Mis Solicitudes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nueva">
          <SolicitudRecoleccionForm />
        </TabsContent>
        
        <TabsContent value="mis-solicitudes">
          <MisSolicitudes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
