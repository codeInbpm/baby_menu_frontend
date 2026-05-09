<template>
  <view class="pending-confession-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="bg-pattern"></view>
    
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" color="#FFF" />
      </view>
    </view>
    
    <view v-if="loading" class="loading-box">
      <wd-loading />
    </view>
    
    <view v-else-if="!record" class="empty-box">
      <text class="empty-emoji">🤷‍♀️</text>
      <text class="empty-text">当前没有待填写的告白任务哦～</text>
      <button class="back-btn" @click="goBack">返回上一页</button>
    </view>
    
    <view v-else class="confession-container">
      <view class="header-card">
        <text class="emoji-icon">🥺</text>
        <text class="title">你的管家使用了「公主告白券」</text>
        <text class="desc">他正满怀期待地等着你的甜蜜回应呢！快去夸夸他吧～\n(文字和语音至少填一项哦)</text>
      </view>
      
      <view class="input-section">
        <text class="section-title">写给他的情话：</text>
        <textarea 
          class="text-input" 
          v-model="content" 
          placeholder="亲爱的，我最喜欢你..." 
          :maxlength="1000"
        />
        <text class="word-count">{{ content.length }}/1000</text>
      </view>
      
      <view class="voice-section">
        <text class="section-title">录一段甜蜜语音：</text>
        
        <view v-if="voiceUrl" class="voice-player" @click="playVoice">
          <view class="play-btn" :class="{ 'playing': isPlaying }">
            <wd-icon :name="isPlaying ? 'pause' : 'play'" size="20px" color="#FFF" />
          </view>
          <text class="voice-text">{{ isPlaying ? '播放中...' : '点击试听' }}</text>
          <text class="re-record" @click.stop="clearVoice">重新录制</text>
        </view>
        
        <view v-else class="record-btn-wrap">
          <view 
            class="record-btn" 
            :class="{ 'recording': isRecording }"
            @touchstart="startRecord"
            @touchend="stopRecord"
            @touchcancel="stopRecord"
          >
            <wd-icon name="audio" size="30px" color="#FFF" />
            <text>{{ isRecording ? '松开结束' : '长按录音' }}</text>
          </view>
          <view class="ripple" v-if="isRecording"></view>
        </view>
      </view>
      
      <button class="submit-btn" :class="{ 'disabled': !canSubmit }" @click="submit">
        发送我的专属告白
      </button>
    </view>
    
    <!-- 提交成功的撒花特效层 -->
    <view v-if="showSuccess" class="success-overlay">
      <view class="success-content">
        <text class="success-emoji heartbeat">💖</text>
        <text class="success-title">告白已送达！</text>
        <text class="success-desc">管家收到一定会开心到飞起～</text>
      </view>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { confessionApi } from '@/api';
import { BASE_URL } from '@/utils/request';
import { useUserStore } from '@/store/user';
import { useToast } from 'wot-design-uni';

const toast = useToast();
const userStore = useUserStore();

const loading = ref(true);
const record = ref<any>(null);
const statusBarHeight = ref(44);

const content = ref('');
const voiceUrl = ref('');
const voiceTempPath = ref('');

const isRecording = ref(false);
const isPlaying = ref(false);
const showSuccess = ref(false);

const recorderManager = uni.getRecorderManager();
const innerAudioContext = uni.createInnerAudioContext();

const canSubmit = computed(() => {
  return content.value.trim().length > 0 || voiceUrl.value.length > 0;
});

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 44;

  loadPending();
  
  recorderManager.onStart(() => {
    isRecording.value = true;
  });
  
  recorderManager.onStop((res) => {
    isRecording.value = false;
    voiceTempPath.value = res.tempFilePath;
    uploadVoice(res.tempFilePath);
  });
  
  recorderManager.onError((err) => {
    isRecording.value = false;
    toast.error('录音失败，请检查权限');
  });
  
  innerAudioContext.onPlay(() => {
    isPlaying.value = true;
  });
  innerAudioContext.onEnded(() => {
    isPlaying.value = false;
  });
  innerAudioContext.onError((res) => {
    isPlaying.value = false;
    toast.error('语音播放失败');
  });
});

onUnmounted(() => {
  innerAudioContext.destroy();
});

async function loadPending() {
  loading.value = true;
  try {
    const res = await confessionApi.pending();
    record.value = res || null;
  } catch (e) {
    toast.error('加载待办任务失败');
  } finally {
    loading.value = false;
  }
}

function startRecord() {
  uni.vibrateShort(); // 震动反馈
  recorderManager.start({
    format: 'aac',
    duration: 60000 // 最长1分钟
  });
}

function stopRecord() {
  if (isRecording.value) {
    recorderManager.stop();
  }
}

function clearVoice() {
  voiceUrl.value = '';
  voiceTempPath.value = '';
  if (isPlaying.value) {
    innerAudioContext.stop();
  }
}

function playVoice() {
  if (isPlaying.value) {
    innerAudioContext.stop();
    return;
  }
  if (!voiceUrl.value) return;
  innerAudioContext.src = voiceUrl.value;
  innerAudioContext.play();
}

