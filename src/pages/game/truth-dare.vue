<template>
  <view class="game-page" :style="themeStore.themeStyle">
    <view class="game-header">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" color="#fff" />
      </view>
      <text class="title">真心话大冒险</text>
      <view class="history-btn" @click="showHistory">
        <wd-icon name="history" size="24px" color="#fff" />
      </view>
    </view>

    <view class="card-container">
      <view 
        class="main-card" 
        :class="[currentType, { flipping: isFlipping }]"
        @click="drawCard"
      >
        <view class="card-face front">
          <view class="card-content">
            <text class="type-badge">{{ currentType === 'truth' ? '真心话' : '大冒险' }}</text>
            <text class="question-text">{{ currentQuestion || '点击卡片开启挑战' }}</text>
          </view>
          <view class="card-footer" v-if="currentQuestion">
            <view class="complete-btn" @click.stop="recordSuccess">我完成了！</view>
          </view>
        </view>
        <view class="card-face back">
          <view class="logo-box">❤️</view>
          <text class="logo-text">Secret Card</text>
        </view>
      </view>
    </view>

    <view class="control-panel">
      <view class="type-selectors">
        <view 
          class="selector truth" 
          :class="{ active: mode === 'truth' }" 
          @click="mode = 'truth'"
        >
          <text>真心话</text>
        </view>
        <view 
          class="selector dare" 
          :class="{ active: mode === 'dare' }" 
          @click="mode = 'dare'"
        >
          <text>大冒险</text>
        </view>
        <view 
          class="selector mix" 
          :class="{ active: mode === 'mix' }" 
          @click="mode = 'mix'"
        >
          <text>随机抽</text>
        </view>
      </view>

      <view class="action-buttons">
        <view class="btn secondary" @click="skipWithKiss">
          <text>亲一口跳过</text>
        </view>
        <view class="btn primary" @click="drawCard">
          <text>抽取卡片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useThemeStore } from '@/store/theme';
import { gameApi } from '@/api';

const themeStore = useThemeStore();
const mode = ref('mix');
const currentType = ref('truth');
const currentQuestion = ref('');
const isFlipping = ref(false);

const questions = {
  truth: [
    "第一次见我时，你心里觉得我是个什么样的人？",
    "哪一瞬间你觉得自己非我不可？",
    "如果我们可以穿越回过去的一天，你选哪天？",
    "手机里有没有哪张我的照片是你偷偷看最多的？",
    "说出一个我最让你感动的细节。",
    "你觉得我身上最好闻的味道是什么？",
    "最后一次因为我哭是因为什么？",
    "你梦想中的求婚场景是什么样的？",
    "说出一件我不知道但你偷偷为我做的事。",
    "如果可以交换身体一天，你最想用我的身体做什么？"
  ],
  dare: [
    "保持对视30秒，不许笑，最后亲一下。",
    "用对方的手机，在朋友圈发一句“我好爱TA”。",
    "给对方做一个搞怪的鬼脸并拍照存证。",
    "背着对方绕客厅走一圈，边走边喊“我有全世界最棒的宝贝”。",
    "现场给对方唱一首情歌（副歌部分即可）。",
    "闭上眼，让对方在脸上画一个小爱心。",
    "抱着对方转三圈，不能放手。",
    "深情注视对方10秒，然后说：“今晚我想...”",
    "模仿对方平时撒娇的样子。",
    "向对方撒娇，直到对方说“原谅你”为止。"
  ]
};

function drawCard() {
  if (isFlipping.value) return;
  isFlipping.value = true;
  
  setTimeout(() => {
    let type = mode.value;
    if (type === 'mix') {
      type = Math.random() > 0.5 ? 'truth' : 'dare';
    }
    currentType.value = type;
    const list = questions[type as 'truth' | 'dare'];
    currentQuestion.value = list[Math.floor(Math.random() * list.length)];
    isFlipping.value = false;
  }, 600);
}

async function recordSuccess() {
  await gameApi.record({
    gameCode: 'truth_dare',
    comment: `完成挑战: ${currentQuestion.value}`
  });
  uni.showToast({ title: '记录成功 ❤️', icon: 'success' });
  currentQuestion.value = '';
}

function skipWithKiss() {
  uni.showToast({ title: '💋 豁免成功！', icon: 'none' });
  drawCard();
}

function goBack() { uni.navigateBack(); }
function showHistory() {
  uni.showToast({ title: '历史记录开发中', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.game-page {
  min-height: 100vh;
  background: #121212;
  padding: 40rpx;
  padding-top: calc(40rpx + var(--status-bar-height));
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60rpx;
  .title { color: #fff; font-size: 36rpx; font-weight: bold; }
}

.card-container {
  flex: 1;
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-card {
  width: 580rpx;
  height: 800rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.flipping { transform: rotateY(180deg); }
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.5);
}

.front {
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border: 4rpx solid rgba(255,255,255,0.1);
  
  .truth & { background: linear-gradient(145deg, #1e3c72, #2a5298); }
  .dare & { background: linear-gradient(145deg, #cb2d3e, #ef473a); }
}

.back {
  background: linear-gradient(145deg, #FF69B4, #9370DB);
  transform: rotateY(180deg);
  .logo-box { font-size: 120rpx; margin-bottom: 20rpx; }
  .logo-text { color: #fff; font-size: 32rpx; font-weight: bold; letter-spacing: 4rpx; }
}

.type-badge {
  font-size: 24rpx;
  background: rgba(255,255,255,0.2);
  color: #fff;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  margin-bottom: 40rpx;
}

.question-text {
  font-size: 44rpx;
  color: #fff;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
}

.card-footer {
  margin-top: 60rpx;
  .complete-btn {
    background: #fff;
    color: #000;
    padding: 20rpx 60rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.control-panel {
  margin-top: 60rpx;
}

.type-selectors {
  display: flex;
  background: rgba(255,255,255,0.05);
  border-radius: 999rpx;
  padding: 10rpx;
  margin-bottom: 40rpx;
  
  .selector {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    color: #666;
    font-size: 26rpx;
    border-radius: 999rpx;
    transition: all 0.3s;
    
    &.active { background: #fff; color: #000; font-weight: bold; }
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  
  .btn {
    flex: 1;
    height: 100rpx;
    border-radius: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30rpx;
    font-weight: bold;
    
    &.primary { background: #fff; color: #000; }
    &.secondary { background: rgba(255,255,255,0.1); color: #fff; }
  }
}
</style>
