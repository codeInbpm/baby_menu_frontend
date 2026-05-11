import { defineStore } from 'pinia';
import { skinApi } from '@/api';

import { useUserStore } from './user';

interface ThemeState {
  currentSkinCode: string;
  customVars: Record<string, string>;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => {
    const savedSkin = uni.getStorageSync('currentSkinCode') || 'default';
    let savedVars = uni.getStorageSync('customVars') || {};
    
    if (typeof savedVars === 'string') {
      try {
        savedVars = JSON.parse(savedVars);
      } catch (e) {
        savedVars = {};
      }
    }
    
    return {
      currentSkinCode: savedSkin,
      customVars: savedVars,
    };
  },
  getters: {
    isOwner: () => {
      const userStore = useUserStore();
      return userStore.info?.roleInCouple === 'owner';
    },
    themeStyle: (state) => {
      const userStore = useUserStore();
      const role = userStore.info?.roleInCouple;
      const isOwner = role === 'owner';
      
      // 默认主题变量
      const defaults: Record<string, string> = isOwner ? {
        '--primary-color': '#4A90E2',
        '--bg-color': '#F0F7FF',
        '--card-bg': '#FFFFFF',
        '--text-color': '#333333',
        '--secondary-text': '#666666',
        '--gradient': 'linear-gradient(135deg, #74ABE2 0%, #4A90E2 100%)',
        '--card-shadow': 'rgba(74, 144, 226, 0.12)',
        '--tab-bg': '#FFFFFF',
        '--border-color': 'rgba(74, 144, 226, 0.1)',
        '--glow-color': 'transparent'
      } : {
        '--primary-color': '#FF6FA0',
        '--bg-color': '#FFF5F8',
        '--card-bg': '#FFFFFF',
        '--text-color': '#333333',
        '--secondary-text': '#999999',
        '--gradient': 'linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%)',
        '--card-shadow': 'rgba(255, 111, 160, 0.08)',
        '--tab-bg': '#FFFFFF',
        '--border-color': 'rgba(255, 255, 255, 0.2)',
        '--glow-color': 'transparent'
      };

      // 如果是管家且使用了个性皮肤，合并变量
      let finalVars = { ...defaults };
      if (isOwner && state.currentSkinCode !== 'default') {
        const custom = state.customVars || {};
        finalVars = { ...finalVars, ...custom };
      }
      
      // 强制包含基础背景变量以防万一
      if (!finalVars['--bg-color']) finalVars['--bg-color'] = defaults['--bg-color'];
      if (!finalVars['--card-bg']) finalVars['--card-bg'] = defaults['--card-bg'];
      if (!finalVars['--text-color']) finalVars['--text-color'] = defaults['--text-color'];
      
      return Object.entries(finalVars).map(([k, v]) => `${k}: ${v}`).join('; ') + ';';
    }
  },
  actions: {
    setSkin(skinCode: string, configJson: any) {
      this.currentSkinCode = skinCode;
      
      let parsedConfig = configJson;
      if (typeof configJson === 'string') {
        try {
          parsedConfig = JSON.parse(configJson);
        } catch (e) {
          parsedConfig = {};
        }
      }
      
      this.customVars = parsedConfig || {};
      uni.setStorageSync('currentSkinCode', skinCode);
      uni.setStorageSync('customVars', this.customVars);
      
      // 同步更新原生样式
      this.updateTabBarStyle();
      this.updateNavigationStyle();
    // 延迟一点执行，防止页面切换过程中调用
     setTimeout(() => {
         this.updateTabBarStyle();
         this.updateNavigationStyle();
     }, 100);
    },
    updateTabBarStyle() {
      try {
        const isDark = this.currentSkinCode !== 'default';
        const bgColor = this.customVars['--tab-bg'] || (isDark ? '#1A1A1A' : '#FFFFFF');
        const textColor = isDark ? '#AAAAAA' : '#999999';
        const selectedColor = this.customVars['--primary-color'] || (this.isOwner ? '#4A90E2' : '#FF6FA0');

        uni.setTabBarStyle({
          backgroundColor: bgColor,
          color: textColor,
          selectedColor: selectedColor,
          borderStyle: isDark ? 'black' : 'white'
        });
      } catch (e) {
        // 忽略非 TabBar 页面调用的报错
        console.warn('TabBar style update skipped:', e);
      }
    },
    updateNavigationStyle() {
      if (this.currentSkinCode === 'default') {
        try {
          uni.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#FFF5F8',
            animation: { duration: 400, timingFunc: 'easeIn' }
          });
        } catch (e) {}
        return;
      }
      
      const bgColor = this.customVars['--bg-color'] || '#000000';
      const isDarkBg = true; // 专家皮肤通常都是深色系
      
      try {
        uni.setNavigationBarColor({
          frontColor: isDarkBg ? '#ffffff' : '#000000',
          backgroundColor: bgColor,
          animation: { duration: 400, timingFunc: 'easeIn' }
        });
      } catch (e) {}
    },
    async initTheme() {
      try {
        const res = await skinApi.current();
        if (res && res.code) {
          this.setSkin(res.code, res.configJson || {});
        } else {
          this.updateTabBarStyle();
          this.updateNavigationStyle();
        }
      } catch (e) {
        console.error('初始化主题失败', e);
        this.updateTabBarStyle();
        this.updateNavigationStyle();
      }
    }
  }
});
