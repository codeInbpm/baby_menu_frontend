<template>
  <view class="page-root" :style="themeStore.themeStyle">
    <view class="skins-page">
      <!-- 预览区域 -->
      <view class="preview-header glass-card">
        <view class="preview-device">
          <view class="device-screen">
            <view class="mock-nav" :style="{ backgroundColor: 'var(--bg-color)' }">
              <view class="mock-status-bar"></view>
              <view class="mock-nav-content">
                <text class="mock-title" :style="{ color: 'var(--text-color)' }">预览效果</text>
              </view>
            </view>
            <view class="mock-body" :style="{ backgroundColor: 'var(--bg-color)' }">
              <view class="mock-card" :style="{ backgroundColor: 'var(--card-bg)', boxShadow: '0 4rpx 20rpx var(--card-shadow)' }">
                <view class="mock-line-lg" :style="{ background: 'var(--gradient)' }"></view>
                <view class="mock-line-md" :style="{ backgroundColor: 'var(--secondary-text)', opacity: 0.2 }"></view>
                <view class="mock-line-sm" :style="{ backgroundColor: 'var(--secondary-text)', opacity: 0.1 }"></view>
              </view>
              <view class="mock-btn" :style="{ background: 'var(--gradient)' }">确认风格</view>
            </view>
          </view>
        </view>
        <view class="preview-info">
          <text class="current-name">{{ currentSkinName }}</text>
          <text class="style-desc">{{ getStyleDesc(themeStore.currentSkinCode) }}</text>
        </view>
      </view>

      <view v-if="loading" class="loading-box">
        <wd-loading />
      </view>

      <view v-else class="skin-sections">
        <!-- 已拥有的皮肤 -->
        <view class="section-header">
          <view class="section-title">我的收藏</view>
          <view class="count-tag">{{ ownedSkins.length }}</view>
        </view>
        
        <view class="skin-list">
          <view 
            class="skin-card owned" 
            v-for="skin in ownedSkins" 
            :key="skin.id"
            :class="{ active: currentSkinCode === skin.code }"
            @click="selectSkin(skin)"
          >
            <view class="card-inner">
              <view class="preview-circle" :style="getCircleStyle(skin)">
                <wd-icon v-if="currentSkinCode === skin.code" name="check" size="24px" color="#FFF" />
              </view>
              <view class="skin-details">
                <text class="name">{{ skin.name }}</text>
                <text class="tag" v-if="currentSkinCode === skin.code">佩戴中</text>
                <text class="tag owned-tag" v-else>已解锁</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 待解锁的皮肤 -->
        <view class="section-header" v-if="availableSkins.length > 0">
          <view class="section-title">特权中心</view>
          <text class="subtitle">积分限时兑换高级风格</text>
        </view>

        <view class="skin-list">
          <view 
            class="skin-card locked" 
            v-for="skin in availableSkins" 
            :key="skin.id"
            @click="previewSkin(skin)"
          >
            <view class="card-inner">
              <view class="preview-circle" :style="getCircleStyle(skin)">
                <wd-icon name="lock-on" size="20px" color="rgba(255,255,255,0.6)" />
              </view>
              <view class="skin-details">
                <text class="name">{{ skin.name }}</text>
                <view class="price-row">
                  <text class="price">{{ skin.price }}</text>
                  <text class="unit">积分</text>
                </view>
              </view>
              <button class="redeem-btn-circle" @click.stop="handleRedeem(skin)">
                <wd-icon name="cart" size="18px" />
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { skinApi } from '@/api';
import { useThemeStore } from '@/store/theme';
import { useToast } from 'wot-design-uni';

const toast = useToast();
const themeStore = useThemeStore();

const loading = ref(true);
const allSkins = ref<any[]>([]);

const currentSkinCode = computed(() => themeStore.currentSkinCode);
const currentSkinName = computed(() => {
  const skin = ownedSkins.value.find(s => s.code === currentSkinCode.value);
  return skin ? skin.name : '默认风格';
});

// 已拥有的皮肤（包含默认）
const ownedSkins = computed(() => {
  const defaults = { id: 0, code: 'default', name: '默认风格', unlocked: true, previewImage: '', configJson: {
    "--primary-color": "#4A90E2",
    "--gradient": "linear-gradient(135deg, #74ABE2 0%, #4A90E2 100%)"
  } };
  const unlocked = allSkins.value.filter(s => s.unlocked);
  return [defaults, ...unlocked];
});

// 待解锁的皮肤
const availableSkins = computed(() => {
  return allSkins.value.filter(s => !s.unlocked);
});

onMounted(() => {
  loadSkins();
});

async function loadSkins() {
  loading.value = true;
  try {
    const list = await skinApi.list();
    allSkins.value = list || [];
  } catch (e) {
    toast.error('加载皮肤列表失败');
  } finally {
    loading.value = false;
  }
}

function getStyleDesc(code: string) {
  const descs: Record<string, string> = {
    'default': '清新简约的管家基础风格，沉稳而不失活力。',
    'black_gold': '至尊黑金配色，磨砂质感与流光溢彩的完美结合，彰显绝对品味。',
    'cyberpunk': '霓虹幻彩视觉，打破常规的赛博美学，属于未来的潮流先驱。',
    'mecha_tech': '硬核工业机甲风格，冷峻的金属质感与能量流光，科技感拉满。'
  };
  return descs[code] || '专属定制的高级主题风格。';
}

