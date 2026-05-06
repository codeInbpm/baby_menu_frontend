import { defineStore } from 'pinia';
import { pointsApi } from '@/api';

interface PointsInfo {
  currentPoints: number;
  dailyLimit: number;
  todayUsed: number;
  remainingToday: number;
  canRequestCount: number;
  partnerName: string;
}

export const usePointsStore = defineStore('points', {
  state: () => ({
    info: null as PointsInfo | null,
    transactions: [] as any[],
    highlightOwnerPoints: false,
  }),
  actions: {
    async fetchInfo() {
      try {
        const res = await pointsApi.info();
        this.info = res;
      } catch (e) {
        console.error('Fetch Points Info Error:', e);
      }
    },
    async fetchTransactions() {
      try {
        const res = await pointsApi.transactions();
        this.transactions = res || [];
      } catch (e) {
        console.error('Fetch Transactions Error:', e);
      }
    },
    async allocate(amount: number, note: string) {
      await pointsApi.allocate({ amount, note });
      // 成功后重新拉取
      await this.fetchInfo();
      await this.fetchTransactions();
    }
  }
});
