/**
 * Decorator Pattern - Sistema de Notificaciones Extensible
 * 
 * Permite añadir funcionalidades como logging, retry, filtrado,
 * validación, etc. a las notificaciones de manera modular
 */

export interface INotificacion {
  id: string;
  destinatario: string;
  asunto: string;
  mensaje: string;
  tipo: 'email' | 'sms' | 'push' | 'sistema';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fechaCreacion: Date;
  metadata?: Record<string, unknown>;
}

export interface INotificacionService {
  enviar(notificacion: INotificacion): Promise<boolean>;
  obtenerEstado(id: string): Promise<'pendiente' | 'enviado' | 'fallido' | 'cancelado'>;
}

/**
 * Implementación base del servicio de notificaciones
 */
export class BaseNotificacionService implements INotificacionService {
  private readonly nombre: string;

  constructor(nombre: string = 'BaseNotificacionService') {
    this.nombre = nombre;
  }

  async enviar(notificacion: INotificacion): Promise<boolean> {
    try {
      // Simulación del envío real
      console.log(`${this.nombre}: Enviando notificación ${notificacion.id}`);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // Simular fallo ocasional (5% de probabilidad)
      if (Math.random() < 0.05) {
        throw new Error('Error de red simulado');
      }

      return true;
    } catch (error) {
      console.error(`${this.nombre}: Error enviando notificación ${notificacion.id}:`, error);
      return false;
    }
  }

  async obtenerEstado(id: string): Promise<'pendiente' | 'enviado' | 'fallido' | 'cancelado'> {
    // Simulación - en la práctica consultaría BD o servicio externo
    console.log(`${this.nombre}: Consultando estado de notificación ${id}`);
    return 'enviado';
  }
}

/**
 * Decorator base abstracto
 */
export abstract class NotificacionDecorator implements INotificacionService {
  protected service: INotificacionService;

  constructor(service: INotificacionService) {
    this.service = service;
  }

  async enviar(notificacion: INotificacion): Promise<boolean> {
    return this.service.enviar(notificacion);
  }

  async obtenerEstado(id: string): Promise<'pendiente' | 'enviado' | 'fallido' | 'cancelado'> {
    return this.service.obtenerEstado(id);
  }
}

/**
 * Decorator de Logging - Registra todas las operaciones
 */
export class LoggingNotificacionDecorator extends NotificacionDecorator {
  private logs: Array<{
    timestamp: Date;
    operacion: string;
    notificacionId: string;
    resultado: boolean | string;
    duracion?: number;
  }> = [];

  async enviar(notificacion: INotificacion): Promise<boolean> {
    const inicio = Date.now();
    
    this.log('enviar_inicio', notificacion.id, true);
    
    try {
      const resultado = await super.enviar(notificacion);
      const duracion = Date.now() - inicio;
      
      this.log('enviar_completado', notificacion.id, resultado, duracion);
      
      return resultado;
    } catch (error) {
      const duracion = Date.now() - inicio;
      this.log('enviar_error', notificacion.id, false, duracion);
      throw error;
    }
  }

  async obtenerEstado(id: string): Promise<'pendiente' | 'enviado' | 'fallido' | 'cancelado'> {
    this.log('obtener_estado', id, true);
    
    const estado = await super.obtenerEstado(id);
    
    this.log('obtener_estado_completado', id, estado);
    
    return estado;
  }

  private log(operacion: string, notificacionId: string, resultado: boolean | string, duracion?: number): void {
    this.logs.push({
      timestamp: new Date(),
      operacion,
      notificacionId,
      resultado,
      duracion
    });

    console.log(`[NotificacionService] ${operacion} - ${notificacionId} - ${resultado}${duracion ? ` (${duracion}ms)` : ''}`);
  }

