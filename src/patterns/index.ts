/**
 * Índice central de todos los patrones de diseño implementados
 * 
 * Este archivo facilita la importación y uso de todos los patrones
 * desde un punto central en la aplicación
 */

// Repository Pattern
export * from './repositories/BaseRepository';
export * from './repositories/UsuarioRepository';

// Factory Pattern  
export * from './factories/SolicitudFactory';

// Observer Pattern
export * from './observers/EventManager';
export * from './observers/NotificationObserver';

// Strategy Pattern
export * from './strategies/PuntosStrategy';

// Singleton Pattern
export * from './singleton/AppConfigManager';

// Decorator Pattern
export * from './decorators/NotificacionDecorators';

// Re-exportaciones de instancias específicas para uso directo
export { configManager } from './singleton/AppConfigManager';

// Tipos y interfaces comunes
export interface PatternInfo {
  name: string;
  description: string;
  benefits: string[];
  useCases: string[];
}

export const PATRONES_IMPLEMENTADOS: Record<string, PatternInfo> = {
  repository: {
    name: 'Repository Pattern',
    description: 'Abstrae el acceso a datos proporcionando una interfaz uniforme',
    benefits: [
      'Separación de responsabilidades',
      'Facilita testing con mocks',
      'Permite cambiar implementación de BD',
      'Centraliza consultas complejas'
    ],
    useCases: [
      'Operaciones CRUD',
      'Consultas complejas',
      'Abstracción de base de datos'
    ]
  },
  factory: {
    name: 'Factory Pattern',
    description: 'Crea objetos sin especificar su clase exacta',
    benefits: [
      'Código más flexible y extensible',
      'Facilita agregar nuevos tipos',
      'Centraliza lógica de creación'
    ],
    useCases: [
      'Creación de solicitudes',
      'Generación de notificaciones',
      'Instanciación de reportes'
    ]
  },
  observer: {
    name: 'Observer Pattern',
    description: 'Notifica automáticamente sobre cambios de estado',
    benefits: [
      'Desacoplamiento entre emisor y receptor',
      'Extensibilidad sin modificar código',
      'Comunicación event-driven'
    ],
    useCases: [
      'Sistema de notificaciones',
      'Logging de eventos',
      'Actualizaciones de estado'
    ]
  },
  strategy: {
    name: 'Strategy Pattern',
    description: 'Permite intercambiar algoritmos dinámicamente',
    benefits: [
      'Algoritmos intercambiables',
      'Extensión sin modificación',
      'Eliminación de condicionales complejos'
    ],
    useCases: [
      'Cálculo de puntos',
      'Estrategias de notificación',
      'Algoritmos de procesamiento'
    ]
  },
  singleton: {
    name: 'Singleton Pattern',
    description: 'Asegura una única instancia global',
    benefits: [
      'Control de instancia única',
      'Acceso global controlado',
      'Consistencia de configuración'
    ],
    useCases: [
      'Configuración global',
      'Manejo de cache',
      'Gestión de conexiones'
    ]
  },
  decorator: {
    name: 'Decorator Pattern',
    description: 'Añade funcionalidades de manera modular',
    benefits: [
      'Extensión flexible de funcionalidades',
      'Composición en lugar de herencia',
      'Responsabilidades modulares'
    ],
    useCases: [
      'Logging y auditoría',
      'Retry y resilencia',
      'Validación y filtrado'
    ]
  }
};

/**
 * Función helper para obtener información de un patrón
 */
export function obtenerInfoPatron(nombrePatron: keyof typeof PATRONES_IMPLEMENTADOS): PatternInfo | null {
  return PATRONES_IMPLEMENTADOS[nombrePatron] || null;
}

/**
 * Función helper para listar todos los patrones implementados
 */
export function listarPatronesImplementados(): string[] {
  return Object.keys(PATRONES_IMPLEMENTADOS);
}

/**
 * Función helper para validar si un patrón está implementado
 */
export function estaPatronImplementado(nombrePatron: string): boolean {
  return nombrePatron in PATRONES_IMPLEMENTADOS;
}
