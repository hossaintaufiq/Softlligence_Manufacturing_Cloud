import { EventEmitter } from 'node:events';

export type PlatformEventType =
  | 'work_order.completed'
  | 'inventory.receipt'
  | 'dispatch.issued'
  | 'steel_heat.logged'
  | 'user.security_alert';

export type PlatformEventPayload = {
  eventId: string;
  tenantId?: string | null;
  userId?: string | null;
  timestamp: string;
  payload: Record<string, any>;
};

class DecoupledEventBus {
  private emitter = new EventEmitter();

  public publish(event: PlatformEventType, data: Omit<PlatformEventPayload, 'eventId' | 'timestamp'>) {
    const eventPayload: PlatformEventPayload = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.log(`[EVENT BUS] Published '${event}':`, eventPayload.eventId);
    this.emitter.emit(event, eventPayload);
    this.emitter.emit('*', { event, ...eventPayload });
    return eventPayload;
  }

  public subscribe(event: PlatformEventType | '*', listener: (payload: any) => void) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }
}

export const eventBus = new DecoupledEventBus();
