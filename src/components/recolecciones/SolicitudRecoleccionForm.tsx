'use client'

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { crearSolicitudAction } from '@/app/dashboard/recolecciones/actions';
import { toast } from 'sonner';

const tiposResiduos = [
  { 
    value: 'ORGANICO', 
    label: 'Orgánico',
    description: 'Restos de comida, cáscaras, etc. Se programa automáticamente según los días de tu localidad.',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'INORGANICO', 
    label: 'Inorgánico',
    description: 'Plástico, papel, cartón, vidrio, metal. Requiere programación de frecuencia.',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'PELIGROSO', 
    label: 'Peligroso',
    description: 'Pilas, medicamentos, productos químicos. Requiere manejo especial.',
    color: 'bg-red-100 text-red-800'
  }
];

const frecuenciasInorganico = [
  { value: 'UNICA', label: 'Una vez' },
  { value: 'SEMANAL_1', label: 'Semanal (1 vez)' },
  { value: 'SEMANAL_2', label: 'Semanal (2 veces)' }
];

const frecuenciasPeligroso = [
  { value: 'UNICA', label: 'Una vez' },
  { value: 'MENSUAL', label: 'Mensual' }
];

export default function SolicitudRecoleccionForm() {
  const [tipoResiduo, setTipoResiduo] = useState<string>('');
  const [fechaSolicitada, setFechaSolicitada] = useState('');
  const [frecuenciaInorg, setFrecuenciaInorg] = useState('');
  const [frecuenciaPelig, setFrecuenciaPelig] = useState('');
  const [notas, setNotas] = useState('');
  const [isPending, startTransition] = useTransition();

  const tipoSeleccionado = tiposResiduos.find(t => t.value === tipoResiduo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoResiduo || !fechaSolicitada) {
      toast.error('Completa los campos requeridos');
      return;
    }

    // Validar fecha (no puede ser en el pasado)
    const fechaSeleccionada = new Date(fechaSolicitada);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      toast.error('La fecha no puede ser anterior a hoy');
      return;
    }

    // Validar frecuencias requeridas
    if (tipoResiduo === 'INORGANICO' && !frecuenciaInorg) {
      toast.error('Selecciona la frecuencia para residuos inorgánicos');
      return;
    }

    if (tipoResiduo === 'PELIGROSO' && !frecuenciaPelig) {
      toast.error('Selecciona la frecuencia para residuos peligrosos');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('tipoResiduo', tipoResiduo);
      formData.set('fechaSolicitada', fechaSolicitada);
      if (frecuenciaInorg) formData.set('frecuenciaInorg', frecuenciaInorg);
      if (frecuenciaPelig) formData.set('frecuenciaPelig', frecuenciaPelig);
      if (notas.trim()) formData.set('notas', notas.trim());

      const result = await crearSolicitudAction(formData);
      
      if (result.success) {
        toast.success(result.message);
        // Limpiar formulario
        setTipoResiduo('');
        setFechaSolicitada('');
        setFrecuenciaInorg('');
        setFrecuenciaPelig('');
        setNotas('');
      } else {
        toast.error(result.message);
      }
    });
  };

  // Fecha mínima (hoy)
  const fechaMinima = new Date().toISOString().split('T')[0];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Nueva Solicitud de Recolección
        </CardTitle>
        <p className="text-sm text-gray-600">
          Programa la recolección de tus residuos según el tipo y frecuencia necesaria.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Residuo */}
          <div className="space-y-3">
            <Label htmlFor="tipoResiduo" className="text-sm font-medium">
              Tipo de Residuo *
            </Label>
            <Select value={tipoResiduo} onValueChange={setTipoResiduo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de residuo" />
              </SelectTrigger>
              <SelectContent>
                {tiposResiduos.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={tipo.color} variant="secondary">
                        {tipo.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {tipoSeleccionado && (
              <div className="p-3 bg-gray-50 rounded-md border-l-4 border-gray-400">
                <p className="text-sm text-gray-700">{tipoSeleccionado.description}</p>
              </div>
            )}
          </div>

          {/* Fecha Solicitada */}
          <div className="space-y-2">
            <Label htmlFor="fechaSolicitada" className="text-sm font-medium">
              Fecha Deseada *
            </Label>
            <Input
              id="fechaSolicitada"
              type="date"
              value={fechaSolicitada}
              onChange={(e) => setFechaSolicitada(e.target.value)}
              min={fechaMinima}
              required
            />
            <p className="text-xs text-gray-500">
              {tipoResiduo === 'ORGANICO' 
                ? 'Para residuos orgánicos, se asignará automáticamente el día más cercano según tu localidad'
                : 'Fecha preferida para la recolección'
              }
            </p>
          </div>

          {/* Frecuencia para Inorgánicos */}
          {tipoResiduo === 'INORGANICO' && (
            <div className="space-y-2">
              <Label htmlFor="frecuenciaInorg" className="text-sm font-medium">
                Frecuencia de Recolección *
              </Label>
              <Select value={frecuenciaInorg} onValueChange={setFrecuenciaInorg}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {frecuenciasInorganico.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Frecuencia para Peligrosos */}
          {tipoResiduo === 'PELIGROSO' && (
            <div className="space-y-2">
              <Label htmlFor="frecuenciaPelig" className="text-sm font-medium">
                Frecuencia de Recolección *
              </Label>
              <Select value={frecuenciaPelig} onValueChange={setFrecuenciaPelig}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {frecuenciasPeligroso.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-yellow-600">
                ⚠️ Los residuos peligrosos requieren manejo especializado
              </p>
            </div>
          )}

          {/* Notas adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notas" className="text-sm font-medium">
              Notas Adicionales
            </Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional sobre los residuos, ubicación, etc..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {notas.length}/500 caracteres
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !tipoResiduo || !fechaSolicitada}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? 'Creando Solicitud...' : 'Crear Solicitud'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
