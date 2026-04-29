<template>
  <view class="title-entry" @click="goTitle">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="content">
      <view class="left">
        <view class="title">情侣称号 <wd-icon name="medal" size="18px" color="#FFF" /></view>
        <view class="desc" v-if="currentTitle">当前佩戴：<text class="name">{{ currentTitle.titleName }}</text></view>
        <view class="desc" v-else>快去解锁你们的浪漫称号吧</view>
      </view>
      <view class="right">
        <view class="btn">查看 <wd-icon name="arrow-right" size="14px" /></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTitleStore } from '@/store/title';

const titleStore = useTitleStore();
const currentTitle = computed(() => titleStore.currentTitle);

function goTitle() {
  uni.navigateTo({ url: '/pages/title/index' });
}
</script>

<style lang="scss" scoped>
.title-entry {
  margin: 30rpx 30rpx 0;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.2);
  
  .bg-pattern {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    opacity: 0.1;
  }
  
  .content {
    position: relative;
    z-index: 1;
    padding: 30rpx 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .left {
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 8rpx;
    }
    .desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.85);
      .name {
        font-weight: bold;
        color: #FFD700;
        margin-left: 6rpx;
      }
    }
  }
  
  .right {
    .btn {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      padding: 10rpx 24rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 4rpx;
    }
  }
}
</style>
