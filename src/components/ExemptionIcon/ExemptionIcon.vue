<template>
  <view class="icon-container" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <svg :width="size + 'rpx'" :height="size + 'rpx'" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 盾牌主体 -->
      <path d="M50 5 L15 20 V50 C15 75 50 95 50 95 C50 95 85 75 85 50 V20 L50 5Z" 
        fill="url(#goldGradient)" stroke="#FFD700" stroke-width="2"/>
      
      <!-- 中心装饰：爱心 + 星星 -->
      <path d="M50 35 L53 42 H60 L54 47 L56 54 L50 50 L44 54 L46 47 L40 42 H47 L50 35Z" fill="#FFF"/>
      
      <!-- 底部装饰线 -->
      <path d="M30 65 Q50 75 70 65" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"/>
      
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stop-color="#D4AF37"/>
          <stop offset="50%" stop-color="#F9E295"/>
          <stop offset="100%" stop-color="#B8860B"/>
        </linearGradient>
      </defs>
    </svg>
    
    <!-- 动态光效叠加 -->
    <view class="shimmer"></view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  size: { type: Number, default: 100 }
});
</script>

<style scoped>
.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.shimmer {
  position: absolute;
  top: -50%;
  left: -150%;
  width: 50%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(25deg);
  animation: shimmer-effect 3s infinite;
}

@keyframes shimmer-effect {
  0% { left: -150%; }
  20% { left: 150%; }
  100% { left: 150%; }
}
</style>
