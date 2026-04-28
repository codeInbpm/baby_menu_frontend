<template>
  <view class="page">
    <view class="profile-card">
      <image class="avatar" :src="user.info?.avatar || '/static/love.png'" mode="aspectFill" />
      <view class="info">
        <view class="name">
          {{ user.info?.nickname || '宝贝' }}
          <text v-if="user.info?.roleInCouple === 'owner'" class="role-badge owner">专属管家</text>
          <text v-if="user.info?.roleInCouple === 'pet'" class="role-badge pet">小宝贝</text>
        </view>
        <view v-if="user.bound" class="bound">
          已绑定 ❤️ {{ user.partner?.nickname || '宝贝' }}
        </view>
        <view v-else class="unbound">尚未绑定伴侣</view>
      </view>
    </view>

    <!-- 收到待处理互换请求时 -->
    <view class="switch-notify" v-if="hasPendingSwitch && !isApplicant">
      <view class="text">💕 你的宝贝申请和你互换角色，要不要宠 TA 一次呢？</view>
      <view class="btn primary" @click="acceptSwitch">同意互换的啦</view>
    </view>
    <!-- 等待对方处理 -->
    <view class="switch-notify waiting" v-else-if="hasPendingSwitch && isApplicant">
      <view class="text">⏳ 已发送角色互换申请，等待 TA 同意哦～</view>
    </view>

    <!-- 积分卡片 (Pet可见，因为现在积分真正属于Pet了) -->
    <PointsCard v-if="user.bound && user.info?.roleInCouple === 'pet'" />
    
    <!-- 主人专属卡片 (Owner可见，给Pet发积分) -->
    <OwnerCard v-if="user.bound && user.info?.roleInCouple === 'owner'" />

    <!-- 积分记录 (双方都可见，因为都能收到分配) -->
    <PointsRecord v-if="user.bound" />

    <view class="menu">
      <view class="row" @click="requestSwitchRole" v-if="user.bound && !hasPendingSwitch">
        <text>申请角色互换</text><text class="arrow">›</text>
      </view>
      <view class="row" @click="goRequests"><text>我的请求</text><text class="arrow">›</text></view>
      <view class="row disabled"><text>宠爱报表</text><text class="badge">即将上线</text></view>
      <view v-if="user.bound" class="row danger" @click="onUnbind"><text>解除绑定</text></view>
      <view class="row danger" @click="onLogout"><text>退出登录</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { coupleApi, userApi, SUBSCRIBE_TEMPLATE_ID } from '@/api';
import { useUserStore } from '@/store/user';
import { usePointsStore } from '@/store/points';
import PointsCard from './PointsCard.vue';
import OwnerCard from './OwnerCard.vue';
import PointsRecord from './PointsRecord.vue';

const user = useUserStore();
const pointsStore = usePointsStore();

const hasPendingSwitch = computed(() => user.coupleInfo && user.coupleInfo.switchRolePending);
const isApplicant = computed(() => user.coupleInfo && user.info && user.coupleInfo.switchRoleApplicant === user.info.id);

async function load() {
  try {
    const me = await userApi.me();
    user.setLogin(user.token, me.user, me.bound);
    user.setPartner(me.partner);
    if (me.couple) {
      user.setCoupleInfo(me.couple);
    }
    if (me.bound) {
      pointsStore.fetchInfo();
      pointsStore.fetchTransactions();
    }
  } catch {}
}
onShow(load);

async function requestSwitchRole() {
  uni.showModal({
    title: '角色互换',
    content: '想要和TA互换主人与宠物的身份吗？',
    success: async (r) => {
      if (r.confirm) {
        // 请求订阅消息权限，以便未来能收到对方同意的通知
        uni.requestSubscribeMessage({
          tmplIds: [SUBSCRIBE_TEMPLATE_ID],
          complete: async () => {
            uni.showLoading({ title: '申请中...' });
            try {
              await coupleApi.switchRoleRequest();
              uni.showToast({ title: '已发送申请', icon: 'success' });
              load();
            } finally {
              uni.hideLoading();
            }
          }
        });
      }
    }
  });
}

async function acceptSwitch() {
  // 请求订阅消息权限
  uni.requestSubscribeMessage({
    tmplIds: [SUBSCRIBE_TEMPLATE_ID],
    complete: async () => {
      uni.showLoading({ title: '处理中...' });
      try {
        await coupleApi.switchRoleAccept();
        uni.showToast({ title: '互换成功！', icon: 'success' });
        load();
      } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '操作失败', icon: 'none' });
      }
    }
  });
}

function goRequests() { uni.navigateTo({ url: '/pages/request/list' }); }

function onUnbind() {
  uni.showModal({
    title: '提示', content: '确定要解除绑定吗？',
    success: async (r) => {
      if (r.confirm) {
        await coupleApi.unbind();
        uni.showToast({ title: '已解绑', icon: 'success' });
        
        // 清理本地状态
        user.setLogin(user.token, { ...user.info, coupleId: null, roleInCouple: null }, false);
        user.setPartner(null);
        user.setCoupleInfo(null);
        
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
.page { 
  min-height: 100vh;
  background: #fdfdfd;
  padding: 32rpx 0; 
}
.profile-card {
  margin: 0 32rpx 32rpx;
  background: linear-gradient(135deg, #FFE0EC, #FFD6E5);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  display: flex; align-items: center;
}
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid #fff; }
.info { margin-left: 24rpx; }
.name { 
  font-size: 36rpx; font-weight: 700; color: #fff; 
  display: flex; align-items: center; gap: 12rpx;
}
.role-badge {
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
  font-weight: normal; margin-left: 8rpx;
}
.role-badge.owner { background: rgba(255,255,255,0.3); }
.role-badge.pet { background: #FF6699; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

.bound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .9; }
.unbound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .85; }

.switch-notify {
  margin: 0 32rpx 32rpx; background: #fff; border-radius: 24rpx;
  padding: 30rpx; box-shadow: 0 4rpx 20rpx rgba(255,105,180,0.15);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  border: 2rpx solid #FFF0F5;
}
.switch-notify.waiting {
  background: #FCFAFA; border: 2rpx dashed #eee; box-shadow: none;
}
.switch-notify .text { font-size: 28rpx; color: #555; margin-bottom: 20rpx; }
.switch-notify .btn.primary {
  background: linear-gradient(135deg, #FF69B4, #FF1493);
  color: #fff; font-size: 28rpx; font-weight: 600;
  padding: 16rpx 40rpx; border-radius: 999rpx;
  box-shadow: 0 6rpx 16rpx rgba(255,20,147,0.3);
}

.menu { 
  margin: 0 32rpx;
  background: #fff; border-radius: 24rpx; overflow: hidden; 
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
}
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
