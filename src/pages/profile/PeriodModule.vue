<template>
  <view class="period-module" :class="themeClass">
    <view class="card-header">
      <view class="title">
        <text class="icon">🌸</text>
        <text>{{ isOwner ? '她的周期守护' : '我的周期守护' }}</text>
      </view>
      <view class="mode-tag">{{ config.mode === 'conceive' ? '备孕模式' : '普通模式' }}</view>
    </view>

    <view class="circle-container" @click="goCalendar">
      <view class="outer-circle">
        <view class="inner-circle">
          <view class="status-text">{{ overview.status }}</view>
          <view class="day-num" v-if="overview.status === '经期中'">第 {{ overview.dayInCycle }} 天</view>
          <view class="day-num" v-else>{{ overview.daysUntilNext }}<text class="unit">天</text></view>
          <view class="sub-text">{{ overview.status === '经期中' ? '正在经期' : '距离下次' }}</view>
        </view>
      </view>
      
      <!-- 预测区间 -->
      <view class="predict-range" v-if="overview.predictStartDate">
        预测：{{ formatDate(overview.predictStartDate) }} ~ {{ formatDate(overview.predictEndDate) }}
      </view>
    </view>

    <view class="tip-card" v-if="!isOwner">
      <view class="tip-icon">💡</view>
      <view class="tip-content">
        <view class="tip-title">今日建议</view>
        <view class="tip-desc">{{ displayTip }}</view>
      </view>
      <view class="action-btn" @click="goCalendar">记一笔</view>
    </view>

    <!-- 男生端：今日照顾计划 -->
    <view class="care-section" v-if="isOwner && overview.todayCare">
      <view class="care-header">
        <text class="c-title">今日如何照顾她 💖</text>
        <text class="c-phase">{{ overview.todayCare.phaseName }}</text>
      </view>
      
      <!-- 情绪安抚 -->
      <view class="care-block emotion" v-if="overview.todayCare.emotionAdvice">
        <view class="b-title">💭 情绪解码</view>
        <view class="b-text">{{ overview.todayCare.emotionAdvice }}</view>
      </view>

      <!-- 行动建议 -->
      <view class="care-block action" v-if="overview.todayCare.actionAdvice || overview.todayCare.careTips?.length">
        <view class="b-title">🛠️ 行动指南</view>
        <view class="b-text">{{ overview.todayCare.actionAdvice }}</view>
        <view class="tips-list">
          <view class="t-item" v-for="(t, idx) in overview.todayCare.careTips" :key="idx">
            <text class="dot">•</text> <text>{{ t }}</text>
          </view>
        </view>
      </view>

      <!-- 饮食红黑榜 -->
      <view class="care-block food" v-if="overview.todayCare.foodsToEat?.length || overview.todayCare.foodsToAvoid?.length">
        <view class="food-row">
          <view class="f-col eat" v-if="overview.todayCare.foodsToEat?.length">
            <view class="f-title">✅ 适宜</view>
            <view class="f-item" v-for="f in overview.todayCare.foodsToEat" :key="f">{{ f }}</view>
          </view>
          <view class="f-col avoid" v-if="overview.todayCare.foodsToAvoid?.length">
            <view class="f-title">❌ 忌口</view>
            <view class="f-item" v-for="f in overview.todayCare.foodsToAvoid" :key="f">{{ f }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-links" v-if="!isOwner">
      <view class="link-item" @click="goCalendar">
        <text class="l-icon">📅</text>
        <text>周期日历</text>
      </view>
      <view class="link-item" @click="showConfig = true">
        <text class="l-icon">⚙️</text>
        <text>设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { periodApi } from '@/api';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';

const user = useUserStore();
const overview = ref<any>({});
const config = ref<any>({});
const showConfig = ref(false);

const isOwner = computed(() => user.info?.roleInCouple === 'owner');
const themeClass = computed(() => user.themeClass);

const displayTip = computed(() => {
  return overview.value.dailyTip || '保持好的心情，迎接每一天 🌸';
});

async function load() {
  try {
    const targetId = isOwner.value ? user.partner?.id : undefined;
    overview.value = await periodApi.overview(targetId);
    if (!isOwner.value) {
      config.value = await periodApi.getConfig();
    }
  } catch (e) {}
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return dayjs(dateStr).format('M.D');
}

function goCalendar() {
  uni.navigateTo({ url: '/pages/profile/PeriodCalendar' });
}

onMounted(load);
</script>

<style lang="scss" scoped>
.period-module {
  margin: 0 32rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 30rpx var(--card-shadow);
}

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30rpx;
  .title {
    display: flex; align-items: center; gap: 12rpx;
    font-size: 30rpx; font-weight: bold; color: #333;
  }
  .mode-tag {
    font-size: 20rpx; color: #FF6FA0; background: #FFF0F5;
    padding: 4rpx 16rpx; border-radius: 20rpx;
  }
}