  getLogs(): typeof this.logs {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Decorator de Retry - Reintenta envíos fallidos
 */
export class RetryNotificacionDecorator extends NotificacionDecorator {
  private readonly maxReintentos: number;
  private readonly delayBase: number;

  constructor(service: INotificacionService, maxReintentos: number = 3, delayBase: number = 1000) {
    super(service);
    this.maxReintentos = maxReintentos;
    this.delayBase = delayBase;
  }

  async enviar(notificacion: INotificacion): Promise<boolean> {
    let ultimoError: Error | null = null;

    for (let intento = 0; intento <= this.maxReintentos; intento++) {
      try {
        const resultado = await super.enviar(notificacion);
        
        if (resultado) {
          if (intento > 0) {
            console.log(`Notificación ${notificacion.id} enviada exitosamente en intento ${intento + 1}`);
          }
          return true;
        }
      } catch (error) {
        ultimoError = error as Error;
        console.warn(`Intento ${intento + 1} fallido para notificación ${notificacion.id}:`, error);
      }

      // No hacer delay después del último intento
      if (intento < this.maxReintentos) {
        const delay = this.calcularDelay(intento);
        console.log(`Esperando ${delay}ms antes del próximo intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`Notificación ${notificacion.id} falló después de ${this.maxReintentos + 1} intentos`);
    if (ultimoError) {
      throw ultimoError;
    }
    
    return false;
  }

  private calcularDelay(intento: number): number {
    // Backoff exponencial con jitter
    const exponential = this.delayBase * Math.pow(2, intento);
    const jitter = Math.random() * 1000; // Hasta 1s de jitter
    return Math.min(exponential + jitter, 30000); // Máximo 30s
  }
}

/**
 * Decorator de Filtro - Filtra notificaciones según criterios
 */
export class FiltroNotificacionDecorator extends NotificacionDecorator {
  private filtros: Array<(notificacion: INotificacion) => boolean> = [];
  private notificacionesBloqueadas: string[] = [];

  agregarFiltro(filtro: (notificacion: INotificacion) => boolean): void {
    this.filtros.push(filtro);
  }

  // Filtros predefinidos comunes
  static filtrarPorPrioridad(prioridadMinima: INotificacion['prioridad']): (n: INotificacion) => boolean {
    const niveles = { 'baja': 1, 'media': 2, 'alta': 3, 'critica': 4 };
    const nivelMinimo = niveles[prioridadMinima];
    
    return (notificacion: INotificacion) => {
      return niveles[notificacion.prioridad] >= nivelMinimo;
    };
  }

  static filtrarPorTipo(tiposPermitidos: INotificacion['tipo'][]): (n: INotificacion) => boolean {
    return (notificacion: INotificacion) => {
      return tiposPermitidos.includes(notificacion.tipo);
    };
  }

  static filtrarPorHorario(horaInicio: number, horaFin: number): (n: INotificacion) => boolean {
    return () => {
      const hora = new Date().getHours();
      return hora >= horaInicio && hora <= horaFin;
    };
  }

  async enviar(notificacion: INotificacion): Promise<boolean> {
    // Aplicar todos los filtros
    for (const filtro of this.filtros) {
      if (!filtro(notificacion)) {
        console.log(`Notificación ${notificacion.id} bloqueada por filtro`);
        this.notificacionesBloqueadas.push(notificacion.id);
        return false;
      }
    }

    return super.enviar(notificacion);
  }

  getNotificacionesBloqueadas(): string[] {
    return [...this.notificacionesBloqueadas];
  }

  limpiarHistorialBloqueadas(): void {
    this.notificacionesBloqueadas = [];
  }
}

/**
 * Decorator de Cache - Evita notificaciones duplicadas
 */
export class CacheNotificacionDecorator extends NotificacionDecorator {
  private cache = new Map<string, { timestamp: Date; resultado: boolean }>();
  private readonly tiempoExpiracion: number;

  constructor(service: INotificacionService, tiempoExpiracionMinutos: number = 5) {
    super(service);
    this.tiempoExpiracion = tiempoExpiracionMinutos * 60 * 1000;
  }

  async enviar(notificacion: INotificacion): Promise<boolean> {
    const cacheKey = this.generarCacheKey(notificacion);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.haExpirado(cached.timestamp)) {
      console.log(`Notificación ${notificacion.id} encontrada en cache, evitando duplicado`);
      return cached.resultado;
    }

    const resultado = await super.enviar(notificacion);
    
    // Guardar en cache
    this.cache.set(cacheKey, {
      timestamp: new Date(),
      resultado
    });

    // Limpiar entradas expiradas periodicamente
    this.limpiarCache();

    return resultado;
  }

  private generarCacheKey(notificacion: INotificacion): string {
    // Combinar destinatario, asunto y tipo para generar clave única
    return `${notificacion.destinatario}|${notificacion.asunto}|${notificacion.tipo}`;
  }

  private haExpirado(timestamp: Date): boolean {
    return Date.now() - timestamp.getTime() > this.tiempoExpiracion;
  }

  private limpiarCache(): void {
    const ahora = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (ahora - value.timestamp.getTime() > this.tiempoExpiracion) {
        this.cache.delete(key);
      }
    }
  }

  limpiarCacheCompleto(): void {
    this.cache.clear();
  }

  getTamañoCache(): number {
    return this.cache.size;
  }
}

/**
 * Decorator de Validación - Valida notificaciones antes del envío
 */
export class ValidacionNotificacionDecorator extends NotificacionDecorator {
  async enviar(notificacion: INotificacion): Promise<boolean> {
    const errores = this.validar(notificacion);
    
    if (errores.length > 0) {
      console.error(`Notificación ${notificacion.id} inválida:`, errores);
      throw new Error(`Notificación inválida: ${errores.join(', ')}`);
    }

    return super.enviar(notificacion);
  }

  private validar(notificacion: INotificacion): string[] {
    const errores: string[] = [];

    // Validaciones básicas
    if (!notificacion.id || notificacion.id.trim() === '') {
      errores.push('ID requerido');
    }

    if (!notificacion.destinatario || notificacion.destinatario.trim() === '') {
      errores.push('Destinatario requerido');
    }

    if (!notificacion.mensaje || notificacion.mensaje.trim() === '') {
      errores.push('Mensaje requerido');
    }

    // Validaciones específicas por tipo
    switch (notificacion.tipo) {
      case 'email':
        if (!this.esEmailValido(notificacion.destinatario)) {
          errores.push('Email inválido');
        }
        break;
      case 'sms':
        if (!this.esTelefonoValido(notificacion.destinatario)) {
          errores.push('Teléfono inválido');
        }
        break;
    }

    // Validar longitud del mensaje
    if (notificacion.mensaje.length > 1000) {
      errores.push('Mensaje demasiado largo (máximo 1000 caracteres)');
    }

    return errores;
  }

  private esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private esTelefonoValido(telefono: string): boolean {
    const regex = /^\+?[\d\s-()]{8,}$/;
    return regex.test(telefono);
  }
}

/**
 * Builder para crear servicios con múltiples decorators
 */
export class NotificacionServiceBuilder {
  private service: INotificacionService;

  constructor(serviceBase?: INotificacionService) {
    this.service = serviceBase || new BaseNotificacionService();
  }

  conLogging(): this {
    this.service = new LoggingNotificacionDecorator(this.service);
    return this;
  }

  conRetry(maxReintentos: number = 3, delayBase: number = 1000): this {
    this.service = new RetryNotificacionDecorator(this.service, maxReintentos, delayBase);
    return this;
  }

  conFiltros(): this {
    this.service = new FiltroNotificacionDecorator(this.service);
    return this;
  }

  conCache(tiempoExpiracionMinutos: number = 5): this {
    this.service = new CacheNotificacionDecorator(this.service, tiempoExpiracionMinutos);
    return this;
  }

  conValidacion(): this {
    this.service = new ValidacionNotificacionDecorator(this.service);
    return this;
  }

  build(): INotificacionService {
    return this.service;
  }
}

// Ejemplo de uso:
// const servicio = new NotificacionServiceBuilder()
//   .conValidacion()
//   .conRetry(3, 1000)
//   .conCache(10)
//   .conLogging()
//   .build();