function getCircleStyle(skin: any) {
  const vars = skin.configJson || {};
  return {
    background: vars['--gradient'] || vars['--primary-color'] || '#4A90E2',
    boxShadow: `0 4rpx 15rpx ${vars['--card-shadow'] || 'rgba(0,0,0,0.1)'}`
  };
}

async function selectSkin(skin: any) {
  if (skin.code === currentSkinCode.value) return;
  
  uni.showLoading({ title: '切换中...' });
  try {
    await skinApi.set(skin.code);
    themeStore.setSkin(skin.code, skin.configJson || {});
    uni.hideLoading();
    toast.success('已切换至 ' + skin.name);
  } catch (e: any) {
    uni.hideLoading();
    toast.error(e.message || '切换失败');
  }
}

function previewSkin(skin: any) {
  themeStore.setSkin(skin.code, skin.configJson || {});
  toast.info('预览中：' + skin.name);
}

async function handleRedeem(skin: any) {
  uni.showModal({
    title: '风格兑换',
    content: `确认消耗 ${skin.price} 积分永久解锁「${skin.name}」风格吗？`,
    confirmText: '立即解锁',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '解锁中...' });
        try {
          await skinApi.exchange(skin.id);
          uni.hideLoading();
          toast.success('恭喜！已解锁高级风格');
          loadSkins();
          themeStore.setSkin(skin.code, skin.configJson || {});
        } catch (e: any) {
          uni.hideLoading();
          toast.error(e.message || '兑换失败');
        }
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.skins-page {
  padding: 40rpx 30rpx;
  min-height: 100vh;
}

/* 预览区域 */
.preview-header {
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 60rpx;
  background: var(--glass-bg);
  
  .preview-device {
    width: 220rpx;
    height: 400rpx;
    background: #000;
    border-radius: 40rpx;
    padding: 10rpx;
    border: 4rpx solid #333;
    flex-shrink: 0;
    
    .device-screen {
      width: 100%; height: 100%;
      background: #fff;
      border-radius: 30rpx;
      overflow: hidden;
      display: flex; flex-direction: column;
    }
  }
}

.mock-nav {
  height: 80rpx;
  display: flex; flex-direction: column;
  .mock-status-bar { height: 30rpx; }
  .mock-nav-content { flex: 1; display: flex; align-items: center; justify-content: center; .mock-title { font-size: 16rpx; font-weight: bold; } }
}

.mock-body {
  flex: 1; padding: 20rpx;
  display: flex; flex-direction: column; gap: 20rpx;
  
  .mock-card {
    padding: 15rpx; border-radius: 15rpx;
    display: flex; flex-direction: column; gap: 10rpx;
    .mock-line-lg { height: 10rpx; border-radius: 5rpx; width: 100%; }
    .mock-line-md { height: 8rpx; border-radius: 4rpx; width: 70%; }
    .mock-line-sm { height: 8rpx; border-radius: 4rpx; width: 40%; }
  }
  
  .mock-btn {
    margin-top: auto;
    height: 40rpx; border-radius: 20rpx;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14rpx; font-weight: bold;
  }
}

.preview-info {
  flex: 1;
  display: flex; flex-direction: column; gap: 20rpx;
  .current-name { font-size: 40rpx; font-weight: bold; color: var(--primary-color); }
  .style-desc { font-size: 24rpx; color: var(--secondary-text); line-height: 1.6; }
}

/* 列表区域 */
.section-header {
  display: flex; align-items: center; gap: 16rpx;
  margin-bottom: 30rpx;
  .section-title { font-size: 32rpx; font-weight: bold; color: var(--text-color); }
  .count-tag { 
    font-size: 20rpx; background: var(--primary-color); color: #fff; 
    padding: 2rpx 12rpx; border-radius: 20rpx; opacity: 0.8;
  }
  .subtitle { font-size: 24rpx; color: var(--secondary-text); margin-left: auto; }
}

.skin-list {
  display: flex; flex-direction: column; gap: 24rpx;
  margin-bottom: 60rpx;
}

.skin-card {
  padding: 24rpx;
  border-radius: 32rpx;
  background: var(--card-bg);
  border: 1rpx solid var(--border-color);
  box-shadow: 0 4rpx 15rpx var(--card-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.active {
    transform: scale(1.02);
    border-color: var(--primary-color);
    box-shadow: 0 10rpx 30rpx var(--card-shadow);
  }
  
  .card-inner {
    display: flex; align-items: center; gap: 30rpx;
  }
}

.preview-circle {
  width: 100rpx; height: 100rpx;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.5s ease;
}

.skin-details {
  flex: 1;
  display: flex; flex-direction: column; gap: 8rpx;
  .name { font-size: 30rpx; font-weight: bold; color: var(--text-color); }
  .tag { font-size: 18rpx; color: var(--primary-color); background: rgba(0,0,0,0.05); padding: 4rpx 12rpx; border-radius: 8rpx; align-self: flex-start; }
  .owned-tag { color: var(--secondary-text); }
  
  .price-row {
    display: flex; align-items: baseline; gap: 4rpx;
    .price { font-size: 32rpx; font-weight: bold; color: #FFD700; }
    .unit { font-size: 20rpx; color: var(--secondary-text); }
  }
}

.redeem-btn-circle {
  width: 70rpx; height: 70rpx; border-radius: 50%;
  background: var(--gradient);
  color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  padding: 0; margin: 0;
  box-shadow: 0 4rpx 12rpx var(--card-shadow);
  &:active { transform: scale(0.9); opacity: 0.8; }
}

.loading-box { padding: 100rpx 0; text-align: center; }
</style>
