'use client'

import React, { useState, useTransition } from 'react';
import { crearSolicitudAction } from '@/app/dashboard/recolecciones/actions';
import { crearEmpresaAction } from '@/app/dashboard/admin/empresas/actions';
import { cambiarPasswordAction } from '@/app/dashboard/perfil/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { ResiduoTipo, FrecuenciaInorganico, FrecuenciaPeligroso } from '@prisma/client';

interface ValidationFormExamplesProps {
  userRole?: string;
}

export default function ValidationFormExamples({ userRole }: ValidationFormExamplesProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    fieldErrors?: Record<string, string>;
  } | null>(null);

  // Estados para cada formulario
  const [activeForm, setActiveForm] = useState<'solicitud' | 'empresa' | 'password'>('solicitud');

  // Estado para solicitud
  const [solicitudData, setSolicitudData] = useState({
    tipoResiduo: 'ORGANICO' as ResiduoTipo,
    fechaSolicitada: '',
    frecuenciaInorg: 'QUINCENAL' as FrecuenciaInorganico,
    frecuenciaPelig: 'MENSUAL' as FrecuenciaPeligroso,
    notas: ''
  });

  // Estado para empresa
  const [empresaData, setEmpresaData] = useState({
    nombre: '',
    nit: '',
    contactoEmail: '',
    contactoTel: ''
  });

  // Estado para cambio de password
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  const handleSolicitudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('tipoResiduo', solicitudData.tipoResiduo);
    formData.append('fechaSolicitada', solicitudData.fechaSolicitada);
    formData.append('notas', solicitudData.notas);
    
    if (solicitudData.tipoResiduo === 'INORGANICO') {
      formData.append('frecuenciaInorg', solicitudData.frecuenciaInorg);
    }
    
    if (solicitudData.tipoResiduo === 'PELIGROSO') {
      formData.append('frecuenciaPelig', solicitudData.frecuenciaPelig);
    }

    startTransition(async () => {
      const result = await crearSolicitudAction(formData);
      setResult(result);
    });
  };

  const handleEmpresaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', empresaData.nombre);
    formData.append('nit', empresaData.nit);
    formData.append('contactoEmail', empresaData.contactoEmail);
    formData.append('contactoTel', empresaData.contactoTel);

    startTransition(async () => {
      const result = await crearEmpresaAction(formData);
      setResult(result);
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('passwordActual', passwordData.passwordActual);
    formData.append('passwordNueva', passwordData.passwordNueva);
    formData.append('confirmarPassword', passwordData.confirmarPassword);

    startTransition(async () => {
      const actionResult = await cambiarPasswordAction(formData);
      setResult({
        success: actionResult.success,
        message: actionResult.message,
        fieldErrors: actionResult.fieldErrors
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ejemplos de Validación Backend</h2>
        <p className="text-gray-600 mb-6">
          Estos formularios demuestran la integración de validaciones backend usando patrones de diseño
        </p>
      </div>

      {/* Selector de formulario */}
      <div className="flex gap-4 justify-center mb-6">
        <Button 
          variant={activeForm === 'solicitud' ? 'default' : 'outline'}
          onClick={() => setActiveForm('solicitud')}
        >
          Solicitud de Recolección
        </Button>
        {userRole === 'ADMIN' && (
          <Button 
            variant={activeForm === 'empresa' ? 'default' : 'outline'}
            onClick={() => setActiveForm('empresa')}
          >
            Crear Empresa
          </Button>
        )}
        <Button 
          variant={activeForm === 'password' ? 'default' : 'outline'}
          onClick={() => setActiveForm('password')}
        >
          Cambiar Contraseña
        </Button>
      </div>

      {/* Resultado de validación */}
      {result && (
        <Card className={`p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
          {result.fieldErrors && Object.keys(result.fieldErrors).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(result.fieldErrors).map(([field, error]) => (
                <p key={field} className="text-sm text-red-600">
                  <span className="font-medium">{field}:</span> {error}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Formulario de Solicitud */}
      {activeForm === 'solicitud' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Solicitud de Recolección</h3>
          <form onSubmit={handleSolicitudSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipoResiduo">Tipo de Residuo</Label>
              <select
                id="tipoResiduo"
                value={solicitudData.tipoResiduo}
                onChange={(e) => setSolicitudData(prev => ({ 
                  ...prev, 
                  tipoResiduo: e.target.value as ResiduoTipo 
                }))}
                className="w-full p-2 border rounded"
                required
              >
                <option value="ORGANICO">Orgánico</option>
                <option value="INORGANICO">Inorgánico</option>
                <option value="PELIGROSO">Peligroso</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fechaSolicitada">Fecha Solicitada</Label>
              <Input
                type="date"
                id="fechaSolicitada"
                value={solicitudData.fechaSolicitada}
                onChange={(e) => setSolicitudData(prev => ({ 
                  ...prev, 
                  fechaSolicitada: e.target.value 
                }))}
                required
              />
            </div>

            {solicitudData.tipoResiduo === 'INORGANICO' && (
              <div>
                <Label htmlFor="frecuenciaInorg">Frecuencia</Label>
                <select
                  id="frecuenciaInorg"
                  value={solicitudData.frecuenciaInorg}
                  onChange={(e) => setSolicitudData(prev => ({ 
                    ...prev, 
                    frecuenciaInorg: e.target.value as FrecuenciaInorganico 
                  }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="QUINCENAL">Quincenal</option>
                  <option value="MENSUAL">Mensual</option>
                </select>
              </div>
            )}

            {solicitudData.tipoResiduo === 'PELIGROSO' && (
              <div>
                <Label htmlFor="frecuenciaPelig">Frecuencia</Label>
                <select
                  id="frecuenciaPelig"
                  value={solicitudData.frecuenciaPelig}
                  onChange={(e) => setSolicitudData(prev => ({ 
                    ...prev, 
                    frecuenciaPelig: e.target.value as FrecuenciaPeligroso 
                  }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="MENSUAL">Mensual</option>
                  <option value="TRIMESTRAL">Trimestral</option>
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
              <textarea
                id="notas"
                value={solicitudData.notas}
                onChange={(e) => setSolicitudData(prev => ({ 
                  ...prev, 
                  notas: e.target.value 
                }))}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Información adicional sobre la solicitud"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Creando...' : 'Crear Solicitud'}
            </Button>
          </form>
        </Card>
      )}

      {/* Formulario de Empresa (solo para admin) */}
      {activeForm === 'empresa' && userRole === 'ADMIN' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Empresa Recolectora</h3>
          <form onSubmit={handleEmpresaSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Empresa</Label>
              <Input
                type="text"
                id="nombre"
                value={empresaData.nombre}
                onChange={(e) => setEmpresaData(prev => ({ 
                  ...prev, 
                  nombre: e.target.value 
                }))}
                required
                placeholder="Empresa de Recolección XYZ"
              />
            </div>

            <div>
              <Label htmlFor="nit">NIT (opcional)</Label>
              <Input
                type="text"
                id="nit"
                value={empresaData.nit}
                onChange={(e) => setEmpresaData(prev => ({ 
                  ...prev, 
                  nit: e.target.value 
                }))}
                placeholder="123456789-0"
              />
            </div>

            <div>
              <Label htmlFor="contactoEmail">Email de Contacto</Label>
              <Input
                type="email"
                id="contactoEmail"
                value={empresaData.contactoEmail}
                onChange={(e) => setEmpresaData(prev => ({ 
                  ...prev, 
                  contactoEmail: e.target.value 
                }))}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="contactoTel">Teléfono de Contacto</Label>
              <Input
                type="tel"
                id="contactoTel"
                value={empresaData.contactoTel}
                onChange={(e) => setEmpresaData(prev => ({ 
                  ...prev, 
                  contactoTel: e.target.value 
                }))}
                placeholder="+57 300 123 4567"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Creando...' : 'Crear Empresa'}
            </Button>
          </form>
        </Card>
      )}

      {/* Formulario de Cambio de Contraseña */}
      {activeForm === 'password' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="passwordActual">Contraseña Actual</Label>
              <Input
                type="password"
                id="passwordActual"
                value={passwordData.passwordActual}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  passwordActual: e.target.value 
                }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="passwordNueva">Nueva Contraseña</Label>
              <Input
                type="password"
                id="passwordNueva"
                value={passwordData.passwordNueva}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  passwordNueva: e.target.value 
                }))}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmarPassword">Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                id="confirmarPassword"
                value={passwordData.confirmarPassword}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  confirmarPassword: e.target.value 
                }))}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        </Card>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          <strong>Características implementadas:</strong>
        </p>
        <ul className="mt-2 space-y-1">
          <li>✅ Validaciones backend con Chain of Responsibility</li>
          <li>✅ Manejo de errores de campo específicos</li>
          <li>✅ Integración con patrones de diseño</li>
          <li>✅ Feedback visual de validación</li>
          <li>✅ Estados de loading y transiciones</li>
        </ul>
      </div>
    </div>
  );
}
