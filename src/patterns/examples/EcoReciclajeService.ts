/**
 * Ejemplo práctico y simplificado de uso de patrones de diseño en EcoReciclaje
 * 
 * Este archivo demuestra cómo usar los patrones implementados de manera práctica
 */

import { PrismaClient } from '@prisma/client';
import { PuntosCalculator, PuntosStrategyFactory } from '../strategies/PuntosStrategy';
import { configManager } from '../singleton/AppConfigManager';
import { NotificacionServiceBuilder } from '../decorators/NotificacionDecorators';

/**
 * Servicio simplificado que demuestra el uso de patrones
 */
export class EcoReciclajeService {
  private prisma: PrismaClient;
  private notificacionService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    
    // Inicializar servicio de notificaciones con decorators
    this.notificacionService = new NotificacionServiceBuilder()
      .conValidacion()
      .conRetry(2, 1000)
      .conCache(10)
      .conLogging()
      .build();
  }

  /**
   * Ejemplo de uso del Strategy Pattern para calcular puntos
   */
  async calcularPuntosSolicitud(
    tipoResiduo: string, 
    cantidad: number, 
    usuarioId: string,
    calidad: 'alta' | 'media' | 'baja' = 'media'
  ) {
    // Usar Strategy Pattern para seleccionar algoritmo de cálculo
    const estrategia = PuntosStrategyFactory.crearEstrategia(tipoResiduo);
    const calculator = new PuntosCalculator(estrategia);

    // Obtener información del usuario para metadatos
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si es primera vez
    const solicitudesAnteriores = await this.prisma.solicitudRecoleccion.count({
      where: { usuarioId }
    });

    // Verificar si es usuario recurrente
    const solicitudesRecientes = await this.prisma.solicitudRecoleccion.count({
      where: {
        usuarioId,
        fechaSolicitada: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const metadata = {
      tipoResiduo,
      localidad: usuario.localidad || undefined,
      fechaRecoleccion: new Date(),
      usuarioId,
      esPrimeraVez: solicitudesAnteriores === 0,
      esRecurrente: solicitudesRecientes >= 3,
      calidad
    };

    return calculator.obtenerDetalles(cantidad, metadata);
  }

  /**
   * Ejemplo de uso del Singleton Pattern para configuración
   */
  validarSistemaDisponible(): { disponible: boolean; mensaje?: string } {
    // Usar Singleton para acceder a configuración global
    if (configManager.estaEnMantenimiento()) {
      return {
        disponible: false,
        mensaje: 'Sistema en mantenimiento temporalmente'
      };
    }

    const horaActual = new Date().toTimeString().substring(0, 5);
    if (!configManager.estaEnHorarioRecoleccion(horaActual)) {
      const config = configManager.getConfigSeccion('recoleccion');
      return {
        disponible: false,
        mensaje: `Horario no válido. Disponible: ${config.horasLimite.inicio} - ${config.horasLimite.fin}`
      };
    }

    return { disponible: true };
  }

  /**
   * Ejemplo de uso del Decorator Pattern para notificaciones
   */
  async enviarNotificacionSolicitud(
    usuarioEmail: string,
    solicitudId: string,
    tipoResiduo: string,
    puntos: number
  ) {
    const notificacion = {
      id: `notif_${solicitudId}`,
      destinatario: usuarioEmail,
      asunto: 'Solicitud de recolección procesada',
      mensaje: `Tu solicitud de recolección de ${tipoResiduo} ha sido procesada. ¡Ganaste ${puntos} puntos!`,
      tipo: 'email' as const,
      prioridad: 'media' as const,
      fechaCreacion: new Date(),
      metadata: {
        solicitudId,
        puntos,
        tipoResiduo
      }
    };

    try {
      const enviado = await this.notificacionService.enviar(notificacion);
      return { enviado, mensaje: enviado ? 'Notificación enviada' : 'Error enviando notificación' };
    } catch (error) {
      console.error('Error enviando notificación:', error);
      return { enviado: false, mensaje: 'Error en el servicio de notificaciones' };
    }
  }

  /**
   * Proceso completo que integra múltiples patrones
   */
  async procesarSolicitud(data: {
    usuarioId: string;
    tipoResiduo: string;
    cantidad: number;
    calidad?: 'alta' | 'media' | 'baja';
  }) {
    // 1. Validar sistema disponible (Singleton)
    const validacion = this.validarSistemaDisponible();
    if (!validacion.disponible) {
      throw new Error(validacion.mensaje);
    }

    // 2. Obtener usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: data.usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // 3. Calcular puntos (Strategy Pattern)
    const detallesPuntos = await this.calcularPuntosSolicitud(
      data.tipoResiduo,
      data.cantidad,
      data.usuarioId,
      data.calidad
    );

    // 4. Crear puntaje record
    await this.prisma.puntaje.create({
      data: {
        usuarioId: data.usuarioId,
        puntos: detallesPuntos.puntos,
        motivo: `Recolección de ${data.tipoResiduo}`
      }
    });

    // 5. Crear solicitud usando los valores correctos del enum
    const tipoResiduoEnum = data.tipoResiduo.toUpperCase() === 'ORGANICOS' ? 'ORGANICO' : 'INORGANICO';
    
    const solicitud = await this.prisma.solicitudRecoleccion.create({
      data: {
        usuarioId: data.usuarioId,
        tipoResiduo: tipoResiduoEnum as 'ORGANICO' | 'INORGANICO' | 'PELIGROSO',
        fechaSolicitada: new Date(),
        estado: 'PENDIENTE'
      }
    });

    // 6. Enviar notificación (Decorator Pattern)
    const notificacionResult = await this.enviarNotificacionSolicitud(
      usuario.email,
      solicitud.id,
      data.tipoResiduo,
      detallesPuntos.puntos
    );

    return {
      solicitudId: solicitud.id,
      puntosGanados: detallesPuntos.puntos,
      estrategiaUtilizada: detallesPuntos.estrategia,
      multiplicador: detallesPuntos.multiplicador,
      bonificaciones: detallesPuntos.bonificaciones,
      notificacionEnviada: notificacionResult.enviado,
      mensaje: 'Solicitud procesada exitosamente'
    };
  }
}

/**
 * Funciones auxiliares para usar en la aplicación
 */

/**
 * Preview de puntos usando Strategy Pattern
 */
export async function calcularPuntosPreview(
  tipoResiduo: string,
  cantidad: number
) {
  const estrategia = PuntosStrategyFactory.crearEstrategia(tipoResiduo);
  const calculator = new PuntosCalculator(estrategia);

  const metadata = {
    tipoResiduo,
    fechaRecoleccion: new Date(),
    usuarioId: 'preview',
    calidad: 'media' as const
  };

  return calculator.obtenerDetalles(cantidad, metadata);
}

/**
 * Obtener configuración actual del sistema
 */
export function obtenerConfiguracionSistema() {
  return {
    estaEnMantenimiento: configManager.estaEnMantenimiento(),
    horarioRecoleccion: configManager.getConfigSeccion('recoleccion').horasLimite,
    puntosConfig: configManager.getConfigSeccion('puntos'),
    version: configManager.getConfigSeccion('sistema').version,
    notificacionesConfig: configManager.getConfigSeccion('notificaciones')
  };
}

/**
 * Listar estrategias de puntos disponibles
 */
export function obtenerEstrategiasDisponibles() {
  return PuntosStrategyFactory.obtenerEstrategiasDisponibles();
}

/**
 * Validar horario de recolección
 */
export function validarHorarioRecoleccion(hora?: string): boolean {
  const horaValidar = hora || new Date().toTimeString().substring(0, 5);
  return configManager.estaEnHorarioRecoleccion(horaValidar);
}

/**
 * Hook-like function para componentes React
 */
export function usePatronesEcoReciclaje() {
  return {
    calcularPuntosPreview,
    obtenerConfiguracionSistema,
    obtenerEstrategiasDisponibles,
    validarHorarioRecoleccion,
    configuracion: configManager.getConfig()
  };
}
