<template>
  <view class="frame-page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" color="#FFF" />
      </view>
      <view class="nav-title">专属头像框</view>
      <view class="placeholder"></view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <wd-loading />
    </view>
    
    <block v-else>
      <view class="preview-area">
        <swiper class="frame-swiper" :current="currentIndex" @change="onSwiperChange" previous-margin="80rpx" next-margin="80rpx">
          <swiper-item v-for="(frame, index) in frames" :key="frame.code">
            <view class="swiper-item-wrap" :class="{ 'active': currentIndex === index }">
              <AvatarWithFrame :avatarUrl="myAvatar" :frameCode="frame.code" :size="240" />
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="info-area" v-if="currentFrame">
        <view class="frame-name">{{ currentFrame.name }}</view>
        <view class="frame-desc">{{ currentFrame.styleDesc }}</view>
        <view class="frame-price">
          <text v-if="isOwned(currentFrame.code)" class="owned-tag">已拥有</text>
          <text v-else class="price-val">💎 {{ currentFrame.price }} 积分</text>
        </view>
      </view>

      <view class="action-area" v-if="currentFrame">
        <button v-if="isEquipped(currentFrame.code)" class="btn-equipped" @click="unequip">取消佩戴</button>
        <button v-else-if="isOwned(currentFrame.code)" class="btn-equip" @click="equip(currentFrame.code)">立即佩戴</button>
        <button v-else class="btn-buy" @click="buy(currentFrame)">兑换获取</button>
      </view>
    </block>

    <!-- 粒子特效容器 -->
    <view class="particles" v-if="showEffect"></view>

    <wd-toast id="wd-toast" />
    <wd-message-box id="wd-message-box" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { avatarFrameApi } from '@/api';
import { useToast, useMessage } from 'wot-design-uni';
import AvatarWithFrame from '@/components/AvatarWithFrame/AvatarWithFrame.vue';

const user = useUserStore();
const toast = useToast();
const messageBox = useMessage();

const myAvatar = computed(() => user.info?.avatar);

const loading = ref(true);
const frames = ref<any[]>([]);
const ownedCodes = ref<string[]>([]);
const currentEquipped = ref<string | null>(null);

const currentIndex = ref(0);
const currentFrame = computed(() => frames.value[currentIndex.value] || null);

const showEffect = ref(false);

function goBack() { uni.navigateBack(); }

async function loadData() {
  loading.value = true;
  try {
    const [listRes, myRes] = await Promise.all([
      avatarFrameApi.list(),
      avatarFrameApi.my()
    ]);
    frames.value = listRes;
    ownedCodes.value = myRes.ownedCodes || [];
    currentEquipped.value = myRes.currentCode || null;
    
    // 如果有佩戴的，默认滚动到佩戴的那个
    if (currentEquipped.value) {
      const idx = frames.value.findIndex(f => f.code === currentEquipped.value);
      if (idx !== -1) currentIndex.value = idx;
    }
  } catch (e) {
    toast.error('加载头像框失败');
  } finally {
    loading.value = false;
  }
}

function onSwiperChange(e: any) {
  currentIndex.value = e.detail.current;
}

function isOwned(code: string) { return ownedCodes.value.includes(code); }
function isEquipped(code: string) { return currentEquipped.value === code; }

async function buy(frame: any) {
  try {
    await messageBox.confirm({
      title: '确认兑换',
      content: `确定消耗 ${frame.price} 积分兑换「${frame.name}」头像框吗？`,
      confirmButtonText: '立即兑换'
    });

    toast.loading('兑换中...');
    await avatarFrameApi.buy(frame.code);
    toast.success('获得专属头像框！');
    
    ownedCodes.value.push(frame.code);
    playEffect();
  } catch (e: any) {
    if (e !== 'cancel') toast.error(e.message || '兑换失败');
  }
}

async function equip(code: string) {
  try {
    toast.loading('佩戴中...');
    await avatarFrameApi.equip(code);
    currentEquipped.value = code;
    toast.success('佩戴成功');
    playEffect();
  } catch (e: any) {
    toast.error(e.message || '操作失败');
  }
}

async function unequip() {
  try {
    toast.loading('取消中...');
    await avatarFrameApi.equip('');
    currentEquipped.value = null;
    toast.success('已取消佩戴');
  } catch (e: any) {
    toast.error(e.message || '操作失败');
  }
}

function playEffect() {
  showEffect.value = true;
  setTimeout(() => { showEffect.value = false; }, 2000);
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.frame-page {
  min-height: 100vh;
  background: #0f1220;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 100rpx 30rpx 20rpx;
  background: #0f1220;
  .nav-title { font-size: 32rpx; font-weight: bold; color: #FFF; }
  .placeholder { width: 48rpx; }
}

.loading-wrap { flex: 1; display: flex; justify-content: center; align-items: center; }

.preview-area {
  margin-top: 100rpx;
  height: 500rpx;
}
.frame-swiper { height: 100%; }
.swiper-item-wrap {
  height: 100%; display: flex; justify-content: center; align-items: center;
  transform: scale(0.8); transition: all 0.3s ease; opacity: 0.5;
}
.swiper-item-wrap.active {
  transform: scale(1.1); opacity: 1;
}

.info-area {
  padding: 60rpx 40rpx; text-align: center;
  flex: 1;
}
.frame-name { font-size: 48rpx; font-weight: bold; color: #d4af37; text-shadow: 0 4rpx 20rpx rgba(212,175,55,0.4); margin-bottom: 20rpx; }
.frame-desc { font-size: 26rpx; color: #a0a0a0; margin-bottom: 40rpx; line-height: 1.6; }
.owned-tag { color: #1FCB6A; background: rgba(31, 203, 106, 0.1); padding: 8rpx 24rpx; border-radius: 12rpx; font-size: 24rpx; font-weight: bold; }
.price-val { font-size: 40rpx; color: #FFD700; font-weight: bold; }

.action-area {
  padding: 40rpx 60rpx 80rpx;
  button {
    height: 100rpx; line-height: 100rpx; border-radius: 50rpx; font-size: 32rpx; font-weight: bold; border: none;
  }
  .btn-buy { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; box-shadow: 0 8rpx 24rpx rgba(255,111,160,0.4); }
  .btn-equip { background: linear-gradient(135deg, #d4af37, #f9e295); color: #000; box-shadow: 0 8rpx 24rpx rgba(212,175,55,0.4); }
  .btn-equipped { background: #333; color: #999; }
}

/* 简单的 CSS 粒子特效 */
.particles {
  position: absolute; inset: 0; pointer-events: none; z-index: 100;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 20%);
  background-size: 20rpx 20rpx;
  background-position: 0 0;
  animation: particleBurst 0.5s ease-out forwards;
}
@keyframes particleBurst {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(5); opacity: 0; }
}
</style>
