<template>
  <view class="points-record-module">
    <view class="section-title">
      <text class="icon">📝</text> 最近积分记录
    </view>
    
    <view class="record-list" v-if="isValidArray(displayList)">
      <view class="record-item" v-for="item in displayList" :key="item.id">
        <view class="left">
          <view class="time">{{ formatTime(item.createTime) }}</view>
          <view class="note" v-if="item.note">{{ item.note }}</view>
        </view>
        <view class="right">
          <view :class="['type-tag', item.type]">{{ getTypeText(item.type) }}</view>
          <view :class="['amount', item.type]">
            {{ getAmountText(item.type, Math.abs(item.amount)) }}
          </view>
        </view>
      </view>
      
      <view class="more-btn" v-if="hasMore" @click="goFullRecords">
        <text>查看更多明细</text>
        <text class="arrow">›</text>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      暂无积分记录哦～
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointsStore } from '@/store/points';

const pointsStore = usePointsStore();

const displayList = computed(() => {
  return pointsStore.transactions.slice(0, 3);
});

const hasMore = computed(() => {
  return pointsStore.transactions.length > 3;
});

function isValidArray(arr: any) {
  return Array.isArray(arr) && arr.length > 0;
}

function formatTime(str: string) {
  if (!str) return '';
  const d = new Date(str.replace(/-/g, '/').replace('T', ' '));
  if (isNaN(d.getTime())) return str;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    'request_deduct': '请求扣除',
    'allocate': '收到分配',
    'allocate_out': '发红包',
    'daily_reset': '每日重置',
    'monthly_reset': '月初重置',
    'request_refund': '积分退回',
    'request_income': '服务收益',
    'reward_received': '获得奖励',
    'reward_given': '送出奖励'
  };
  return map[type] || '其他';
}

function getAmountText(type: string, amount: number) {
  if (type === 'request_deduct' || type === 'allocate_out' || type === 'reward_given') return `-${amount}`;
  if (type === 'allocate' || type === 'request_refund' || type === 'reward_received' || type === 'request_income') return `+${amount}`;
  if (type === 'daily_reset' || type === 'monthly_reset') return '重置';
  return `${amount}`;
}

function goFullRecords() {
  uni.navigateTo({ url: '/pages/profile/records' });
}
</script>

<style lang="scss" scoped>
.points-record-module {
  margin: 30rpx 30rpx 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  .icon { margin-right: 12rpx; }
}

.record-list {
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #fafafa;
  &:last-child { border-bottom: none; }
}

.left {
  flex: 1;
  padding-right: 20rpx;
  .time { font-size: 24rpx; color: #999; margin-bottom: 8rpx; }
  .note { font-size: 26rpx; color: #555; }
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.type-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
  &.allocate { background: #F0F9EB; color: #1FCB6A; }
  &.allocate_out { background: #FFF0F0; color: #FF4D4F; }
  &.request_refund { background: #E6F7FF; color: #1890FF; }
  &.request_income { background: #FFF7E6; color: #FA8C16; }
  &.reward_received { background: #FFF0F6; color: #EB2F96; }
  &.reward_given { background: #F6FFED; color: #52C41A; }
  &.daily_reset, &.monthly_reset { background: #F5F5F5; color: #999; }
}

.amount {
  font-size: 32rpx;
  font-weight: 700;
  &.request_deduct { color: #FF4D4F; }
  &.allocate { color: #1FCB6A; }
  &.reward_received { color: #FF1493; }
  &.reward_given { color: #FF69B4; }
  &.daily_reset { color: #999; font-size: 26rpx; font-weight: normal; }
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
  background: #fff;
  border-radius: 24rpx;
}

.more-btn {
  display: flex; justify-content: center; align-items: center;
  padding-top: 24rpx;
  border-top: 2rpx dashed #f0f0f0;
  font-size: 24rpx; color: #FF6FA0;
  .arrow { margin-left: 8rpx; font-size: 28rpx; }
}
</style>
