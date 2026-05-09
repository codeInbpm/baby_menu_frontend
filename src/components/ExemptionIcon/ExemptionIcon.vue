<template>
  <view class="icon-container" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <image :src="svgDataUri" class="svg-img" />
    <!-- 动态光效叠加 -->
    <view class="shimmer"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  size: { type: Number, default: 100 }
});

const svgContent = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 5 L15 20 V50 C15 75 50 95 50 95 C50 95 85 75 85 50 V20 L50 5Z" 
    fill="url(#goldGradient)" stroke="#FFD700" stroke-width="2"/>
  <path d="M50 35 L53 42 H60 L54 47 L56 54 L50 50 L44 54 L46 47 L40 42 H47 L50 35Z" fill="#FFF"/>
  <path d="M30 65 Q50 75 70 65" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"/>
  <defs>
    <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#F9E295"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
  </defs>
</svg>
`;

const svgDataUri = computed(() => {
  const encoded = encodeURIComponent(svgContent.trim())
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
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

.svg-img {
  width: 100%;
  height: 100%;
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
