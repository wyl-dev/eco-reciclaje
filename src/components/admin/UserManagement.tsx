'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  toggleUserStatusAction, 
  changeUserRoleAction, 
  deleteUserAction,
  getUsersAction 
} from '@/app/dashboard/admin/actions';

interface User {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  localidad: string | null;
  direccion: string | null;
  role: 'ADMIN' | 'USUARIO' | 'EMPRESA';
  createdAt: Date;
  suscripcion: { activa: boolean } | null;
  totalPuntos: number;
  solicitudesActivas: number;
  totalSolicitudes: number;
}

interface UsersData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Props {
  initialData: UsersData;
}

export default function UserManagement({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USUARIO' | 'EMPRESA'>('ALL');
  const [currentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.localidad?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleUserStatusAction(userId, !currentStatus);
      if (result.success) {
        toast.success(result.message);
        // Actualizar datos
        const newData = await getUsersAction(currentPage, roleFilter === 'ALL' ? undefined : roleFilter);
        setData(newData);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleChangeRole = async (userId: string, newRole: 'ADMIN' | 'USUARIO' | 'EMPRESA') => {
    startTransition(async () => {
      const result = await changeUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success(result.message);
        const newData = await getUsersAction(currentPage, roleFilter === 'ALL' ? undefined : roleFilter);
        setData(newData);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success(result.message);
        const newData = await getUsersAction(currentPage, roleFilter === 'ALL' ? undefined : roleFilter);
        setData(newData);
      } else {
        toast.error(result.message);
      }
    });
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'bg-red-100 text-red-800',
      EMPRESA: 'bg-blue-100 text-blue-800',
      USUARIO: 'bg-green-100 text-green-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Usuarios del Sistema
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Buscar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            {/* Filtro por rol */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                <SelectItem value="USUARIO">Usuarios</SelectItem>
                <SelectItem value="EMPRESA">Empresas</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios con los filtros aplicados.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {user.nombre || 'Sin nombre'}
                      </h3>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusBadge(user.suscripcion?.activa || false)}>
                        {user.suscripcion?.activa ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.localidad && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.localidad}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    {user.role !== 'ADMIN' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.suscripcion?.activa || false)}
                          disabled={isPending}
                          className="flex items-center gap-1"
                        >
                          {user.suscripcion?.activa ? (
                            <>
                              <UserX className="w-4 h-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Activar
                            </>
                          )}
                        </Button>

                        <Select
                          value={user.role}
                          onValueChange={(value) => handleChangeRole(user.id, value as 'ADMIN' | 'USUARIO' | 'EMPRESA')}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USUARIO">Usuario</SelectItem>
                            <SelectItem value="EMPRESA">Empresa</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.nombre || user.email)}
                          disabled={isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Estadísticas del usuario */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm font-medium text-emerald-600">{user.totalPuntos}</p>
                    <p className="text-xs text-gray-500">Puntos totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">{user.solicitudesActivas}</p>
                    <p className="text-xs text-gray-500">Activas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">{user.totalSolicitudes}</p>
                    <p className="text-xs text-gray-500">Total solicitudes</p>
                  </div>
                  {user.telefono && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">{user.telefono}</p>
                      <p className="text-xs text-gray-500">Teléfono</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Información de paginación */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <p>
            Mostrando {filteredUsers.length} de {data.pagination.total} usuarios
          </p>
          {data.pagination.totalPages > 1 && (
            <p>
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
