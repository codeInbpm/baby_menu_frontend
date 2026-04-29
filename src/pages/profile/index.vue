<template>
  <view class="page">
    <!-- 奖励动画遮罩 -->
    <view class="reward-overlay" v-if="showRewardAnimation">
      <!-- 飞行的心 -->
      <view class="fly-heart" :class="{ 'fly': isFlying }" v-if="!isExploding">💖</view>
      
      <!-- 爆炸粒子 -->
      <view class="explosion" v-if="isExploding">
        <text v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)">❤️</text>
      </view>

      <!-- 奖励文字 -->
      <view class="reward-text" :class="{ 'show': isExploding }">
        宝贝奖励了你 <text class="highlight">+{{ rewardAmount }}</text> 积分 ❤️
      </view>
    </view>

    <view class="profile-card" :style="profileCardStyle">
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

      <!-- 在一起徽章 -->
      <view v-if="user.bound && mainMemorialInfo" class="together-badge">
        <text class="label">{{ mainMemorialInfo.text }}</text>
        <view class="days-wrap">
          <text class="num">{{ mainMemorialInfo.days }}</text>
          <text class="unit">天</text>
        </view>
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

    <!-- 浪漫相册 & 纪念日 双网格 -->
    <view class="romance-grid" v-if="user.bound">
      <view class="grid-item album" @click="goAlbum" :style="albumCoverStyle">
        <view class="overlay"></view>
        <view class="content">
          <text class="icon">📸</text>
          <text class="title">情侣相册</text>
          <text class="sub-title">我们的回忆</text>
        </view>
      </view>
      <view class="grid-item memorial" @click="goMemorial">
        <view class="overlay"></view>
        <view class="content">
          <text class="icon">🗓️</text>
          <text class="title">纪念日</text>
          <text class="sub-title">每个重要日子</text>
        </view>
      </view>
    </view>

    <!-- 情侣足迹地图入口 -->
    <FootprintEntryCard v-if="user.bound" />

    <!-- 宠爱报表入口 -->
    <ReportEntryCard v-if="user.bound" />

    <!-- 积分记录 (双方都可见，因为都能收到分配) -->
    <PointsRecord v-if="user.bound" />

    <view class="menu">
      <view class="row" @click="requestSwitchRole" v-if="user.bound && !hasPendingSwitch">
        <text>申请角色互换</text><text class="arrow">›</text>
      </view>
      <view class="row" @click="goRequests"><text>我的请求</text><text class="arrow">›</text></view>
      <view v-if="user.bound" class="row danger" @click="onUnbind"><text>解除绑定</text></view>
      <view class="row danger" @click="onLogout"><text>退出登录</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { coupleApi, userApi, SUBSCRIBE_TEMPLATE_ID } from '@/api';
import { useUserStore } from '@/store/user';
import { usePointsStore } from '@/store/points';
import PointsCard from './PointsCard.vue';
import OwnerCard from './OwnerCard.vue';
import PointsRecord from './PointsRecord.vue';
import ReportEntryCard from './ReportEntryCard.vue';
import FootprintEntryCard from './FootprintEntryCard.vue';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';

const user = useUserStore();
const pointsStore = usePointsStore();

const mainMemorialInfo = computed(() => {
  const item = user.mainMemorial;
  if (!item) return null;
  
  const today = dayjs().startOf('day');
  let originalSolarDate = dayjs(item.memorialDate).startOf('day');
  let lunarInfo: any = null;

  if (item.calendarType === 1) {
    const [y, m, d] = item.memorialDate.split('-').map(Number);
    const lunar = Lunar.fromYmd(y, m, d);
    const solar = lunar.getSolar();
    originalSolarDate = dayjs(`${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`).startOf('day');
    lunarInfo = { y, m, d };
  }

  if (item.recordType === 1) {
    const days = today.diff(originalSolarDate, 'day');
    return {
      text: `${item.title}已有`,
      days: Math.max(0, days)
    };
  } else {
    let nextSolarDate = originalSolarDate;
    if (item.isAnnualRemind) {
      if (item.calendarType === 1 && lunarInfo) {
        const thisYearLunar = Lunar.fromYmd(today.year(), lunarInfo.m, lunarInfo.d);
        const thisYearSolar = thisYearLunar.getSolar();
        let candidate = dayjs(`${thisYearSolar.getYear()}-${thisYearSolar.getMonth()}-${thisYearSolar.getDay()}`).startOf('day');
        if (candidate.isBefore(today)) {
          const nextYearLunar = Lunar.fromYmd(today.year() + 1, lunarInfo.m, lunarInfo.d);
          const nextYearSolar = nextYearLunar.getSolar();
          candidate = dayjs(`${nextYearSolar.getYear()}-${nextYearSolar.getMonth()}-${nextYearSolar.getDay()}`).startOf('day');
        }
        nextSolarDate = candidate;
      } else {
        nextSolarDate = originalSolarDate.year(today.year());
        if (nextSolarDate.isBefore(today)) {
          nextSolarDate = nextSolarDate.add(1, 'year');
        }
      }
    }
    const days = nextSolarDate.diff(today, 'day');
    return {
      text: `${item.title}还有`,
      days: Math.max(0, days)
    };
  }
});

