'use client'

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMisSolicitudesAction, cancelarSolicitudAction } from '@/app/dashboard/recolecciones/actions';
import { toast } from 'sonner';
import { Calendar, FileText, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Solicitud {
  id: string;
  tipoResiduo: string;
  estado: string;
  fechaSolicitada: string;
  fechaProgramada?: string;
  notas?: string | null;
  frecuenciaInorg?: string | null;
  frecuenciaPelig?: string | null;
  recoleccion?: {
    id: string;
    fecha: string;
    pesoKg?: number | null;
    separadoOk?: boolean | null;
    puntosGenerados?: number | null;
    empresa?: { nombre: string } | null;
    puntos?: number;
  } | null;
}

const estadoConfig = {
  PENDIENTE: { 
    label: 'Pendiente', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    description: 'Tu solicitud está en espera de programación'
  },
  PROGRAMADA: { 
    label: 'Programada', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Calendar,
    description: 'La recolección ya tiene fecha asignada'
  },
  ASIGNADA: { 
    label: 'Asignada', 
    color: 'bg-purple-100 text-purple-800', 
    icon: CheckCircle,
    description: 'Una empresa ha sido asignada para la recolección'
  },
  COMPLETADA: { 
    label: 'Completada', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    description: 'La recolección fue realizada exitosamente'
  },
  CANCELADA: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle,
    description: 'La solicitud fue cancelada'
  }
};

const tipoResiduoConfig = {
  ORGANICO: { label: 'Orgánico', color: 'bg-green-100 text-green-800' },
  INORGANICO: { label: 'Inorgánico', color: 'bg-blue-100 text-blue-800' },
  PELIGROSO: { label: 'Peligroso', color: 'bg-red-100 text-red-800' }
};

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const result = await getMisSolicitudesAction(filtroEstado);
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
  }, [filtroEstado]); // Ignoramos la advertencia porque cargarSolicitudes es estable

  const handleCancelar = (solicitudId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta solicitud?')) return;

    startTransition(async () => {
      const result = await cancelarSolicitudAction(solicitudId, 'Cancelada por el usuario');
      if (result.success) {
        toast.success(result.message);
        await cargarSolicitudes();
      } else {
        toast.error(result.message);
      }
    });
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatearFechaCompleta = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const solicitudesFiltradas = solicitudes.filter(s => 
    filtroEstado === 'ALL' || s.estado === filtroEstado
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Mis Solicitudes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Historial de solicitudes de recolección
          </p>
        </div>

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

      {solicitudesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes
            </h3>
            <p className="text-gray-600">
              {filtroEstado === 'ALL' 
                ? 'Aún no has creado ninguna solicitud de recolección.'
                : `No tienes solicitudes con estado "${estadoConfig[filtroEstado as keyof typeof estadoConfig]?.label}".`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {solicitudesFiltradas.map((solicitud) => {
            const estado = estadoConfig[solicitud.estado as keyof typeof estadoConfig];
            const tipoResiduo = tipoResiduoConfig[solicitud.tipoResiduo as keyof typeof tipoResiduoConfig];
            const IconoEstado = estado?.icon || Clock;
            
            return (
              <Card key={solicitud.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={tipoResiduo?.color} variant="secondary">
                        {tipoResiduo?.label}
                      </Badge>
                      <Badge className={estado?.color} variant="secondary">
                        <IconoEstado className="h-3 w-3 mr-1" />
                        {estado?.label}
                      </Badge>
                    </div>
                    
                    {(solicitud.estado === 'PENDIENTE' || solicitud.estado === 'PROGRAMADA') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelar(solicitud.id)}
                        disabled={isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Solicitada: {formatearFecha(solicitud.fechaSolicitada)}
                        {solicitud.fechaProgramada && (
                          <span className="ml-4 text-green-600 font-medium">
                            📅 Programada: {formatearFechaCompleta(solicitud.fechaProgramada)}
                          </span>
                        )}
                      </span>
                    </div>

                    {(solicitud.frecuenciaInorg || solicitud.frecuenciaPelig) && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Frecuencia:</span> 
                        {solicitud.frecuenciaInorg === 'UNICA' && ' Una vez'}
                        {solicitud.frecuenciaInorg === 'SEMANAL_1' && ' Semanal (1 vez)'}
                        {solicitud.frecuenciaInorg === 'SEMANAL_2' && ' Semanal (2 veces)'}
                        {solicitud.frecuenciaPelig === 'UNICA' && ' Una vez'}
                        {solicitud.frecuenciaPelig === 'MENSUAL' && ' Mensual'}
                      </div>
                    )}

                    {solicitud.notas && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Notas:</span>
                        <p className="text-gray-600 mt-1">{solicitud.notas}</p>
                      </div>
                    )}

                    {solicitud.recoleccion && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">
                          ✅ Recolección Completada
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Fecha:</span>
                            <p className="font-medium">{formatearFecha(solicitud.recoleccion.fecha)}</p>
                          </div>
                          {solicitud.recoleccion.pesoKg && (
                            <div>
                              <span className="text-gray-600">Peso:</span>
                              <p className="font-medium">{solicitud.recoleccion.pesoKg} kg</p>
                            </div>
                          )}
                          {typeof solicitud.recoleccion.separadoOk === 'boolean' && (
                            <div>
                              <span className="text-gray-600">Separación:</span>
                              <p className="font-medium">
                                {solicitud.recoleccion.separadoOk ? '✅ Correcta' : '❌ Incorrecta'}
                              </p>
                            </div>
                          )}
                          {solicitud.recoleccion.puntos && (
                            <div>
                              <span className="text-gray-600">Puntos:</span>
                              <p className="font-medium text-emerald-600">
                                +{solicitud.recoleccion.puntos} pts
                              </p>
                            </div>
                          )}
                        </div>
                        {solicitud.recoleccion.empresa && (
                          <div className="mt-2 text-sm text-gray-600">
                            Recolectado por: <span className="font-medium">{solicitud.recoleccion.empresa.nombre}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 border-t pt-3">
                      {estado?.description}
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
