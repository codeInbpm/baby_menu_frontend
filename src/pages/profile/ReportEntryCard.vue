<template>
  <view class="report-entry" @click="goReport">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="content">
      <view class="left">
        <view class="title">宠爱报表 <wd-icon name="chart-pie" size="18px" color="#FFF" /></view>
        <view class="desc">查看属于你们的专属甜蜜数据</view>
      </view>
      <view class="right">
        <view class="btn">查看 <wd-icon name="arrow-right" size="14px" /></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goReport() {
  uni.navigateTo({ url: '/pages/report/index' });
}
</script>

<style lang="scss" scoped>
.report-entry {
  margin: 30rpx 30rpx 0;
  position: relative;
  background: linear-gradient(135deg, #B588F7 0%, #FF69B4 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.2);
  
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
