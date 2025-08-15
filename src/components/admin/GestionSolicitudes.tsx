'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSolicitudesAdminAction } from '@/app/dashboard/admin/solicitudes/actions';
import { toast } from 'sonner';
import { Calendar, User, MapPin, FileText, Phone, Mail } from 'lucide-react';

interface SolicitudAdmin {
  id: string;
  tipoResiduo: string;
  estado: string;
  fechaSolicitada: string;
  fechaProgramada?: string;
  localidad?: string | null;
  notas?: string | null;
  frecuenciaInorg?: string | null;
  frecuenciaPelig?: string | null;
  usuario: {
    nombre?: string | null;
    email: string;
    telefono?: string | null;
    direccion?: string | null;
  };
}

const estadoConfig = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  PROGRAMADA: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
  ASIGNADA: { label: 'Asignada', color: 'bg-purple-100 text-purple-800' },
  COMPLETADA: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
};

const tipoResiduoConfig = {
  ORGANICO: { label: 'Orgánico', color: 'bg-green-100 text-green-800' },
  INORGANICO: { label: 'Inorgánico', color: 'bg-blue-100 text-blue-800' },
  PELIGROSO: { label: 'Peligroso', color: 'bg-red-100 text-red-800' }
};

export default function GestionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdmin[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('ALL');
  const [filtroLocalidad, setFiltroLocalidad] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const result = await getSolicitudesAdminAction(
        filtroEstado === 'ALL' ? undefined : filtroEstado,
        filtroLocalidad === 'ALL' ? undefined : filtroLocalidad
      );
      if (result.success) {
        setSolicitudes(result.solicitudes || []);
      } else {
        toast.error(result.message || 'Error al cargar solicitudes');
      }
    } catch (error) {
      toast.error('Error al cargar las solicitudes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [filtroEstado, filtroLocalidad]); // Ignoramos advertencia porque cargarSolicitudes es estable

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const localidadesUnicas = Array.from(
    new Set(solicitudes.map(s => s.localidad).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Estado:</label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendientes</SelectItem>
              <SelectItem value="PROGRAMADA">Programadas</SelectItem>
              <SelectItem value="ASIGNADA">Asignadas</SelectItem>
              <SelectItem value="COMPLETADA">Completadas</SelectItem>
              <SelectItem value="CANCELADA">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Localidad:</label>
          <Select value={filtroLocalidad} onValueChange={setFiltroLocalidad}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por localidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las localidades</SelectItem>
              {localidadesUnicas.map(localidad => (
                <SelectItem key={localidad} value={localidad!}>
                  {localidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={cargarSolicitudes} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {solicitudes.length}
            </div>
            <div className="text-sm text-gray-600">Total Solicitudes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {solicitudes.filter(s => s.estado === 'PENDIENTE').length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {solicitudes.filter(s => s.estado === 'PROGRAMADA').length}
            </div>
            <div className="text-sm text-gray-600">Programadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {solicitudes.filter(s => s.estado === 'COMPLETADA').length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes
            </h3>
            <p className="text-gray-600">
              No se encontraron solicitudes con los filtros aplicados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => {
            const estado = estadoConfig[solicitud.estado as keyof typeof estadoConfig];
            const tipoResiduo = tipoResiduoConfig[solicitud.tipoResiduo as keyof typeof tipoResiduoConfig];
            
            return (
              <Card key={solicitud.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={tipoResiduo?.color} variant="secondary">
                        {tipoResiduo?.label}
                      </Badge>
                      <Badge className={estado?.color} variant="secondary">
                        {estado?.label}
                      </Badge>
                      {solicitud.localidad && (
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {solicitud.localidad}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {solicitud.id.slice(-8)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de la solicitud */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Detalles de la Solicitud</h4>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Solicitada: {formatearFecha(solicitud.fechaSolicitada)}
                        </span>
                      </div>

                      {solicitud.fechaProgramada && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Programada: {formatearFecha(solicitud.fechaProgramada)}
                          </span>
                        </div>
                      )}

                      {(solicitud.frecuenciaInorg || solicitud.frecuenciaPelig) && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Frecuencia:</span>
                          <span className="ml-1">
                            {solicitud.frecuenciaInorg === 'UNICA' && 'Una vez'}
                            {solicitud.frecuenciaInorg === 'SEMANAL_1' && 'Semanal (1 vez)'}
                            {solicitud.frecuenciaInorg === 'SEMANAL_2' && 'Semanal (2 veces)'}
                            {solicitud.frecuenciaPelig === 'UNICA' && 'Una vez'}
                            {solicitud.frecuenciaPelig === 'MENSUAL' && 'Mensual'}
                          </span>
                        </div>
                      )}

                      {solicitud.notas && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Notas:</span>
                          <p className="text-gray-600 mt-1">{solicitud.notas}</p>
                        </div>
                      )}
                    </div>

                    {/* Información del usuario */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Información del Usuario</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {solicitud.usuario.nombre || 'Sin nombre'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{solicitud.usuario.email}</span>
                        </div>

                        {solicitud.usuario.telefono && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{solicitud.usuario.telefono}</span>
                          </div>
                        )}

                        {solicitud.usuario.direccion && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{solicitud.usuario.direccion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
