/**
 * Singleton Pattern - Configuración Global del Sistema
 * 
 * Gestiona la configuración global de la aplicación de manera centralizada
 * Asegura que solo existe una instancia de configuración en toda la aplicación
 */

export interface ConfiguracionGlobal {
  puntos: {
    multiplicadorBase: number;
    bonificacionPrimeraVez: number;
    bonificacionRecurrente: number;
    bonificacionCalidadAlta: number;
    descuentoPenalizacion: number;
  };
  recoleccion: {
    horasLimite: {
      inicio: string;
      fin: string;
    };
    diasAnticipacionMinima: number;
    diasAnticipacionMaxima: number;
    cancelacionLimiteHoras: number;
  };
  notificaciones: {
    emailHabilitado: boolean;
    smsHabilitado: boolean;
    pushHabilitado: boolean;
    recordatorioHoras: number[];
  };
  sistema: {
    version: string;
    mantenimiento: boolean;
    debug: boolean;
    rateLimitMinutos: number;
    cacheExpiracionMinutos: number;
  };
  horarios: {
    zonaHoraria: string;
    formatoHora: '12h' | '24h';
    diasHabiles: number[];
  };
}

export class AppConfigManager {
  private static instance: AppConfigManager;
  private config: ConfiguracionGlobal;
  private observers: Array<(config: ConfiguracionGlobal) => void> = [];

  private constructor() {
    this.config = this.cargarConfiguracionDefault();
    this.inicializarConfiguracion();
  }

  /**
   * Obtiene la instancia única del ConfigManager
   */
  public static getInstance(): AppConfigManager {
    if (!AppConfigManager.instance) {
      AppConfigManager.instance = new AppConfigManager();
    }
    return AppConfigManager.instance;
  }

  /**
   * Carga la configuración por defecto
   */
  private cargarConfiguracionDefault(): ConfiguracionGlobal {
    return {
      puntos: {
        multiplicadorBase: 1.0,
        bonificacionPrimeraVez: 50,
        bonificacionRecurrente: 20,
        bonificacionCalidadAlta: 30,
        descuentoPenalizacion: 0.5
      },
      recoleccion: {
        horasLimite: {
          inicio: '06:00',
          fin: '18:00'
        },
        diasAnticipacionMinima: 1,
        diasAnticipacionMaxima: 30,
        cancelacionLimiteHoras: 2
      },
      notificaciones: {
        emailHabilitado: true,
        smsHabilitado: false,
        pushHabilitado: true,
        recordatorioHoras: [24, 2] // 24h y 2h antes
      },
      sistema: {
        version: '1.0.0',
        mantenimiento: false,
        debug: process.env.NODE_ENV === 'development',
        rateLimitMinutos: 1,
        cacheExpiracionMinutos: 15
      },
      horarios: {
        zonaHoraria: 'America/Argentina/Buenos_Aires',
        formatoHora: '24h',
        diasHabiles: [1, 2, 3, 4, 5] // Lunes a Viernes
      }
    };
  }

  /**
   * Inicializa la configuración desde variables de entorno o base de datos
   */
  private async inicializarConfiguracion(): Promise<void> {
    try {
      // Intentar cargar configuración desde variables de entorno
      this.aplicarConfiguracionEntorno();

      // TODO: Cargar configuración personalizada desde base de datos
      await this.cargarConfiguracionBD();

    } catch (error) {
      console.warn('Error cargando configuración personalizada, usando defaults:', error);
    }
  }

  /**
   * Aplica configuración desde variables de entorno
   */
  private aplicarConfiguracionEntorno(): void {
    if (process.env.PUNTOS_MULTIPLICADOR_BASE) {
      this.config.puntos.multiplicadorBase = parseFloat(process.env.PUNTOS_MULTIPLICADOR_BASE);
    }

    if (process.env.RECOLECCION_HORA_INICIO) {
      this.config.recoleccion.horasLimite.inicio = process.env.RECOLECCION_HORA_INICIO;
    }

    if (process.env.RECOLECCION_HORA_FIN) {
      this.config.recoleccion.horasLimite.fin = process.env.RECOLECCION_HORA_FIN;
    }

    if (process.env.EMAIL_HABILITADO) {
      this.config.notificaciones.emailHabilitado = process.env.EMAIL_HABILITADO === 'true';
    }

    if (process.env.SISTEMA_MANTENIMIENTO) {
      this.config.sistema.mantenimiento = process.env.SISTEMA_MANTENIMIENTO === 'true';
    }

    if (process.env.TZ) {
      this.config.horarios.zonaHoraria = process.env.TZ;
    }
  }

