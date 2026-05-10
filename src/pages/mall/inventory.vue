<template>
  <view class="inventory-page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" color="#d4af37" />
      </view>
    </view>
    <view class="header">
      <view class="title">我的特权</view>
      <view class="subtitle">管家的专属荣誉与护身符</view>
    </view>

    <view class="content">
      <view v-if="loading" class="loading-box">
        <wd-loading />
      </view>
      
      <view v-else-if="list.length === 0" class="empty-box">
        <image src="/static/empty.png" class="empty-img" />
        <text>目前还没有任何特权哦，快去商城看看吧～</text>
        <button class="go-mall-btn" @click="goMall">前往商城</button>
      </view>

      <view v-else class="rights-list">
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
            <wd-icon v-if="req.score > 0 && req.score <= 3" name="warn-bold" color="#d4af37" size="20px" />
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
import { mallApi, requestApi } from '@/api';
import { useToast, useMessage } from 'wot-design-uni';
import ExemptionIcon from '@/components/ExemptionIcon/ExemptionIcon.vue';
import dayjs from 'dayjs';

const toast = useToast();
const messageBox = useMessage();
const list = ref<any[]>([]);
const loading = ref(true);
const showUsePicker = ref(false);
const activeRequests = ref<any[]>([]);
const selectedInventoryId = ref<number | null>(null);

async function loadData() {
  loading.value = true;
  try {
    const res = await mallApi.inventory();
    list.value = res;
  } catch (e) {
    toast.error('加载失败');
  } finally {
    loading.value = false;
  }
}

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

function goMall() {
  uni.navigateTo({ url: '/pages/mall/index' });
}

function goBack() {
  uni.navigateBack();
}

async function onUse(item: any) {
  if (item.itemType === 2) {
    selectedInventoryId.value = item.id;
    // 加载待保护的服务列表
    try {
      const [res1, res2] = await Promise.all([
        requestApi.list(1), // 进行中
        requestApi.list(2)  // 已完成
      ]);
      const all = [...res1, ...res2];
      console.log('[权益包] 所有服务:', all.map((r: any) => ({ id: r.id, score: r.score, status: r.status, isExemptionUsed: r.isExemptionUsed })));
      
      activeRequests.value = all.filter((r: any) => {
        if (r.isExemptionUsed) return false;
        
        // 1. 进行中的请求 (Status: 1 - Accepted)
        if (r.status === 1) return true;
        
        // 2. 已完成的请求 (Status: 2 - Finished)
        if (r.status === 2) {
          // 如果还没评过分，允许预先保护
          if (r.score === null || r.score === undefined || r.score === 0) return true;
          // 如果评过分了，只有 <= 3 分的允许补救
          return Number(r.score) <= 3;
        }
        
        return false;
      });
      console.log('[权益包] 筛选后可保护:', activeRequests.value);
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
    loadData();
  } catch (e: any) {
    if (e !== 'cancel') toast.error(e.message || '使用失败');
  }
}

onMounted(loadData);
</script>

<style lang="scss" scoped>
.inventory-page {
  min-height: 100vh;
  background: #0f1220;
  color: #fff;
  padding: 0 30rpx 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 40rpx 0 20rpx;
  position: sticky;
  top: 0;
  background: #0f1220;
  z-index: 10;
}

.header {
  margin-bottom: 60rpx;
  .title { font-size: 48rpx; font-weight: 900; color: #d4af37; }
  .subtitle { font-size: 24rpx; color: rgba(255,255,255,0.5); margin-top: 10rpx; }
}

.rights-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.rights-card {
  position: relative;
  background: linear-gradient(135deg, #1e2439 0%, #161a2b 100%);
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  border-radius: 24rpx;
  padding: 30rpx;
  overflow: hidden;
  
  &.used { opacity: 0.6; border-color: rgba(255,255,255,0.1); }
  &.expired { border-color: rgba(255,255,255,0.1); }
  
  .card-glow {
    position: absolute; top: -50%; right: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .card-main {
    display: flex;
    align-items: center;
    gap: 30rpx;
    z-index: 2;
    position: relative;
  }
  
  .emoji-icon { font-size: 60rpx; }
  
  .info-section {
    flex: 1;
    .name-row {
      display: flex; align-items: center; gap: 16rpx;
      .name { font-size: 32rpx; font-weight: bold; color: #d4af37; }
    }
    .desc { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx; display: block; }
    .time { font-size: 20rpx; color: rgba(255,255,255,0.4); margin-top: 12rpx; display: block; }
  }
  
  .status-tag {
    font-size: 18rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
    &.active { background: rgba(21, 203, 106, 0.2); color: #1fcb6a; }
    &.used { background: rgba(255,255,255,0.1); color: #999; }
    &.expired { background: rgba(255, 0, 0, 0.1); color: #ff5b5b; }
  }
  
  .card-footer {
    margin-top: 30rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
    position: relative;
    
    .count { font-size: 24rpx; color: #d4af37; font-weight: bold; }
    .use-btn {
      margin: 0; padding: 0 40rpx; height: 64rpx; line-height: 64rpx;
      background: linear-gradient(90deg, #d4af37, #f9e295);
      color: #0f1220; font-size: 24rpx; font-weight: bold;
      border-radius: 32rpx;
    }
  }
  
  .used-info {
    margin-top: 20rpx; font-size: 20rpx; color: rgba(255,255,255,0.3);
  }
}

.use-popup {
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  overflow: hidden;
}

.popup-content {
  background: #1e2439;
  padding: 40rpx 30rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 40rpx;
  font-size: 32rpx; font-weight: bold; color: #d4af37;
}

.request-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.request-item {
  background: rgba(255,255,255,0.05);
  padding: 30rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:active { background: rgba(255,255,255,0.1); }
  &.low-score-warn { border-left: 6rpx solid #d4af37; background: rgba(212, 175, 55, 0.05); }
  
  .req-title-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
  .req-title { font-size: 28rpx; color: #eee; font-weight: 500; flex: 1; }
  .req-stars { font-size: 24rpx; letter-spacing: 2rpx; }
  .req-time { font-size: 22rpx; color: rgba(255,255,255,0.4); margin-top: 6rpx; display: block; }
}

.no-req {
  padding: 60rpx 0; text-align: center; color: rgba(255,255,255,0.4); font-size: 26rpx;
}

.empty-box {
  padding: 120rpx 0; text-align: center;
  display: flex; flex-direction: column; align-items: center;
  color: rgba(255,255,255,0.4);
  
  .empty-img { width: 300rpx; height: 300rpx; margin-bottom: 40rpx; opacity: 0.2; }
  .go-mall-btn {
    margin-top: 60rpx;
    background: #d4af37; color: #0f1220;
    padding: 20rpx 80rpx; border-radius: 999rpx; font-weight: bold;
  }
}

.loading-box { padding: 100rpx 0; text-align: center; }
</style>
