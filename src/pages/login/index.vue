<template>
  <view class="login-page">
    <!-- 背景装饰光环 -->
    <view class="bg-glow"></view>

    <view class="content-wrapper">
      <view class="header">
        <view class="title">宝贝的专属菜单</view>
        <view class="subtitle">全都是你的最爱 💜</view>
      </view>

      <view class="image-showcase">
        <image class="hero-img" src="/static/bg.png" mode="aspectFill" />
        <view class="img-overlay"></view>
      </view>
    </view>

    <view class="actions">
      <button class="btn-primary" open-type="getUserInfo" @click="handleLogin">
        <text class="wx-icon">💬</text> 微信一键登录
      </button>
      <view class="agreement">登录即表示同意《用户协议》和《隐私政策》</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { authApi } from '@/api';
import { useUserStore } from '@/store/user';

const user = useUserStore();

async function handleLogin() {
  let nickname = '微信用户';
  let avatar = '';
  let gender = 0;
  
  try {
    const p: any = await new Promise((res, rej) =>
      uni.getUserProfile({ desc: '获取您的昵称和头像', success: res, fail: rej })
    );
    nickname = p.userInfo?.nickName || nickname;
    avatar = p.userInfo?.avatarUrl || '';
    gender = p.userInfo?.gender || 0;
  } catch (e) {
    console.warn("获取微信信息失败", e);
  }

  uni.showLoading({ title: '登录中…' });
  try {
    const { code } = await new Promise<UniApp.LoginRes>((resolve, reject) =>
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    );

    const resp = await authApi.login({ code, nickname, avatar, gender });
    user.setLogin(resp.token, resp.user, resp.bound);
    uni.hideLoading();
    if (resp.bound) {
      uni.reLaunch({ url: '/pages/menu/index' });
    } else {
      uni.reLaunch({ url: '/pages/bind/index' });
    }
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: '登录失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  height: 100vh;
  box-sizing: border-box;
  background: #FCFAFA;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 160rpx 60rpx 100rpx;
  overflow: hidden;
}

/* 梦幻的光效背景 */
.bg-glow {
  position: absolute;
  top: -10%;
  left: -20%;
  width: 140%;
  height: 60%;
  background: radial-gradient(ellipse at center, rgba(255, 182, 193, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 0;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 64rpx;
  font-weight: 900;
  color: #333;
  letter-spacing: 4rpx;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.subtitle {
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #FF6FA0;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* 中间图片展示区域 */
.image-showcase {
  position: relative;
  width: 560rpx;
  height: 560rpx;
  border-radius: 48rpx;
  box-shadow: 0 20rpx 60rpx rgba(255, 105, 180, 0.15), 0 0 0 16rpx rgba(255, 255, 255, 0.6);
  background: #fff;
  margin: 0 auto;
}

.hero-img {
  width: 100%;
  height: 100%;
  border-radius: 48rpx;
  /* 平滑缩放动画 */
  animation: floatImage 6s ease-in-out infinite alternate;
}

.img-overlay {
  position: absolute;
  inset: 0;
  border-radius: 48rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(255, 182, 193, 0.2) 100%);
  pointer-events: none;
}

@keyframes floatImage {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12rpx); }
}

.actions {
  position: relative;
  z-index: 1;
  padding-bottom: 40rpx;
  width: 100%;
}

.btn-primary {
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 30rpx rgba(255, 111, 160, 0.35);
  border: none;
  transition: transform 0.2s;
}

.btn-primary:active {
  transform: scale(0.96);
  box-shadow: 0 6rpx 15rpx rgba(255, 111, 160, 0.2);
}

.wx-icon {
  margin-right: 12rpx;
  font-size: 38rpx;
}

.agreement {
  text-align: center;
  margin-top: 36rpx;
  font-size: 24rpx;
  color: #999;
  font-weight: 300;
}
</style>