  /**
   * Carga configuración personalizada desde base de datos
   */
  private async cargarConfiguracionBD(): Promise<void> {
    // TODO: Implementar carga desde BD cuando esté disponible
    // const configBD = await prisma.configuracionSistema.findFirst();
    // if (configBD) {
    //   this.config = { ...this.config, ...JSON.parse(configBD.configuracion) };
    // }
  }

  /**
   * Obtiene toda la configuración actual
   */
  public getConfig(): ConfiguracionGlobal {
    return { ...this.config };
  }

  /**
   * Obtiene una sección específica de la configuración
   */
  public getConfigSeccion<K extends keyof ConfiguracionGlobal>(
    seccion: K
  ): ConfiguracionGlobal[K] {
    return { ...this.config[seccion] };
  }

  /**
   * Obtiene un valor específico de configuración
   */
  public getConfigValor<K extends keyof ConfiguracionGlobal, V extends keyof ConfiguracionGlobal[K]>(
    seccion: K,
    clave: V
  ): ConfiguracionGlobal[K][V] {
    return this.config[seccion][clave];
  }

  /**
   * Actualiza una sección completa de la configuración
   */
  public async actualizarSeccion<K extends keyof ConfiguracionGlobal>(
    seccion: K,
    nuevaConfiguracion: Partial<ConfiguracionGlobal[K]>
  ): Promise<void> {
    this.config[seccion] = {
      ...this.config[seccion],
      ...nuevaConfiguracion
    };

    await this.guardarConfiguracion();
    this.notificarObservers();
  }

  /**
   * Actualiza un valor específico de configuración
   */
  public async actualizarValor<K extends keyof ConfiguracionGlobal, V extends keyof ConfiguracionGlobal[K]>(
    seccion: K,
    clave: V,
    valor: ConfiguracionGlobal[K][V]
  ): Promise<void> {
    (this.config[seccion] as Record<string, unknown>)[clave as string] = valor;

    await this.guardarConfiguracion();
    this.notificarObservers();
  }

  /**
   * Resetea la configuración a los valores por defecto
   */
  public async resetearConfiguracion(): Promise<void> {
    this.config = this.cargarConfiguracionDefault();
    await this.guardarConfiguracion();
    this.notificarObservers();
  }

  /**
   * Guarda la configuración actual en base de datos
   */
  private async guardarConfiguracion(): Promise<void> {
    try {
      // TODO: Implementar guardado en BD
      // await prisma.configuracionSistema.upsert({
      //   where: { id: 1 },
      //   create: { configuracion: JSON.stringify(this.config) },
      //   update: { configuracion: JSON.stringify(this.config) }
      // });
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  }

  /**
   * Suscribe un observer para cambios en la configuración
   */
  public suscribirCambios(observer: (config: ConfiguracionGlobal) => void): void {
    this.observers.push(observer);
  }

  /**
   * Desuscribe un observer
   */
  public desuscribirCambios(observer: (config: ConfiguracionGlobal) => void): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notifica a todos los observers sobre cambios en la configuración
   */
  private notificarObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer(this.getConfig());
      } catch (error) {
        console.error('Error notificando observer de configuración:', error);
      }
    });
  }

  /**
   * Valida si el sistema está en mantenimiento
   */
  public estaEnMantenimiento(): boolean {
    return this.config.sistema.mantenimiento;
  }

  /**
   * Valida si una hora está dentro del rango de recolección
   */
  public estaEnHorarioRecoleccion(hora: string): boolean {
    return hora >= this.config.recoleccion.horasLimite.inicio && 
           hora <= this.config.recoleccion.horasLimite.fin;
  }

  /**
   * Obtiene la zona horaria configurada
   */
  public getZonaHoraria(): string {
    return this.config.horarios.zonaHoraria;
  }

  /**
   * Valida si un día es hábil según configuración
   */
  public esDiaHabil(numeroDia: number): boolean {
    return this.config.horarios.diasHabiles.includes(numeroDia);
  }

  /**
   * Obtiene información de debug de la configuración
   */
  public getInfoDebug(): {
    version: string;
    configuracionCargada: Date;
    observersActivos: number;
    estaEnMantenimiento: boolean;
  } {
    return {
      version: this.config.sistema.version,
      configuracionCargada: new Date(),
      observersActivos: this.observers.length,
      estaEnMantenimiento: this.config.sistema.mantenimiento
    };
  }
}

// Export de la instancia para uso directo
export const configManager = AppConfigManager.getInstance();
