<template>
  <view class="avatar-wrapper" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <!-- 基础头像图片 -->
    <image class="base-avatar" :src="avatarUrl || '/static/love.png'" mode="aspectFill" :class="frameCode" />
    
    <!-- 边框装饰层 -->
    <view v-if="frameCode" class="frame-layer" :class="'frame-' + frameCode">
      <!-- 针对不同边框的额外装饰元素 -->
      
      <!-- CYBER_MECHA 专属角标 -->
      <block v-if="frameCode === 'CYBER_MECHA'">
        <view class="mecha-corner top-left"></view>
        <view class="mecha-corner bottom-right"></view>
        <view class="mecha-scanner"></view>
      </block>
      
      <!-- DARK_GOLD 专属流光 -->
      <block v-if="frameCode === 'DARK_GOLD'">
        <view class="gold-shine"></view>
      </block>
      
      <!-- ROMANCE_HEART 专属爱心和皇冠 -->
      <block v-if="frameCode === 'ROMANCE_HEART'">
        <view class="crown">👑</view>
        <view class="floating-heart h1">❤️</view>
        <view class="floating-heart h2">💖</view>
      </block>

      <!-- NEON_PUNK 专属故障闪烁 -->
      <block v-if="frameCode === 'NEON_PUNK'">
        <view class="glitch-box cyan"></view>
        <view class="glitch-box magenta"></view>
      </block>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  avatarUrl: { type: String, default: '' },
  frameCode: { type: String, default: '' },
  size: { type: Number, default: 120 }
});
</script>

<style lang="scss" scoped>
.avatar-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 50%;
}

.base-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  transition: all 0.3s;
}

/* 框架外层，覆盖在头像上方 */
.frame-layer {
  position: absolute;
  top: -15%;
  left: -15%;
  width: 130%;
  height: 130%;
  pointer-events: none;
  border-radius: 50%;
  box-sizing: border-box;
}

/* 1. 机甲科技 (CYBER_MECHA) */
.frame-CYBER_MECHA {
  border: 4rpx solid #00f3ff;
  box-shadow: 0 0 20rpx rgba(0, 243, 255, 0.6), inset 0 0 10rpx rgba(0, 243, 255, 0.4);
  /* 制作切角效果 */
  clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
  border-radius: 0;
}
.base-avatar.CYBER_MECHA {
  clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
  border-radius: 0;
}
.mecha-corner {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border: 4rpx solid #fff;
}
.mecha-corner.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.mecha-corner.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }
.mecha-scanner {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 4rpx;
  background: rgba(0, 243, 255, 0.8);
  box-shadow: 0 0 10rpx #00f3ff;
  animation: scan 3s linear infinite;
}
@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 2. 深邃黑金 (DARK_GOLD) */
.frame-DARK_GOLD {
  border: 6rpx solid #2a2a2a;
  background: radial-gradient(circle at top left, transparent 60%, rgba(212, 175, 55, 0.15) 100%);
  box-shadow: 0 0 16rpx rgba(0,0,0,0.8), inset 0 0 8rpx rgba(212, 175, 55, 0.5);
}
.frame-DARK_GOLD::before {
  content: '';
  position: absolute;
  inset: -6rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #8B6508 100%) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.gold-shine {
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 215, 0, 0.4) 50%, transparent 60%);
  animation: goldShine 4s infinite linear;
}
@keyframes goldShine {
  0% { transform: translate(-30%, -30%) rotate(45deg); }
  100% { transform: translate(30%, 30%) rotate(45deg); }
}

/* 3. 浪漫守护 (ROMANCE_HEART) */
.frame-ROMANCE_HEART {
  border: 8rpx solid #FFB6C1;
  box-shadow: 0 0 24rpx rgba(255, 105, 180, 0.4), inset 0 0 12rpx rgba(255, 182, 193, 0.5);
  background: radial-gradient(circle, transparent 70%, rgba(255, 192, 203, 0.2) 100%);
}
.crown {
  position: absolute;
  top: -20rpx;
  left: 50%;
  transform: translateX(-50%) rotate(-10deg);
  font-size: 40rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.2));
  animation: floatCrown 2s infinite alternate ease-in-out;
}
@keyframes floatCrown {
  0% { transform: translateX(-50%) rotate(-10deg) translateY(0); }
  100% { transform: translateX(-50%) rotate(0deg) translateY(-8rpx); }
}
.floating-heart {
  position: absolute;
  font-size: 24rpx;
  animation: floatHeart 3s infinite linear;
}
.floating-heart.h1 { bottom: 10rpx; right: -10rpx; animation-delay: 0s; font-size: 30rpx; }
.floating-heart.h2 { top: 40rpx; left: -20rpx; animation-delay: 1.5s; }
@keyframes floatHeart {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-20rpx) scale(1.2); opacity: 1; }
  100% { transform: translateY(-40rpx) scale(1); opacity: 0; }
}

/* 4. 赛博朋克 (NEON_PUNK) */
.frame-NEON_PUNK {
  border: 6rpx solid #fff;
  border-radius: 20%;
  box-shadow: 
    0 0 10rpx #fff,
    inset 0 0 10rpx #fff,
    0 0 20rpx #0ff,
    inset 0 0 20rpx #0ff,
    0 0 40rpx #f0f,
    inset 0 0 40rpx #f0f;
  animation: neonFlicker 2s infinite alternate;
}
.base-avatar.NEON_PUNK {
  border-radius: 20%;
}
.glitch-box {
  position: absolute;
  inset: -6rpx;
  border-radius: 20%;
  border: 6rpx solid;
  pointer-events: none;
  opacity: 0.7;
}
.glitch-box.cyan {
  border-color: #0ff;
  transform: translate(-4rpx, 4rpx);
  animation: glitchCyan 3s infinite;
}
.glitch-box.magenta {
  border-color: #f0f;
  transform: translate(4rpx, -4rpx);
  animation: glitchMagenta 2.5s infinite;
}
@keyframes neonFlicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { box-shadow: 0 0 10rpx #fff, inset 0 0 10rpx #fff, 0 0 20rpx #0ff, inset 0 0 20rpx #0ff, 0 0 40rpx #f0f, inset 0 0 40rpx #f0f; }
  20%, 24%, 55% { box-shadow: none; border-color: #333; }
}
@keyframes glitchCyan {
  0%, 100% { transform: translate(-4rpx, 4rpx); clip-path: inset(10% 0 80% 0); }
  20% { transform: translate(4rpx, -2rpx); clip-path: inset(80% 0 10% 0); }
  40% { transform: translate(-4rpx, 2rpx); clip-path: inset(40% 0 40% 0); }
  60% { transform: translate(2rpx, 4rpx); clip-path: inset(60% 0 20% 0); }
  80% { transform: translate(-2rpx, -4rpx); clip-path: inset(20% 0 60% 0); }
}
@keyframes glitchMagenta {
  0%, 100% { transform: translate(4rpx, -4rpx); clip-path: inset(80% 0 10% 0); }
  20% { transform: translate(-4rpx, 2rpx); clip-path: inset(10% 0 80% 0); }
  40% { transform: translate(4rpx, -2rpx); clip-path: inset(60% 0 20% 0); }
  60% { transform: translate(-2rpx, -4rpx); clip-path: inset(40% 0 40% 0); }
  80% { transform: translate(2rpx, 4rpx); clip-path: inset(20% 0 60% 0); }
}

</style>
