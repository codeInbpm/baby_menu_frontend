<template>
  <view class="game-entry-card" @click="goGames">
    <view class="card-content">
      <view class="icon-box">
        <text class="game-icon">🎮</text>
      </view>
      <view class="info-box">
        <text class="title">双人游戏中心</text>
        <text class="desc">甜蜜互动，记录属于你们的快乐时光</text>
      </view>
      <view class="go-btn">
        <text>查看</text>
        <wd-icon name="arrow-right" size="14px" color="#fff" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goGames() {
  uni.navigateTo({ url: '/pages/game/index' });
}
</script>

<style lang="scss" scoped>
.game-entry-card {
  margin: 30rpx 32rpx 32rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 32rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(79, 172, 254, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:active { opacity: 0.9; transform: scale(0.98); transition: all 0.2s; }
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-box {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24rpx;
  .game-icon { font-size: 40rpx; }
}

.info-box {
  flex: 1;
  .title { font-size: 30rpx; font-weight: bold; color: #fff; display: block; }
  .desc { font-size: 22rpx; color: rgba(255, 255, 255, 0.8); margin-top: 4rpx; display: block; }
}

.go-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  text { font-size: 22rpx; color: #fff; font-weight: bold; }
}
</style>
