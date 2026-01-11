/**
 * Menu diffing utilities
 * Compares two menu snapshots and generates UpdateEvents
 */

import type { MenuItem } from './menu-parser';

export type UpdateEventType = 'PRODUCT_ADDED' | 'PRICE_CHANGED';

export interface UpdateEvent {
  id: string;
  competitorId: string;
  competitorName?: string;
  url: string;
  type: UpdateEventType;
  createdAt: Date;
  payload: {
    itemKey: string;
    itemName: string;
    oldPrice?: number;
    newPrice?: number;
    price?: number; // For PRODUCT_ADDED, just the current price
    description?: string;
  };
}

/**
 * Diff two menus and generate update events
 */
export function diffMenus(
  oldItems: MenuItem[],
  newItems: MenuItem[],
  competitorId: string,
  competitorName: string,
  url: string
): UpdateEvent[] {
  const events: UpdateEvent[] = [];
  
  console.log(`🔍 Diffing menus: ${oldItems.length} old items vs ${newItems.length} new items`);
  
  // Create lookup maps for O(1) access
  const oldItemsMap = new Map<string, MenuItem>();
  const newItemsMap = new Map<string, MenuItem>();
  
  oldItems.forEach(item => oldItemsMap.set(item.key, item));
  newItems.forEach(item => newItemsMap.set(item.key, item));
  
  // 1. Find new products (in NEW but not in OLD)
  for (const newItem of newItems) {
    if (!oldItemsMap.has(newItem.key)) {
      events.push({
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        competitorId,
        competitorName,
        url,
        type: 'PRODUCT_ADDED',
        createdAt: new Date(),
        payload: {
          itemKey: newItem.key,
          itemName: newItem.name,
          price: newItem.price,
          description: newItem.description,
        },
      });
      console.log(`➕ PRODUCT_ADDED: ${newItem.name} at $${newItem.price}`);
    }
  }
  
  // 2. Find price changes (in both OLD and NEW, but price changed)
  for (const newItem of newItems) {
    const oldItem = oldItemsMap.get(newItem.key);
    
    if (oldItem) {
      // Check if price changed (with small tolerance for floating point)
      const priceDiff = Math.abs(newItem.price - oldItem.price);
      if (priceDiff > 0.01) { // More than 1 cent difference
        events.push({
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          competitorId,
          competitorName,
          url,
          type: 'PRICE_CHANGED',
          createdAt: new Date(),
          payload: {
            itemKey: newItem.key,
            itemName: newItem.name,
            oldPrice: oldItem.price,
            newPrice: newItem.price,
            description: newItem.description,
          },
        });
        console.log(`💰 PRICE_CHANGED: ${newItem.name} - $${oldItem.price} → $${newItem.price}`);
      }
    }
  }
  
  console.log(`✅ Generated ${events.length} update events`);
  
  return events;
}

/**
 * Filter events by type
 */
export function filterEventsByType(
  events: UpdateEvent[],
  type: UpdateEventType
): UpdateEvent[] {
  return events.filter(e => e.type === type);
}
