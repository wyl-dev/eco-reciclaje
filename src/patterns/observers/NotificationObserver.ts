/**
 * Observer Pattern - Notification Observer
 * 
 * Maneja las notificaciones del sistema cuando ocurren eventos
 */

import { Observer, EventData, EventType } from './EventManager';

// Tipos de notificaciones
export type NotificationType = 'email' | 'push' | 'sms' | 'in-app';

export interface NotificationTemplate {
  title: string;
  body: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

export interface NotificationConfig {
  enabled: boolean;
  types: NotificationType[];
  conditions?: (event: EventData) => boolean;
  template?: NotificationTemplate;
}

/**
 * Observer para el sistema de notificaciones
 */
export class NotificationObserver implements Observer {
  readonly id = 'notification-observer';
  readonly name = 'Sistema de Notificaciones';
  
  private configurations: Map<EventType, NotificationConfig> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeConfigurations();
  }

  /**
   * Maneja eventos y envía notificaciones correspondientes
   */
  async handle(event: EventData): Promise<void> {
    try {
      const config = this.configurations.get(event.entityType as EventType);
      
      if (!config || !config.enabled) {
        return;
      }

      // Verificar condiciones personalizadas
      if (config.conditions && !config.conditions(event)) {
        return;
      }

      // Generar notificaciones para cada tipo configurado
      const notifications = config.types.map(type => 
        this.createNotification(event, type, config)
      );

      // Enviar notificaciones
      await Promise.all(
        notifications.map(notification => this.sendNotification(notification))
      );

      console.log(`Notificaciones enviadas para evento ${event.entityType}:${event.action}`);
    } catch (error) {
      console.error('Error en NotificationObserver:', error);
    }
  }

  /**
   * Crea una notificación basada en el evento
   */
  private createNotification(
    event: EventData, 
    type: NotificationType, 
    config: NotificationConfig
  ): NotificationTemplate {
    const templateKey = `${event.entityType}_${event.action}`;
    const baseTemplate = this.templates.get(templateKey) || this.getDefaultTemplate(event);

    return {
      ...baseTemplate,
      type,
      title: this.interpolateTemplate(baseTemplate.title, event),
      body: this.interpolateTemplate(baseTemplate.body, event),
      metadata: {
        ...baseTemplate.metadata,
        eventId: event.id,
        userId: event.userId,
        timestamp: event.timestamp
      }
    };
  }

  /**
   * Envía una notificación según su tipo
   */
  private async sendNotification(notification: NotificationTemplate): Promise<void> {
    switch (notification.type) {
      case 'email':
        await this.sendEmailNotification(notification);
        break;
      case 'push':
        await this.sendPushNotification(notification);
        break;
      case 'sms':
        await this.sendSmsNotification(notification);
        break;
      case 'in-app':
        await this.sendInAppNotification(notification);
        break;
    }
  }

  /**
   * Envía notificación por email
   */
  private async sendEmailNotification(notification: NotificationTemplate): Promise<void> {
    // Aquí se integraría con un servicio de email como SendGrid, Nodemailer, etc.
    console.log('📧 Enviando email:', notification.title);
    // Implementación de envío de email
  }

  /**
   * Envía notificación push
   */
  private async sendPushNotification(notification: NotificationTemplate): Promise<void> {
    // Aquí se integraría con un servicio push como Firebase Cloud Messaging
    console.log('📱 Enviando push notification:', notification.title);
    // Implementación de push notification
  }

  /**
   * Envía notificación SMS
   */
  private async sendSmsNotification(notification: NotificationTemplate): Promise<void> {
    // Aquí se integraría con un servicio SMS como Twilio
    console.log('📱 Enviando SMS:', notification.title);
    // Implementación de SMS
  }

  /**
   * Envía notificación in-app
   */
  private async sendInAppNotification(notification: NotificationTemplate): Promise<void> {
    // Aquí se guardaría la notificación en la BD para mostrarla en la app
    console.log('🔔 Guardando notificación in-app:', notification.title);
    
    // Ejemplo de cómo se podría guardar en la BD
    try {
      // await prisma.notificacion.create({
      //   data: {
      //     titulo: notification.title,
      //     mensaje: notification.body,
      //     tipo: notification.type,
      //     prioridad: notification.priority,
      //     usuarioId: notification.metadata?.userId as string,
      //     leida: false
      //   }
      // });
    } catch (error) {
      console.error('Error guardando notificación in-app:', error);
    }
  }

