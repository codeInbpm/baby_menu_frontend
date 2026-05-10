<template>
  <view class="page-root" :style="themeStore.themeStyle">
    <view class="skins-page">
      <view class="header">
        <text class="title">我的个性皮肤</text>
        <text class="subtitle">选择专属主题，展示高级品味</text>
      </view>

      <view v-if="loading" class="loading-box">
        <wd-loading />
      </view>

      <view v-else class="skin-sections">
        <!-- 已拥有的皮肤 -->
        <view class="section-title" v-if="ownedSkins.length > 0">已解锁样式</view>
        <view class="skin-list">
          <view 
            class="skin-item owned" 
            v-for="skin in ownedSkins" 
            :key="skin.id"
            :class="{ active: currentSkinCode === skin.code }"
            @click="selectSkin(skin)"
          >
            <view class="preview-wrap">
              <image v-if="skin.previewImage" :src="skin.previewImage" class="preview-img" mode="aspectFill" />
              <view v-else class="default-preview">
                <text>默认风格</text>
              </view>
              <view class="check-mask" v-if="currentSkinCode === skin.code">
                <wd-icon name="check-bold" size="30px" color="#FFF" />
              </view>
            </view>
            <view class="skin-info">
              <text class="name">{{ skin.name }}</text>
              <text class="status" v-if="currentSkinCode === skin.code">佩戴中</text>
            </view>
          </view>
        </view>

        <!-- 待解锁的皮肤 -->
        <view class="section-title" v-if="availableSkins.length > 0">积分商城兑换</view>
        <view class="skin-list">
          <view 
            class="skin-item locked" 
            v-for="skin in availableSkins" 
            :key="skin.id"
            @click="previewSkin(skin)"
          >
            <view class="preview-wrap">
              <image :src="skin.previewImage" class="preview-img" mode="aspectFill" />
              <view class="price-mask">
                <text class="price">{{ skin.price }} 积分</text>
              </view>
            </view>
            <view class="skin-info">
              <text class="name">{{ skin.name }}</text>
              <button class="redeem-btn-mini" @click.stop="handleRedeem(skin)">兑换</button>
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

// 已拥有的皮肤（包含默认）
const ownedSkins = computed(() => {
  const defaults = { id: 0, code: 'default', name: '默认风格', unlocked: true, previewImage: '', configJson: {} };
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

async function selectSkin(skin: any) {
  if (skin.code === currentSkinCode.value) return;
  
  uni.showLoading({ title: '切换中...' });
  try {
    await skinApi.set(skin.code);
    themeStore.setSkin(skin.code, skin.configJson || {});
    uni.hideLoading();
    toast.success('切换成功！');
  } catch (e: any) {
    uni.hideLoading();
    toast.error(e.message || '切换失败');
  }
}

function previewSkin(skin: any) {
  // 临时应用主题预览
  themeStore.setSkin(skin.code, skin.configJson || {});
  toast.info('已开启临时预览，兑换后可永久保存');
}

async function handleRedeem(skin: any) {
  try {
    uni.showModal({
      title: '确认兑换',
      content: `确定消耗 ${skin.price} 积分兑换永久皮肤「${skin.name}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          uni.showLoading({ title: '兑换中...' });
          try {
            await skinApi.exchange(skin.id);
            uni.hideLoading();
            toast.success('兑换成功！');
            loadSkins(); // 刷新列表
            themeStore.setSkin(skin.code, skin.configJson || {}); // 兑换后自动应用
          } catch (e: any) {
            uni.hideLoading();
            toast.error(e.message || '兑换失败');
          }
        }
      }
    });
  } catch (e) {}
}

function goMall() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.skins-page {
  padding: 40rpx;
  min-height: 100vh;
}

.header {
  margin-bottom: 60rpx;
  .title {
    font-size: 40rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 10rpx;
  }
  .subtitle {
    font-size: 26rpx;
    opacity: 0.6;
  }
}

.loading-box {
  padding: 100rpx 0;
  display: flex; justify-content: center;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin: 40rpx 0 20rpx;
  color: var(--primary-color, #FF6FA0);
  &:first-child { margin-top: 0; }
}

.skin-list {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
}

.skin-item {
  width: calc(50% - 15rpx);
  border-radius: 24rpx;
  overflow: hidden;
  background: var(--card-bg, rgba(255,255,255,0.05));
  border: 4rpx solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &.active {
    border-color: var(--primary-color, #FF6FA0);
    transform: translateY(-4rpx);
    box-shadow: 0 10rpx 20rpx var(--card-shadow, rgba(0,0,0,0.1));
  }

  &.locked {
    filter: grayscale(0.2);
    &:active { transform: scale(0.98); }
  }
}

.preview-wrap {
  width: 100%;
  height: 240rpx;
  position: relative;
  background: var(--bg-color);
  opacity: 0.9;
  
  .preview-img {
    width: 100%;
    height: 100%;
  }
  
  .default-preview {
    width: 100%; height: 100%;
    display: flex; justify-content: center; align-items: center;
    background: var(--bg-color);
    color: var(--secondary-text);
    font-size: 28rpx;
  }
  
  .check-mask {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex; justify-content: center; align-items: center;
    animation: fadeIn 0.3s;
  }

  .price-mask {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: rgba(0,0,0,0.6);
    padding: 10rpx;
    text-align: center;
    .price { font-size: 22rpx; color: #FFD700; font-weight: bold; }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.skin-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  
  .name {
    font-size: 26rpx;
    font-weight: bold;
    display: block;
    color: var(--text-color);
  }
  .status {
    font-size: 18rpx;
    color: #fff;
    background: var(--primary-color, #FF6FA0);
    padding: 2rpx 12rpx;
    border-radius: 8rpx;
  }
  .redeem-btn-mini {
    margin: 0;
    width: 100%;
    height: 50rpx;
    line-height: 50rpx;
    font-size: 20rpx;
    background: var(--gradient);
    color: #fff;
    border-radius: 25rpx;
    border: none;
    box-shadow: 0 4rpx 10rpx var(--card-shadow);
  }
}

.empty-hint {
  margin-top: 100rpx;
  text-align: center;
  font-size: 26rpx;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  
  .go-mall-btn {
    margin-top: 40rpx;
    width: 240rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: var(--gradient, #FF6FA0);
    color: #fff;
    border-radius: 35rpx;
    font-size: 26rpx;
  }
}
</style>
