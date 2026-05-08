<template>
  <view class="footprint-entry" @click="goFootprint">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="card-bg">
      <view class="blob blob1"></view>
      <view class="blob blob2"></view>
    </view>
    <view class="content">
      <view class="left">
        <text class="icon">🗺️</text>
        <view class="text-info">
          <view class="title">情侣足迹</view>
          <view class="desc">我们一起去过 <text class="count">{{ count }}</text> 个地方</view>
        </view>
      </view>
      <view class="right">
        <view class="btn">出发 <wd-icon name="arrow-right" size="14px" /></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { footprintApi } from '@/api';

const count = ref(0);

onShow(() => {
  fetchCount();
});

async function fetchCount() {
  try {
    const res = await footprintApi.list();
    count.value = res.length;
  } catch (e) {}
}

function goFootprint() {
  uni.navigateTo({ url: '/pages/footprint/index' });
}
</script>

<style lang="scss" scoped>
.footprint-entry {
  margin: 30rpx 30rpx 0;
  position: relative;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 154, 158, 0.2);
  
  .bg-pattern {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    opacity: 0.15;
  }
  
  .card-bg {
    position: absolute; inset: 0; z-index: 0;
    
    .blob {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.15); filter: blur(20rpx);
    }
    .blob1 {
      width: 250rpx; height: 250rpx; top: -80rpx; left: -50rpx;
      animation: blobAnim1 8s infinite alternate ease-in-out;
    }
    .blob2 {
      width: 180rpx; height: 180rpx; bottom: -50rpx; right: 10%;
      animation: blobAnim2 6s infinite alternate ease-in-out;
    }
  }
  
  @keyframes blobAnim1 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(60rpx, 40rpx) scale(1.1); }
  }
  @keyframes blobAnim2 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-50rpx, -30rpx) scale(1.2); }
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
        .count {
          font-size: 30rpx;
          font-weight: bold;
          margin: 0 6rpx;
          color: #FFF;
        }
      }
    }
  }
  
  .right {
    .btn {
      background: rgba(255, 255, 255, 0.3);
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