  /**
   * Interpola plantillas con datos del evento
   */
  private interpolateTemplate(template: string, event: EventData): string {
    let result = template;
    
    // Reemplazar variables comunes
    result = result.replace(/\{entityType\}/g, event.entityType);
    result = result.replace(/\{action\}/g, event.action);
    result = result.replace(/\{entityId\}/g, event.entityId);
    
    // Reemplazar variables del payload
    Object.entries(event.payload).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  /**
   * Obtiene plantilla por defecto para un evento
   */
  private getDefaultTemplate(event: EventData): NotificationTemplate {
    return {
      title: `Evento ${event.entityType}`,
      body: `Se ha ejecutado la acción ${event.action} en ${event.entityType}`,
      type: 'in-app',
      priority: 'medium'
    };
  }

  /**
   * Inicializa las plantillas de notificaciones
   */
  private initializeTemplates(): void {
    // Plantillas para solicitudes
    this.templates.set('solicitud_created', {
      title: '✅ Nueva solicitud creada',
      body: 'Tu solicitud de recolección de {tipoResiduo} ha sido creada exitosamente.',
      type: 'in-app',
      priority: 'medium'
    });

    this.templates.set('solicitud_updated', {
      title: '🔄 Solicitud actualizada',
      body: 'Tu solicitud de recolección ha sido actualizada. Estado: {estado}',
      type: 'push',
      priority: 'medium'
    });

    this.templates.set('solicitud_completed', {
      title: '🎉 Recolección completada',
      body: 'Tu solicitud de recolección ha sido completada exitosamente. ¡Has ganado {puntos} puntos!',
      type: 'push',
      priority: 'high'
    });

    this.templates.set('solicitud_cancelled', {
      title: '❌ Solicitud cancelada',
      body: 'Tu solicitud de recolección ha sido cancelada. {motivo}',
      type: 'email',
      priority: 'high'
    });

    // Plantillas para puntos
    this.templates.set('puntos_added', {
      title: '⭐ Puntos agregados',
      body: '¡Has ganado {puntos} puntos! Motivo: {motivo}',
      type: 'in-app',
      priority: 'low'
    });

    this.templates.set('puntos_deducted', {
      title: '📉 Puntos deducidos',
      body: 'Se han deducido {puntos} puntos. Motivo: {motivo}',
      type: 'in-app',
      priority: 'medium'
    });

    // Plantillas para usuarios
    this.templates.set('usuario_created', {
      title: '👋 ¡Bienvenido a EcoReciclaje!',
      body: 'Tu cuenta ha sido creada exitosamente. ¡Comienza a reciclar y gana puntos!',
      type: 'email',
      priority: 'high'
    });

    // Plantillas para suscripciones
    this.templates.set('suscripcion_expired', {
      title: '⚠️ Suscripción expirada',
      body: 'Tu suscripción ha expirado. Renueva para seguir disfrutando de todos los beneficios.',
      type: 'email',
      priority: 'high'
    });

    // Plantillas para recolecciones
    this.templates.set('recoleccion_scheduled', {
      title: '📅 Recolección programada',
      body: 'Tu recolección ha sido programada para {fechaProgramada}. Prepara tus residuos.',
      type: 'push',
      priority: 'high'
    });
  }

  /**
   * Inicializa las configuraciones de notificaciones
   */
  private initializeConfigurations(): void {
    // Configuración para eventos de solicitudes
    this.configurations.set('solicitud:created', {
      enabled: true,
      types: ['in-app', 'push'],
      conditions: (event) => !!event.userId
    });

    this.configurations.set('solicitud:updated', {
      enabled: true,
      types: ['in-app'],
      conditions: (event) => {
        const estado = event.payload.estado as string;
        return ['PROGRAMADA', 'ASIGNADA', 'COMPLETADA'].includes(estado);
      }
    });

    this.configurations.set('solicitud:completed', {
      enabled: true,
      types: ['push', 'email'],
      conditions: (event) => !!event.userId
    });

    this.configurations.set('solicitud:cancelled', {
      enabled: true,
      types: ['email', 'in-app'],
      conditions: (event) => !!event.userId
    });

    // Configuración para eventos de puntos
    this.configurations.set('puntos:added', {
      enabled: true,
      types: ['in-app'],
      conditions: (event) => {
        const puntos = event.payload.puntos as number;
        return puntos > 0;
      }
    });

    this.configurations.set('puntos:deducted', {
      enabled: true,
      types: ['in-app', 'push'],
      conditions: (event) => {
        const puntos = event.payload.puntos as number;
        return puntos > 5; // Solo notificar si se deducen más de 5 puntos
      }
    });

    // Configuración para eventos de usuarios
    this.configurations.set('usuario:created', {
      enabled: true,
      types: ['email', 'in-app']
    });

    // Configuración para recolecciones
    this.configurations.set('recoleccion:scheduled', {
      enabled: true,
      types: ['push', 'email'],
      conditions: (event) => !!event.userId
    });
  }

  /**
   * Actualiza configuración para un tipo de evento
   */
  updateConfiguration(eventType: EventType, config: NotificationConfig): void {
    this.configurations.set(eventType, config);
    console.log(`Configuración actualizada para ${eventType}`);
  }

  /**
   * Agrega o actualiza una plantilla
   */
  updateTemplate(key: string, template: NotificationTemplate): void {
    this.templates.set(key, template);
    console.log(`Plantilla actualizada: ${key}`);
  }

  /**
   * Obtiene todas las configuraciones
   */
  getConfigurations(): Map<EventType, NotificationConfig> {
    return new Map(this.configurations);
  }

  /**
   * Obtiene todas las plantillas
   */
  getTemplates(): Map<string, NotificationTemplate> {
    return new Map(this.templates);
  }
}

// Singleton instance
export const notificationObserver = new NotificationObserver();
