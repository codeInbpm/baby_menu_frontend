<template>
  <view class="page-root" :style="themeStore.themeStyle">
    <view class="header">
      <view class="title-group" @click="goBack">
        <view class="back-icon-wrap">
          <wd-icon name="arrow-left" size="24px" color="var(--text-color)" />
        </view>
        <view class="text-wrap">
          <text class="main-title">甜蜜游乐场</text>
          <text class="sub-title">Our Secret Playground</text>
        </view>
      </view>
      <view class="stats-card">
        <view class="stat-item">
          <text class="value">{{ statsSummary.totalPlays }}</text>
          <text class="label">累计局数</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item">
          <text class="value">{{ statsSummary.matchRate }}%</text>
          <text class="label">默契值</text>
        </view>
      </view>
    </view>

    <view class="game-grid">
      <view 
        v-for="game in games" 
        :key="game.code" 
        class="game-card"
        :class="game.code"
        @click="startGame(game)"
      >
        <view class="card-glass"></view>
        <view class="game-icon-box">
          <image :src="game.icon" mode="aspectFit" class="game-icon" />
        </view>
        <view class="game-info">
          <text class="game-name">{{ game.name }}</text>
          <text class="game-desc">{{ game.description }}</text>
        </view>
        <view class="play-badge">
          <text>GO</text>
        </view>
      </view>
    </view>

    <view class="leaderboard-section">
      <view class="section-header">
        <text class="section-title">情侣数据统计</text>
      </view>
      <view class="rank-list">
        <view v-for="stat in gameStats" :key="stat.gameCode" class="rank-item">
          <text class="game-label">{{ getGameName(stat.gameCode) }}</text>
          <view class="stat-bars">
            <view class="bar butler" :style="{ flex: stat.butlerWins || 1 }">管家 {{ stat.butlerWins }}</view>
            <view class="bar princess" :style="{ flex: stat.princessWins || 1 }">公主 {{ stat.princessWins }}</view>
          </view>
        </view>
        <view v-if="!gameStats.length" class="empty">玩一局游戏开启统计吧~</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useThemeStore } from '@/store/theme';
import { gameApi } from '@/api';

const themeStore = useThemeStore();
const games = ref<any[]>([]);
const gameStats = ref<any[]>([]);

const statsSummary = computed(() => {
  let total = 0;
  if (gameStats.value && Array.isArray(gameStats.value)) {
    gameStats.value.forEach(s => total += s.totalPlays);
  }
  return {
    totalPlays: total,
    matchRate: total > 0 ? Math.min(100, 60 + total * 2) : 0
  };
});

async function loadData() {
  try {
    games.value = await gameApi.list() || [];
    gameStats.value = await gameApi.stats() || [];
  } catch (e) {
    console.error('Failed to load game data:', e);
  }
}

function getGameName(code: string) {
  return games.value.find(g => g.code === code)?.name || code;
}

function startGame(game: any) {
  if (game.type === 'H5') {
    uni.navigateTo({ url: `/pages/game/webview?url=${encodeURIComponent(game.url)}&code=${game.code}` });
  } else {
    // 处理 NATIVE 路由，代码中的下划线换成中划线匹配 pages.json
    const route = game.code.replace('_', '-');
    uni.navigateTo({ url: `/pages/game/${route}` });
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/menu/index' });
    }
  });
}

onShow(loadData);
</script>

<style lang="scss" scoped>
.page-root {
  min-height: 100vh;
  background: var(--bg-color);
  padding: 40rpx 30rpx;
  padding-top: calc(40rpx + var(--status-bar-height));
}

.header {
  margin-bottom: 50rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title-group {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .back-icon-wrap {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  }
  
  .main-title {
    font-size: 48rpx;
    font-weight: 800;
    background: linear-gradient(135deg, #FF69B4, #9370DB);
    -webkit-background-clip: text;
    color: transparent;
    display: block;
  }
  
  .sub-title {
    font-size: 24rpx;
    color: var(--secondary-text);
    opacity: 0.6;
    letter-spacing: 2rpx;
  }
}

.stats-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20rpx);
  padding: 20rpx 40rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  
  .stat-item {
    text-align: center;
    .value { font-size: 36rpx; font-weight: bold; color: var(--text-color); display: block; }
    .label { font-size: 20rpx; color: var(--secondary-text); }
  }
  
  .divider {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 30rpx;
  }
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.game-card {
  position: relative;
  height: 280rpx;
  border-radius: 40rpx;
  overflow: hidden;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
  background: #333; // Fallback
  
  &:active { transform: scale(0.95); }
  
  .card-glass {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
    backdrop-filter: blur(8rpx);
    z-index: 1;
  }
  
  .game-icon-box {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 100rpx;
    height: 100rpx;
    z-index: 2;
    
    .game-icon { width: 100%; height: 100%; filter: drop-shadow(0 10rpx 15rpx rgba(0,0,0,0.2)); }
  }
  
  .game-info {
    position: relative;
    z-index: 2;
    
    .game-name { font-size: 30rpx; font-weight: bold; color: #fff; display: block; margin-bottom: 6rpx; }
    .game-desc { font-size: 18rpx; color: rgba(255,255,255,0.7); }
  }
  
  .play-badge {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    width: 50rpx;
    height: 50rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    text { font-size: 18rpx; font-weight: 900; color: #333; }
  }
  
  &.gomoku { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
  &.truth_dare { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
  &.draw_guess { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
  &.spot_diff { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  &.link_game { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); }
  &.match3 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
}

.leaderboard-section {
  background: var(--card-bg);
  border-radius: 40rpx;
  padding: 30rpx;
  border: 1rpx solid rgba(255,255,255,0.05);
  
  .section-title { font-size: 32rpx; font-weight: bold; color: var(--text-color); display: block; margin-bottom: 30rpx; }
}

.rank-item {
  margin-bottom: 24rpx;
  .game-label { font-size: 24rpx; color: var(--secondary-text); margin-bottom: 12rpx; display: block; }
}

.stat-bars {
  height: 40rpx;
  display: flex;
  border-radius: 20rpx;
  overflow: hidden;
  font-size: 20rpx;
  color: #fff;
  line-height: 40rpx;
  text-align: center;
  
  .butler { background: #4080F0; transition: all 0.5s; }
  .princess { background: #FF69B4; transition: all 0.5s; }
}

.empty { text-align: center; padding: 40rpx; font-size: 24rpx; color: var(--secondary-text); }
</style>
