/**
 * Factory Pattern - Solicitud Factory
 * 
 * Crea diferentes tipos de solicitudes de recolección
 * Permite agregar nuevos tipos sin modificar código existente
 */

import { ResiduoTipo, FrecuenciaInorganico, FrecuenciaPeligroso } from '@prisma/client';

// Tipos base para solicitudes
export interface BaseSolicitudData {
  usuarioId: string;
  direccion: string;
  descripcion?: string;
  cantidadEstimada?: string;
  fechaSolicitada: Date;
  horarioPreferido?: string;
}

export interface SolicitudOrganicaData extends BaseSolicitudData {
  tipo: 'ORGANICO';
  tipoCompostaje?: 'CASERO' | 'COMUNITARIO';
}

export interface SolicitudInorganicaData extends BaseSolicitudData {
  tipo: 'INORGANICO';
  tipoMaterial: 'PAPEL' | 'PLASTICO' | 'VIDRIO' | 'METAL' | 'MIXTO';
  frecuencia: FrecuenciaInorganico;
  preparado: boolean; // Si está separado correctamente
}

export interface SolicitudPeligrosaData extends BaseSolicitudData {
  tipo: 'PELIGROSO';
  tipoResiduoPeligroso: 'ELECTRONICO' | 'QUIMICO' | 'MEDICO' | 'BATERIAS' | 'ACEITES' | 'OTRO';
  frecuencia: FrecuenciaPeligroso;
  certificadoRequerido: boolean;
  instruccionesEspeciales?: string;
}

export type SolicitudData = SolicitudOrganicaData | SolicitudInorganicaData | SolicitudPeligrosaData;

// Interfaces para las solicitudes creadas
export interface SolicitudCreada {
  id?: string;
  usuarioId: string;
  tipoResiduo: ResiduoTipo;
  direccion: string;
  descripcion?: string;
  cantidadEstimada?: string;
  fechaSolicitada: Date;
  horarioPreferido?: string;
  estado: 'PENDIENTE';
  fechaProgramada?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

/**
 * Factory abstracto para solicitudes
 */
export abstract class SolicitudFactory {
  abstract createSolicitud(data: SolicitudData): SolicitudCreada;
  abstract validateData(data: SolicitudData): boolean;
  abstract calculateProgrammedDate(data: SolicitudData): Date | undefined;
  abstract getRequiredFields(): string[];
}

/**
 * Factory para solicitudes orgánicas
 */
export class SolicitudOrganicaFactory extends SolicitudFactory {
  createSolicitud(data: SolicitudOrganicaData): SolicitudCreada {
    if (!this.validateData(data)) {
      throw new Error('Datos inválidos para solicitud orgánica');
    }

    return {
      usuarioId: data.usuarioId,
      tipoResiduo: 'ORGANICO',
      direccion: data.direccion,
      descripcion: data.descripcion,
      cantidadEstimada: data.cantidadEstimada,
      fechaSolicitada: data.fechaSolicitada,
      horarioPreferido: data.horarioPreferido || 'Mañana',
      estado: 'PENDIENTE',
      fechaProgramada: this.calculateProgrammedDate(data),
      metadata: {
        tipoCompostaje: data.tipoCompostaje || 'CASERO',
        requiereProgramacionSemanal: true,
        prioridadAlta: true // Orgánicos tienen prioridad
      }
    };
  }

  validateData(data: SolicitudOrganicaData): boolean {
    return !!(
      data.usuarioId &&
      data.direccion &&
      data.fechaSolicitada &&
      data.tipo === 'ORGANICO'
    );
  }

  calculateProgrammedDate(data: SolicitudOrganicaData): Date | undefined {
    // Los orgánicos se programan para el próximo día hábil
    const tomorrow = new Date(data.fechaSolicitada);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Si es fin de semana, programar para lunes
    if (tomorrow.getDay() === 0) { // Domingo
      tomorrow.setDate(tomorrow.getDate() + 1);
    } else if (tomorrow.getDay() === 6) { // Sábado
      tomorrow.setDate(tomorrow.getDate() + 2);
    }
    
    return tomorrow;
  }

