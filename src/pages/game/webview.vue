<template>
  <view class="webview-container">
    <web-view :src="src" @message="handleMessage"></web-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { gameApi } from '@/api';

const src = ref('');
const gameCode = ref('');

onLoad((options: any) => {
  if (options.url) {
    src.value = decodeURIComponent(options.url);
  }
  if (options.code) {
    gameCode.value = options.code;
  }
});

async function handleMessage(e: any) {
  const data = e.detail.data[0];
  if (data && data.action === 'gameResult') {
    // 假设 H5 传回的数据格式为 { action: 'gameResult', score: 100, winnerId: 1 }
    await gameApi.record({
      gameCode: gameCode.value,
      winnerId: data.winnerId,
      scoreJson: JSON.stringify(data.scores || {}),
      comment: data.comment
    });
    uni.showToast({ title: '游戏成绩已同步', icon: 'success' });
  }
}
</script>

<style scoped>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>
