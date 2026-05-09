<template>
  <view class="title-entry" @click="goTitle">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="card-bg">
      <view class="light-beam"></view>
    </view>
    <view class="content">
      <view class="left">
        <text class="icon">👑</text>
        <view class="text-info">
          <view class="title">情侣称号</view>
          <view class="desc" v-if="currentTitle">当前佩戴：<text class="name">{{ currentTitle.titleName }}</text></view>
          <view class="desc" v-else>快去解锁你们的浪漫称号吧</view>
        </view>
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

  .card-bg {
    position: absolute; inset: 0; z-index: 0;

    .light-beam {
      position: absolute;
      width: 100rpx;
      height: 300%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      top: -100%;
      left: -50%;
      transform: rotate(30deg);
      animation: sweepBeam 4s infinite linear;
    }
  }

  @keyframes sweepBeam {
    0% { left: -50%; }
    50%, 100% { left: 150%; }
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
    display: flex;
    align-items: center;

    .icon {
      font-size: 56rpx;
      margin-right: 20rpx;
      filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
    }

    .text-info {
      display: flex;
      flex-direction: column;

      .title {
        font-size: 32rpx;
        font-weight: bold;
        color: #FFF;
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 4rpx;
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