.circle-container {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 40rpx;
}

.outer-circle {
  width: 280rpx; height: 280rpx; border-radius: 50%;
  background: linear-gradient(135deg, #FFB6C1, #FF8DA1);
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 10rpx 40rpx rgba(255, 141, 161, 0.3);
  position: relative;
  
  &::after {
    content: ''; position: absolute; inset: 10rpx; border: 2rpx dashed rgba(255,255,255,0.5);
    border-radius: 50%;
  }
}

.inner-circle {
  width: 220rpx; height: 220rpx; border-radius: 50%;
  background: #fff;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  z-index: 1;
}

.status-text { font-size: 24rpx; color: #999; margin-bottom: 8rpx; }
.day-num {
  font-size: 60rpx; font-weight: bold; color: #FF6FA0; line-height: 1;
  .unit { font-size: 24rpx; margin-left: 4rpx; }
}
.sub-text { font-size: 22rpx; color: #bbb; margin-top: 8rpx; }

.predict-range {
  margin-top: 20rpx; font-size: 22rpx; color: #999;
  background: #f9f9f9; padding: 6rpx 20rpx; border-radius: 20rpx;
}

.tip-card {
  background: #FFF9FA; border-radius: 24rpx; padding: 24rpx;
  display: flex; align-items: center; gap: 20rpx;
  border: 2rpx solid #FFF0F5;
}
.tip-icon { font-size: 40rpx; }
.tip-content { flex: 1; }
.tip-title { font-size: 24rpx; font-weight: bold; color: #555; }
.tip-desc { font-size: 22rpx; color: #888; margin-top: 4rpx; line-height: 1.4; }

.action-btn {
  background: linear-gradient(135deg, #FF8FB3, #FF6FA0);
  color: #fff; font-size: 24rpx; font-weight: bold;
  padding: 12rpx 30rpx; border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 111, 160, 0.2);
}

.quick-links {
  display: flex; justify-content: space-around; margin-top: 30rpx;
  padding-top: 20rpx; border-top: 1rpx solid #f5f5f5;
  .link-item {
    display: flex; align-items: center; gap: 8rpx;
    font-size: 24rpx; color: #666;
  }
  .l-icon { font-size: 28rpx; }
}

.care-section {
  background: #FFF0F5;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: 20rpx;
}
.care-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
  .c-title { font-size: 30rpx; font-weight: bold; color: #FF4D8D; }
  .c-phase { font-size: 22rpx; background: rgba(255,105,180,0.15); color: #FF4D8D; padding: 4rpx 16rpx; border-radius: 20rpx; }
}
.care-block {
  margin-bottom: 24rpx; background: rgba(255,255,255,0.7); padding: 20rpx; border-radius: 16rpx;
  &:last-child { margin-bottom: 0; }
  .b-title { font-size: 26rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
  .b-text { font-size: 24rpx; color: #666; line-height: 1.5; }
}
.tips-list {
  margin-top: 12rpx;
  .t-item { font-size: 24rpx; color: #555; display: flex; align-items: flex-start; margin-bottom: 8rpx; }
  .dot { margin-right: 8rpx; color: #FF4D8D; font-weight: bold; }
}
.food-row {
  display: flex; gap: 20rpx;
  .f-col { flex: 1; }
  .f-title { font-size: 24rpx; font-weight: bold; margin-bottom: 8rpx; }
  .eat .f-title { color: #1FCB6A; }
  .avoid .f-title { color: #FF4D4F; }
  .f-item { font-size: 22rpx; color: #666; margin-bottom: 6rpx; line-height: 1.4; }
}
</style>
