<template>
  <view class="bind-page">
    <view class="header">
      <view class="title">绑定你的宝贝 ❤️</view>
      <view class="subtitle">一对一专属，开启你们的浪漫菜单</view>
    </view>

    <view class="card">
      <view class="card-title">我要邀请 TA</view>
      <button class="btn-primary" @click="generateCode">生成邀请码</button>
      <view v-if="myCode" class="code-box">
        <view class="code">{{ myCode }}</view>
        <view class="hint">7 天内有效</view>
        <view class="qr-area">
          <canvas canvas-id="qrcode" id="qrcode" style="width:300rpx;height:300rpx" />
        </view>
        <view class="row">
          <button class="btn-outline" @click="copyCode">复制邀请码</button>
          <button class="btn-outline" open-type="share">分享给宝贝</button>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">我有邀请码</view>
      <input class="input" v-model="inputCode" placeholder="请输入 8 位邀请码" maxlength="8" />
      <button class="btn-primary" @click="bind">立即绑定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { coupleApi } from '@/api';

const myCode = ref('');
const inputCode = ref('');

async function generateCode() {
  uni.showLoading({ title: '生成中…' });
  try {
    const r = await coupleApi.invite();
    myCode.value = r.code;
    setTimeout(drawQrcode, 100);
  } finally {
    uni.hideLoading();
  }
}

function drawQrcode() {
  // 用 canvas 简单绘制（实际项目可引入 qrcode 库 / 后端返回 base64）
  // 这里画一个占位的码块图，鼓励用户使用「复制邀请码」或微信分享
  // @ts-ignore
  const ctx = uni.createCanvasContext('qrcode');
  ctx.setFillStyle('#fff');
  ctx.fillRect(0, 0, 300, 300);
  ctx.setFillStyle('#FF6FA0');
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if ((myCode.value.charCodeAt((i + j) % myCode.value.length) + i * j) % 3 === 0) {
        ctx.fillRect(i * 18 + 6, j * 18 + 6, 16, 16);
      }
    }
  }
  ctx.setFontSize(14);
  ctx.setFillStyle('#333');
  ctx.fillText(myCode.value, 110, 290);
  ctx.draw();
}

function copyCode() {
  uni.setClipboardData({ data: myCode.value });
}

async function bind() {
  if (!inputCode.value || inputCode.value.length !== 8) {
    uni.showToast({ title: '请输入 8 位邀请码', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '绑定中…' });
  try {
    await coupleApi.bind(inputCode.value.trim());
    uni.hideLoading();
    uni.showToast({ title: '绑定成功 ❤️', icon: 'success' });
    setTimeout(() => uni.reLaunch({ url: '/pages/menu/index' }), 800);
  } catch {
    uni.hideLoading();
  }
}

onMounted(() => {});
</script>

<style lang="scss" scoped>
.bind-page { padding: 32rpx; }
.header { text-align: center; padding: 40rpx 0 60rpx; }
.title { font-size: 44rpx; color: #FF6FA0; font-weight: 700; }
.subtitle { font-size: 26rpx; color: #999; margin-top: 14rpx; }

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 111, 160, 0.08);
}
.card-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 24rpx; }
.btn-primary {
  background: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  color: #fff; border-radius: 999rpx; font-size: 28rpx;
  width: 100%; padding: 22rpx 0;
}
.code-box { margin-top: 28rpx; text-align: center; }
.code {
  font-size: 56rpx; letter-spacing: 12rpx; color: #FF6FA0; font-weight: 700;
  background: #FFEEF4; padding: 20rpx 0; border-radius: 16rpx;
}
.hint { font-size: 22rpx; color: #aaa; margin-top: 10rpx; }
.qr-area { display: flex; justify-content: center; padding: 24rpx 0; }
.row { display: flex; gap: 20rpx; margin-top: 16rpx; }
.row .btn-outline { flex: 1; background: #fff; color: #FF6FA0; border: 2rpx solid #FF6FA0; border-radius: 999rpx; font-size: 26rpx; padding: 16rpx 0; }
.input {
  background: #FFF5F8; border-radius: 16rpx; padding: 24rpx;
  font-size: 30rpx; letter-spacing: 6rpx; text-align: center;
  margin-bottom: 24rpx;
}
</style>
