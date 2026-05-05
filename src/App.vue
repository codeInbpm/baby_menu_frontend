<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

onLaunch(() => {
  const u = useUserStore();
  u.restore();
});
</script>

<style lang="scss">
/* 全局主题变量 */
page {
  --primary-color: #FF6FA0;
  --bg-color: #FFF5F8;
  --gradient: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  --secondary-color: #A78BFA;
  --card-shadow: rgba(255, 111, 160, 0.08);
  
  background: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s ease;
}

/* 管家主题 (蓝色系) */
.theme-owner {
  --primary-color: #4A90E2;
  --bg-color: #F0F7FF;
  --gradient: linear-gradient(135deg, #74ABE2 0%, #4A90E2 100%);
  --secondary-color: #5CACEB;
  --card-shadow: rgba(74, 144, 226, 0.12);
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
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx var(--card-shadow);
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
