<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

onLaunch(() => {
  const u = useUserStore();
  u.restore();
});
</script>

<style lang="scss">
/* 全局粉紫暖色系 */
page {
  background: #FFF5F8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  color: #333;
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }

.text-pink { color: #FF6FA0; }
.text-purple { color: #A78BFA; }
.bg-pink { background: #FFEEF4; }

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 111, 160, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  padding: 22rpx 60rpx;
  border: none;
}
.btn-primary:active { opacity: .85; }

.btn-outline {
  background: #fff;
  color: #1FCB6A;
  border: 2rpx solid #1FCB6A;
  border-radius: 12rpx;
  font-size: 26rpx;
  padding: 12rpx 22rpx;
}

.heart {
  color: #FF6FA0;
}
</style>
