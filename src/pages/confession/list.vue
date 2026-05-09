<template>
  <view class="confession-list-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" color="#FFF" />
      </view>
    </view>

    <view class="header">
      <text class="title">专属告白珍藏</text>
      <text class="subtitle">所有甜蜜的瞬间，都在这里永久保存</text>
    </view>

    <view v-if="loading" class="loading-box">
      <wd-loading />
    </view>

    <view v-else-if="list.length === 0" class="empty-box">
      <text class="empty-emoji">💌</text>
      <text class="empty-text">暂时还没有告白记录哦\n快去商城兑换告白券给公主吧～</text>
    </view>

    <view v-else class="list-container">
      <view class="record-card" v-for="item in list" :key="item.id">
        <view class="card-header">
          <text class="date">{{ formatTime(item.finishTime) }}</text>
          <text class="heart-icon">💕</text>
        </view>
        <view class="card-body">
          <text class="content" v-if="item.content">{{ item.content }}</text>
          
          <view class="voice-player" v-if="item.voiceUrl" @click="playVoice(item.voiceUrl, item.id)">
            <view class="play-btn" :class="{ 'playing': currentPlayingId === item.id }">
              <wd-icon :name="currentPlayingId === item.id ? 'pause' : 'play'" size="20px" color="#FFF" />
            </view>
            <text class="voice-text">{{ currentPlayingId === item.id ? '播放中...' : '点击聆听她的声音' }}</text>
            <view class="wave" v-if="currentPlayingId === item.id">
              <view class="bar"></view><view class="bar"></view><view class="bar"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { confessionApi } from '@/api';
import dayjs from 'dayjs';
import { useToast } from 'wot-design-uni';

const toast = useToast();
const list = ref<any[]>([]);
const loading = ref(true);
const statusBarHeight = ref(44);

const innerAudioContext = uni.createInnerAudioContext();
const currentPlayingId = ref<number | null>(null);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;

  loadList();
  
  innerAudioContext.onPlay(() => {
    // console.log('开始播放');
  });
  innerAudioContext.onEnded(() => {
    currentPlayingId.value = null;
  });
  innerAudioContext.onError((res) => {
    toast.error('语音播放失败');
    currentPlayingId.value = null;
  });
});

onUnmounted(() => {
  innerAudioContext.destroy();
});

async function loadList() {
  try {
    loading.value = true;
    const res = await confessionApi.list();
    list.value = res || [];
  } catch (e: any) {
    toast.error(e.message || '获取记录失败');
  } finally {
    loading.value = false;
  }
}

function formatTime(time: string) {
  return time ? dayjs(time).format('YYYY年MM月DD日 HH:mm') : '';
}

function playVoice(url: string, id: number) {
  if (currentPlayingId.value === id) {
    // 正在播放当前音频，则停止
    innerAudioContext.stop();
    currentPlayingId.value = null;
    return;
  }
  
  innerAudioContext.src = url;
  innerAudioContext.play();
  currentPlayingId.value = id;
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.confession-list-page {
  min-height: 100vh;
  background: #1a1525;
  padding: 0 40rpx 40rpx;
  color: #fff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  margin-bottom: 20rpx;
  .back-btn {
    padding: 10rpx 20rpx 10rpx 0;
  }
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  .title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #FF69B4;
    text-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.4);
    margin-bottom: 16rpx;
  }
  .subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
}

.empty-box {
  .empty-emoji {
    font-size: 100rpx;
    margin-bottom: 30rpx;
    opacity: 0.8;
  }
  .empty-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    line-height: 1.6;
  }
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.record-card {
  background: linear-gradient(135deg, rgba(255,105,180,0.1) 0%, rgba(255,182,193,0.05) 100%);
  border: 2rpx solid rgba(255,105,180,0.2);
  border-radius: 24rpx;
  padding: 30rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 6rpx;
    background: linear-gradient(90deg, #FF69B4, #FFB6C1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx dashed rgba(255,255,255,0.1);
  
  .date {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
  }
  .heart-icon {
    font-size: 32rpx;
    animation: heartbeat 2s infinite;
  }
}

.card-body {
  .content {
    display: block;
    font-size: 30rpx;
    color: #fff;
    line-height: 1.6;
    margin-bottom: 24rpx;
    white-space: pre-wrap;
    letter-spacing: 1rpx;
  }
  
  .voice-player {
    display: flex;
    align-items: center;
    background: rgba(255,105,180,0.15);
    border-radius: 100rpx;
    padding: 16rpx 30rpx;
    gap: 20rpx;
    width: max-content;
    max-width: 100%;
    cursor: pointer;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.98);
      background: rgba(255,105,180,0.25);
    }
    
    .play-btn {
      width: 50rpx; height: 50rpx;
      border-radius: 50%;
      background: #FF69B4;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      
      &.playing {
        box-shadow: 0 0 15rpx #FF69B4;
      }
    }
    
    .voice-text {
      font-size: 26rpx;
      color: #FFB6C1;
    }
    
    .wave {
      display: flex;
      align-items: center;
      gap: 6rpx;
      height: 30rpx;
      
      .bar {
        width: 4rpx;
        background: #FF69B4;
        border-radius: 2rpx;
        animation: wave 1s infinite ease-in-out;
        
        &:nth-child(1) { height: 40%; animation-delay: 0s; }
        &:nth-child(2) { height: 100%; animation-delay: 0.2s; }
        &:nth-child(3) { height: 60%; animation-delay: 0.4s; }
      }
    }
  }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}
</style>
