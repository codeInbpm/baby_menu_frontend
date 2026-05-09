<template>
  <view class="page">
    <view class="card" v-if="data">
      <view class="title">{{ data.content }}</view>
      <view class="meta">发起时间：{{ data.createTime }}</view>
      <view class="meta">状态：{{ statusText(data.status) }}</view>
      <!-- 已评价内容展示 -->
      <view class="eval-box" v-if="data.evaluatedTime">
        <view class="eval-title">服务评价</view>
        <view class="eval-row" v-if="data.score">
          <text class="label">评分：</text>
          <text class="stars">{{ '⭐'.repeat(data.score) }}</text>
        </view>
        <view class="eval-row" v-if="data.petRewardPoints > 0">
          <text class="label">奖励积分：</text>
          <text class="points">+{{ data.petRewardPoints }}</text>
        </view>
        <view class="eval-row" v-if="data.petFeedback">
          <text class="label">留言：</text>
          <text class="feedback">{{ data.petFeedback }}</text>
        </view>
      </view>
      <!-- 免责保护状态 -->
      <view class="exemption-status" v-if="data.isExemptionUsed">
        <wd-icon name="check-circle" color="#d4af37" size="16px" />
        <text>本次服务受「免责金牌」保护中</text>
      </view>
    </view>

    <view class="actions" v-if="data">
      <!-- 接收方操作 -->
      <block v-if="isReceiver">
        <button v-if="data.status === 0" class="btn primary" @click="op('accept')">接受 ❤️</button>
        <button v-if="data.status === 0" class="btn ghost" @click="op('reject')">拒绝</button>
        <button v-if="data.status === 1" class="btn primary" @click="op('finish')">完成服务</button>
        <!-- 任务已完成、被打低分且未免责时显示 -->
        <button v-if="data.status === 2 && data.score > 0 && data.score < 3 && !data.isExemptionUsed" class="btn gold-btn" @click="checkAndShowExemptionTip(true)">使用免责金牌</button>
      </block>

      <!-- 发起方操作 -->
      <block v-if="isSender">
        <button v-if="data.status === 2 && !data.evaluatedTime" class="btn primary eval-btn" @click="openEvaluate">评价并奖励 ❤️</button>
      </block>
    </view>

    <!-- 评价模态框 -->
    <wd-popup v-model="showEvaluateModal" position="bottom" custom-style="border-radius: 32rpx 32rpx 0 0;">
      <view class="eval-modal">
        <view class="modal-header">给管家评价 & 奖励</view>
        <view class="modal-content">
          <view class="form-item">
            <view class="label">服务评分</view>
            <view class="star-group">
              <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= evalData.score }" @click="evalData.score = i">★</text>
            </view>
          </view>
          <view class="form-item">
            <view class="label">奖励积分 (非必填)</view>
            <input class="input" type="number" v-model.number="evalData.rewardPoints" placeholder="例如：10" />
          </view>
          <view class="form-item">
            <view class="label">爱的留言 (非必填)</view>
            <textarea class="textarea" v-model="evalData.feedback" placeholder="今天按得特别舒服，辛苦啦❤️" :maxlength="100"></textarea>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn cancel" @click="showEvaluateModal = false">取消</view>
          <view class="btn confirm" @click="submitEvaluate">确认奖励</view>
        </view>
      </view>
    </wd-popup>

    <!-- 低分免责保护提示 -->
    <wd-popup v-model="showExemptionTip" position="center" custom-class="protection-popup">
      <view class="p-content">
        <view class="p-icon">🛡️</view>
        <view class="p-title">检测到低分评价预警</view>
        <view class="p-desc">公主本次评价偏低（{{ data?.score }}星），是否使用「服务免责金牌」进行保护？</view>
        <view class="p-tip">使用后将退回罚分，且不影响称号进度。(本月剩余{{ remainingExemptions }}次)</view>
        <view class="p-footer">
          <button class="p-btn ghost" @click="showExemptionTip = false">暂不使用</button>
          <button class="p-btn gold" @click="applyExemption">立即保护</button>
        </view>
      </view>
    </wd-popup>
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
const isSender = computed(() => data.value && data.value.fromUserId === user.info?.id);

const showEvaluateModal = ref(false);
const evalData = ref({ score: 5, rewardPoints: 10, feedback: '' });

function statusText(s: number) {
  return ['待处理', '已接受', '已完成', '已拒绝'][s] || '';
}

onLoad((opts: any) => {
  id.value = Number(opts.id);
  load();
});

async function load() { 
  data.value = await requestApi.detail(id.value); 
  // 强化触发条件：管家身份 + 已完成 + 评分 < 3 + 未免责
  if (isReceiver.value && data.value.status === 2 && data.value.score > 0 && data.value.score < 3 && !data.value.isExemptionUsed) {
    checkAndShowExemptionTip(false);
  }
}

const showExemptionTip = ref(false);
const remainingExemptions = ref(0);
const exemptionItemId = ref<number | null>(null);

async function checkAndShowExemptionTip(manual = false) {
  try {
    const inventory = await mallApi.inventory();
    const medal = inventory.find((it: any) => it.itemType === 2 && it.status === 0);
    if (medal) {
      exemptionItemId.value = medal.id;
      remainingExemptions.value = 1;
      showExemptionTip.value = true;
    } else if (manual) {
      uni.showToast({ title: '您暂无免责金牌，请前往商城兑换', icon: 'none' });
    }
  } catch (e) {
    if (manual) uni.showToast({ title: '获取特权失败', icon: 'none' });
  }
}

