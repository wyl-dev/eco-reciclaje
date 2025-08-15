export const dynamic = 'force-dynamic';

import { getConfigPuntosAction, getRankingUsuariosAction } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Settings, TrendingUp, Users, Trophy, Star } from 'lucide-react';
import PuntosManagement from '@/components/admin/PuntosManagement';

export default async function AdminPuntosPage() {
  const [configData, ranking] = await Promise.all([
    getConfigPuntosAction(),
    getRankingUsuariosAction()
  ]);

  const { configActiva, estadisticas } = configData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sistema de Puntos</h1>
        <p className="text-gray-600">Configura y administra el sistema de puntuación</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Puntos</CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {estadisticas.totalPuntosGenerados.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Puntos generados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.usuariosConPuntos}</div>
            <p className="text-xs text-gray-500">Con puntuación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.promedioUsuario}</div>
            <p className="text-xs text-gray-500">Puntos por registro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estadisticas.esteMes.puntos}
            </div>
            <p className="text-xs text-gray-500">Puntos generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuración actual */}
      {configActiva && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración Activa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{configActiva.base}</div>
                <p className="text-sm text-gray-600">Puntos base</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{configActiva.factorPeso}</div>
                <p className="text-sm text-gray-600">Factor peso (x kg)</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{configActiva.factorSeparado}</div>
                <p className="text-sm text-gray-600">Bonus separación</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 font-mono break-all">
                  {configActiva.expresion}
                </div>
                <p className="text-sm text-gray-600 mt-1">Fórmula</p>
              </div>
            </div>
            
            {configActiva.descripcion && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Descripción:</strong> {configActiva.descripcion}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ranking de usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranking.slice(0, 10).map((usuario, index) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' : 
                        index === 2 ? 'bg-orange-500 text-white' : 
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{usuario.nombre || usuario.email}</p>
                      <p className="text-xs text-gray-500">{usuario.localidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{usuario.totalPuntos}</p>
                    <p className="text-xs text-gray-500">{usuario.recoleccionesCompletadas} recolecciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gestión del sistema */}
        <PuntosManagement initialData={configData} usuarios={ranking} />
      </div>
    </div>
  );
}
