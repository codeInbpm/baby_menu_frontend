<template>
  <view class="bind-page">
    <view class="header">
      <view class="title">绑定你的宝贝 ❤️</view>
      <view class="subtitle">一对一专属，开启你们的浪漫菜单</view>
    </view>

    <view class="card">
      <view class="card-title">我要邀请 TA</view>
      <button v-if="!myCode" class="btn-primary" @click="generateCode">生成邀请码</button>
      
      <view v-if="myCode" class="code-box">
        <view class="code-label">专属邀请码</view>
        <view class="code">{{ myCode }}</view>
        <view class="hint">有效期 7 天，请尽快绑定</view>
        
        <view class="qr-section">
          <canvas canvas-id="qrcode" id="qrcode" class="qr-canvas" />
          <view class="qr-tip">长按或截图保存二维码分享</view>
        </view>

        <view class="share-actions">
          <button class="btn-share-main" open-type="share">
            <wd-icon name="chat" size="18px" /> 分享给宝贝
          </button>
          <view class="sub-actions">
            <button class="btn-sub" @click="copyCode">复制码</button>
            <button class="btn-sub" @click="copyLink">复制链接</button>
            <button class="btn-sub" @click="showShareModal = true">手动分享</button>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">我有邀请码</view>
      <view class="input-wrapper">
        <input class="input" v-model="inputCode" placeholder="请输入 8 位邀请码" maxlength="8" />
        <view class="input-hint" v-if="inputCode">准备好绑定了吗？✨</view>
      </view>
      <button class="btn-primary" @click="bind">立即绑定</button>
    </view>

    <!-- 降级方案弹窗 -->
    <wd-popup v-model="showShareModal" position="center" closable custom-style="padding: 40rpx; border-radius: 24rpx; width: 80%;">
      <view class="fallback-modal">
        <view class="f-title">分享说明</view>
        <view class="f-content">
          由于小程序未认证，微信直接分享功能可能受限。建议使用以下方式：
        </view>
        <view class="f-steps">
          1. <text class="bold" @click="copyCode">复制邀请码</text> 发送给 TA<br/>
          2. 截图上方二维码发送给 TA<br/>
          3. TA 进入后在下方输入框粘贴绑定
        </view>
        <button class="btn-primary mini" @click="showShareModal = false">知道了</button>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { coupleApi } from '@/api';

const myCode = ref('');
const inputCode = ref('');
const showShareModal = ref(false);

// 处理来自分享的邀请码
onLoad((options) => {
  if (options.inviteCode) {
    inputCode.value = options.inviteCode;
    uni.showToast({ title: '已自动填充邀请码 ✨', icon: 'none' });
  }
});

// 微信分享到好友
onShareAppMessage((res) => {
  return {
    title: '来和我一起开启专属情侣菜单吧 ❤️',
    path: `/pages/bind/index?inviteCode=${myCode.value}`,
    imageUrl: '/static/share-card.png',
    desc: '我已经为你准备好了专属菜单，快来绑定成为我的宝贝～'
  };
});

// 微信分享到朋友圈
onShareTimeline(() => {
  return {
    title: '属于我们的浪漫空间，等一个 TA 来绑定 ❤️',
    query: `inviteCode=${myCode.value}`,
    imageUrl: '/static/share-card.png'
  };
});

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
  uni.setClipboardData({ 
    data: myCode.value,
    success: () => uni.showToast({ title: '邀请码已复制' })
  });
}

function copyLink() {
  // 兜底方案：一键复制完整链接
  const link = `pages/bind/index?inviteCode=${myCode.value}`;
  uni.setClipboardData({ 
    data: link,
    success: () => uni.showToast({ title: '分享路径已复制' })
  });
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
</script>

<style lang="scss" scoped>
.bind-page { 
  padding: 32rpx; 
  background: #fffafa;
  min-height: 100vh;
}
.header { text-align: center; padding: 40rpx 0 60rpx; }
.title { font-size: 44rpx; color: #FF6FA0; font-weight: 700; }
.subtitle { font-size: 26rpx; color: #999; margin-top: 14rpx; }

.card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 30rpx rgba(255, 111, 160, 0.1);
}
.card-title { 
  font-size: 32rpx; 
  font-weight: 600; 
  color: #333; 
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  &:before {
    content: '';
    width: 8rpx;
    height: 32rpx;
    background: #FF6FA0;
    border-radius: 4rpx;
    margin-right: 16rpx;
  }
}
.btn-primary {
  background: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  color: #fff; border-radius: 999rpx; font-size: 28rpx;
  width: 100%; padding: 22rpx 0;
  box-shadow: 0 10rpx 20rpx rgba(255, 111, 160, 0.3);
  &.mini { padding: 14rpx 0; margin-top: 24rpx; }
}
.code-box { 
  text-align: center; 
}
.code-label { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }
.code {
  font-size: 64rpx; letter-spacing: 16rpx; color: #FF6FA0; font-weight: 700;
  background: #FFEEF4; padding: 24rpx 0; border-radius: 20rpx;
  font-family: 'Courier New', Courier, monospace;
}
.hint { font-size: 22rpx; color: #bbb; margin-top: 16rpx; }

.qr-section {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .qr-canvas { width: 300rpx; height: 300rpx; }
  .qr-tip { font-size: 20rpx; color: #ccc; margin-top: 8rpx; }
}

.share-actions {
  margin-top: 40rpx;
  .btn-share-main {
    background: #FF6FA0;
    color: #fff;
    border-radius: 999rpx;
    font-size: 30rpx;
    padding: 24rpx 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;
  }
  .sub-actions {
    display: flex;
    gap: 16rpx;
    .btn-sub {
      flex: 1;
      background: #fff;
      color: #FF6FA0;
      border: 1px solid #FF6FA0;
      border-radius: 999rpx;
      font-size: 24rpx;
      padding: 14rpx 0;
    }
  }
}

.input-wrapper {
  margin-bottom: 24rpx;
  .input {
    background: #FFF5F8; border-radius: 20rpx; padding: 28rpx;
    font-size: 32rpx; letter-spacing: 8rpx; text-align: center;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    &:focus { border-color: #FF6FA0; }
  }
  .input-hint { font-size: 22rpx; color: #FF6FA0; text-align: center; margin-top: 8rpx; }
}

.fallback-modal {
  text-align: center;
  .f-title { font-size: 34rpx; font-weight: bold; margin-bottom: 20rpx; color: #333; }
  .f-content { font-size: 26rpx; color: #666; margin-bottom: 24rpx; line-height: 1.5; }
  .f-steps { 
    text-align: left; 
    font-size: 24rpx; 
    color: #444; 
    line-height: 2; 
    background: #f9f9f9; 
    padding: 20rpx; 
    border-radius: 12rpx;
    .bold { font-weight: bold; color: #FF6FA0; text-decoration: underline; }
  }
}
</style>
