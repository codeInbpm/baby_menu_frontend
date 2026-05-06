<template>
  <view class="owner-card-module">
    <!-- 专属管家卡片 -->
    <view class="card-wrap">
      <view class="achieve-badge" v-if="(info?.currentPoints || 0) > 0">🥇 本月最佳管家</view>
      <view class="hearts-bg">
        <text class="heart h1">💖</text>
        <text class="heart h2">🐾</text>
        <text class="heart h3">✨</text>
      </view>
      
      <view class="card-content">
        <view class="label">本月荣誉奖励积分</view>
        <view class="points-display">
          <text class="num" :class="{ 'highlight-jump': pointsStore.highlightOwnerPoints }">
            {{ info?.currentPoints ? Number(info.currentPoints) : 0 }}
          </text>
          <text class="limit">分</text>
        </view>
        
        <view class="hint-text">
          用积攒的荣誉积分给宝贝发红包充值！
        </view>
        
        <view class="reward-stats" v-if="(info?.rewardPoints || 0) > 0">
          🎉 累计获得专属奖励：<text class="highlight">{{ info?.rewardPoints ? Number(info.rewardPoints) : 0 }}</text> 积分
        </view>
      </view>
    </view>

    <!-- 分配积分按钮 -->
    <button class="btn-allocate" @click="openAllocate">
      <text class="btn-icon">🎁</text> 拿荣誉积分给宝贝发小金库
    </button>

    <!-- 弹窗 -->
    <view class="modal-mask" v-if="showAllocate" @click="closeAllocate">
      <view class="modal-box" @click.stop="noop">
        <view class="modal-header">充值发红包 ✨</view>
        <view class="modal-body">
          <view class="balance-hint">
            您当前有 <text class="highlight">{{ info?.currentPoints || 0 }}</text> 荣誉积分可用。
          </view>
          <view class="input-group">
            <text class="label">要发放的额度:</text>
            <input type="number" class="input" v-model="allocateForm.amount" placeholder="输入你想给宝贝的积分" />
          </view>
          <view class="input-group">
            <text class="label">附言留言:</text>
            <textarea class="textarea" v-model="allocateForm.note" placeholder="拿着去买服务吧，小宝贝～" :auto-height="true"></textarea>
          </view>
        </view>
        <view class="modal-footer">
          <button class="m-btn ghost" @click="closeAllocate">取消</button>
          <button class="m-btn primary" @click="confirmAllocate">送出 ❤️</button>
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
  uni.showLoading({ title: '充值中...' });
  try {
    const noteToSend = allocateForm.value.note.trim() || '拿着去买服务吧，小宝贝～';
    await pointsStore.allocate(amountNum, noteToSend);
    uni.hideLoading();
    uni.showToast({ title: '充值成功！', icon: 'success' });
    closeAllocate();
    allocateForm.value.amount = '';
    allocateForm.value.note = '';
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '充值失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.owner-card-module {
  margin: 30rpx;
}

/* 核心大卡片 */
.card-wrap {
  position: relative;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-radius: 36rpx;
  padding: 40rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.2);
  color: #fff;
}

.achieve-badge {
  position: absolute; top: 32rpx; right: 32rpx;
  background: rgba(255, 255, 255, 0.25);
  font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 999rpx;
  font-weight: bold; border: 1rpx solid rgba(255,255,255,0.4);
}

.hearts-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  opacity: 0.6;
  .heart { position: absolute; font-size: 40rpx; filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.1)); }
  .h1 { top: -10rpx; right: 20rpx; font-size: 80rpx; transform: rotate(15deg); }
  .h2 { bottom: 40rpx; right: -10rpx; font-size: 60rpx; transform: rotate(-20deg); }
  .h3 { top: 40rpx; left: 40rpx; font-size: 30rpx; opacity: 0.8; }
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

.highlight-jump {
  animation: numJump 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #FF1493 !important;
  text-shadow: 0 0 20rpx rgba(255, 20, 147, 0.8) !important;
}

@keyframes numJump {
  0% { transform: translateY(0) scale(1); }
  20% { transform: translateY(-20rpx) scale(1.3); }
  50% { transform: translateY(0) scale(1); }
  70% { transform: translateY(-10rpx) scale(1.15); }
  100% { transform: translateY(0) scale(1); }
}

.hint-text {
  font-size: 26rpx;
  opacity: 0.9;
  display: inline-block;
  background: rgba(255,255,255,0.25);
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  margin-top: 14rpx;
}

.reward-stats {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #fff;
  background: rgba(255, 20, 147, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  display: inline-block;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  .highlight { font-weight: bold; font-size: 32rpx; color: #FFD700; text-shadow: 0 2rpx 8rpx rgba(255,215,0,0.4); margin: 0 8rpx; }
}

/* 分配积分按钮 */
.btn-allocate {
  margin-top: 30rpx;
  background: #fff;
  color: #FF69B4;
  font-weight: 700;
  font-size: 30rpx;
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
  font-size: 24rpx; color: #666; text-align: center; margin-bottom: 30rpx;
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
