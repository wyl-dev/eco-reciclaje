/**
 * Validaciones específicas para formularios de EcoReciclaje
 * 
 * Este archivo contiene validaciones pre-configuradas para todos
 * los formularios del sistema utilizando el patrón Chain of Responsibility
 */

import { PrismaClient } from '@prisma/client';
import { 
  ValidationChainBuilder, 
  ValidationContext, 
  ValidationResult,
  ValidationUtils 
} from './ValidationChain';
import { configManager } from '../singleton/AppConfigManager';

/**
 * Validaciones para registro de usuario
 */
export function createUsuarioRegistroValidator(prisma: PrismaClient) {
  return new ValidationChainBuilder()
    .requiredFields(['email', 'password', 'nombre'])
    .dataTypes({
      email: 'email',
      password: 'string',
      nombre: 'string',
      telefono: 'string',
      localidad: 'string'
    })
    .ranges({
      password: { minLength: 8, maxLength: 100 },
      nombre: { minLength: 2, maxLength: 50 },
      telefono: { minLength: 8, maxLength: 20 },
      localidad: { maxLength: 50 }
    })
    .uniqueness({
      email: {
        checkUnique: async (email: unknown) => {
          if (typeof email !== 'string') return false;
          const existing = await prisma.usuario.findUnique({
            where: { email }
          });
          return !existing;
        },
        message: 'Ya existe un usuario con este email'
      }
    })
    .businessRules([
      {
        name: 'password-strength',
        validator: async (context: ValidationContext) => {
          const password = context.data.password as string;
          const errors = [];

          if (password && !isStrongPassword(password)) {
            errors.push({
              field: 'password',
              message: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número',
              code: 'WEAK_PASSWORD',
              value: password
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'telefono-format',
        validator: async (context: ValidationContext) => {
          const telefono = context.data.telefono as string;
          const errors = [];

          if (telefono && !ValidationUtils.isTelefono(telefono)) {
            errors.push({
              field: 'telefono',
              message: 'Formato de teléfono inválido',
              code: 'INVALID_PHONE_FORMAT',
              value: telefono
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      }
    ])
    .build();
}

/**
 * Validaciones para solicitud de recolección
 */
export function createSolicitudRecoleccionValidator(prisma: PrismaClient) {
  return new ValidationChainBuilder()
    .requiredFields(['usuarioId', 'tipoResiduo', 'direccion'])
    .dataTypes({
      usuarioId: 'string',
      tipoResiduo: 'string',
      direccion: 'string',
      fechaRecoleccion: 'date',
      cantidad: 'number',
      descripcion: 'string'
    })
    .ranges({
      direccion: { minLength: 10, maxLength: 200 },
      descripcion: { maxLength: 500 },
      cantidad: { min: 0.1, max: 1000 }
    })
    .dates({
      fechaRecoleccion: {
        futureOnly: true,
        minDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mínimo 24 horas
      }
    })
    .businessRules([
      {
        name: 'usuario-exists',
        validator: async (context: ValidationContext) => {
          const usuarioId = context.data.usuarioId as string;
          const errors = [];

          if (usuarioId) {
            const usuario = await prisma.usuario.findUnique({
              where: { id: usuarioId }
            });

            if (!usuario) {
              errors.push({
                field: 'usuarioId',
                message: 'Usuario no encontrado',
                code: 'USER_NOT_FOUND',
                value: usuarioId
              });
            }
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'tipo-residuo-valido',
        validator: async (context: ValidationContext) => {
          const tipoResiduo = context.data.tipoResiduo as string;
          const errors = [];
          const tiposValidos = ['ORGANICO', 'INORGANICO', 'PELIGROSO'];

          if (tipoResiduo && !tiposValidos.includes(tipoResiduo.toUpperCase())) {
            errors.push({
              field: 'tipoResiduo',
              message: `Tipo de residuo debe ser: ${tiposValidos.join(', ')}`,
              code: 'INVALID_RESIDUE_TYPE',
              value: tipoResiduo
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'horario-valido',
        validator: async (context: ValidationContext) => {
          const fechaRecoleccion = context.data.fechaRecoleccion as Date;
          const errors = [];

          if (fechaRecoleccion) {
            const hora = fechaRecoleccion.toTimeString().substring(0, 5);
            
            if (!configManager.estaEnHorarioRecoleccion(hora)) {
              const config = configManager.getConfigSeccion('recoleccion');
              errors.push({
                field: 'fechaRecoleccion',
                message: `La recolección debe programarse entre ${config.horasLimite.inicio} y ${config.horasLimite.fin}`,
                code: 'INVALID_TIME_SLOT',
                value: fechaRecoleccion
              });
            }

            const diaSemana = fechaRecoleccion.getDay();
            if (!configManager.esDiaHabil(diaSemana)) {
              errors.push({
                field: 'fechaRecoleccion',
                message: 'La recolección solo se puede programar en días hábiles',
                code: 'INVALID_WEEKDAY',
                value: fechaRecoleccion
              });
            }
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'limite-solicitudes-diarias',
        validator: async (context: ValidationContext) => {
          const usuarioId = context.data.usuarioId as string;
          const fechaRecoleccion = context.data.fechaRecoleccion as Date;
          const errors = [];

          if (usuarioId && fechaRecoleccion) {
            const inicioDelDia = new Date(fechaRecoleccion);
            inicioDelDia.setHours(0, 0, 0, 0);
            
            const finDelDia = new Date(fechaRecoleccion);
            finDelDia.setHours(23, 59, 59, 999);

            const solicitudesDelDia = await prisma.solicitudRecoleccion.count({
              where: {
                usuarioId,
                fechaSolicitada: {
                  gte: inicioDelDia,
                  lte: finDelDia
                }
              }
            });

            if (solicitudesDelDia >= 3) {
              errors.push({
                field: 'fechaRecoleccion',
                message: 'Límite máximo de 3 solicitudes por día alcanzado',
                code: 'DAILY_LIMIT_EXCEEDED',
                value: fechaRecoleccion
              });
            }
          }

          return { isValid: errors.length === 0, errors };
        }
      }
    ])
    .build();
}

/**
 * Validaciones para configuración de empresa
 */
export function createEmpresaValidator(prisma: PrismaClient) {
  return new ValidationChainBuilder()
    .requiredFields(['nombre', 'email', 'telefono'])
    .dataTypes({
      nombre: 'string',
      email: 'email',
      telefono: 'string',
      direccion: 'string',
      cuit: 'string'
    })
    .ranges({
      nombre: { minLength: 2, maxLength: 100 },
      direccion: { minLength: 10, maxLength: 200 },
      telefono: { minLength: 8, maxLength: 20 },
      cuit: { minLength: 11, maxLength: 13 }
    })
    .uniqueness({
      email: {
        checkUnique: async (email: unknown) => {
          if (typeof email !== 'string') return false;
          const existing = await prisma.empresaRecolectora.findFirst({
            where: { nombre: email } // Temporal: usando nombre hasta tener campo email
          });
          return !existing;
        }
      },
      cuit: {
        checkUnique: async (cuit: unknown) => {
          if (typeof cuit !== 'string') return false;
          const existing = await prisma.empresaRecolectora.findFirst({
            where: { nombre: cuit } // Asumiendo que guardamos CUIT en nombre por ahora
          });
          return !existing;
        },
        message: 'Ya existe una empresa con este CUIT'
      }
    })
    .businessRules([
      {
        name: 'cuit-format',
        validator: async (context: ValidationContext) => {
          const cuit = context.data.cuit as string;
          const errors = [];

          if (cuit && !isValidCUIT(cuit)) {
            errors.push({
              field: 'cuit',
              message: 'Formato de CUIT inválido',
              code: 'INVALID_CUIT_FORMAT',
              value: cuit
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      }
    ])
    .build();
}

/**
 * Validaciones para configuración de horarios
 */
export function createHorarioOrganicoValidator() {
  return new ValidationChainBuilder()
    .requiredFields(['localidad', 'dia'])
    .dataTypes({
      localidad: 'string',
      dia: 'string'
    })
    .ranges({
      localidad: { minLength: 2, maxLength: 50 }
    })
    .businessRules([
      {
        name: 'dia-semana-valido',
        validator: async (context: ValidationContext) => {
          const dia = context.data.dia as string;
          const errors = [];
          const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

          if (dia && !diasValidos.includes(dia.toUpperCase())) {
            errors.push({
              field: 'dia',
              message: `Día debe ser uno de: ${diasValidos.join(', ')}`,
              code: 'INVALID_WEEKDAY',
              value: dia
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      }
    ])
    .build();
}

/**
 * Validaciones para login
 */
export function createLoginValidator() {
  return new ValidationChainBuilder()
    .requiredFields(['email', 'password'])
    .dataTypes({
      email: 'email',
      password: 'string'
    })
    .ranges({
      password: { minLength: 1, maxLength: 100 }
    })
    .build();
}

/**
 * Validaciones para cambio de contraseña
 */
export function createPasswordChangeValidator(_prisma: PrismaClient, _userId: string) {
  return new ValidationChainBuilder()
    .requiredFields(['currentPassword', 'newPassword', 'confirmPassword'])
    .dataTypes({
      currentPassword: 'string',
      newPassword: 'string',
      confirmPassword: 'string'
    })
    .ranges({
      newPassword: { minLength: 8, maxLength: 100 },
      confirmPassword: { minLength: 8, maxLength: 100 }
    })
    .businessRules([
      {
        name: 'password-match',
        validator: async (context: ValidationContext) => {
          const newPassword = context.data.newPassword as string;
          const confirmPassword = context.data.confirmPassword as string;
          const errors = [];

          if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            errors.push({
              field: 'confirmPassword',
              message: 'Las contraseñas no coinciden',
              code: 'PASSWORD_MISMATCH',
              value: confirmPassword
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'new-password-strength',
        validator: async (context: ValidationContext) => {
          const newPassword = context.data.newPassword as string;
          const errors = [];

          if (newPassword && !isStrongPassword(newPassword)) {
            errors.push({
              field: 'newPassword',
              message: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número',
              code: 'WEAK_PASSWORD',
              value: newPassword
            });
          }

          return { isValid: errors.length === 0, errors };
        }
      },
      {
        name: 'current-password-valid',
        validator: async (context: ValidationContext) => {
          const currentPassword = context.data.currentPassword as string;
          const errors: Array<{ field: string; message: string; code: string; value?: unknown }> = [];

          if (currentPassword) {
            // Aquí verificarías la contraseña actual con bcrypt
            // const user = await prisma.usuario.findUnique({ where: { id: userId } });
            // const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
            
            // Por ahora, simulamos que siempre es válida
            // En producción, descomentar la verificación real
            console.log(`Validando contraseña para usuario: ${_userId}`);
            console.log(`Usando prisma:`, _prisma ? 'disponible' : 'no disponible');
          }

          return { isValid: errors.length === 0, errors };
        }
      }
    ])
    .build();
}

// Funciones auxiliares

function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
}

function isValidCUIT(cuit: string): boolean {
  // Remover guiones y espacios
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  
  // Verificar que tenga 11 dígitos
  if (!/^\d{11}$/.test(cleanCuit)) {
    return false;
  }

  // Algoritmo de validación de CUIT argentino
  const digits = cleanCuit.split('').map(Number);
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * multipliers[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === digits[10];
}

/**
 * Función helper para validar datos usando un validador específico
 */
export async function validateData(
  validatorName: 'usuario' | 'solicitud' | 'empresa' | 'horario' | 'login' | 'password',
  data: Record<string, unknown>,
  prisma: PrismaClient,
  context?: { userId?: string }
): Promise<ValidationResult> {
  let validator;

  switch (validatorName) {
    case 'usuario':
      validator = createUsuarioRegistroValidator(prisma);
      break;
    case 'solicitud':
      validator = createSolicitudRecoleccionValidator(prisma);
      break;
    case 'empresa':
      validator = createEmpresaValidator(prisma);
      break;
    case 'horario':
      validator = createHorarioOrganicoValidator();
      break;
    case 'login':
      validator = createLoginValidator();
      break;
    case 'password':
      if (!context?.userId) {
        throw new Error('userId requerido para validación de contraseña');
      }
      validator = createPasswordChangeValidator(prisma, context.userId);
      break;
    default:
      throw new Error(`Validador desconocido: ${validatorName}`);
  }

  const validationContext: ValidationContext = {
    data,
    metadata: context
  };

  return await validator.validate(validationContext);
}

/**
 * Middleware para Express que valida automáticamente
 */
export function createValidationMiddleware(
  validatorName: 'usuario' | 'solicitud' | 'empresa' | 'horario' | 'login' | 'password',
  prisma: PrismaClient
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await validateData(validatorName, req.body, prisma, { 
        userId: (req as Request & { user?: { id: string } }).user?.id 
      });

      if (!result.isValid) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Añadir warnings a la respuesta si existen
      if (result.warnings && result.warnings.length > 0) {
        (req as Request & { validationWarnings?: string[] }).validationWarnings = result.warnings;
      }

      next();
    } catch (error) {
      console.error('Error en validación:', error);
      res.status(500).json({
        error: 'Error interno de validación'
      });
    }
  };
}

// Tipos para Express (opcional, para mejor tipado)
interface Request {
  body: Record<string, unknown>;
  user?: { id: string };
  validationWarnings?: string[];
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

type NextFunction = () => void;
