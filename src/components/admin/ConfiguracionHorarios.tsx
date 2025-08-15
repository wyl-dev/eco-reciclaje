'use client'

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  configurarHorarioOrganicoAction, 
  getHorariosOrganicosAction 
} from '@/app/dashboard/recolecciones/actions';
import { toast } from 'sonner';
import { Calendar, MapPin, Plus } from 'lucide-react';

interface Horario {
  id: string;
  localidad: string;
  dia: string;
}

const diasSemana = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

const localidades = [
  'Centro', 'Norte', 'Sur', 'Oriente', 'Occidente',
  'Chapinero', 'Usaquén', 'Suba', 'Engativá', 'Fontibón'
];

export default function ConfiguracionHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [nuevaLocalidad, setNuevaLocalidad] = useState('');
  const [nuevoDia, setNuevoDia] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const cargarHorarios = async () => {
    try {
      const result = await getHorariosOrganicosAction();
      if (result.success) {
        setHorarios(result.horarios || []);
      } else {
        toast.error(result.message || 'Error al cargar horarios');
      }
    } catch (error) {
      toast.error('Error al cargar horarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevaLocalidad.trim() || !nuevoDia) {
      toast.error('Completa todos los campos');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('localidad', nuevaLocalidad.trim());
      formData.set('dia', nuevoDia);

      const result = await configurarHorarioOrganicoAction(formData);
      
      if (result.success) {
        toast.success(result.message);
        setNuevaLocalidad('');
        setNuevoDia('');
        await cargarHorarios();
      } else {
        toast.error(result.message);
      }
    });
  };

  const getDiaColor = (dia: string) => {
    const colores = {
      'LUNES': 'bg-blue-100 text-blue-800',
      'MARTES': 'bg-green-100 text-green-800',
      'MIERCOLES': 'bg-yellow-100 text-yellow-800',
      'JUEVES': 'bg-purple-100 text-purple-800',
      'VIERNES': 'bg-pink-100 text-pink-800',
      'SABADO': 'bg-orange-100 text-orange-800',
      'DOMINGO': 'bg-red-100 text-red-800'
    };
    return colores[dia as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const getDiaLabel = (dia: string) => {
    const labels = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes', 
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return labels[dia as keyof typeof labels] || dia;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para agregar nuevo horario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Configurar Horario de Recolección Orgánica
          </CardTitle>
          <p className="text-sm text-gray-600">
            Asigna un día de la semana para la recolección automática de residuos orgánicos en cada localidad.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgregar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="localidad">Localidad</Label>
                <Select 
                  value={nuevaLocalidad} 
                  onValueChange={setNuevaLocalidad}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {localidades.map(localidad => (
                      <SelectItem key={localidad} value={localidad}>
                        {localidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  O escribe una nueva localidad:
                </p>
                <Input
                  placeholder="Nueva localidad"
                  value={nuevaLocalidad}
                  onChange={(e) => setNuevaLocalidad(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dia">Día de Recolección</Label>
                <Select value={nuevoDia} onValueChange={setNuevoDia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el día" />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map(dia => (
                      <SelectItem key={dia.value} value={dia.value}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !nuevaLocalidad.trim() || !nuevoDia}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? 'Configurando...' : 'Configurar Horario'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de horarios configurados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Horarios Configurados ({horarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {horarios.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay horarios configurados
              </h3>
              <p className="text-gray-600">
                Configura los días de recolección orgánica para cada localidad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {horarios.map((horario) => (
                <Card key={horario.id} className="border-l-4 border-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {horario.localidad}
                      </h3>
                      <Badge className={getDiaColor(horario.dia)}>
                        {getDiaLabel(horario.dia)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Los residuos orgánicos se recolectan automáticamente los {getDiaLabel(horario.dia).toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                ¿Cómo funciona la programación automática?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cuando un usuario solicita recolección de residuos orgánicos, el sistema calcula automáticamente la próxima fecha según su localidad.</li>
                <li>• Si no hay horario configurado para una localidad, la solicitud quedará pendiente de programación manual.</li>
                <li>• Los horarios se pueden actualizar en cualquier momento sobrescribiendo la configuración existente.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
