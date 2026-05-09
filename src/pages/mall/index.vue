<template>
  <view class="mall-page">
    <view class="nav-bar">
<!--      <view class="back-btn" @click="goBack">-->
<!--        <wd-icon name="arrow-left" size="24px" color="#FFF" />-->
<!--      </view>-->
<!--      <view class="nav-title">积分商城</view>-->
<!--      <view class="placeholder"></view>-->
    </view>

    <!-- Top header (Figure 1 style) -->
    <view class="top-header">
      <view class="label">我的可用积分</view>
      <view class="points-val">
        <text class="star-icon">⭐</text>{{ points }}
      </view>
    </view>

    <!-- Tabs -->
    <view class="tabs-container">
      <view class="tabs">
        <view class="tab" :class="{ active: activeTab === 'mall' }" @click="switchTab('mall')">
          <text>兑换商城</text>
          <view class="line"></view>
        </view>
        <view class="tab" :class="{ active: activeTab === 'inventory' }" @click="switchTab('inventory')">
          <text>我的权益</text>
          <view class="line"></view>
        </view>
      </view>
    </view>

    <!-- 兑换商城 -->
    <view class="tab-content" v-if="activeTab === 'mall'">
      <view class="mall-list">
        <!-- 专属头像框特权入口 -->
        <view class="mall-card frame-entry-card" @click="goFrameDetail">
          <view class="icon-wrap frame-wrap">
            <text class="emoji">🔲</text>
          </view>
          <view class="item-info">
            <text class="name highlight-name">专属头像框合集</text>
            <text class="desc">永久获得炫酷专属头像框（深邃黑金、机甲科技、赛博朋克、浪漫守护等风格可选）</text>
            <view class="price-row">
              <text class="price">多价格 <text class="unit">可选</text></text>
              <text class="tag permanent">永久有效</text>
            </view>
          </view>
          <button class="redeem-btn frame-btn">去选购</button>
        </view>

        <view v-for="item in items" :key="item.id" class="mall-card">
          <view class="icon-wrap" :class="'type-' + item.itemType">
            <ExemptionIcon v-if="item.itemType === 2" :size="60" />
            <text v-else class="emoji">{{ item.icon || '🎁' }}</text>
          </view>

          <view class="item-info">
            <text class="name">{{ item.name }}</text>
            <text class="desc">{{ item.description }}</text>
            <view class="price-row">
              <text class="price">{{ item.price }} <text class="unit">积分</text></text>
              <text class="tag" :class="{'permanent': getExpireTag(item) === '永久有效'}">{{ getExpireTag(item) }}</text>
            </view>
          </view>

          <button class="redeem-btn" @click="handleRedeem(item)">兑换</button>
        </view>
      </view>
    </view>

    <!-- 我的权益 (Inventory) -->
    <view class="tab-content" v-if="activeTab === 'inventory'">
      <view v-if="loadingInventory" class="loading-box">
        <wd-loading />
      </view>

      <view v-else-if="list.length === 0" class="empty-box">
        <image src="/static/empty.png" class="empty-img" />
        <text>目前还没有任何特权哦，快去兑换商城看看吧～</text>
        <button class="go-mall-btn" @click="switchTab('mall')">前往商城</button>
      </view>

      <view v-else class="rights-list">
        <!-- 我的头像框入口 -->
        <view class="rights-card frame-rights-card" @click="goFrameDetail">
          <view class="card-glow"></view>
          <view class="card-main">
            <view class="icon-section">
              <text class="emoji-icon">🔲</text>
            </view>
            <view class="info-section">
              <view class="name-row">
                <text class="name">我的头像框</text>
                <text class="status-tag active">有效中</text>
              </view>
              <text class="desc">管理和穿戴你已拥有的专属头像框特效。</text>
              <text class="time">永久</text>
            </view>
          </view>
          <view class="card-footer">
            <view class="usage-info"><text class="count">可无限次切换</text></view>
            <button class="use-btn">去穿戴</button>
          </view>
        </view>

        <view
          v-for="item in list"
          :key="item.id"
          class="rights-card"
          :class="{ 'used': item.status === 1, 'expired': isExpired(item) }"
        >
          <view class="card-glow"></view>

          <view class="card-main">
            <view class="icon-section">
              <ExemptionIcon v-if="item.itemType === 2" :size="100" />
              <text v-else class="emoji-icon">{{ item.icon || '🎁' }}</text>
            </view>

            <view class="info-section">
              <view class="name-row">
                <text class="name">{{ item.itemName }}</text>
                <text v-if="item.status === 1" class="status-tag used">已使用</text>
                <text v-else-if="isExpired(item)" class="status-tag expired">已过期</text>
                <text v-else class="status-tag active">有效中</text>
              </view>
              <text class="desc">{{ getItemDesc(item) }}</text>
              <text class="time">有效期至: {{ formatTime(item.expireTime) }}</text>
            </view>
          </view>

          <view class="card-footer" v-if="item.status === 0 && !isExpired(item)">
            <view class="usage-info">
              <text class="count">剩余次数: 1次</text>
            </view>
            <button class="use-btn" @click="onUse(item)">立即使用</button>
          </view>

          <view class="used-info" v-if="item.status === 1">
            使用于: {{ formatTime(item.useTime) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 使用确认弹窗 -->
    <wd-popup v-model="showUsePicker" position="bottom" custom-class="use-popup">
      <view class="popup-content">
        <view class="popup-header">
          <text>选择要应用的服务</text>
          <wd-icon name="close" @click="showUsePicker = false" />
        </view>

        <scroll-view scroll-y class="request-list">
          <view
            v-for="req in activeRequests"
            :key="req.id"
            class="request-item"
            :class="{ 'low-score-warn': req.score > 0 && req.score < 3 }"
            @click="confirmUse(req.id)"
          >
            <view class="req-info">
              <view class="req-title-row">
                <text class="req-title">{{ req.content }}</text>
                <text v-if="req.score > 0" class="req-stars">{{ '⭐'.repeat(req.score) }}</text>
              </view>
              <text class="req-time">{{ formatTime(req.createTime) }}</text>
            </view>
            <wd-icon v-if="req.score > 0 && req.score < 3" name="warn-bold" color="#d4af37" size="20px" />
            <wd-icon v-else name="arrow-right" />
          </view>

          <view v-if="activeRequests.length === 0" class="no-req">
            当前没有正在进行中的服务请求，请在服务详情页或此处进行中的服务上使用。
          </view>
        </scroll-view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
    <wd-message-box id="wd-message-box" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { mallApi, pointsApi, requestApi } from '@/api';
import { useToast, useMessage } from 'wot-design-uni';
import ExemptionIcon from '@/components/ExemptionIcon/ExemptionIcon.vue';
import dayjs from 'dayjs';

const toast = useToast();
const messageBox = useMessage();
const activeTab = ref('mall'); // 'mall' | 'inventory'

// ==== Mall State ====
const items = ref<any[]>([]);
const points = ref(0);

// ==== Inventory State ====
const list = ref<any[]>([]);
const loadingInventory = ref(false);
const showUsePicker = ref(false);
const activeRequests = ref<any[]>([]);
const selectedInventoryId = ref<number | null>(null);

function goBack() {
  uni.navigateBack();
}

function goFrameDetail() {
  uni.navigateTo({ url: '/pages/mall/frame-detail' });
}

function switchTab(tab: string) {
  activeTab.value = tab;
  if (tab === 'inventory' && list.value.length === 0) {
    loadInventory();
  }
}

async function loadData() {
  try {
    const [itemList, pointInfo] = await Promise.all([
      mallApi.items(),
      pointsApi.info()
    ]);
    items.value = itemList;
    points.value = pointInfo.currentPoints || 0;
  } catch (e) {
    toast.error('加载商城数据失败');
  }
}

async function loadInventory() {
  loadingInventory.value = true;
  try {
    const res = await mallApi.inventory();
    list.value = res;
  } catch (e) {
    toast.error('加载特权失败');
  } finally {
    loadingInventory.value = false;
  }
}

// ==== Mall Logic ====
function getExpireTag(item: any) {
  if (item.expireDays) return `有效期 ${item.expireDays} 天`;
  if (item.itemType === 2) return `有效期 30 天`;
  if (item.name.includes('告白') || item.name.includes('头像')) return '永久有效';
  return '有效期 7 天';
}

async function handleRedeem(item: any) {
  try {
    await messageBox.confirm({
      title: '确认兑换',
      content: `确定消耗 ${item.price} 积分兑换「${item.name}」吗？`,
      confirmButtonText: '立即兑换'
    });

    toast.loading('兑换中...');
    await mallApi.redeem(item.id);
    toast.success('兑换成功！');
    loadData();
    if (activeTab.value === 'inventory' || list.value.length > 0) {
      loadInventory();
    }
  } catch (e: any) {
    if (e !== 'cancel') toast.error(e.message || '兑换失败');
  }
}

// ==== Inventory Logic ====
function isExpired(item: any) {
  if (!item.expireTime) return false;
  return dayjs().isAfter(dayjs(item.expireTime));
}

function formatTime(time: string) {
  if (!time) return '永久';
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

function getItemDesc(item: any) {
  if (item.itemType === 2) return '可在服务详情页手动激活，保护本次服务免受积分处罚。';
  return '管家的专属特权权益。';
}

async function onUse(item: any) {
  if (item.itemType === 2) {
    selectedInventoryId.value = item.id;
    try {
      const [res1, res2] = await Promise.all([
        requestApi.list(1), // 进行中
        requestApi.list(2)  // 已完成
      ]);
      const all = [...res1, ...res2];

      activeRequests.value = all.filter((r: any) => {
        const isOngoing = r.status === 1 && !r.isExemptionUsed;
        const isLowScore = r.status === 2
          && r.score !== null && r.score !== undefined
          && Number(r.score) > 0 && Number(r.score) < 3
          && !r.isExemptionUsed;
        return isOngoing || isLowScore;
      });
      showUsePicker.value = true;
    } catch (e) {
      toast.error('获取服务列表失败');
    }
  } else {
    toast.info('该权益将在满足条件时自动生效或请在相关页面查看');
  }
}

async function confirmUse(requestId: number) {
  if (!selectedInventoryId.value) return;

  try {
    await messageBox.confirm({
      title: '使用免责金牌',
      content: '确定要为该服务使用免责金牌吗？一旦使用不可撤销。',
      confirmButtonText: '立即保护'
    });

    toast.loading('处理中...');
    await mallApi.useItem(selectedInventoryId.value, { requestId });
    toast.success('免责保护已激活！');
    showUsePicker.value = false;
    loadInventory();
  } catch (e: any) {
    if (e !== 'cancel') toast.error(e.message || '使用失败');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.mall-page {
  min-height: 100vh;
  background: #12141D;
  color: #fff;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100rpx 30rpx 20rpx;
  position: sticky;
  top: 0;
  background: #12141D;
  z-index: 10;
  .nav-title { font-size: 32rpx; font-weight: bold; color: #FFF; }
  .placeholder { width: 48rpx; }
}

.top-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  .label { font-size: 24rpx; color: #888; margin-bottom: 10rpx; }
  .points-val {
    font-size: 60rpx; font-weight: bold; color: #FFD700;
    display: flex; align-items: center; gap: 10rpx;
  }
  .star-icon { font-size: 40rpx; }
}

.tabs-container {
  padding: 0 40rpx;
  margin-bottom: 30rpx;
  display: flex; justify-content: center;
}
.tabs {
  display: flex; gap: 80rpx;
  .tab {
    font-size: 28rpx; color: #888;
    display: flex; flex-direction: column; align-items: center; gap: 10rpx;
    transition: all 0.3s;
    &.active {
      color: #00E5FF; font-weight: bold;
      .line { opacity: 1; transform: scaleX(1); }
    }
    .line {
      width: 40rpx; height: 6rpx; background: #00E5FF; border-radius: 4rpx;
      opacity: 0; transform: scaleX(0.5); transition: all 0.3s;
    }
  }
}

.tab-content {
  padding: 0 30rpx 60rpx;
}

/* ================= 兑换商城 ================= */
.mall-list {
  display: flex; flex-direction: column; gap: 24rpx;
}
.mall-card {
  background: #1C1E2B;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.icon-wrap {
  width: 100rpx; height: 100rpx;
  background: #252837; border-radius: 20rpx;
  display: flex; justify-content: center; align-items: center;
  flex-shrink: 0;
}
.emoji { font-size: 50rpx; }

.item-info {
  flex: 1; display: flex; flex-direction: column;
}
.name { font-size: 30rpx; font-weight: bold; color: #FFF; margin-bottom: 8rpx; }
.desc { font-size: 22rpx; color: #888; line-height: 1.4; margin-bottom: 16rpx; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price-row { display: flex; align-items: center; gap: 16rpx; flex-wrap: wrap; }
.price { font-size: 26rpx; font-weight: bold; color: #FFD700; }
.unit { font-size: 22rpx; color: #FFF; margin-left: 4rpx; font-weight: normal; }
.tag { font-size: 20rpx; color: #00E5FF; background: rgba(0, 229, 255, 0.1); padding: 2rpx 10rpx; border-radius: 8rpx; }
.tag.permanent { color: #1FCB6A; background: rgba(31, 203, 106, 0.1); }

.redeem-btn {
  margin: 0; padding: 0 30rpx; height: 60rpx; line-height: 60rpx;
  background: linear-gradient(90deg, #00E5FF, #00BFFF);
  color: #FFF; font-size: 24rpx; font-weight: bold;
  border-radius: 30rpx; flex-shrink: 0;
}

.frame-entry-card {
  border: 2rpx solid rgba(212, 175, 55, 0.4);
  background: linear-gradient(135deg, #1C1E2B, #2a2a2a);
}
.frame-wrap { background: #333; }
.highlight-name { color: #d4af37; }
.frame-btn { background: linear-gradient(90deg, #d4af37, #f9e295); color: #000; }

/* ================= 我的权益 ================= */
.rights-list { display: flex; flex-direction: column; gap: 30rpx; }
.rights-card {
  position: relative;
  background: linear-gradient(135deg, #1e2439 0%, #161a2b 100%);
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  border-radius: 24rpx; padding: 30rpx; overflow: hidden;

  &.used { opacity: 0.6; border-color: rgba(255,255,255,0.1); }
  &.expired { border-color: rgba(255,255,255,0.1); }

  .card-glow {
    position: absolute; top: -50%; right: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .card-main { display: flex; align-items: center; gap: 30rpx; z-index: 2; position: relative; }
  .emoji-icon { font-size: 60rpx; }

  .info-section {
    flex: 1;
    .name-row {
      display: flex; align-items: center; gap: 16rpx;
      .name { font-size: 32rpx; font-weight: bold; color: #d4af37; margin-bottom: 0; }
    }
    .desc { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx; display: block; -webkit-line-clamp: 2; overflow: hidden; text-overflow: ellipsis; }
    .time { font-size: 20rpx; color: rgba(255,255,255,0.4); margin-top: 12rpx; display: block; }
  }

  .status-tag {
    font-size: 18rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
    &.active { background: rgba(21, 203, 106, 0.2); color: #1fcb6a; }
    &.used { background: rgba(255,255,255,0.1); color: #999; }
    &.expired { background: rgba(255, 0, 0, 0.1); color: #ff5b5b; }
  }

  .card-footer {
    margin-top: 30rpx; padding-top: 24rpx; border-top: 1rpx solid rgba(255,255,255,0.05);
    display: flex; justify-content: space-between; align-items: center; z-index: 2; position: relative;
    .count { font-size: 24rpx; color: #d4af37; font-weight: bold; }
    .use-btn {
      margin: 0; padding: 0 40rpx; height: 64rpx; line-height: 64rpx;
      background: linear-gradient(90deg, #d4af37, #f9e295);
      color: #0f1220; font-size: 24rpx; font-weight: bold; border-radius: 32rpx;
    }
  }
  .used-info { margin-top: 20rpx; font-size: 20rpx; color: rgba(255,255,255,0.3); }
}

.empty-box {
  padding: 120rpx 0; text-align: center;
  display: flex; flex-direction: column; align-items: center; color: rgba(255,255,255,0.4);
  .empty-img { width: 300rpx; height: 300rpx; margin-bottom: 40rpx; opacity: 0.2; }
  .go-mall-btn { margin-top: 60rpx; background: #00E5FF; color: #FFF; padding: 0 60rpx; height: 80rpx; line-height: 80rpx; border-radius: 999rpx; font-weight: bold; font-size: 28rpx; border: none; }
}
.loading-box { padding: 100rpx 0; text-align: center; }

/* ================= 弹窗 ================= */
.use-popup { border-top-left-radius: 32rpx; border-top-right-radius: 32rpx; overflow: hidden; }
.popup-content { background: #1e2439; padding: 40rpx 30rpx; max-height: 70vh; display: flex; flex-direction: column; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; font-size: 32rpx; font-weight: bold; color: #d4af37; }
.request-list { flex: 1; display: flex; flex-direction: column; gap: 20rpx; }
.request-item {
  background: rgba(255,255,255,0.05); padding: 30rpx; border-radius: 20rpx; display: flex; justify-content: space-between; align-items: center;
  &:active { background: rgba(255,255,255,0.1); }
  &.low-score-warn { border-left: 6rpx solid #d4af37; background: rgba(212, 175, 55, 0.05); }
  .req-title-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
  .req-title { font-size: 28rpx; color: #eee; font-weight: 500; flex: 1; }
  .req-stars { font-size: 24rpx; letter-spacing: 2rpx; }
  .req-time { font-size: 22rpx; color: rgba(255,255,255,0.4); margin-top: 6rpx; display: block; }
}
.no-req { padding: 60rpx 0; text-align: center; color: rgba(255,255,255,0.4); font-size: 26rpx; }
</style>
