import { defineStore } from 'pinia';

interface UserInfo {
  id?: number;
  nickname?: string;
  avatar?: string;
  coupleId?: number | null;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '' as string,
    info: {} as UserInfo,
    partner: null as UserInfo | null,
    bound: false,
  }),
  actions: {
    setLogin(token: string, user: UserInfo, bound: boolean) {
      this.token = token;
      this.info = user;
      this.bound = bound;
      uni.setStorageSync('token', token);
      uni.setStorageSync('user', user);
    },
    setPartner(p: UserInfo | null) { this.partner = p; },
    restore() {
      this.token = uni.getStorageSync('token') || '';
      this.info = uni.getStorageSync('user') || {};
      this.bound = !!this.info.coupleId;
    },
    logout() {
      this.token = '';
      this.info = {};
      this.partner = null;
      this.bound = false;
      uni.removeStorageSync('token');
      uni.removeStorageSync('user');
    },
  },
});
