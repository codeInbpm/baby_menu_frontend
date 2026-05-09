<template>
  <view class="page" :class="user.themeClass">
    <!-- 奖励动画遮罩 -->
    <view class="reward-overlay" :class="{ 'active': showRewardAnimation }">
      <!-- 梦幻光斑背景 -->
      <view class="dreamy-bg" v-if="showRewardAnimation"></view>

      <!-- 飞行的心和拖尾 -->
      <view class="fly-heart-wrap" :class="{ 'fly': isFlying }" v-if="!isExploding && showRewardAnimation">
        <view class="fly-heart">💖</view>
        <view class="tail-sparks">
          <text v-for="i in 5" :key="i" class="spark" :style="getSparkStyle(i)">✨</text>
        </view>
      </view>
      
      <!-- 爆炸粒子 -->
      <view class="explosion" v-if="isExploding">
        <text v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)">❤️</text>
      </view>

      <!-- 奖励文字 -->
      <view class="reward-text" :class="{ 'show': showRewardText }">
        宝贝奖励了你 <text class="highlight">+{{ rewardAmount }}</text> 积分 ❤️
      </view>
    </view>

    <view class="profile-card" :style="profileCardStyle">
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <AvatarWithFrame :avatarUrl="user.info?.avatar || '/static/love.png'" :frameCode="currentFrameCode" :size="120" />
        <view class="avatar-edit-tag">更换</view>
      </button>
      <view class="info">
        <view class="name" @click="showEditNickname = true">
          {{ user.info?.nickname || '宝贝' }}
          <wd-icon name="edit-1" size="14px" color="rgba(255,255,255,0.8)" />
          <text v-if="user.info?.roleInCouple === 'owner'" class="role-badge owner">专属管家</text>
          <text v-if="user.info?.roleInCouple === 'pet'" class="role-badge pet">小宝贝</text>
        </view>
        <!-- 当前佩戴称号 -->
        <view v-if="titleStore.currentTitle" class="current-title-box" @click="goTitlePage">
          <text class="title-text" :class="titleStore.currentTitle.level">
            {{ titleStore.currentTitle.titleName }}
          </text>
          <wd-icon name="arrow-right" size="12px" color="rgba(255,255,255,0.6)" />
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

    <!-- 收到奖励通知 -->
    <view class="switch-notify reward-notify" v-if="pendingReward > 0">
      <view class="text">🎁 宝贝刚刚给管家点赞，奖励了你 <text style="color:#FF1493;font-weight:bold;">{{ pendingReward }}</text> 积分！</view>
      <view class="btn primary" @click="triggerRewardAnimation">点击拆开</view>
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

    <!-- 经期周期守护模块 -->
    <PeriodModule v-if="user.bound" />

    <!-- 情侣共同待办清单入口 -->
    <BucketEntryCard v-if="user.bound" />

    <!-- 情侣称号入口 -->
    <TitleEntryCard v-if="user.bound" />

    <!-- 宠爱报表入口 -->
    <ReportEntryCard v-if="user.bound" />

    <!-- 积分记录 (双方都可见，因为都能收到分配) -->
    <PointsRecord v-if="user.bound" />

    <view class="menu">
      <view class="row" @click="requestSwitchRole" v-if="user.bound && !hasPendingSwitch">
        <text>申请角色互换</text><text class="arrow">›</text>
      </view>
<!--      <view class="row" @click="goRequests"><text>我的请求</text><text class="arrow">›</text></view>-->
      <view class="row" @click="goSubscribe"><text>订阅消息设置</text></view>
      <view v-if="user.bound" class="row danger" @click="onUnbind"><text>解除绑定</text></view>
      <view class="row danger" @click="onLogout"><text>退出登录</text></view>
    </view>

    <!-- 修改昵称弹窗 -->
    <wd-popup v-model="showEditNickname" position="center" custom-style="border-radius: 32rpx; width: 80%;">
      <view class="edit-popup">
        <view class="popup-title">修改你的昵称</view>
        <view class="input-wrap">
          <input 
            type="nickname" 
            class="nickname-input" 
            v-model="tempNickname" 
            placeholder="请输入新昵称" 
            @blur="onNicknameBlur"
            @confirm="saveNickname"
          />
        </view>
        <view class="popup-tips">可以使用微信头像或直接输入</view>
        <view class="popup-footer">
          <view class="p-btn cancel" @click="showEditNickname = false">取消</view>
          <view class="p-btn confirm" @click="saveNickname">确定</view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { coupleApi, userApi, avatarFrameApi, SUBSCRIBE_TEMPLATE_ID } from '@/api';
