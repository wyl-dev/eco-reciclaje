/**
 * Componente de ejemplo que usa validaciones del backend
 * 
 * Demuestra cómo integrar las validaciones en formularios React
 * con manejo de errores y warnings
 */

'use client';

import { useState, useTransition } from 'react';
import { registrarUsuario, crearSolicitudRecoleccion } from '../validators/ServerActionExamples';
// import { formatValidationErrors } from '../validators/ServerActionExamples'; // Commented out due to type issues

/**
 * Formulario de registro con validaciones completas
 */
export function RegistroFormulario() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      // Limpiar errores previos
      setErrors({});
      setWarnings([]);
      setSuccess(null);

      const result = await registrarUsuario(formData);

      if (result.success) {
        setSuccess(result.message || 'Operación exitosa');
        // Limpiar formulario si es necesario
        const form = document.getElementById('registro-form') as HTMLFormElement;
        form?.reset();
      } else {
        if (result.details) {
          setErrors(result.details as unknown as Record<string, string> || {});
        } else {
          setErrors({ general: result.error || 'Error desconocido' });
        }
      }

      if (result.warnings) {
        setWarnings(result.warnings);
      }
    });
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
        Registro de Usuario
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>⚠️ {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <form id="registro-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres, incluir mayúscula, minúscula y número
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label htmlFor="localidad" className="block text-sm font-medium text-gray-700 mb-1">
            Localidad
          </label>
          <input
            type="text"
            id="localidad"
            name="localidad"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.localidad ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.localidad && (
            <p className="mt-1 text-sm text-red-600">{errors.localidad}</p>
          )}
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.direccion && (
            <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Registrando...' : 'Registrar Usuario'}
        </button>
      </form>
    </div>
  );
}

/**
 * Formulario de solicitud de recolección con validaciones
 */
export function SolicitudRecoleccionFormulario({ usuarioId }: { usuarioId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setErrors({});
      setWarnings([]);
      setSuccess(null);

      const result = await crearSolicitudRecoleccion(usuarioId, formData);

      if (result.success) {
        setSuccess(result.message || 'Operación exitosa');
        const form = document.getElementById('solicitud-form') as HTMLFormElement;
        form?.reset();
      } else {
        if (result.details) {
          setErrors(result.details as unknown as Record<string, string> || {});
        } else {
          setErrors({ general: result.error || 'Error desconocido' });
        }
      }

      if (result.warnings) {
        setWarnings(result.warnings);
      }
    });
  }

  // Calcular fecha mínima (24 horas desde ahora)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().slice(0, 16);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
        Solicitar Recolección
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>⚠️ {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <form id="solicitud-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tipoResiduo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Residuo *
          </label>
          <select
            id="tipoResiduo"
            name="tipoResiduo"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.tipoResiduo ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          >
            <option value="">Seleccionar tipo</option>
            <option value="ORGANICO">Orgánico</option>
            <option value="INORGANICO">Inorgánico</option>
            <option value="PELIGROSO">Peligroso</option>
          </select>
          {errors.tipoResiduo && (
            <p className="mt-1 text-sm text-red-600">{errors.tipoResiduo}</p>
          )}
        </div>

        <div>
          <label htmlFor="fechaRecoleccion" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora de Recolección *
          </label>
          <input
            type="datetime-local"
            id="fechaRecoleccion"
            name="fechaRecoleccion"
            min={minDateString}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.fechaRecoleccion ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.fechaRecoleccion && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaRecoleccion}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Debe ser al menos 24 horas desde ahora, en horario hábil
          </p>
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de Recolección *
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            required
            placeholder="Calle, número, localidad"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.direccion && (
            <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
          )}
        </div>

        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad Estimada (kg)
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            min="0.1"
            max="1000"
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.cantidad ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.cantidad && (
            <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Adicional
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            maxLength={500}
            placeholder="Información adicional sobre los residuos"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Máximo 500 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Enviando Solicitud...' : 'Crear Solicitud'}
        </button>
      </form>
    </div>
  );
}

/**
 * Componente que muestra errores de validación de manera visual
 */
export function ValidationErrorDisplay({ 
  errors, 
  warnings 
}: { 
  errors: Record<string, string>; 
  warnings?: string[];
}) {
  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  if (!hasErrors && !hasWarnings) return null;

  return (
    <div className="space-y-2 mb-4">
      {hasErrors && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <h4 className="font-semibold mb-2">❌ Errores de Validación:</h4>
          <ul className="space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="text-sm">
                <strong>{field}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWarnings && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h4 className="font-semibold mb-2">⚠️ Advertencias:</h4>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Hook personalizado para manejar validaciones de formularios
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const handleValidationResult = (result: {
    success: boolean;
    error?: string;
    details?: Array<{ field: string; message: string }>;
    warnings?: string[];
  }) => {
    if (result.success) {
      setErrors({});
      setWarnings(result.warnings || []);
      setIsValid(true);
    } else {
      if (result.details) {
        if (typeof result.details === 'object' && !Array.isArray(result.details)) {
          setErrors(result.details as unknown as Record<string, string>);
        } else {
          setErrors({ general: 'Error de validación' });
        }
      } else {
        setErrors({ general: result.error || 'Error desconocido' });
      }
      setWarnings(result.warnings || []);
      setIsValid(false);
    }

    return result.success;
  };

  const clearValidation = () => {
    setErrors({});
    setWarnings([]);
    setIsValid(true);
  };

  return {
    errors,
    warnings,
    isValid,
    handleValidationResult,
    clearValidation,
    setErrors,
    setWarnings
  };
}