  getRequiredFields(): string[] {
    return ['usuarioId', 'direccion', 'fechaSolicitada', 'tipo'];
  }
}

/**
 * Factory para solicitudes inorgánicas
 */
export class SolicitudInorganicaFactory extends SolicitudFactory {
  createSolicitud(data: SolicitudInorganicaData): SolicitudCreada {
    if (!this.validateData(data)) {
      throw new Error('Datos inválidos para solicitud inorgánica');
    }

    return {
      usuarioId: data.usuarioId,
      tipoResiduo: 'INORGANICO',
      direccion: data.direccion,
      descripcion: this.buildDescription(data),
      cantidadEstimada: data.cantidadEstimada,
      fechaSolicitada: data.fechaSolicitada,
      horarioPreferido: data.horarioPreferido || 'Tarde',
      estado: 'PENDIENTE',
      fechaProgramada: this.calculateProgrammedDate(data),
      metadata: {
        tipoMaterial: data.tipoMaterial,
        frecuencia: data.frecuencia,
        preparado: data.preparado,
        requiereCapacitacion: !data.preparado
      }
    };
  }

  validateData(data: SolicitudInorganicaData): boolean {
    const validMateriales = ['PAPEL', 'PLASTICO', 'VIDRIO', 'METAL', 'MIXTO'];
    return !!(
      data.usuarioId &&
      data.direccion &&
      data.fechaSolicitada &&
      data.tipo === 'INORGANICO' &&
      validMateriales.includes(data.tipoMaterial) &&
      data.frecuencia &&
      typeof data.preparado === 'boolean'
    );
  }

  calculateProgrammedDate(data: SolicitudInorganicaData): Date | undefined {
    const baseDate = new Date(data.fechaSolicitada);
    
    // Según la frecuencia
    switch (data.frecuencia) {
      case 'UNICA':
        // Programar para dentro de 3-5 días
        baseDate.setDate(baseDate.getDate() + 3);
        break;
      case 'SEMANAL_1':
        // Programar para la próxima semana
        baseDate.setDate(baseDate.getDate() + 7);
        break;
      case 'SEMANAL_2':
        // Programar para dentro de 3-4 días
        baseDate.setDate(baseDate.getDate() + 3);
        break;
    }
    
    return baseDate;
  }

  getRequiredFields(): string[] {
    return ['usuarioId', 'direccion', 'fechaSolicitada', 'tipo', 'tipoMaterial', 'frecuencia', 'preparado'];
  }

  private buildDescription(data: SolicitudInorganicaData): string {
    let desc = `Recolección de ${data.tipoMaterial.toLowerCase()}`;
    if (data.descripcion) {
      desc += ` - ${data.descripcion}`;
    }
    if (!data.preparado) {
      desc += ' (Requiere separación previa)';
    }
    return desc;
  }
}

/**
 * Factory para solicitudes de residuos peligrosos
 */
export class SolicitudPeligrosaFactory extends SolicitudFactory {
  createSolicitud(data: SolicitudPeligrosaData): SolicitudCreada {
    if (!this.validateData(data)) {
      throw new Error('Datos inválidos para solicitud de residuos peligrosos');
    }

    return {
      usuarioId: data.usuarioId,
      tipoResiduo: 'PELIGROSO',
      direccion: data.direccion,
      descripcion: this.buildDescription(data),
      cantidadEstimada: data.cantidadEstimada,
      fechaSolicitada: data.fechaSolicitada,
      horarioPreferido: data.horarioPreferido || 'Mañana',
      estado: 'PENDIENTE',
      fechaProgramada: this.calculateProgrammedDate(data),
      metadata: {
        tipoResiduoPeligroso: data.tipoResiduoPeligroso,
        frecuencia: data.frecuencia,
        certificadoRequerido: data.certificadoRequerido,
        instruccionesEspeciales: data.instruccionesEspeciales,
        requiereEquipoEspecial: true,
        prioridadSeguridad: true
      }
    };
  }

