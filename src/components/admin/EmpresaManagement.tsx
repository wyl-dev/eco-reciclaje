'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { 
  Search, 
  Plus,
  Building2,
  Mail,
  Phone,
  Users,
  Package,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  createEmpresaAction,
  updateEmpresaAction,
  deleteEmpresaAction,
  getEmpresasAction
} from '@/app/dashboard/admin/actions';

interface Empresa {
  id: string;
  nombre: string;
  nit: string | null;
  contactoEmail: string | null;
  contactoTel: string | null;
  createdAt: Date;
  updatedAt: Date;
  recoleccionesMes: number;
  pesoTotalMes: number;
  totalRecolecciones: number;
  totalUsuarios: number;
  usuarios: Array<{
    id: string;
    nombre: string | null;
    email: string;
  }>;
}

interface EmpresasData {
  empresas: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Props {
  initialData: EmpresasData;
}

export default function EmpresaManagement({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  const filteredEmpresas = data.empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.contactoEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshData = async () => {
    const newData = await getEmpresasAction(1);
    setData(newData);
  };

  const handleCreateEmpresa = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createEmpresaAction(formData);
      if (result.success) {
        toast.success(result.message);
        setShowCreateModal(false);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdateEmpresa = async (formData: FormData) => {
    if (!selectedEmpresa) return;

    startTransition(async () => {
      const result = await updateEmpresaAction(selectedEmpresa.id, formData);
      if (result.success) {
        toast.success(result.message);
        setShowEditModal(false);
        setSelectedEmpresa(null);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteEmpresa = async (empresa: Empresa) => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEmpresaAction(empresa.id);
      if (result.success) {
        toast.success(result.message);
        await refreshData();
      } else {
        toast.error(result.message);
      }
    });
  };

  const openEditModal = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas Recolectoras
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Buscar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Crear empresa */}
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Empresa
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {filteredEmpresas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No se encontraron empresas con ese criterio.' : 'No hay empresas registradas.'}
              </div>
            ) : (
              filteredEmpresas.map((empresa) => (
                <div key={empresa.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {empresa.nombre}
                        </h3>
                        {empresa.nit && (
                          <Badge variant="outline">
                            NIT: {empresa.nit}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                        {empresa.contactoEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {empresa.contactoEmail}
                          </div>
                        )}
                        {empresa.contactoTel && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {empresa.contactoTel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(empresa)}
                        disabled={isPending}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEmpresa(empresa)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Estadísticas de la empresa */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{empresa.totalUsuarios}</span>
                      </div>
                      <p className="text-xs text-gray-500">Empleados</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">{empresa.recoleccionesMes}</span>
                      </div>
                      <p className="text-xs text-gray-500">Este mes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                        <span className="font-medium">{empresa.pesoTotalMes.toFixed(1)}kg</span>
                      </div>
                      <p className="text-xs text-gray-500">Peso total</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <span className="font-medium">{empresa.totalRecolecciones}</span>
                      </div>
                      <p className="text-xs text-gray-500">Total historico</p>
                    </div>
                  </div>

                  {/* Lista de empleados */}
                  {empresa.usuarios.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Personal asignado:</h4>
                      <div className="flex flex-wrap gap-2">
                        {empresa.usuarios.map((usuario) => (
                          <Badge key={usuario.id} variant="secondary" className="text-xs">
                            {usuario.nombre || usuario.email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal crear empresa */}
      <Modal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Crear Nueva Empresa"
      >
        <form action={handleCreateEmpresa} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Empresa *</Label>
            <Input id="nombre" name="nombre" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="nit">NIT</Label>
            <Input id="nit" name="nit" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="contactoEmail">Email de Contacto</Label>
            <Input id="contactoEmail" name="contactoEmail" type="email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="contactoTel">Teléfono de Contacto</Label>
            <Input id="contactoTel" name="contactoTel" className="mt-1" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? 'Creando...' : 'Crear Empresa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal editar empresa */}
      <Modal 
        open={showEditModal} 
        onClose={() => { setShowEditModal(false); setSelectedEmpresa(null); }}
        title="Editar Empresa"
      >
        {selectedEmpresa && (
          <form action={handleUpdateEmpresa} className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre">Nombre de la Empresa *</Label>
              <Input 
                id="edit-nombre" 
                name="nombre" 
                defaultValue={selectedEmpresa.nombre}
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="edit-nit">NIT</Label>
              <Input 
                id="edit-nit" 
                name="nit" 
                defaultValue={selectedEmpresa.nit || ''}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="edit-contactoEmail">Email de Contacto</Label>
              <Input 
                id="edit-contactoEmail" 
                name="contactoEmail" 
                type="email"
                defaultValue={selectedEmpresa.contactoEmail || ''}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="edit-contactoTel">Teléfono de Contacto</Label>
              <Input 
                id="edit-contactoTel" 
                name="contactoTel" 
                defaultValue={selectedEmpresa.contactoTel || ''}
                className="mt-1" 
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowEditModal(false); setSelectedEmpresa(null); }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                {isPending ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
