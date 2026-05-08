<template>
  <view class="container">
    <view class="header">
      <text class="title">订阅消息设置</text>
      <text class="desc">打开小程序设置，手动开启所有订阅模板，确保能收到管家提醒。</text>
    </view>
    <view class="action">
      <button class="btn-primary" @click="openSetting">打开设置</button>
    </view>
  </view>
</template>

<script setup lang="ts">
function openSetting() {
  // @ts-ignore
  uni.openSetting({
    success(res) {
      console.log('openSetting success', res);
    },
    fail(err) {
      console.warn('openSetting fail', err);
    },
  });
}
</script>

<style scoped lang="scss">
.container {
  padding: 40rpx;
  background: var(--bg-color);
  min-height: 100vh;
}
.header {
  margin-bottom: 80rpx;
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #ff1493;
  }
  .desc {
    margin-top: 12rpx;
    font-size: 28rpx;
    color: #555;
  }
}
.btn-primary {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #ff69b4, #9c27b0);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