// Force hot reload
console.log('Profile page loaded');

const hasPendingSwitch = computed(() => user.coupleInfo && user.coupleInfo.switchRolePending);
const isApplicant = computed(() => user.coupleInfo && user.info && user.coupleInfo.switchRoleApplicant === user.info.id);

const profileCardStyle = computed(() => {
  // 可以根据是否有纪念日/相册更换背景
  return {};
});

const albumCoverStyle = computed(() => {
  if (user.coupleInfo && user.coupleInfo.albumCoverUrl) {
    return {
      backgroundImage: `url(${user.coupleInfo.albumCoverUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return {};
});

const showRewardAnimation = ref(false);
const isFlying = ref(false);
const isExploding = ref(false);
const rewardAmount = ref(0);

function getParticleStyle(i: number) {
  const angle = (i * 45) * (Math.PI / 180);
  const radius = 120; // 扩散半径 rpx
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return `
    --tx: ${x}rpx;
    --ty: ${y}rpx;
    animation-delay: ${Math.random() * 0.1}s;
  `;
}

async function playRewardAnimation(amount: number) {
  rewardAmount.value = amount;
  showRewardAnimation.value = true;
  isFlying.value = false;
  isExploding.value = false;

  setTimeout(() => { isFlying.value = true; }, 100);

  setTimeout(() => {
    isExploding.value = true;
    setTimeout(async () => {
      showRewardAnimation.value = false;
      try { await userApi.clearUnreadReward(); } catch {}
      // Update local store to reflect the cleared status to prevent re-trigger on immediate navigation
      if (user.info) {
        user.setLogin(user.token, { ...user.info, hasUnreadReward: 0 }, user.bound);
      }
    }, 2500);
  }, 1100);
}

async function load() {
  try {
    const me = await userApi.me();
    user.setLogin(user.token, me.user, me.bound);
    user.setPartner(me.partner);
    if (me.couple) {
      user.setCoupleInfo(me.couple);
    }
    if (me.mainMemorial !== undefined) {
      user.setMainMemorial(me.mainMemorial);
    }
    if (me.bound) {
      pointsStore.fetchInfo();
      pointsStore.fetchTransactions();
    }
    
    // Check for unread rewards for Owner
    if (me.user.roleInCouple === 'owner' && me.user.hasUnreadReward > 0) {
      playRewardAnimation(me.user.hasUnreadReward);
    }
  } catch {}
}
onShow(load);

function goAlbum() { uni.navigateTo({ url: '/pages/album/index' }); }
function goMemorial() { uni.navigateTo({ url: '/pages/memorial/index' }); }

async function requestSwitchRole() {
  uni.showModal({
    title: '角色互换',
    content: '想要和TA互换主人与宠物的身份吗？',
    success: async (r) => {
      if (r.confirm) {
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
  background: #fcf8fa;
  padding: 32rpx 0; 
  padding-bottom: 60rpx;
}
.profile-card {
  margin: 0 32rpx 32rpx;
  background: linear-gradient(135deg, #FFB6C1, #FF8DA1);
  border-radius: 36rpx;
  padding: 40rpx 32rpx;
  display: flex; align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(255, 141, 161, 0.25);
}
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid #fff; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }
.info { margin-left: 24rpx; flex: 1; }
.name { 
  font-size: 36rpx; font-weight: 700; color: #fff; 
  display: flex; align-items: center; gap: 12rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}
.role-badge {
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
  font-weight: normal; margin-left: 8rpx;
}
.role-badge.owner { background: rgba(255,255,255,0.3); }
.role-badge.pet { background: #FF6699; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

.bound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .95; }
.unbound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .85; }

.together-badge {
  position: absolute; right: 32rpx; top: 32rpx;
  display: flex; flex-direction: column; align-items: flex-end;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  .label { font-size: 22rpx; opacity: 0.9; font-weight: 500; }
  .days-wrap { 
    display: flex; align-items: baseline; margin-top: -4rpx;
    .num { font-size: 60rpx; font-weight: 900; line-height: 1; font-style: italic; }
    .unit { font-size: 24rpx; margin-left: 4rpx; opacity: 0.9; }
  }
}

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

.romance-grid {
  margin: 0 32rpx 32rpx;
  display: flex;
  gap: 20rpx;
}
.grid-item {
  flex: 1;
  height: 180rpx;
  border-radius: 28rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  background-size: cover;
  background-position: center;
}
.grid-item.album {
  background-color: #ffe6f0;
}
.grid-item.memorial {
  background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
}
.grid-item .overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.15); z-index: 1;
}
.grid-item.memorial .overlay { background: rgba(255,255,255,0.2); }

.grid-item .content {
  position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; color: #fff;
}
.grid-item.memorial .content { color: #8E24AA; }

.grid-item .icon { font-size: 48rpx; margin-bottom: 8rpx; filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1)); }
.grid-item .title { font-size: 30rpx; font-weight: 700; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1); }
.grid-item.memorial .title { text-shadow: none; }
.grid-item .sub-title { font-size: 22rpx; opacity: 0.9; margin-top: 4rpx; }

.menu { 
  margin: 0 32rpx;
  background: #fff; border-radius: 24rpx; overflow: hidden; 
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.04);
}
.row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx; font-size: 28rpx; color: #333;
  border-bottom: 1rpx solid #f9f9f9;
}
.row:last-child { border-bottom: none; }
.row.disabled { color: #aaa; }
.row .badge { font-size: 22rpx; color: #999; background: #f5f5f5; padding: 4rpx 12rpx; border-radius: 999rpx; }
.row .arrow { color: #ccc; }
.row.danger { color: #ff5b5b; justify-content: center; }

/* 奖励动画样式 */
.reward-overlay {
  position: fixed; inset: 0; z-index: 999;
  pointer-events: none;
  display: flex; justify-content: center; align-items: center;
}

.fly-heart {
  font-size: 120rpx;
  position: absolute;
  top: 60%; left: 50%;
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;
  transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);
  filter: drop-shadow(0 0 20rpx rgba(255,105,180,0.8));
  
  &.fly {
    opacity: 1;
    /* 飞向左上角头像，位置大约为 top 110rpx, left 110rpx */
    transform: translate(calc(-50vw + 110rpx), calc(-60vh + 110rpx)) scale(1.5) rotate(-15deg);
  }
}

.explosion {
  position: absolute;
  left: 110rpx; top: 110rpx;
  .particle {
    position: absolute;
    font-size: 40rpx;
    top: -20rpx; left: -20rpx;
    opacity: 0;
    animation: explode 0.8s ease-out forwards;
  }
}

@keyframes explode {
  0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.2) rotate(45deg); opacity: 0; }
}

.reward-text {
  position: absolute;
  top: 45%;
  font-size: 34rpx; font-weight: bold; color: #FF6FA0;
  opacity: 0;
  transform: translateY(40rpx);
  transition: all 0.5s ease-out;
  background: rgba(255,255,255,0.95);
  padding: 24rpx 48rpx; border-radius: 999rpx;
  box-shadow: 0 10rpx 40rpx rgba(255,105,180,0.25);
  border: 2rpx solid #FFF0F5;
  
  &.show {
    opacity: 1;
    transform: translateY(0);
    animation: bounceText 2s infinite;
  }
  .highlight { 
    font-size: 56rpx; color: #FF1493; margin: 0 12rpx; 
    display: inline-block;
    animation: pulsePoints 1s infinite alternate;
  }
}

@keyframes bounceText {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes pulsePoints {
  0% { transform: scale(1); text-shadow: 0 0 10rpx rgba(255,20,147,0.2); }
  100% { transform: scale(1.1); text-shadow: 0 0 20rpx rgba(255,20,147,0.6); }
}
</style>