import { useUserStore } from '@/store/user';
import AvatarWithFrame from '@/components/AvatarWithFrame/AvatarWithFrame.vue';
import { BASE_URL } from '@/utils/request';
import { usePointsStore } from '@/store/points';
import PointsCard from './PointsCard.vue';
import OwnerCard from './OwnerCard.vue';
import PointsRecord from './PointsRecord.vue';
import ReportEntryCard from './ReportEntryCard.vue';
import FootprintEntryCard from './FootprintEntryCard.vue';
import TitleEntryCard from './TitleEntryCard.vue';
import BucketEntryCard from './BucketEntryCard.vue';
import PeriodModule from './PeriodModule.vue';
import { useTitleStore } from '@/store/title';
import { requestSubscribe } from '@/utils/subscribe';
import { useSubscribeGuide } from '@/utils/subscribeGuide';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';

const user = useUserStore();
const pointsStore = usePointsStore();
const titleStore = useTitleStore();

const mainMemorialInfo = computed(() => {
  const item = user.mainMemorial;
  if (!item) return null;

  let title = item.title;
  if (item.userId && item.userId !== user.info?.id) {
    if (title.includes('我的')) {
      const partnerName = user.partner?.nickname || 'TA';
      title = title.replace('我的', partnerName + '的');
    }
  }

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
    const days = today.diff(originalSolarDate, 'day') + 1;
    return {
      text: `在一起第`,
      days: Math.max(1, days)
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
      text: `${title}还有`,
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
const showRewardText = ref(false);
const rewardAmount = ref(0);
const pendingReward = ref(0);

const showEditNickname = ref(false);
const tempNickname = ref('');
const currentFrameCode = ref('');

function onNicknameBlur(e: any) {
  tempNickname.value = e.detail.value;
}

async function saveNickname() {
  if (!tempNickname.value) return;
  uni.showLoading({ title: '保存中...' });
  try {
    await userApi.updateProfile({ nickname: tempNickname.value });
    user.setLogin(user.token, { ...user.info, nickname: tempNickname.value }, user.bound);
    showEditNickname.value = false;
    uni.showToast({ title: '昵称已更新', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e.message || '更新失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
}

async function onChooseAvatar(e: any) {
  const avatarUrl = e.detail.avatarUrl;
  if (!avatarUrl) {
    uni.showToast({ title: '获取头像路径失败', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '上传头像...' });
  try {
    const uploadedUrl = await uploadSingleFile(avatarUrl);
    await userApi.updateProfile({ avatar: uploadedUrl });
    user.setLogin(user.token, { ...user.info, avatar: uploadedUrl }, user.bound);
    uni.showToast({ title: '头像已更新', icon: 'success' });
  } catch (err: any) {
    console.error('Avatar upload failed:', err);
    uni.showToast({ title: err.message || '更新失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
}

function uploadSingleFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/upload/image',
      filePath: path,
      name: 'file',
      header: { Authorization: 'Bearer ' + user.token },
      success: (r) => {
        if (r.statusCode !== 200) {
          console.error('Upload failed with status:', r.statusCode, r.data);
          reject(new Error(`服务器错误(${r.statusCode})`));
          return;
        }
        try {
          const body = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          if (body.code === 0) {
            let url = body.data.url;
            url = url.startsWith('http') ? url : BASE_URL.replace('/api', '') + url;
            resolve(url);
          } else {
            reject(new Error(body.message || '服务器返回错误'));
          }
        } catch (err) {
          console.error('Parse upload response failed:', r.data);
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (err) => {
        console.error('uni.uploadFile fail:', err);
        reject(new Error('网络上传失败'));
      }
    });
  });
}

function getParticleStyle(i: number) {
  const angle = (i * 30) * (Math.PI / 180);
  const radius = 150; // 扩散半径 rpx
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return `
    --tx: ${x}rpx;
    --ty: ${y}rpx;
    animation-delay: ${Math.random() * 0.1}s;
  `;
}

function getSparkStyle(i: number) {
  const angle = (i * 72) * (Math.PI / 180);
  const x = Math.cos(angle) * 60;
  const y = Math.sin(angle) * 60;
  return `
    --tx: ${x}rpx;
    --ty: ${y}rpx;
    animation-delay: ${Math.random() * 0.5}s;
  `;
}

function triggerRewardAnimation() {
  const amount = pendingReward.value;
  pendingReward.value = 0;
  playRewardAnimation(amount);
}

async function playRewardAnimation(amount: number) {
  rewardAmount.value = amount;
  showRewardAnimation.value = true;
  isFlying.value = false;
  isExploding.value = false;
  showRewardText.value = false;

  // 播放轻柔叮～音效
  try {
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.src = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
    innerAudioContext.play();
  } catch(e) {}

  setTimeout(() => { isFlying.value = true; }, 100);

  setTimeout(() => {
    isExploding.value = true;
    showRewardText.value = true;
    setTimeout(async () => {
      showRewardAnimation.value = false;
      showRewardText.value = false;

      // 触发积分卡片数字高亮跳动
      pointsStore.highlightOwnerPoints = true;
      setTimeout(() => { pointsStore.highlightOwnerPoints = false; }, 1500);

      try { await userApi.clearUnreadReward(); } catch {}
      // Update local store to reflect the cleared status to prevent re-trigger on immediate navigation
      if (user.info) {
        user.setLogin(user.token, { ...user.info, hasUnreadReward: 0 }, user.bound);
      }
    }, 3000);
  }, 1300); // 1.2s duration for flying
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
      titleStore.fetchCurrentTitle();
    }

    // Check for unread rewards for Owner
    if (me.user.roleInCouple === 'owner' && me.user.hasUnreadReward > 0) {
      pendingReward.value = me.user.hasUnreadReward;
    }

    try {
      const frameRes = await avatarFrameApi.my();
      currentFrameCode.value = frameRes.currentCode || '';
    } catch(e) {}

    const { checkAndPrompt } = useSubscribeGuide('profile', 1000);
    checkAndPrompt();
  } catch {}
}
onShow(load);

function goAlbum() { uni.navigateTo({ url: '/pages/album/index' }); }
function goMemorial() { uni.navigateTo({ url: '/pages/memorial/index' }); }
function goTitlePage() { uni.navigateTo({ url: '/pages/title/index' }); }

async function requestSwitchRole() {
  uni.showModal({
    title: '角色互换',
    content: '想要和TA互换管家与公主的身份吗？',
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
async function goSubscribe() {
  const ok = await requestSubscribe();
  if (ok) {
    uni.showToast({ title: '订阅成功 ❤️', icon: 'success' });
  } else {
    uni.showToast({ title: '已取消或订阅失败', icon: 'none' });
  }
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
  background: var(--gradient);
  border-radius: 36rpx;
  padding: 40rpx 32rpx;
  display: flex; align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx var(--card-shadow);
}
.avatar-wrapper {
  padding: 0; margin: 0; background: none; line-height: 1; border-radius: 50%;
  position: relative;
  &::after { border: none; }
}
.avatar-edit-tag {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.3); color: #fff; font-size: 18rpx;
  padding: 4rpx 0; text-align: center;
}

.info { margin-left: 24rpx; flex: 1; }
.name { 
  font-size: 36rpx; font-weight: 700; color: #fff; 
  display: flex; align-items: center; gap: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  &:active { opacity: 0.8; }
}
.role-badge {
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
  font-weight: normal; margin-left: 8rpx;
}
.role-badge.owner { background: rgba(255,255,255,0.3); }
.role-badge.pet { background: #FF6699; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

.bound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .95; }
.unbound { font-size: 24rpx; color: #fff; margin-top: 12rpx; opacity: .85; }

.current-title-box {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4rpx);
  padding: 6rpx 16rpx; border-radius: 999rpx;
  margin-top: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  
  &:active { opacity: 0.8; }
  
  .title-text {
    font-size: 22rpx; font-weight: bold; color: #fff;
    &.rare { color: #FFEBCD; text-shadow: 0 0 8rpx rgba(255,215,0,0.5); }
    &.legend { color: #FFF; text-shadow: 0 0 12rpx rgba(255,255,255,0.8), 0 0 20rpx rgba(255,20,147,0.5); }
  }
}

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
  padding: 30rpx; box-shadow: 0 4rpx 20rpx var(--card-shadow);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  border: 2rpx solid var(--bg-color);
}
.switch-notify.waiting {
  background: #FCFAFA; border: 2rpx dashed #eee; box-shadow: none;
}
.switch-notify .text { font-size: 28rpx; color: #555; margin-bottom: 20rpx; }
.switch-notify .btn.primary {
  background: var(--gradient);
  color: #fff; font-size: 28rpx; font-weight: 600;
  padding: 16rpx 40rpx; border-radius: 999rpx;
  box-shadow: 0 6rpx 16rpx var(--card-shadow);
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
  animation: breathePink 4s infinite alternate;
  &::before {
    content: '📸'; position: absolute; font-size: 140rpx; opacity: 0.1; right: -20rpx; bottom: -30rpx;
    animation: floatIcon 6s infinite ease-in-out alternate;
  }
}
@keyframes breathePink {
  0% { background-color: #ffe6f0; }
  100% { background-color: #ffc2d6; }
}
.grid-item.memorial {
  background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
  background-size: 200% 200%;
  animation: panMemorial 5s ease-in-out infinite alternate;
  &::before {
    content: '🗓️'; position: absolute; font-size: 140rpx; opacity: 0.1; left: -20rpx; top: -30rpx;
    animation: floatIcon 7s infinite ease-in-out alternate-reverse;
  }
}
@keyframes panMemorial {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}
@keyframes floatIcon {
  0% { transform: translateY(0) rotate(-10deg); }
  100% { transform: translateY(-15rpx) rotate(10deg); }
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
.row .arrow { color: #ccc; margin-left: 8rpx; }
.row .row-right { display: flex; align-items: center; }
.row.danger { color: #ff5b5b; justify-content: center; }

/* 奖励动画样式 */
.reward-overlay {
  position: fixed; inset: 0; z-index: 999;
  pointer-events: none;
  display: flex; justify-content: center; align-items: center;
  opacity: 0; transition: opacity 0.3s;
  &.active { opacity: 1; }
}

.dreamy-bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, rgba(255,182,193,0.3) 0%, rgba(255,255,255,0) 70%);
  animation: pulseBg 2s infinite alternate;
}

@keyframes pulseBg {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.1); }
}

.fly-heart-wrap {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  .fly-heart {
    font-size: 160rpx;
    filter: drop-shadow(0 0 40rpx rgba(255,105,180,0.9));
    animation: heartbeat 1s infinite alternate;
  }
  
  .tail-sparks {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }
  
  &.fly {
    opacity: 1;
    /* 飞向左上角头像 (大约120rpx, 120rpx) */
    transform: translate(calc(-50vw + 120rpx), calc(-50vh + 120rpx)) scale(0.8) rotate(-15deg);
    
    .tail-sparks {
      opacity: 1;
      .spark {
        position: absolute; font-size: 30rpx;
        animation: sparkTail 0.8s linear infinite;
      }
    }
  }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  100% { transform: scale(1.1) rotate(5deg); }
}

@keyframes sparkTail {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; }
}

.explosion {
  position: absolute;
  left: 120rpx; top: 120rpx;
  .particle {
    position: absolute;
    font-size: 50rpx;
    top: -25rpx; left: -25rpx;
    opacity: 0;
    animation: explode 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
}

@keyframes explode {
  0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.5) rotate(720deg); opacity: 0; }
}

.reward-text {
  position: absolute;
  top: 60%;
  font-size: 36rpx; font-weight: bold; color: #FF6FA0;
  opacity: 0;
  transform: translateY(60rpx) scale(0.9);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(255,255,255,0.95);
  padding: 30rpx 50rpx; border-radius: 999rpx;
  box-shadow: 0 10rpx 40rpx rgba(255, 105, 180, 0.3);
  border: 2rpx solid #FFB6C1;
  text-align: center;
  
  &.show {
    opacity: 1;
    transform: translateY(0) scale(1);
    animation: floatText 3s infinite;
  }
  .highlight { 
    font-size: 64rpx; color: #FF1493; margin: 0 16rpx; 
    display: inline-block;
    animation: pulsePoints 1s infinite alternate;
  }
}

@keyframes floatText {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15rpx) scale(1.02); }
}

@keyframes pulsePoints {
  0% { transform: scale(1); text-shadow: 0 0 10rpx rgba(255,20,147,0.2); }
  100% { transform: scale(1.1); text-shadow: 0 0 20rpx rgba(255,20,147,0.6); }
}

/* 编辑弹窗 */
.edit-popup {
  background: #fff; padding: 40rpx;
  .popup-title { font-size: 32rpx; font-weight: bold; color: #333; text-align: center; margin-bottom: 30rpx; }
  .input-wrap {
    background: #f5f5f5; border-radius: 12rpx; padding: 20rpx;
    margin-bottom: 20rpx;
    .nickname-input { width: 100%; height: 80rpx; font-size: 30rpx; }
  }
  .popup-tips { font-size: 24rpx; color: #999; text-align: center; margin-bottom: 40rpx; }
  .popup-footer {
    display: flex; gap: 20rpx;
    .p-btn {
      flex: 1; height: 88rpx; border-radius: 44rpx;
      display: flex; justify-content: center; align-items: center;
      font-size: 28rpx; font-weight: bold;
    }
    .cancel { background: #f0f0f0; color: #666; }
    .confirm { background: var(--primary-color); color: #fff; }
  }
}
</style>
