<template>
  <view class="container">
    <view class="banner">
      <text class="title">💖 主动宠爱管家</text>
      <text class="desc">使用你的《公主主动服务卡》为管家送上温暖提醒，免除积分消耗。</text>
    </view>
    <view class="action">
      <button class="btn-primary" @click="startFreeMode">立即宠爱管家</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { requestSubscribe } from '@/utils/subscribe';

// 读取卡片ID，若未传入则直接返回
let cardId: number | null = null;

onLoad((options) => {
  if (options?.cardId) {
    cardId = Number(options.cardId);
  }
});

async function startFreeMode() {
  if (!cardId) {
    uni.showToast({ title: '卡片信息缺失', icon: 'none' });
    return;
  }
  const ok = await requestSubscribe();
  if (!ok) {
    uni.showToast({ title: '建议开启消息订阅，以免错过管家的提醒哦', icon: 'none' });
    // 这里不再强制中断，因为用户可能已经通过其他方式订阅或不想订阅，但为了体验最好还是提醒
  }
  // 跳转到菜单页面并携带参数，后端会识别免积分模式
  uni.navigateTo({
    url: `/pages/menu/index?from=princessServiceCard&cardId=${cardId}`,
  });
}
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
  padding: 40rpx;
}
.banner {
  text-align: center;
  margin-bottom: 80rpx;
  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: #ff1493;
  }
  .desc {
    font-size: 28rpx;
    color: #555;
    margin-top: 12rpx;
  }
}
.btn-primary {
  background: linear-gradient(135deg, #ff69b4, #9c27b0);
  color: #fff;
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
