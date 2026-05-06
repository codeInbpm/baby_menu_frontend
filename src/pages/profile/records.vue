<template>
  <view class="records-page">
    <!-- Filter & Config Bar -->
    <view class="filter-bar">
      <view class="filter-btn" @click="openFilter">
        <wd-icon name="filter" size="16px" />
        <text>筛选</text>
        <view class="badge" v-if="selectedTypes.length > 0">{{ selectedTypes.length }}</view>
      </view>
      
      <picker mode="selector" :range="sizeOptions" @change="onSizeChange">
        <view class="size-picker">
          <text>{{ size }}条/页</text>
          <wd-icon name="arrow-down" size="12px" />
        </view>
      </picker>
    </view>

    <!-- Records -->
    <view class="record-list" v-if="isValidArray(list)">
      <view class="record-item" v-for="item in list" :key="item.id">
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
    
    <view class="empty-state" v-if="!isValidArray(list) && !loading">
      没有找到对应的积分记录哦～
    </view>

    <!-- Pagination Controls -->
    <view class="pagination" v-if="totalPages > 0">
      <button class="page-btn" :class="{ disabled: current <= 1 }" @click="changePage(-1)">上一页</button>
      <text class="page-info">{{ current }} / {{ totalPages }}</text>
      <button class="page-btn" :class="{ disabled: current >= totalPages }" @click="changePage(1)">下一页</button>
    </view>

    <!-- Filter Popup -->
    <wd-popup v-model="showFilter" position="bottom" custom-style="border-radius: 24rpx 24rpx 0 0; background: #fff;">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="title">筛选交易类型</text>
          <wd-icon name="close" size="20px" color="#999" @click="showFilter = false" />
        </view>
        <view class="popup-body">
          <view 
            v-for="(label, key) in typeMap" 
            :key="key"
            class="filter-tag"
            :class="{ active: tempSelectedTypes.includes(String(key)) }"
            @click="toggleType(String(key))"
          >
            {{ label }}
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn reset" @click="resetFilter">重置</button>
          <button class="btn confirm" @click="applyFilter">确定</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { pointsApi } from '@/api';

const list = ref<any[]>([]);
const current = ref(1);
const size = ref(10);
const total = ref(0);
const sizeOptions = [10, 20, 50];
const loading = ref(false);

const showFilter = ref(false);
const selectedTypes = ref<string[]>([]);
const tempSelectedTypes = ref<string[]>([]);

const typeMap: Record<string, string> = {
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

const totalPages = computed(() => {
  return Math.ceil(total.value / size.value) || 0;
});

async function fetchList() {
  if (loading.value) return;
  loading.value = true;
  uni.showLoading({ title: '加载中...' });
  try {
    const typesParam = selectedTypes.value.length > 0 ? selectedTypes.value.join(',') : undefined;
    const res = await pointsApi.transactionsPage(current.value, size.value, typesParam);
    if (res && res.records) {
      list.value = res.records;
      total.value = res.total || 0;
    }
  } catch (err) {
    console.error('Fetch records err:', err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    uni.hideLoading();
    uni.stopPullDownRefresh();
  }
}

onLoad(() => {
  fetchList();
});

onPullDownRefresh(() => {
  current.value = 1;
  fetchList();
});

function onSizeChange(e: any) {
  size.value = sizeOptions[e.detail.value];
  current.value = 1;
  fetchList();
}

function changePage(delta: number) {
  const target = current.value + delta;
  if (target >= 1 && target <= totalPages.value) {
    current.value = target;
    fetchList();
    uni.pageScrollTo({ scrollTop: 0, duration: 300 });
  }
}

function openFilter() {
  tempSelectedTypes.value = [...selectedTypes.value];
  showFilter.value = true;
}

function toggleType(key: string) {
  const idx = tempSelectedTypes.value.indexOf(key);
  if (idx > -1) {
    tempSelectedTypes.value.splice(idx, 1);
  } else {
    tempSelectedTypes.value.push(key);
  }
}

function resetFilter() {
  tempSelectedTypes.value = [];
}

function applyFilter() {
  selectedTypes.value = [...tempSelectedTypes.value];
  showFilter.value = false;
  current.value = 1;
  fetchList();
}

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
  return typeMap[type] || '其他';
}

function getAmountText(type: string, amount: number) {
  if (type === 'request_deduct' || type === 'allocate_out' || type === 'reward_given') return `-${amount}`;
  if (type === 'allocate' || type === 'request_refund' || type === 'reward_received' || type === 'request_income') return `+${amount}`;
  if (type === 'daily_reset' || type === 'monthly_reset') return '重置';
  return `${amount}`;
}
</script>

<style lang="scss" scoped>
.records-page {
  min-height: 100vh;
  background: #fcf8fa;
  padding: 30rpx;
  padding-bottom: 60rpx;
  box-sizing: border-box;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  background: #fff;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #333;
  position: relative;
  
  .badge {
    position: absolute;
    top: -12rpx;
    right: -16rpx;
    background: #FF6FA0;
    color: #fff;
    font-size: 20rpx;
    padding: 0 8rpx;
    border-radius: 20rpx;
    line-height: 28rpx;
    height: 28rpx;
  }
}

.size-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}

.record-list {
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  margin-bottom: 30rpx;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30rpx;
  margin-top: 40rpx;
  
  .page-btn {
    margin: 0;
    padding: 0 40rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 26rpx;
    background: #fff;
    color: #333;
    border-radius: 32rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    &::after { border: none; }
    
    &.disabled {
      color: #ccc;
      background: #f9f9f9;
      box-shadow: none;
    }
  }
  
  .page-info {
    font-size: 26rpx;
    color: #666;
    font-weight: 500;
  }
}

.filter-popup {
  padding: 40rpx 30rpx;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .popup-body {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 60rpx;
    
    .filter-tag {
      padding: 16rpx 30rpx;
      background: #f5f5f5;
      color: #666;
      border-radius: 40rpx;
      font-size: 26rpx;
      transition: all 0.2s;
      
      &.active {
        background: #FFF0F6;
        color: #FF6FA0;
        font-weight: 500;
      }
    }
  }
  
  .popup-footer {
    display: flex;
    gap: 30rpx;
    
    .btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: bold;
      margin: 0;
      &::after { border: none; }
      
      &.reset {
        background: #f5f5f5;
        color: #666;
      }
      
      &.confirm {
        background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
        color: #fff;
      }
    }
  }
}
</style>
