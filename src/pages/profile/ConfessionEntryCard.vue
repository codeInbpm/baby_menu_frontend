<template>
  <view class="confession-entry" @click="onClick">
    <image class="bg-pattern" src="/static/bg-pattern.png" mode="aspectFill" />
    <view class="card-bg">
      <view class="heart-pulse-bg" :class="{ 'pulsing': pending }"></view>
    </view>
    <view class="content">
      <view class="left">
        <text class="icon">{{ pending ? '🥺' : '💌' }}</text>
        <view class="badge" v-if="pending"></view>
        <view class="text-info">
          <view class="title">
            {{ pending ? '待回应的专属告白' : '专属告白墙' }}
            <text class="tag" v-if="pending">待处理</text>
          </view>
          <view class="desc">{{ pending ? '管家使用了告白券，快去给他一个甜蜜的回复吧！' : '这里珍藏着你们每一次的双向奔赴与心动语音。' }}</view>
        </view>
      </view>
      <view class="right">
        <view class="btn">{{ pending ? '去回应' : '查看' }} <wd-icon name="arrow-right" size="14px" /></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { confessionApi } from '@/api';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const pending = ref(false);

async function checkPending() {
  if (!user.bound || user.info?.roleInCouple !== 'pet') {
    pending.value = false;
    return;
  }
  try {
    const res = await confessionApi.pending();
    pending.value = !!res;
  } catch (e) {
    pending.value = false;
  }
}

onMounted(() => {
  checkPending();
});

onShow(() => {
  checkPending();
});

function onClick() {
  if (pending.value) {
    uni.navigateTo({ url: '/pages/confession/pending' });
  } else {
    uni.navigateTo({ url: '/pages/confession/list' });
  }
}
</script>

<style lang="scss" scoped>
.confession-entry {
  margin: 30rpx 30rpx 0;
  position: relative;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 154, 158, 0.3);
  
  .bg-pattern {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    opacity: 0.1;
  }
  
  .card-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    
    .heart-pulse-bg {
      position: absolute;
      width: 200%; height: 200%;
      top: -50%; left: -50%;
      background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%);
      opacity: 0.5;
      
      &.pulsing {
        animation: pulseBg 1.5s infinite alternate;
      }
    }
  }

  @keyframes pulseBg {
    0% { transform: scale(1); opacity: 0.3; }
    100% { transform: scale(1.1); opacity: 0.6; }
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
    display: flex;
    align-items: center;
    position: relative;
    
    .icon {
      font-size: 56rpx;
      margin-right: 20rpx;
      filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
    }
    
    .badge {
      position: absolute;
      left: 45rpx;
      top: -5rpx;
      width: 16rpx;
      height: 16rpx;
      background: #FF1493;
      border-radius: 50%;
      border: 2rpx solid #fff;
    }
    
    .text-info {
      display: flex;
      flex-direction: column;
      
      .title {
        font-size: 32rpx;
        font-weight: bold;
        color: #FFF;
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 4rpx;
        
        .tag {
          font-size: 18rpx; color: #FF1493; background: #FFF;
          padding: 2rpx 10rpx; border-radius: 6rpx;
          font-weight: bold;
        }
      }
      .desc {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.9);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      }
    }
  }
  
  .right {
    flex-shrink: 0;
    margin-left: 20rpx;
    .btn {
      background: rgba(255, 255, 255, 0.25);
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
