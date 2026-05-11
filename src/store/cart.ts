import { defineStore } from 'pinia';

interface CartItem {
  id: number;
  name: string;
  imageUrl?: string;
  pointsCost?: number;
  description?: string;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    count: (s) => s.items.length,
    ids:   (s) => s.items.map((i) => i.id),
    totalPointsCost: (s) => s.items.reduce((sum, i) => sum + (i.pointsCost || 0), 0),
  },
  actions: {
    toggle(item: CartItem) {
      const idx = this.items.findIndex((i) => i.id === item.id);
      if (idx >= 0) this.items.splice(idx, 1);
      else this.items.push(item);
    },
    remove(id: number) {
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx >= 0) this.items.splice(idx, 1);
    },
    has(id: number) { return this.items.some((i) => i.id === id); },
    clear() { this.items = []; },
  },
});
