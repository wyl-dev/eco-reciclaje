'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from './DashboardHeader';
import { 
  Users, 
  Recycle, 
  Award, 
  TrendingUp,
  Plus,
  Building2,
  Shield,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  localidad: string | null;
  direccion: string | null;
  role: 'ADMIN' | 'USUARIO' | 'EMPRESA';
  suscripcion: {
    activa: boolean;
  } | null;
  solicitudes: Array<{
    id: string;
    tipoResiduo: 'ORGANICO' | 'INORGANICO' | 'PELIGROSO';
    estado: 'PENDIENTE' | 'PROGRAMADA' | 'ASIGNADA' | 'COMPLETADA' | 'CANCELADA';
    fechaSolicitada: Date;
    createdAt: Date;
  }>;
  puntos: Array<{
    puntos: number;
    motivo: string | null;
    createdAt: Date;
  }>;
}

interface Props {
  user: UserData;
}

export default function DashboardContent({ user }: Props) {
  const totalPuntos = user.puntos.reduce((sum, p) => sum + p.puntos, 0);
  const solicitudesActivas = user.solicitudes.filter(s => 
    ['PENDIENTE', 'PROGRAMADA', 'ASIGNADA'].includes(s.estado)
  ).length;

  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }

  if (user.role === 'EMPRESA') {
    return <EmpresaDashboard user={user} />;
  }

  // Dashboard para USUARIO
  return (
    <div className="space-y-6">
      {/* Header con info del usuario y logout */}
      <DashboardHeader user={user} />

      {/* Header de bienvenida */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {user.nombre || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            Aquí puedes gestionar tus solicitudes de reciclaje y ver tu impacto ambiental
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/dashboard/recolecciones">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Link>
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalPuntos}</div>
            <p className="text-xs text-gray-500">
              +{user.puntos.slice(0, 5).reduce((sum, p) => sum + p.puntos, 0)} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
            <Recycle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitudesActivas}</div>
            <p className="text-xs text-gray-500">En proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recolecciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.solicitudes.filter(s => s.estado === 'COMPLETADA').length}
            </div>
            <p className="text-xs text-gray-500">Completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Info de usuario */}
      {user.localidad && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Tu Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Localidad:</strong> {user.localidad}</p>
            {user.direccion && <p><strong>Dirección:</strong> {user.direccion}</p>}
            <div className="flex items-center gap-2">
              <strong>Suscripción:</strong>
              <Badge variant={user.suscripcion?.activa ? 'default' : 'secondary'}>
                {user.suscripcion?.activa ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes recientes */}
      {user.solicitudes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.solicitudes.slice(0, 3).map((solicitud) => (
                <div key={solicitud.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{solicitud.tipoResiduo}</p>
                    <p className="text-sm text-gray-500">
                      {solicitud.fechaSolicitada.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={solicitud.estado === 'COMPLETADA' ? 'default' : 'secondary'}
                  >
                    {solicitud.estado}
                  </Badge>
                </div>
              ))}
            </div>
            {user.solicitudes.length > 3 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/solicitudes">Ver Todas</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminDashboard({ user }: Props) {
  return (
    <div className="space-y-6">
      {/* Header con info del usuario y logout */}
      <DashboardHeader user={user} />
      
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona todo el sistema EcoReciclaje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Administrar usuarios del sistema</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/admin/usuarios">Ver Usuarios</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas Recolectoras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Gestionar empresas del sistema</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/admin/empresas">Ver Empresas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="w-5 h-5" />
              Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Ver solicitudes de recolección</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/admin/solicitudes">Ver Solicitudes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Sistema de Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configurar sistema de puntos</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/admin/puntos">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Horarios Orgánicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configurar días de recolección</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/admin/horarios">Configurar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmpresaDashboard({ user }: Props) {
  return (
    <div className="space-y-6">
      {/* Header con info del usuario y logout */}
      <DashboardHeader user={user} />
      
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Empresa</h1>
          <p className="text-gray-600">Gestiona las recolecciones asignadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recolecciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-gray-600">Solicitudes por atender</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recolecciones Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-gray-600">Este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
