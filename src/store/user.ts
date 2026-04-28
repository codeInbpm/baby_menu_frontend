import { defineStore } from 'pinia';

interface UserInfo {
  id?: number;
  nickname?: string;
  avatar?: string;
  coupleId?: number | null;
}

interface UserState {
  token: string;
  info: any;
  bound: boolean;
  partner: any;
  coupleInfo: any;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || '',
    info: uni.getStorageSync('user_info') || null,
    bound: uni.getStorageSync('bound') || false,
    partner: uni.getStorageSync('partner') || null,
    coupleInfo: uni.getStorageSync('coupleInfo') || null,
  }),
  actions: {
    setLogin(token: string, user: UserInfo, bound: boolean) {
      this.token = token;
      this.info = user;
      this.bound = bound;
      uni.setStorageSync('token', token);
      uni.setStorageSync('user_info', user);
      uni.setStorageSync('bound', bound);
    },
    setPartner(partner: UserInfo | null) {
      this.partner = partner;
      uni.setStorageSync('partner', partner);
    },
    setCoupleInfo(couple: any) {
      this.coupleInfo = couple;
      uni.setStorageSync('coupleInfo', couple);
    },
    restore() {
      this.token = uni.getStorageSync('token') || '';
      this.info = uni.getStorageSync('user_info') || null;
      this.bound = uni.getStorageSync('bound') || false;
      this.partner = uni.getStorageSync('partner') || null;
      this.coupleInfo = uni.getStorageSync('coupleInfo') || null;
    },
    logout() {
      this.token = '';
      this.info = null;
      this.partner = null;
      this.bound = false;
      uni.removeStorageSync('token');
      uni.removeStorageSync('user');
    },
  },
});