  validateData(data: SolicitudPeligrosaData): boolean {
    const validTipos = ['ELECTRONICO', 'QUIMICO', 'MEDICO', 'BATERIAS', 'ACEITES', 'OTRO'];
    return !!(
      data.usuarioId &&
      data.direccion &&
      data.fechaSolicitada &&
      data.tipo === 'PELIGROSO' &&
      validTipos.includes(data.tipoResiduoPeligroso) &&
      data.frecuencia &&
      typeof data.certificadoRequerido === 'boolean'
    );
  }

  calculateProgrammedDate(data: SolicitudPeligrosaData): Date | undefined {
    const baseDate = new Date(data.fechaSolicitada);
    
    // Los residuos peligrosos requieren más tiempo de programación
    switch (data.frecuencia) {
      case 'UNICA':
        // Programar para dentro de 5-7 días (requiere coordinación especial)
        baseDate.setDate(baseDate.getDate() + 5);
        break;
      case 'MENSUAL':
        // Programar para la siguiente semana del mes
        baseDate.setDate(baseDate.getDate() + 7);
        break;
    }
    
    // Solo días hábiles para residuos peligrosos
    while (baseDate.getDay() === 0 || baseDate.getDay() === 6) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    
    return baseDate;
  }

  getRequiredFields(): string[] {
    return [
      'usuarioId', 
      'direccion', 
      'fechaSolicitada', 
      'tipo', 
      'tipoResiduoPeligroso', 
      'frecuencia', 
      'certificadoRequerido'
    ];
  }

  private buildDescription(data: SolicitudPeligrosaData): string {
    let desc = `Residuo peligroso: ${data.tipoResiduoPeligroso.toLowerCase()}`;
    if (data.descripcion) {
      desc += ` - ${data.descripcion}`;
    }
    if (data.instruccionesEspeciales) {
      desc += ` | Instrucciones: ${data.instruccionesEspeciales}`;
    }
    if (data.certificadoRequerido) {
      desc += ' (Requiere certificado)';
    }
    return desc;
  }
}

/**
 * Factory principal que delega a los factories específicos
 */
export class SolicitudMasterFactory {
  private factories: Map<ResiduoTipo, SolicitudFactory> = new Map();

  constructor() {
    this.factories.set('ORGANICO', new SolicitudOrganicaFactory());
    this.factories.set('INORGANICO', new SolicitudInorganicaFactory());
    this.factories.set('PELIGROSO', new SolicitudPeligrosaFactory());
  }

  /**
   * Crea una solicitud basada en el tipo
   */
  createSolicitud(data: SolicitudData): SolicitudCreada {
    const factory = this.factories.get(data.tipo as ResiduoTipo);
    if (!factory) {
      throw new Error(`Factory no encontrado para tipo: ${data.tipo}`);
    }

    return factory.createSolicitud(data);
  }

  /**
   * Valida datos de solicitud
   */
  validateSolicitud(data: SolicitudData): boolean {
    const factory = this.factories.get(data.tipo as ResiduoTipo);
    if (!factory) {
      return false;
    }

    return factory.validateData(data);
  }

  /**
   * Obtiene campos requeridos para un tipo
   */
  getRequiredFields(tipo: ResiduoTipo): string[] {
    const factory = this.factories.get(tipo);
    if (!factory) {
      return [];
    }

    return factory.getRequiredFields();
  }

  /**
   * Registra un nuevo factory (para extensibilidad)
   */
  registerFactory(tipo: ResiduoTipo, factory: SolicitudFactory): void {
    this.factories.set(tipo, factory);
  }

  /**
   * Obtiene tipos de residuos disponibles
   */
  getAvailableTypes(): ResiduoTipo[] {
    return Array.from(this.factories.keys());
  }
}

// Singleton instance
export const solicitudFactory = new SolicitudMasterFactory();
