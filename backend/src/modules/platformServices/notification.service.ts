import { eventBus, type PlatformEventPayload } from '../../common/events/eventBus.js';

export type InAppNotification = {
  id: string;
  tenantId?: string | null;
  userId?: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'manufacturing' | 'commercial' | 'steel' | 'security';
  read: boolean;
  createdAt: string;
};

// In-memory store for in-app notifications
const notificationStore: InAppNotification[] = [
  {
    id: 'notif_1',
    title: 'Heat Log #HEAT-2026-001 Confirmed',
    message: 'Induction Furnace 1 melt yield recorded at 92.4% with 42,000 kg billet output.',
    type: 'success',
    category: 'steel',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif_2',
    title: 'Delivery Challan CHAL-2026-001 Dispatched',
    message: '50 MT 12mm Rebar rods shipped to National Builders project site.',
    type: 'info',
    category: 'commercial',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

// Subscribe to eventBus events to automatically dispatch notifications
eventBus.subscribe('steel_heat.logged', (data: PlatformEventPayload) => {
  notificationStore.unshift({
    id: `notif_${Date.now()}`,
    tenantId: data.tenantId,
    userId: data.userId,
    title: `Heat Log #${data.payload.heatNo || 'LOG'} Created`,
    message: `Heat log recorded with yield ${data.payload.yieldPct || 0}%`,
    type: 'success',
    category: 'steel',
    read: false,
    createdAt: new Date().toISOString(),
  });
});

export async function getUserNotifications(tenantId?: string | null) {
  if (!tenantId) return notificationStore;
  return notificationStore.filter((n) => !n.tenantId || n.tenantId === tenantId);
}

export async function markNotificationAsRead(id: string) {
  const item = notificationStore.find((n) => n.id === id);
  if (item) item.read = true;
  return { success: true };
}
