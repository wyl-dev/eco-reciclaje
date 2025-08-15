/**
 * Strategy Pattern - Cálculo de Puntos
 * 
 * Permite diferentes estrategias de cálculo de puntos según:
 * - Tipo de residuo
 * - Localidad
 * - Temporada/promociones
 * - Comportamiento del usuario
 */

export interface IPuntosStrategy {
  calcularPuntos(cantidad: number, metadata: PuntosMetadata): number;
  obtenerMultiplicador(): number;
  obtenerBonificaciones(metadata: PuntosMetadata): number;
}

export interface PuntosMetadata {
  tipoResiduo: string;
  localidad?: string;
  fechaRecoleccion: Date;
  usuarioId: string;
  esPrimeraVez?: boolean;
  esRecurrente?: boolean;
  calidad?: 'alta' | 'media' | 'baja';
}

/**
 * Estrategia base para cálculo de puntos
 */
export abstract class BasePuntosStrategy implements IPuntosStrategy {
  protected readonly basePoints: number;
  protected readonly multiplicador: number;

  constructor(basePoints: number = 10, multiplicador: number = 1) {
    this.basePoints = basePoints;
    this.multiplicador = multiplicador;
  }

  abstract calcularPuntos(cantidad: number, metadata: PuntosMetadata): number;

  obtenerMultiplicador(): number {
    return this.multiplicador;
  }

  obtenerBonificaciones(metadata: PuntosMetadata): number {
    let bonificacion = 0;

    // Bonificación por primera vez
    if (metadata.esPrimeraVez) {
      bonificacion += 50;
    }

    // Bonificación por usuario recurrente
    if (metadata.esRecurrente) {
      bonificacion += 20;
    }

    // Bonificación por calidad alta
    if (metadata.calidad === 'alta') {
      bonificacion += 30;
    }

    return bonificacion;
  }

  protected calcularBonificacionTemporal(fecha: Date): number {
    const mes = fecha.getMonth();
    
    // Bonificación extra en meses de campañas ambientales
    if ([3, 5, 9].includes(mes)) { // Abril, Junio, Octubre
      return 1.2; // 20% extra
    }

    return 1.0;
  }
}

/**
 * Estrategia para residuos orgánicos
 */
export class OrganicosStrategy extends BasePuntosStrategy {
  constructor() {
    super(8, 1.1); // 8 puntos base, multiplicador 1.1
  }

  calcularPuntos(cantidad: number, metadata: PuntosMetadata): number {
    const puntosBase = Math.floor(cantidad * this.basePoints * this.multiplicador);
    const bonificaciones = this.obtenerBonificaciones(metadata);
    const bonificacionTemporal = this.calcularBonificacionTemporal(metadata.fechaRecoleccion);
    
    // Los orgánicos tienen bonificación extra por separación correcta
    const bonificacionSeparacion = metadata.calidad === 'alta' ? 1.15 : 1.0;
    
    return Math.floor((puntosBase + bonificaciones) * bonificacionTemporal * bonificacionSeparacion);
  }
}

/**
 * Estrategia para residuos reciclables (papel, cartón, plástico, vidrio)
 */
export class ReciclablesStrategy extends BasePuntosStrategy {
  constructor() {
    super(12, 1.2); // 12 puntos base, multiplicador 1.2
  }

  calcularPuntos(cantidad: number, metadata: PuntosMetadata): number {
    const puntosBase = Math.floor(cantidad * this.basePoints * this.multiplicador);
    const bonificaciones = this.obtenerBonificaciones(metadata);
    const bonificacionTemporal = this.calcularBonificacionTemporal(metadata.fechaRecoleccion);
    
    // Bonificación extra por tipo específico de reciclable
    let multiplicadorTipo = 1.0;
    switch (metadata.tipoResiduo.toLowerCase()) {
      case 'vidrio':
        multiplicadorTipo = 1.3;
        break;
      case 'plastico':
        multiplicadorTipo = 1.2;
        break;
      case 'papel':
      case 'carton':
        multiplicadorTipo = 1.1;
        break;
    }
    
    return Math.floor((puntosBase + bonificaciones) * bonificacionTemporal * multiplicadorTipo);
  }
}

