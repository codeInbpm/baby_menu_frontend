<template>
  <view class="page-root" :style="themeStore.themeStyle">
    <view class="page">
    <view class="tabs">
      <view
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: tab === t.value }"
        @click="onTab(t.value)"
      >
        {{ t.label }}
      </view>
    </view>

    <!-- 管家差评预警提示 -->
    <view v-if="!isPet && lowScoreCount > 0 && !hideWarningBanner" class="butler-warning-banner" @click="goPendingExemption">
      <text class="warn-icon">🛡️</text>
      <text class="warn-text">检测到有 {{ lowScoreCount }} 项服务评价偏低，建议使用「免责金牌」保护</text>
      <text class="warn-arrow">></text>
      <view class="warn-close" @click.stop="hideWarningBanner = true">✕</view>
    </view>

    <view class="list">
      <view v-for="r in list" :key="r.id" class="card" @click="goDetail(r)">
        <view class="top">
          <text class="content">{{ r.content }}</text>
          <text class="status" :class="`s-${r.status}`">{{ statusText(r.status) }}</text>
        </view>
        <view class="meta">
          <view class="meta-left">
            <text>{{ r.fromUserId === selfId ? '我发起的' : '对方发起' }}</text>
            <text v-if="r.score && r.score > 0" class="stars">{{ '⭐'.repeat(r.score) }}</text>
            <text v-if="r.isExemptionUsed" class="exemption-tag">已免责</text>
          </view>
          <text class="time">{{ r.createTime }}</text>
        </view>
      </view>
      <view v-if="!list.length" class="empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { requestApi } from '@/api';
import { useUserStore } from '@/store/user';
import { useThemeStore } from '@/store/theme';

const user = useUserStore();
const themeStore = useThemeStore();
const selfId = computed(() => user.info?.id);
const isPet = computed(() => user.info?.roleInCouple === 'pet');

const tabs = [
  { label: '全部', value: undefined as number | undefined },
  { label: '待处理', value: 0 },
  { label: '已接受', value: 1 },
  { label: '已完成', value: 2 },
];
const tab = ref<number | undefined>(undefined);
const list = ref<any[]>([]);

function statusText(s: number) {
  return ['待处理', '已接受', '已完成', '已拒绝'][s] || '';
}
function onTab(v: number | undefined) { tab.value = v; load(); }

const lowScoreCount = ref(0);
const hideWarningBanner = ref(false);

async function checkExemptionOpportunity() {
  try {
    const res = await requestApi.list(2); // 已完成
    const lowList = res.filter((r: any) => {
      const hasLowScore = r.score !== null && r.score !== undefined && r.score > 0 && r.score < 3;
      const notExempted = !r.isExemptionUsed;
      return hasLowScore && notExempted;
    });
    lowScoreCount.value = lowList.length;
  } catch (e) {
    console.error('[免责预警] 检测失败:', e);
  }
}

function goPendingExemption() {
  uni.navigateTo({ url: '/pages/mall/index' });
}

async function load() { 
  list.value = await requestApi.list(tab.value); 
  if (!isPet.value) {
    checkExemptionOpportunity();
  }
}
function goDetail(r: any) { uni.navigateTo({ url: `/pages/request/detail?id=${r.id}` }); }

onShow(load);
</script>

<style lang="scss" scoped>
.page { padding: 24rpx; }
.tabs { display: flex; background: var(--card-bg); border-radius: 999rpx; padding: 6rpx; margin-bottom: 24rpx; border: 1rpx solid rgba(255,255,255,0.05); }
.tab { flex: 1; text-align: center; padding: 16rpx 0; font-size: 26rpx; color: var(--secondary-text); border-radius: 999rpx; }
.tab.active { background: var(--gradient); color: #fff; font-weight: 600; }

.card { background: var(--card-bg); border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 12rpx var(--card-shadow); border: 1rpx solid rgba(255,255,255,0.05); }
.top { display: flex; justify-content: space-between; align-items: center; }
.content { font-size: 30rpx; color: var(--text-color); font-weight: 600; }
.status { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 999rpx; }
.s-0 { background: var(--bg-color); color: #F0A040; opacity: 0.9; }
.s-1 { background: var(--bg-color); color: #4080F0; opacity: 0.9; }
.s-2 { background: var(--bg-color); color: #1FCB6A; opacity: 0.9; }
.s-3 { background: var(--bg-color); color: #ff5b5b; opacity: 0.9; }
.meta { display: flex; justify-content: space-between; align-items: center; margin-top: 14rpx; font-size: 22rpx; color: var(--secondary-text); }
.meta-left { display: flex; align-items: center; gap: 12rpx; }
.stars { color: #FFD700; letter-spacing: 2rpx; font-size: 20rpx; }
.exemption-tag { font-size: 18rpx; color: #d4af37; background: rgba(212, 175, 55, 0.1); padding: 2rpx 10rpx; border-radius: 8rpx; border: 1rpx solid rgba(212, 175, 55, 0.3); }
.empty { text-align: center; padding: 100rpx 0; color: var(--secondary-text); }

.butler-warning-banner {
  background: linear-gradient(90deg, #1e2439, #2c2c2c);
  color: #d4af37;
  padding: 20rpx 28rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.2);
  
  .warn-icon { font-size: 32rpx; margin-right: 16rpx; }
  .warn-text { flex: 1; font-weight: bold; }
  .warn-arrow { opacity: 0.5; margin-left: 10rpx; }
  .warn-close { opacity: 0.6; margin-left: 20rpx; font-size: 28rpx; padding: 10rpx; }
}
</style>
