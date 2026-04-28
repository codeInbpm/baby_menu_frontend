<template>
  <view class="points-record-module">
    <view class="section-title">
      <text class="icon">📝</text> 最近积分记录
    </view>
    
    <view class="record-list" v-if="isValidArray(pointsStore.transactions)">
      <view class="record-item" v-for="item in pointsStore.transactions" :key="item.id">
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
    </view>
    
    <view class="empty-state" v-else>
      暂无积分记录哦～
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePointsStore } from '@/store/points';

const pointsStore = usePointsStore();

function isValidArray(arr: any) {
  return Array.isArray(arr) && arr.length > 0;
}

function formatTime(str: string) {
  if (!str) return '';
  // expected "YYYY-MM-DDTHH:mm:ss" or similar
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
    'daily_reset': '每日重置'
  };
  return map[type] || '其他';
}

function getAmountText(type: string, amount: number) {
  if (type === 'request_deduct') return `-${amount}`;
  if (type === 'allocate') return `+${amount}`;
  if (type === 'daily_reset') return '重置';
  return `${amount}`;
}
</script>

<style lang="scss" scoped>
.points-record-module {
  margin: 0 30rpx 40rpx;
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
  &.request_deduct { background: #FFF0F0; color: #FF4D4F; }
  &.allocate { background: #F0F9EB; color: #1FCB6A; }
  &.daily_reset { background: #f4f4f4; color: #999; }
}

.amount {
  font-size: 32rpx;
  font-weight: 700;
  &.request_deduct { color: #FF4D4F; }
  &.allocate { color: #1FCB6A; }
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
</style>
