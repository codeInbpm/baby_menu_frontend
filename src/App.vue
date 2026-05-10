<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

import { useThemeStore } from '@/store/theme';

onLaunch(() => {
  const u = useUserStore();
  const t = useThemeStore();
  u.restore();
  if (u.token) {
    t.initTheme();
  }
});
</script>

<style lang="scss">
/* 全局主题变量 */
page {
  --primary-color: #FF6FA0;
  --bg-color: #FFF5F8;
  --card-bg: #FFFFFF;
  --text-color: #333333;
  --secondary-text: #999999;
  --gradient: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  --secondary-color: #A78BFA;
  --card-shadow: rgba(255, 111, 160, 0.08);
  --tab-bg: #FFFFFF;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --border-color: rgba(255, 255, 255, 0.2);
  --glow-color: transparent;
  
  background: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  color: var(--text-color);
  transition: background 0.4s ease, color 0.4s ease;
}

.page-root {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  position: relative;
  
  &::before {
    content: '';
    position: absolute; inset: 0;
    box-shadow: inset 0 0 100rpx var(--glow-color);
    pointer-events: none;
    opacity: 0.5;
  }
}

/* 管家主题 (蓝色系) */
.theme-owner {
  --primary-color: #4A90E2;
  --bg-color: #F0F7FF;
  --card-bg: #FFFFFF;
  --text-color: #333333;
  --secondary-text: #666666;
  --gradient: linear-gradient(135deg, #74ABE2 0%, #4A90E2 100%);
  --secondary-color: #5CACEB;
  --card-shadow: rgba(74, 144, 226, 0.12);
  --tab-bg: #FFFFFF;
}

/* 公主主题 (粉色系 - 默认) */
.theme-pet {
  --primary-color: #FF6FA0;
  --bg-color: #FFF5F8;
  --card-bg: #FFFFFF;
  --text-color: #333333;
  --secondary-text: #999999;
  --gradient: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  --secondary-color: #A78BFA;
  --card-shadow: rgba(255, 111, 160, 0.08);
  --tab-bg: #FFFFFF;
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }

.text-pink { color: var(--primary-color); }
.text-purple { color: var(--secondary-color); }
.bg-pink { background: var(--bg-color); }

.card {
  background: var(--card-bg);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx var(--card-shadow);
  color: var(--text-color);
}

.btn-primary {
  background: var(--gradient);
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  padding: 22rpx 60rpx;
  border: none;
  box-shadow: 0 6rpx 16rpx var(--card-shadow);
}
.btn-primary:active { opacity: .85; }

.btn-outline {
  background: #fff;
  color: var(--primary-color);
  border: 2rpx solid var(--primary-color);
  border-radius: 12rpx;
  font-size: 26rpx;
  padding: 12rpx 22rpx;
}

.heart {
  color: var(--primary-color);
}
</style>
