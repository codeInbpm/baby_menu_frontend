<template>
  <view 
    class="title-icon-container" 
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <!-- 背景光环层 -->
    <view v-if="rarity !== 'normal'" class="icon-halo" :class="rarity"></view>

    <!-- 若图标存在，使用 image 渲染 data URL -->
    <image 
      v-if="iconData"
      :src="svgDataUrl"
      class="title-svg"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></image>
    <!-- 兜底显示：当找不到对应图标时显示一个默认圆形 -->
    <image 
      v-else
      :src="fallbackSvgDataUrl"
      class="title-svg title-svg-fallback"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></image>

    <!-- 传说稀有度额外装饰（例如小星芒） -->
    <view v-if="rarity === 'legend'">
      <view class="legend-sparkle sparkle-1"></view>
      <view class="legend-sparkle sparkle-2"></view>
      <view class="legend-sparkle sparkle-3"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { titleIcons } from './iconData';

const props = defineProps({
  iconCode: { type: String, required: true },
  rarity: { type: String, default: 'normal' },
  size: { type: Number, default: 40 }
});

const iconData = computed(() => titleIcons[props.iconCode] || null);

const svgDataUrl = computed(() => {
  if (!iconData.value) return '';
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${iconData.value.svg}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svgStr)}`;
});

const fallbackSvgDataUrl = computed(() => {
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#E0E0E0" /><text x="50" y="55" font-size="20" text-anchor="middle" fill="#9E9E9E">?</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svgStr)}`;
});
</script>

<style scoped>
.title-icon-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.title-svg {
  display: block;
  z-index: 2;
  position: relative;
}

/* ================= 稀有度光环特效 ================= */
.icon-halo {
  position: absolute;
  top: -15%;
  left: -15%;
  width: 130%;
  height: 130%;
  border-radius: 50%;
  z-index: 1;
}

/* 稀有 (Rare) - 金色呼吸光效 */
.icon-halo.rare {
  background: radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,215,0,0) 70%);
  animation: rare-pulse 2.5s infinite alternate ease-in-out;
}

@keyframes rare-pulse {
  0% { transform: scale(0.9); opacity: 0.6; }
  100% { transform: scale(1.15); opacity: 1; }
}

/* 传说 (Legend) - 多彩全息旋转光环 */
.icon-halo.legend {
  background: conic-gradient(from 0deg, #FF69B4, #9370DB, #87CEFA, #FFD700, #FF69B4);
  filter: blur(10px);
  opacity: 0.75;
  animation: legend-spin 4s linear infinite;
}

@keyframes legend-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 传说特效：点缀星芒 */
.legend-sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #FFF;
  border-radius: 50%;
  box-shadow: 0 0 8px 3px rgba(255, 255, 255, 0.9);
  z-index: 3;
}

.sparkle-1 { top: -5%; right: -5%; animation: sparkle-blink 1.5s infinite; }
.sparkle-2 { bottom: 0%; left: -10%; animation: sparkle-blink 2s infinite 0.5s; }
.sparkle-3 { top: 40%; right: -20%; width: 4px; height: 4px; animation: sparkle-blink 1.8s infinite 1s; }

@keyframes sparkle-blink {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.5) rotate(45deg); }
}
</style>
