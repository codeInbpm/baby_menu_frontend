import { defineStore } from 'pinia';
import { skinApi } from '@/api';

import { useUserStore } from './user';

interface ThemeState {
  currentSkinCode: string;
  customVars: Record<string, string>;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentSkinCode: uni.getStorageSync('currentSkinCode') || 'default',
    customVars: uni.getStorageSync('customVars') || {},
  }),
  getters: {
    isOwner: () => {
      const userStore = useUserStore();
      return userStore.info?.roleInCouple === 'owner';
    },
    themeStyle: (state) => {
      const userStore = useUserStore();
      const isOwner = userStore.info?.roleInCouple === 'owner';
      
      // 如果不是管家角色，或者使用的是默认皮肤，则不注入额外 CSS 变量
      if (!isOwner || state.currentSkinCode === 'default') {
        return '';
      }
      
      let styleStr = '';
      for (const [key, val] of Object.entries(state.customVars)) {
        styleStr += `${key}: ${val};`;
      }
      return styleStr;
    }
  },
  actions: {
    setSkin(skinCode: string, configJson: Record<string, string>) {
      this.currentSkinCode = skinCode;
      this.customVars = configJson;
      uni.setStorageSync('currentSkinCode', skinCode);
      uni.setStorageSync('customVars', configJson);
      
      // 同步更新原生 TabBar 样式
      this.updateTabBarStyle();
    },
    updateTabBarStyle() {
      const isDark = this.currentSkinCode !== 'default';
      const bgColor = this.customVars['--tab-bg'] || (this.isOwner ? '#FFFFFF' : '#FFFFFF');
      const textColor = isDark ? '#888888' : '#999999';
      const selectedColor = this.customVars['--primary-color'] || (this.isOwner ? '#4A90E2' : '#FF6FA0');
      
      uni.setTabBarStyle({
        backgroundColor: bgColor,
        color: textColor,
        selectedColor: selectedColor,
        borderStyle: isDark ? 'black' : 'white'
      });
    },
    async initTheme() {
      try {
        const res = await skinApi.current();
        if (res && res.code) {
          this.setSkin(res.code, res.configJson || {});
        } else {
          this.updateTabBarStyle(); // 确保默认样式也应用
        }
      } catch (e) {
        console.error('初始化主题失败', e);
        this.updateTabBarStyle();
      }
    }
  }
});
