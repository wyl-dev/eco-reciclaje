export const dynamic = 'force-dynamic';

import { getEmpresasAction, getAdminStatsAction } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Package, TrendingUp } from 'lucide-react';
import EmpresaManagement from '@/components/admin/EmpresaManagement';

export default async function AdminEmpresasPage() {
  const [empresasData, stats] = await Promise.all([
    getEmpresasAction(1),
    getAdminStatsAction()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
        <p className="text-gray-600">Administra las empresas recolectoras del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
            <p className="text-xs text-gray-500">Empresas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recolecciones Hoy</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recoleccionesHoy}</div>
            <p className="text-xs text-gray-500">Completadas hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {empresasData.empresas.reduce((sum, emp) => sum + emp.totalUsuarios, 0)}
            </div>
            <p className="text-xs text-gray-500">Empleados totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {empresasData.empresas.length > 0 
                ? Math.round(empresasData.empresas.reduce((sum, emp) => sum + emp.recoleccionesMes, 0) / empresasData.empresas.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500">Recolecciones/mes promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de empresas */}
      <EmpresaManagement initialData={empresasData} />
    </div>
  );
}