function uploadVoice(tempPath: string) {
  uni.showLoading({ title: '语音上传中...' });
  uni.uploadFile({
    url: BASE_URL + '/upload/voice',
    filePath: tempPath,
    name: 'file',
    header: { Authorization: 'Bearer ' + userStore.token },
    success: (r) => {
      uni.hideLoading();
      try {
        const body = JSON.parse(r.data);
        if (body.code === 0) {
          let url = body.data.url;
          voiceUrl.value = url.startsWith('http') ? url : BASE_URL.replace('/api', '') + url;
          toast.success('语音录制成功');
        } else {
          toast.error(body.message || '语音上传失败');
          clearVoice();
        }
      } catch { 
        toast.error('解析返回数据失败');
        clearVoice();
      }
    },
    fail: (e) => {
      uni.hideLoading();
      toast.error('上传网络错误');
      clearVoice();
    }
  });
}

async function submit() {
  if (!canSubmit.value) return;
  if (!record.value) return;
  
  uni.showLoading({ title: '发送中...' });
  try {
    await confessionApi.submit(record.value.id, {
      content: content.value,
      voiceUrl: voiceUrl.value
    });
    uni.hideLoading();
    
    // 显示特效
    showSuccess.value = true;
    setTimeout(() => {
      uni.navigateBack();
    }, 2500);
  } catch (e: any) {
    uni.hideLoading();
    toast.error(e.message || '发送失败');
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.pending-confession-page {
  min-height: 100vh;
  background: #1a1525;
  position: relative;
  overflow: hidden;
  color: #fff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 40rpx;
  position: relative; z-index: 2;
  .back-btn {
    padding: 10rpx 20rpx 10rpx 0;
  }
}

.bg-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(#FF69B4 2rpx, transparent 2rpx);
  background-size: 40rpx 40rpx;
  pointer-events: none;
}

.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  position: relative; z-index: 1;
}

.empty-box {
  .empty-emoji { font-size: 100rpx; margin-bottom: 20rpx; }
  .empty-text { font-size: 30rpx; color: rgba(255,255,255,0.6); margin-bottom: 60rpx; }
  .back-btn { background: #FF69B4; color: #fff; border-radius: 40rpx; padding: 0 60rpx; height: 80rpx; line-height: 80rpx; }
}

.confession-container {
  padding: 40rpx;
  position: relative; z-index: 1;
}

.header-card {
  background: linear-gradient(135deg, rgba(255,105,180,0.15) 0%, rgba(255,182,193,0.05) 100%);
  border: 2rpx solid rgba(255,105,180,0.3);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  margin-bottom: 40rpx;
  
  .emoji-icon { font-size: 80rpx; display: block; margin-bottom: 16rpx; }
  .title { font-size: 32rpx; font-weight: bold; color: #FFB6C1; margin-bottom: 16rpx; display: block; }
  .desc { font-size: 26rpx; color: rgba(255,255,255,0.8); line-height: 1.5; display: block; }
}

.section-title {
  font-size: 30rpx; font-weight: bold; color: #FF69B4; margin-bottom: 20rpx; display: block;
}

.input-section {
  background: rgba(255,255,255,0.05);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  position: relative;
  
  .text-input {
    width: 100%;
    height: 240rpx;
    font-size: 28rpx;
    color: #fff;
    line-height: 1.6;
  }
  
  .word-count {
    position: absolute;
    bottom: 20rpx; right: 30rpx;
    font-size: 22rpx;
    color: rgba(255,255,255,0.4);
  }
}

.voice-section {
  background: rgba(255,255,255,0.05);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 60rpx;
  
  .voice-player {
    display: flex; align-items: center; gap: 20rpx;
    background: rgba(255,105,180,0.15);
    padding: 16rpx 30rpx;
    border-radius: 100rpx;
    
    .play-btn {
      width: 60rpx; height: 60rpx; border-radius: 50%;
      background: #FF69B4; display: flex; align-items: center; justify-content: center;
      &.playing { box-shadow: 0 0 20rpx #FF69B4; }
    }
    .voice-text { font-size: 28rpx; color: #fff; flex: 1; }
    .re-record { font-size: 24rpx; color: #FFB6C1; text-decoration: underline; }
  }
  
  .record-btn-wrap {
    position: relative;
    display: flex; justify-content: center;
    padding: 20rpx 0;
  }
  
  .record-btn {
    width: 240rpx; height: 80rpx;
    background: linear-gradient(90deg, #FF69B4, #FF1493);
    border-radius: 40rpx;
    display: flex; align-items: center; justify-content: center; gap: 10rpx;
    font-size: 28rpx; font-weight: bold; color: #fff;
    position: relative; z-index: 2;
    transition: transform 0.1s;
    
    &.recording { transform: scale(0.95); }
  }
  
  .ripple {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 240rpx; height: 80rpx; border-radius: 40rpx;
    background: rgba(255,105,180,0.4);
    z-index: 1;
    animation: rippleAnim 1.5s infinite;
  }
}

@keyframes rippleAnim {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

.submit-btn {
  background: linear-gradient(135deg, #FF69B4, #FF1493);
  color: #fff;
  height: 90rpx; line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx; font-weight: bold;
  box-shadow: 0 10rpx 30rpx rgba(255,105,180,0.3);
  
  &.disabled {
    background: #555;
    color: #999;
    box-shadow: none;
  }
}

/* 提交成功覆盖层 */
.success-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 21, 37, 0.95);
  display: flex; justify-content: center; align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s;
  
  .success-content {
    display: flex; flex-direction: column; align-items: center;
    .success-emoji { font-size: 120rpx; margin-bottom: 30rpx; }
    .success-title { font-size: 40rpx; font-weight: bold; color: #FF69B4; margin-bottom: 20rpx; }
    .success-desc { font-size: 28rpx; color: rgba(255,255,255,0.8); }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.heartbeat { animation: heartbeat 1s infinite; }
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
