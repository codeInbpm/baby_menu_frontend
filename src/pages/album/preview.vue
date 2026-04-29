<template>
  <view class="preview-page" @click="goBack">
    <!-- 顶部状态栏 -->
    <view class="header">
      <text class="counter">{{ currentIndex + 1 }} / {{ albums.length }}</text>
    </view>
    
    <swiper class="swiper" :current="currentIndex" @change="onSwiperChange" :circular="false">
      <swiper-item v-for="(item, index) in albums" :key="item.id" class="swiper-item">
        <image class="main-img" :src="item.imageUrl" mode="aspectFit" @click.stop="goBack" />
      </swiper-item>
    </swiper>

    <!-- 底部详情栏 -->
    <view class="footer" v-if="currentItem" @click.stop>
      <view class="desc">{{ currentItem.description || '这一刻，无需言语…' }}</view>
      <view class="time">{{ formatTime(currentItem.createTime) }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

const albums = ref<any[]>([]);
const currentIndex = ref(0);

onLoad((options) => {
  if (options && options.current) {
    currentIndex.value = parseInt(options.current) || 0;
  }
  const eventChannel = getCurrentPages()[getCurrentPages().length - 1]?.getOpenerEventChannel();
  if (eventChannel && eventChannel.on) {
    eventChannel.on('acceptDataFromOpenerPage', (data: any) => {
      albums.value = data.data;
    });
  }
});

const currentItem = computed(() => albums.value[currentIndex.value] || null);

function onSwiperChange(e: any) {
  currentIndex.value = e.detail.current;
}

function formatTime(time: string) {
  if (!time) return '';
  return dayjs(time).format('YYYY年MM月DD日 HH:mm');
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.preview-page {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  position: absolute;
  top: env(safe-area-inset-top, 40rpx);
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
  padding-top: 40rpx;
  pointer-events: none;
}
.counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 32rpx;
  font-weight: 500;
  background: rgba(0,0,0,0.3);
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  backdrop-filter: blur(10px);
}

.swiper {
  flex: 1;
  width: 100%;
  height: 100%;
}
.swiper-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
.main-img {
  width: 100%;
  height: 100%;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40rpx 40rpx calc(env(safe-area-inset-bottom, 40rpx) + 40rpx);
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: #fff;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.desc {
  font-size: 30rpx;
  line-height: 1.5;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.5);
  font-weight: 300;
}
.time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
