<template>
  <view class="page">
    <view class="profile-card">
      <image class="avatar" :src="user.info?.avatar || '/static/love.png'" mode="aspectFill" />
      <view class="info">
        <view class="name">{{ user.info?.nickname || '宝贝' }}</view>
        <view v-if="user.bound" class="bound">
          已绑定 ❤️ {{ user.partner?.nickname || '宝贝' }}
        </view>
        <view v-else class="unbound">尚未绑定伴侣</view>
      </view>
    </view>

    <view class="menu">
      <view class="row" @click="goRequests"><text>我的请求</text><text class="arrow">›</text></view>
      <view class="row disabled"><text>积分记录</text><text class="badge">即将上线</text></view>
      <view class="row disabled"><text>宠爱报表</text><text class="badge">即将上线</text></view>
      <view v-if="user.bound" class="row danger" @click="onUnbind"><text>解除绑定</text></view>
      <view class="row danger" @click="onLogout"><text>退出登录</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { coupleApi, userApi } from '@/api';
import { useUserStore } from '@/store/user';

const user = useUserStore();

async function load() {
  try {
    const me = await userApi.me();
    user.setLogin(user.token, me.user, me.bound);
    user.setPartner(me.partner);
  } catch {}
}
onShow(load);

function goRequests() { uni.navigateTo({ url: '/pages/request/list' }); }

function onUnbind() {
  uni.showModal({
    title: '提示', content: '确定要解除绑定吗？',
    success: async (r) => {
      if (r.confirm) {
        await coupleApi.unbind();
        uni.showToast({ title: '已解绑', icon: 'success' });
        setTimeout(() => uni.reLaunch({ url: '/pages/bind/index' }), 600);
      }
    }
  });
}
function onLogout() {
  user.logout();
  uni.reLaunch({ url: '/pages/login/index' });
}
</script>

<style lang="scss" scoped>
.page { padding: 32rpx; }
.profile-card {
  background: linear-gradient(135deg, #FFE0EC, #FFD6E5);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  display: flex; align-items: center;
  margin-bottom: 32rpx;
}
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid #fff; }
.info { margin-left: 24rpx; }
.name { font-size: 36rpx; font-weight: 700; color: #fff; }
.bound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .9; }
.unbound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .85; }

.menu { background: #fff; border-radius: 24rpx; overflow: hidden; }
.row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx; font-size: 28rpx; color: #333;
  border-bottom: 1rpx solid #f5f5f5;
}
.row:last-child { border-bottom: none; }
.row.disabled { color: #aaa; }
.row .badge { font-size: 22rpx; color: #999; background: #f5f5f5; padding: 4rpx 12rpx; border-radius: 999rpx; }
.row .arrow { color: #ccc; }
.row.danger { color: #ff5b5b; justify-content: center; }
</style>
