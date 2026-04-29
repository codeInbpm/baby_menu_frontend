<template>
  <view class="footprint-entry" @click="goFootprint">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="content">
      <view class="left">
        <view class="title">情侣足迹 <wd-icon name="location" size="18px" color="#FFF" /></view>
        <view class="desc">我们一起去过 <text class="count">{{ count }}</text> 个地方</view>
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
      .count {
        font-size: 30rpx;
        font-weight: bold;
        margin: 0 6rpx;
        color: #FFF;
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
