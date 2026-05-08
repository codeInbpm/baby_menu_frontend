<template>
  <view class="login-page">
    <view class="hero">
      <view class="title">宝贝的专属菜单</view>
      <view class="subtitle">全都是你的最爱 💜</view>
<!--      <image class="hero-img" src="/static/love.png" mode="widthFix" />-->

    </view>

    <view class="actions">
      <button class="btn-primary" open-type="getUserInfo" @click="handleLogin">
        微信一键登录
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
    // 必须在点击事件的同步调用栈中立即触发 getUserProfile，否则会因为失去手势上下文而报错
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
  min-height: 100vh;
  background: linear-gradient(180deg, #FFE6EE 0%, #FFF5F8 60%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 120rpx 60rpx 80rpx;
}
.hero { text-align: center; }
.title {
  font-size: 56rpx;
  font-weight: 700;
  color: #FF6FA0;
  letter-spacing: 4rpx;
}
.subtitle {
  margin-top: 16rpx;
  font-size: 30rpx;
  color: #A78BFA;
}
.hero-img {
  width: 480rpx;
  margin-top: 80rpx;
}
.actions { padding-bottom: 60rpx; }
.btn-primary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #FF8FB3 0%, #FF6FA0 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
.agreement {
  text-align: center;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #B8A8B0;
}
</style>
