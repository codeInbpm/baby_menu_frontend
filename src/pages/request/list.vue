<template>
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

    <view class="list">
      <view v-for="r in list" :key="r.id" class="card" @click="goDetail(r)">
        <view class="top">
          <text class="content">{{ r.content }}</text>
          <text class="status" :class="`s-${r.status}`">{{ statusText(r.status) }}</text>
        </view>
        <view class="meta">
          <text>{{ r.fromUserId === selfId ? '我发起的' : '对方发起' }}</text>
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

const user = useUserStore();
const selfId = computed(() => user.info?.id);

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
async function load() { list.value = await requestApi.list(tab.value); }
function goDetail(r: any) { uni.navigateTo({ url: `/pages/request/detail?id=${r.id}` }); }

onShow(load);
</script>

<style lang="scss" scoped>
.page { padding: 24rpx; }
.tabs { display: flex; background: #fff; border-radius: 999rpx; padding: 6rpx; margin-bottom: 24rpx; }
.tab { flex: 1; text-align: center; padding: 16rpx 0; font-size: 26rpx; color: #888; border-radius: 999rpx; }
.tab.active { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; font-weight: 600; }

.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; }
.top { display: flex; justify-content: space-between; align-items: center; }
.content { font-size: 30rpx; color: #333; font-weight: 600; }
.status { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 999rpx; }
.s-0 { background: #FFF1E0; color: #F0A040; }
.s-1 { background: #E0F1FF; color: #4080F0; }
.s-2 { background: #ECF8EE; color: #1FCB6A; }
.s-3 { background: #FBE6E6; color: #ff5b5b; }
.meta { display: flex; justify-content: space-between; margin-top: 14rpx; font-size: 22rpx; color: #999; }
.empty { text-align: center; padding: 100rpx 0; color: #B8A8B0; }
</style>
