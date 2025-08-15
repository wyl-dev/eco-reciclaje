'use client';

import { Card } from '@/components/ui/card';
import LogoutButton from './LogoutButton';

interface User {
  nombre: string | null;
  email: string;
  role: 'ADMIN' | 'USUARIO' | 'EMPRESA';
}

interface Props {
  user: User;
}

export default function DashboardHeader({ user }: Props) {
  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return ' Administrador';
      case 'EMPRESA': return '🏢 Empresa';
      case 'USUARIO': return '👤 Usuario';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EMPRESA': return 'bg-blue-100 text-blue-800';
      case 'USUARIO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Info del usuario */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
            {(user.nombre || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {user.nombre || 'Usuario'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleText(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de logout */}
        <LogoutButton />
      </div>
    </Card>
  );
}
