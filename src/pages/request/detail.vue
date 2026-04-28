<template>
  <view class="page">
    <view class="card" v-if="data">
      <view class="title">{{ data.content }}</view>
      <view class="meta">发起时间：{{ data.createTime }}</view>
      <view class="meta">状态：{{ statusText(data.status) }}</view>
    </view>

    <view class="actions" v-if="data && isReceiver">
      <button v-if="data.status === 0" class="btn primary" @click="op('accept')">接受 ❤️</button>
      <button v-if="data.status === 0" class="btn ghost" @click="op('reject')">拒绝</button>
      <button v-if="data.status === 1" class="btn primary" @click="op('finish')">完成服务</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { requestApi } from '@/api';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const data = ref<any>(null);
const id = ref<number>(0);

const isReceiver = computed(() => data.value && data.value.toUserId === user.info?.id);

function statusText(s: number) {
  return ['待处理', '已接受', '已完成', '已拒绝'][s] || '';
}

onLoad((opts: any) => {
  id.value = Number(opts.id);
  load();
});

async function load() { data.value = await requestApi.detail(id.value); }
async function op(action: 'accept' | 'reject' | 'finish') {
  await (requestApi as any)[action](id.value);
  uni.showToast({ title: '已处理', icon: 'success' });
  load();
}
</script>

<style lang="scss" scoped>
.page { padding: 32rpx; }
.card { background: #fff; border-radius: 24rpx; padding: 32rpx; }
.title { font-size: 34rpx; font-weight: 700; color: #FF6FA0; margin-bottom: 16rpx; }
.meta { font-size: 26rpx; color: #888; margin-top: 8rpx; }
.actions { display: flex; gap: 20rpx; margin-top: 32rpx; }
.btn { flex: 1; padding: 22rpx 0; border-radius: 999rpx; font-size: 28rpx; }
.btn.primary { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; }
.btn.ghost { background: #f4f4f4; color: #666; }
</style>
