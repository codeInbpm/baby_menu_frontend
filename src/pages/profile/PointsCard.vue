<template>
  <view class="points-card-module">
    <view class="card-wrap">
      <view class="hearts-bg">
        <text class="heart h1">❤️</text>
        <text class="heart h2">✨</text>
        <text class="heart h3">💕</text>
      </view>
      
      <view class="card-content">
        <view class="label">当前宠爱积分</view>
        <view class="points-display">
          <text class="num">{{ info?.currentPoints || 0 }}</text>
          <text class="limit">/ {{ info?.dailyLimit || 50 }}</text>
        </view>
        
        <view class="progress-bar">
          <view class="progress-inner" :style="{ width: percent + '%' }"></view>
        </view>
        
        <view class="status-text">
          今日还能给 {{ info?.partnerName || '管家' }} 发起 {{ info?.canRequestCount || 0 }} 次请求哦～
        </view>
      </view>
    </view>

    <!-- 分配积分按钮 -->
    <button class="btn-allocate" @click="openAllocate">
      <text class="btn-icon">🎁</text> 给管家点赞 (奖励积分)
    </button>

    <!-- 弹窗 -->
    <view class="modal-mask" v-if="showAllocate" @click="closeAllocate">
      <view class="modal-box" @click.stop="noop">
        <view class="modal-header">奖励专属管家 ✨</view>
        <view class="modal-body">
          <view class="balance-hint">
            您当前有 <text class="highlight">{{ info?.currentPoints || 0 }}</text> 宠爱积分。<br/>奖励将扣除您的个人余额哦～
          </view>
          <view class="input-group">
            <text class="label">要奖励的荣誉积分:</text>
            <input type="number" class="input" v-model="allocateForm.amount" placeholder="输入整数" />
          </view>
          <view class="input-group">
            <text class="label">附言留言:</text>
            <textarea class="textarea" v-model="allocateForm.note" placeholder="表现很好，赏你的！" :auto-height="true"></textarea>
          </view>
        </view>
        <view class="modal-footer">
          <button class="m-btn ghost" @click="closeAllocate">取消</button>
          <button class="m-btn primary" @click="confirmAllocate">发奖励 🏆</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointsStore } from '@/store/points';

const pointsStore = usePointsStore();

const info = computed(() => pointsStore.info);

// 计算进度条百分比
const percent = computed(() => {
  if (!info.value) return 0;
  const { currentPoints, dailyLimit } = info.value;
  if (!dailyLimit) return 0;
  return Math.min(100, Math.max(0, (currentPoints / dailyLimit) * 100));
});

const showAllocate = ref(false);
function openAllocate() { showAllocate.value = true; }
function closeAllocate() { showAllocate.value = false; }
function noop() {}

const allocateForm = ref({
  amount: '',
  note: ''
});

async function confirmAllocate() {
  const amountNum = parseInt(allocateForm.value.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '发送中...' });
  try {
    const noteToSend = allocateForm.value.note.trim() || '表现很好，赏你的！';
    await pointsStore.allocate(amountNum, noteToSend);
    uni.hideLoading();
    uni.showToast({ title: '奖励成功！', icon: 'success' });
    closeAllocate();
    allocateForm.value.amount = '';
    allocateForm.value.note = '';
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '操作失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.points-card-module {
  margin: 30rpx;
}

/* 核心大卡片 */
.card-wrap {
  position: relative;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%);
  border-radius: 36rpx;
  padding: 40rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 154, 158, 0.3);
  color: #fff;
}

.hearts-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  .heart { position: absolute; font-size: 40rpx; filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.1)); }
  .h1 { top: 20rpx; right: 30rpx; font-size: 80rpx; transform: rotate(15deg); }
  .h2 { bottom: 40rpx; right: 20rpx; font-size: 50rpx; transform: rotate(-20deg); }
  .h3 { top: 60rpx; left: 60rpx; font-size: 30rpx; opacity: 0.8; }
}

.card-content {
  position: relative;
  z-index: 1;
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.points-display {
  display: flex;
  align-items: baseline;
  margin-bottom: 30rpx;
  .num {
    font-size: 88rpx;
    font-weight: 900;
    line-height: 1;
    text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  }
  .limit {
    font-size: 32rpx;
    font-weight: 600;
    opacity: 0.8;
    margin-left: 12rpx;
  }
}

.progress-bar {
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  .progress-inner {
    height: 100%;
    background: #fff;
    border-radius: 8rpx;
    transition: width 0.3s ease;
  }
}

.status-text {
  font-size: 24rpx;
  opacity: 0.9;
  text-align: right;
}

/* 分配积分按钮 */
.btn-allocate {
  margin-top: 30rpx;
  background: #fff;
  color: #FF6FA0;
  font-weight: 700;
  font-size: 32rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05);
  border: 2rpx solid #FFF5F8;
  line-height: 1;
}
.btn-allocate::after { display: none; }
.btn-icon { margin-right: 12rpx; font-size: 36rpx; }

/* 弹窗样式 */
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  width: 600rpx; background: #fff; border-radius: 32rpx; padding: 40rpx;
}
.modal-header {
  font-size: 36rpx; font-weight: 700; color: #FF6FA0; text-align: center; margin-bottom: 24rpx;
}
.balance-hint {
  font-size: 24rpx; color: #666; text-align: center; margin-bottom: 30rpx; line-height: 1.5;
}
.balance-hint .highlight { color: #FF6FA0; font-weight: bold; font-size: 28rpx; margin: 0 4rpx; }
.input-group {
  margin-bottom: 24rpx;
}
.input-group .label {
  font-size: 28rpx; color: #555; margin-bottom: 12rpx; display: block;
}
.input, .textarea {
  width: 100%; box-sizing: border-box; background: #f9f9f9; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; color: #333;
}
.textarea { min-height: 120rpx; }
.modal-footer {
  display: flex; gap: 20rpx; margin-top: 40rpx;
}
.m-btn {
  flex: 1; padding: 20rpx 0; border-radius: 999rpx; font-size: 28rpx; display: flex; justify-content: center; align-items: center; line-height: 1;
}
.m-btn::after { display: none; }
.m-btn.ghost { background: #f2f2f2; color: #666; }
.m-btn.primary { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; font-weight: 600; box-shadow: 0 6rpx 16rpx rgba(255, 111, 160, 0.3); }
</style>