/**
 * Estrategia para residuos electrónicos
 */
export class ElectronicosStrategy extends BasePuntosStrategy {
  constructor() {
    super(25, 1.5); // 25 puntos base, multiplicador 1.5 (mayor valor)
  }

  calcularPuntos(cantidad: number, metadata: PuntosMetadata): number {
    const puntosBase = Math.floor(cantidad * this.basePoints * this.multiplicador);
    const bonificaciones = this.obtenerBonificaciones(metadata);
    const bonificacionTemporal = this.calcularBonificacionTemporal(metadata.fechaRecoleccion);
    
    // Los electrónicos siempre tienen bonificación alta por ser críticos
    const bonificacionCritica = 1.4;
    
    return Math.floor((puntosBase + bonificaciones) * bonificacionTemporal * bonificacionCritica);
  }
}

/**
 * Estrategia para aceites y grasas
 */
export class AceitesStrategy extends BasePuntosStrategy {
  constructor() {
    super(20, 1.4); // 20 puntos base, multiplicador 1.4
  }

  calcularPuntos(cantidad: number, metadata: PuntosMetadata): number {
    const puntosBase = Math.floor(cantidad * this.basePoints * this.multiplicador);
    const bonificaciones = this.obtenerBonificaciones(metadata);
    const bonificacionTemporal = this.calcularBonificacionTemporal(metadata.fechaRecoleccion);
    
    // Bonificación extra por prevenir contaminación
    const bonificacionAmbiental = 1.25;
    
    return Math.floor((puntosBase + bonificaciones) * bonificacionTemporal * bonificacionAmbiental);
  }
}

/**
 * Context clase que usa las estrategias
 */
export class PuntosCalculator {
  private strategy: IPuntosStrategy;

  constructor(strategy: IPuntosStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IPuntosStrategy): void {
    this.strategy = strategy;
  }

  calcular(cantidad: number, metadata: PuntosMetadata): number {
    return this.strategy.calcularPuntos(cantidad, metadata);
  }

  obtenerDetalles(cantidad: number, metadata: PuntosMetadata): {
    puntos: number;
    multiplicador: number;
    bonificaciones: number;
    estrategia: string;
  } {
    return {
      puntos: this.strategy.calcularPuntos(cantidad, metadata),
      multiplicador: this.strategy.obtenerMultiplicador(),
      bonificaciones: this.strategy.obtenerBonificaciones(metadata),
      estrategia: this.strategy.constructor.name
    };
  }
}

/**
 * Factory para obtener la estrategia correcta según el tipo de residuo
 */
export class PuntosStrategyFactory {
  static crearEstrategia(tipoResiduo: string): IPuntosStrategy {
    const tipo = tipoResiduo.toLowerCase().trim();

    switch (tipo) {
      case 'organicos':
      case 'orgánico':
      case 'organico':
        return new OrganicosStrategy();
      
      case 'papel':
      case 'carton':
      case 'cartón':
      case 'plastico':
      case 'plástico':
      case 'vidrio':
      case 'reciclables':
        return new ReciclablesStrategy();
      
      case 'electronicos':
      case 'electrónicos':
      case 'electrodomesticos':
      case 'electrodomésticos':
        return new ElectronicosStrategy();
      
      case 'aceites':
      case 'grasas':
      case 'aceite':
        return new AceitesStrategy();
      
      default:
        // Estrategia por defecto para tipos no especificados
        return new ReciclablesStrategy();
    }
  }

  static obtenerEstrategiasDisponibles(): string[] {
    return [
      'orgánicos',
      'papel',
      'cartón',
      'plástico',
      'vidrio',
      'electrónicos',
      'aceites'
    ];
  }
}
