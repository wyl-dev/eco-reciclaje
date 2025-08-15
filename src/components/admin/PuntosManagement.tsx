'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Gift,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createConfigPuntosAction,
  updateConfigPuntosAction,
  deleteConfigPuntosAction,
  asignarBonificacionAction,
  asignarPenalizacionAction,
  getConfigPuntosAction
} from '@/app/dashboard/admin/actions';

interface ConfigPuntos {
  id: string;
  descripcion: string | null;
  expresion: string;
  base: number;
  factorPeso: number;
  factorSeparado: number;
  activo: boolean;
  createdAt: Date;
}

interface Usuario {
  id: string;
  nombre: string | null;
  email: string;
  localidad: string | null;
  totalPuntos: number;
  recoleccionesCompletadas: number;
}

interface ConfigData {
  configActiva: ConfigPuntos | null;
  todasConfig: ConfigPuntos[];
  estadisticas: {
    totalPuntosGenerados: number;
    usuariosConPuntos: number;
    promedioUsuario: number;
    esteMes: { puntos: number; registros: number };
  };
}

interface Props {
  initialData: ConfigData;
  usuarios: Usuario[];
}

export default function PuntosManagement({ initialData, usuarios }: Props) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigPuntos | null>(null);
  const [selectedUser] = useState<Usuario | null>(null);

  const refreshData = async () => {
    const newData = await getConfigPuntosAction();
    setData(newData);
  };

  const calcularPuntosEjemplo = (config: ConfigPuntos, pesoKg: number = 5, separado: boolean = true): number => {
    return config.base + (pesoKg * config.factorPeso) + (separado ? config.factorSeparado : 0);
  };

  const handleCreateConfig = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createConfigPuntosAction(formData);
      if (result.success) {
        toast.success(result.message);
        setShowCreateModal(false);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdateConfig = async (formData: FormData) => {
    if (!selectedConfig) return;

    startTransition(async () => {
      const result = await updateConfigPuntosAction(selectedConfig.id, formData);
      if (result.success) {
        toast.success(result.message);
        setShowEditModal(false);
        setSelectedConfig(null);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteConfig = async (config: ConfigPuntos) => {
    if (!confirm(`¿Eliminar la configuración "${config.descripcion}"?`)) return;

    startTransition(async () => {
      const result = await deleteConfigPuntosAction(config.id);
      if (result.success) {
        toast.success(result.message);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleAsignarBonus = async (formData: FormData) => {
    startTransition(async () => {
      const result = await asignarBonificacionAction(formData);
      if (result.success) {
        toast.success(result.message);
        setShowBonusModal(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleAsignarPenalty = async (formData: FormData) => {
    startTransition(async () => {
      const result = await asignarPenalizacionAction(formData);
      if (result.success) {
        toast.success(result.message);
        setShowPenaltyModal(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Gestión de configuraciones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuraciones de Puntos
            </CardTitle>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Configuración
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {data.todasConfig.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay configuraciones creadas</p>
            ) : (
              data.todasConfig.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{config.descripcion || 'Sin descripción'}</h3>
                        <Badge variant={config.activo ? 'default' : 'secondary'}>
                          {config.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">{config.base}</p>
                          <p className="text-xs text-gray-500">Base</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{config.factorPeso}</p>
                          <p className="text-xs text-gray-500">x Peso</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">{config.factorSeparado}</p>
                          <p className="text-xs text-gray-500">+ Separado</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        Ejemplo: 5kg separado = {calcularPuntosEjemplo(config)} puntos
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConfig(config);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!config.activo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConfig(config)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Bonificar Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Asigna puntos extra a un usuario específico
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowBonusModal(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Asignar Bonificación
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Penalizar Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Quita puntos a un usuario por mal comportamiento
            </p>
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700"
              onClick={() => setShowPenaltyModal(true)}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Aplicar Penalización
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal crear configuración */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva Configuración de Puntos">
        <form action={handleCreateConfig} className="space-y-4">
          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input id="descripcion" name="descripcion" required className="mt-1" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base">Puntos Base *</Label>
              <Input id="base" name="base" type="number" defaultValue="10" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="factorPeso">Factor Peso *</Label>
              <Input id="factorPeso" name="factorPeso" type="number" defaultValue="2" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="factorSeparado">Bonus Separado *</Label>
              <Input id="factorSeparado" name="factorSeparado" type="number" defaultValue="5" required className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="expresion">Fórmula (opcional)</Label>
            <Input 
              id="expresion" 
              name="expresion" 
              defaultValue="base + peso * factorPeso + (separado ? factorSeparado : 0)"
              className="mt-1 font-mono text-sm" 
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal editar configuración */}
      <Modal 
        open={showEditModal} 
        onClose={() => { setShowEditModal(false); setSelectedConfig(null); }}
        title="Editar Configuración"
      >
        {selectedConfig && (
          <form action={handleUpdateConfig} className="space-y-4">
            <div>
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Input 
                id="edit-descripcion" 
                name="descripcion" 
                defaultValue={selectedConfig.descripcion || ''}
                className="mt-1" 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-base">Puntos Base</Label>
                <Input 
                  id="edit-base" 
                  name="base" 
                  type="number" 
                  defaultValue={selectedConfig.base}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="edit-factorPeso">Factor Peso</Label>
                <Input 
                  id="edit-factorPeso" 
                  name="factorPeso" 
                  type="number" 
                  defaultValue={selectedConfig.factorPeso}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="edit-factorSeparado">Bonus Separado</Label>
                <Input 
                  id="edit-factorSeparado" 
                  name="factorSeparado" 
                  type="number" 
                  defaultValue={selectedConfig.factorSeparado}
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="edit-activo" 
                name="activo" 
                value="true"
                defaultChecked={selectedConfig.activo}
                className="rounded"
              />
              <Label htmlFor="edit-activo">Configuración activa</Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowEditModal(false); setSelectedConfig(null); }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal bonificar */}
      <Modal open={showBonusModal} onClose={() => setShowBonusModal(false)} title="Asignar Bonificación">
        <form action={handleAsignarBonus} className="space-y-4">
          <div>
            <Label htmlFor="bonus-usuario">Usuario *</Label>
            <Select name="usuarioId" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nombre || usuario.email} - {usuario.totalPuntos} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bonus-puntos">Puntos a Bonificar *</Label>
            <Input id="bonus-puntos" name="puntos" type="number" min="1" required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="bonus-motivo">Motivo *</Label>
            <Textarea id="bonus-motivo" name="motivo" required className="mt-1" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowBonusModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
              {isPending ? 'Asignando...' : 'Bonificar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal penalizar */}
      <Modal open={showPenaltyModal} onClose={() => setShowPenaltyModal(false)} title="Aplicar Penalización">
        <form action={handleAsignarPenalty} className="space-y-4">
          <div>
            <Label htmlFor="penalty-usuario">Usuario *</Label>
            <Select name="usuarioId" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nombre || usuario.email} - {usuario.totalPuntos} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="penalty-puntos">Puntos a Penalizar *</Label>
            <Input id="penalty-puntos" name="puntos" type="number" min="1" required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="penalty-motivo">Motivo *</Label>
            <Textarea id="penalty-motivo" name="motivo" required className="mt-1" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowPenaltyModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending ? 'Penalizando...' : 'Penalizar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
