/**
 * Observer Pattern - Event Manager
 * 
 * Sistema central de eventos que permite la comunicación entre componentes
 * sin acoplarlos directamente
 */

// Tipos de eventos del sistema
export type EventType = 
  | 'solicitud:created'
  | 'solicitud:updated' 
  | 'solicitud:completed'
  | 'solicitud:cancelled'
  | 'puntos:added'
  | 'puntos:deducted'
  | 'usuario:created'
  | 'usuario:updated'
  | 'suscripcion:activated'
  | 'suscripcion:expired'
  | 'recoleccion:scheduled'
  | 'recoleccion:completed';

// Interface para datos de eventos
export interface EventData {
  id: string;
  timestamp: Date;
  userId?: string;
  entityId: string;
  entityType: string;
  action: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Interface para observers
export interface Observer {
  id: string;
  name: string;
  handle(event: EventData): Promise<void> | void;
}

// Interface para filtros de eventos
export interface EventFilter {
  types?: EventType[];
  userId?: string;
  entityType?: string;
  condition?: (event: EventData) => boolean;
}

/**
 * Gestor central de eventos (Observer Pattern)
 */
export class EventManager {
  private static instance: EventManager;
  private observers: Map<EventType, Observer[]> = new Map();
  private globalObservers: Observer[] = [];
  private eventHistory: EventData[] = [];
  private maxHistorySize = 1000;

  private constructor() {
    this.initializeEventTypes();
  }

  /**
   * Singleton instance
   */
  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Inicializa los tipos de eventos
   */
  private initializeEventTypes(): void {
    const eventTypes: EventType[] = [
      'solicitud:created',
      'solicitud:updated',
      'solicitud:completed',
      'solicitud:cancelled',
      'puntos:added',
      'puntos:deducted',
      'usuario:created',
      'usuario:updated',
      'suscripcion:activated',
      'suscripcion:expired',
      'recoleccion:scheduled',
      'recoleccion:completed'
    ];

    eventTypes.forEach(type => {
      this.observers.set(type, []);
    });
  }

  /**
   * Registra un observer para tipos específicos de eventos
   */
  subscribe(eventTypes: EventType[], observer: Observer): void {
    eventTypes.forEach(type => {
      const typeObservers = this.observers.get(type) || [];
      
      // Evitar duplicados
      if (!typeObservers.find(obs => obs.id === observer.id)) {
        typeObservers.push(observer);
        this.observers.set(type, typeObservers);
      }
    });

    console.log(`Observer ${observer.name} registrado para eventos: ${eventTypes.join(', ')}`);
  }

  /**
   * Registra un observer global (escucha todos los eventos)
   */
  subscribeGlobal(observer: Observer): void {
    if (!this.globalObservers.find(obs => obs.id === observer.id)) {
      this.globalObservers.push(observer);
      console.log(`Observer global ${observer.name} registrado`);
    }
  }

  /**
   * Desregistra un observer
   */
  unsubscribe(eventTypes: EventType[], observerId: string): void {
    eventTypes.forEach(type => {
      const typeObservers = this.observers.get(type) || [];
      const filtered = typeObservers.filter(obs => obs.id !== observerId);
      this.observers.set(type, filtered);
    });
  }

  /**
   * Desregistra un observer global
   */
  unsubscribeGlobal(observerId: string): void {
    this.globalObservers = this.globalObservers.filter(obs => obs.id !== observerId);
  }

  /**
   * Emite un evento a todos los observers suscritos
   */
  async emit(eventType: EventType, data: Omit<EventData, 'id' | 'timestamp'>): Promise<void> {
    const event: EventData = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...data
    };

    // Agregar al historial
    this.addToHistory(event);

    // Notificar observers específicos del tipo
    const typeObservers = this.observers.get(eventType) || [];
    
    // Notificar observers globales
    const allObservers = [...typeObservers, ...this.globalObservers];

    // Ejecutar notificaciones en paralelo
    const notifications = allObservers.map(observer => 
      this.notifyObserver(observer, event)
    );

    await Promise.allSettled(notifications);

    console.log(`Evento ${eventType} emitido a ${allObservers.length} observers`);
  }

  /**
   * Notifica a un observer específico
   */
  private async notifyObserver(observer: Observer, event: EventData): Promise<void> {
    try {
      await observer.handle(event);
    } catch (error) {
      console.error(`Error en observer ${observer.name}:`, error);
    }
  }

  /**
   * Obtiene el historial de eventos con filtros
   */
  getEventHistory(filter?: EventFilter, limit?: number): EventData[] {
    let filtered = this.eventHistory;

    if (filter) {
      filtered = filtered.filter(event => {
        // Filtrar por tipos
        if (filter.types && !filter.types.includes(event.entityType as EventType)) {
          return false;
        }

        // Filtrar por usuario
        if (filter.userId && event.userId !== filter.userId) {
          return false;
        }

        // Filtrar por tipo de entidad
        if (filter.entityType && event.entityType !== filter.entityType) {
          return false;
        }

        // Filtro personalizado
        if (filter.condition && !filter.condition(event)) {
          return false;
        }

        return true;
      });
    }

    // Aplicar límite
    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtiene estadísticas de eventos
   */
  getEventStatistics(timeRange?: { from: Date; to: Date }) {
    let events = this.eventHistory;

    if (timeRange) {
      events = events.filter(event => 
        event.timestamp >= timeRange.from && event.timestamp <= timeRange.to
      );
    }

    const stats = {
      total: events.length,
      byType: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byHour: {} as Record<number, number>,
      recentActivity: events.slice(-10)
    };

    events.forEach(event => {
      // Por tipo de entidad
      stats.byType[event.entityType] = (stats.byType[event.entityType] || 0) + 1;
      
      // Por acción
      stats.byAction[event.action] = (stats.byAction[event.action] || 0) + 1;
      
      // Por hora del día
      const hour = event.timestamp.getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpia el historial de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
    console.log('Historial de eventos limpiado');
  }

  /**
   * Obtiene observers registrados
   */
  getObservers(): { type: EventType; observers: Observer[] }[] {
    return Array.from(this.observers.entries()).map(([type, observers]) => ({
      type,
      observers
    }));
  }

  /**
   * Obtiene observers globales
   */
  getGlobalObservers(): Observer[] {
    return [...this.globalObservers];
  }

  /**
   * Agrega evento al historial
   */
  private addToHistory(event: EventData): void {
    this.eventHistory.push(event);
    
    // Mantener tamaño máximo del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Genera ID único para eventos
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Funciones de utilidad para crear eventos comunes
export const EventCreators = {
  solicitudCreated: (solicitudId: string, userId: string, payload: Record<string, unknown>) => ({
    entityId: solicitudId,
    entityType: 'solicitud',
    action: 'created',
    userId,
    payload
  }),

  solicitudUpdated: (solicitudId: string, userId: string, changes: Record<string, unknown>) => ({
    entityId: solicitudId,
    entityType: 'solicitud',
    action: 'updated',
    userId,
    payload: { changes }
  }),

  puntosAdded: (userId: string, puntos: number, motivo: string) => ({
    entityId: userId,
    entityType: 'puntos',
    action: 'added',
    userId,
    payload: { puntos, motivo }
  }),

  usuarioCreated: (userId: string, userData: Record<string, unknown>) => ({
    entityId: userId,
    entityType: 'usuario',
    action: 'created',
    userId,
    payload: userData
  })
};

// Instancia singleton
export const eventManager = EventManager.getInstance();
