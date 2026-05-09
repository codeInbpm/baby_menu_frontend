<template>
  <view class="bucket-entry-card" @click="goToBucketList">
    <view class="card-bg">
      <view class="wave"></view>
    </view>
    <view class="content">
      <view class="left">
        <text class="icon">📝</text>
        <view class="text-info">
          <text class="title">共同待办清单</text>
          <text class="subtitle">属于我们的小心愿</text>
        </view>
      </view>
      <view class="right">
        <text class="arrow">出发 &gt;</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goToBucketList() {
  uni.navigateTo({
    url: '/pages/bucket/index'
  });
}
</script>

<style lang="scss" scoped>
.bucket-entry-card {
  margin: 0 32rpx 32rpx;
  background: linear-gradient(135deg, #FFD194 0%, #70E1F5 100%);
  border-radius: 28rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(112, 225, 245, 0.2);
  height: 140rpx;

  &:active {
    transform: scale(0.98);
  }
}

.card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  .wave {
    position: absolute;
    width: 200%;
    height: 200%;
    background: rgba(255,255,255,0.15);
    border-radius: 40%;
    top: -100%;
    left: -50%;
    animation: waveAnim 10s linear infinite;
  }
}

@keyframes waveAnim {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40rpx;
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
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
    }

    .subtitle {
      font-size: 24rpx;
      color: rgba(255,255,255,0.9);
      margin-top: 4rpx;
    }
  }
}

.right {
  .arrow {
    background: rgba(255,255,255,0.25);
    backdrop-filter: blur(8rpx);
    color: #fff;
    font-size: 24rpx;
    padding: 8rpx 24rpx;
    border-radius: 999rpx;
    font-weight: 600;
  }
}
</style>