async function applyExemption() {
  if (!exemptionItemId.value) return;
  uni.showLoading({ title: '激活保护中...' });
  try {
    await mallApi.useItem(exemptionItemId.value, { requestId: id.value });
    uni.hideLoading();
    showExemptionTip.value = false;
    uni.showToast({ title: '免责保护已激活！', icon: 'success' });
    load();
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '激活失败', icon: 'none' });
  }
}
async function op(action: 'accept' | 'reject' | 'finish') {
  await (requestApi as any)[action](id.value);
  uni.showToast({ title: '已处理', icon: 'success' });
  load();
}

function openEvaluate() {
  evalData.value = { score: 5, rewardPoints: 10, feedback: '' };
  showEvaluateModal.value = true;
}

async function submitEvaluate() {
  if (evalData.value.rewardPoints < 0) {
    uni.showToast({ title: '奖励积分不能为负', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '提交中...' });
  try {
    await requestApi.evaluate(id.value, evalData.value);
    uni.hideLoading();
    showEvaluateModal.value = false;
    uni.showToast({ title: '评价成功！', icon: 'success' });
    load();
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '评价失败', icon: 'none' });
  }
}


</script>

<style lang="scss" scoped>
.page { padding: 32rpx; min-height: 100vh; background: #f7f7f7; }
.card { background: #fff; border-radius: 24rpx; padding: 32rpx; position: relative; }
.title { font-size: 34rpx; font-weight: 700; color: #FF6FA0; margin-bottom: 16rpx; }
.meta { font-size: 26rpx; color: #888; margin-top: 8rpx; }
.actions { display: flex; flex-direction: column; gap: 20rpx; margin-top: 32rpx; }
.btn { width: 100%; padding: 22rpx 0; border-radius: 999rpx; font-size: 28rpx; text-align: center; }
.btn.primary { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; }
.btn.ghost { background: #f4f4f4; color: #666; }
.btn.gold-btn { 
  background: linear-gradient(135deg, #d4af37, #f9e295); 
  color: #1a1a1a; font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(212, 175, 55, 0.3);
}

.exemption-status {
  margin-top: 24rpx; padding: 16rpx 24rpx; background: rgba(212, 175, 55, 0.08);
  border-radius: 12rpx; display: flex; align-items: center; gap: 12rpx;
  font-size: 24rpx; color: #b8860b; font-weight: 500;
}

.protection-popup {
  width: 600rpx; border-radius: 32rpx; overflow: hidden;
}
.p-content {
  padding: 60rpx 40rpx; text-align: center; background: #1e2439; color: #fff;
  .p-icon { font-size: 100rpx; margin-bottom: 30rpx; }
  .p-title { font-size: 36rpx; font-weight: bold; color: #d4af37; margin-bottom: 20rpx; }
  .p-desc { font-size: 28rpx; color: #eee; line-height: 1.5; margin-bottom: 20rpx; }
  .p-tip { font-size: 22rpx; color: rgba(255,255,255,0.4); margin-bottom: 40rpx; }
  .p-footer { display: flex; gap: 20rpx; }
  .p-btn { flex: 1; height: 80rpx; line-height: 80rpx; font-size: 26rpx; border-radius: 40rpx; margin: 0; }
  .p-btn.ghost { background: rgba(255,255,255,0.05); color: #888; }
  .p-btn.gold { background: linear-gradient(90deg, #d4af37, #f9e295); color: #0f1220; font-weight: bold; }
}

.eval-box {
  margin-top: 30rpx; padding-top: 20rpx; border-top: 2rpx dashed #eee;
  .eval-title { font-size: 28rpx; font-weight: 600; color: #FF6FA0; margin-bottom: 16rpx; }
  .eval-row { font-size: 26rpx; display: flex; margin-bottom: 12rpx; align-items: flex-start; }
  .label { color: #888; width: 140rpx; flex-shrink: 0; }
  .stars { color: #FFD700; letter-spacing: 4rpx; }
  .points { color: #FF6FA0; font-weight: bold; }
  .feedback { color: #333; flex: 1; line-height: 1.4; }
}

.eval-btn { background: linear-gradient(135deg, #FF69B4, #FF1493); box-shadow: 0 6rpx 20rpx rgba(255,105,180,0.3); }

.eval-modal {
  background: #fff; padding: 40rpx;
  .modal-header { font-size: 36rpx; font-weight: bold; text-align: center; margin-bottom: 40rpx; color: #333; }
  .form-item { margin-bottom: 30rpx; }
  .label { font-size: 28rpx; color: #666; margin-bottom: 16rpx; }
  .star-group { display: flex; gap: 16rpx; }
  .star { font-size: 60rpx; color: #eee; transition: color 0.3s; }
  .star.active { color: #FFD700; text-shadow: 0 2rpx 10rpx rgba(255,215,0,0.4); }
  .input { background: #f9f9f9; height: 80rpx; border-radius: 16rpx; padding: 0 24rpx; font-size: 28rpx; }
  .textarea { background: #f9f9f9; width: 100%; height: 160rpx; border-radius: 16rpx; padding: 24rpx; font-size: 28rpx; box-sizing: border-box; }
  .modal-footer {
    display: flex; gap: 20rpx; margin-top: 40rpx;
    .btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; justify-content: center; align-items: center; font-size: 30rpx; font-weight: 600; }
    .cancel { background: #f5f5f5; color: #666; }
    .confirm { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; box-shadow: 0 6rpx 20rpx rgba(255,111,160,0.3); }
  }
}
</style>
