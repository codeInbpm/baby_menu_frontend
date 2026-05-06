<template>
  <view class="calendar-page" :class="themeClass">
    <view class="header">
      <view class="back" @click="back">‹</view>
      <view class="title">{{ currentMonthText }}</view>
      <view class="actions">
        <view class="btn" @click="prevMonth">‹</view>
        <view class="btn" @click="nextMonth">›</view>
      </view>
    </view>

    <!-- 日历主体 -->
    <view class="calendar-card card">
      <view class="weeks">
        <text v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</text>
      </view>
      <view class="days-grid">
        <view 
          v-for="(day, idx) in days" 
          :key="idx" 
          class="day-cell"
          :class="{ 
            'not-current': !day.isCurrentMonth,
            'is-today': day.isToday,
            'is-period': day.isPeriod,
            'is-predict': day.isPredict,
            'is-ovulation': day.isOvulation
          }"
          @click="onDayClick(day)"
        >
          <text class="day-num">{{ day.day }}</text>
          <view class="indicator" v-if="day.hasRecord"></view>
        </view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="legend card">
      <view class="l-item"><view class="dot period"></view><text>经期</text></view>
      <view class="l-item"><view class="dot predict"></view><text>预测期</text></view>
      <view class="l-item"><view class="dot ovulation"></view><text>排卵日</text></view>
    </view>

    <!-- 记录详情/记录表单 -->
    <view class="record-section card" v-if="selectedDay">
      <view class="s-header">
        <text class="date">{{ selectedDay.fullDate }}</text>
        <text class="status-tag" :class="{ period: selectedDay.isPeriod }">
          {{ selectedDay.isPeriod ? '经期中' : '非经期' }}
        </text>
      </view>
      
      <view class="record-form" v-if="!isOwner">
        <view class="form-row">
          <text>是否来姨妈</text>
          <wd-switch v-model="recordForm.isPeriod" active-color="#FF6699" />
        </view>
        
        <template v-if="recordForm.isPeriod">
          <view class="form-label">流量</view>
          <view class="options-grid">
            <view 
              v-for="f in [{v:1,n:'少'},{v:2,n:'中'},{v:3,n:'多'}]" 
              :key="f.v"
              class="opt-item"
              :class="{ active: recordForm.flow === f.v }"
              @click="recordForm.flow = f.v"
            >{{ f.n }}</view>
          </view>
          
          <view class="form-label">痛经程度</view>
          <view class="options-grid">
            <view 
              v-for="p in [{v:0,n:'无'},{v:1,n:'轻微'},{v:2,n:'中度'},{v:3,n:'严重'}]" 
              :key="p.v"
              class="opt-item"
              :class="{ active: recordForm.painLevel === p.v }"
              @click="recordForm.painLevel = p.v"
            >{{ p.n }}</view>
          </view>
        </template>

        <view class="form-label">心情</view>
        <view class="options-grid mood">
          <view 
            v-for="m in [{v:'smile',n:'😊'},{v:'normal',n:'😐'},{v:'sad',n:'😢'},{v:'angry',n:'😡'}]" 
            :key="m.v"
            class="opt-item"
            :class="{ active: recordForm.mood === m.v }"
            @click="recordForm.mood = m.v"
          >{{ m.n }}</view>
        </view>

        <view class="form-label">特殊需求 (他能为你做什么)</view>
        <textarea class="textarea" style="height: 100rpx;" v-model="recordForm.specialNeeds" placeholder="例如：想喝红糖水、想吃火锅..." />

        <view class="form-label">备注</view>
        <textarea class="textarea" v-model="recordForm.note" placeholder="写点什么吧..." />

        <button class="btn-primary" @click="saveRecord">保存记录</button>
      </view>
      <view class="record-display" v-else>
        <!-- Owner 查看记录 -->
        <view class="display-item" v-if="selectedDay.record?.painLevel">
          <text class="label">痛经程度：</text>
          <text>{{ getPainName(selectedDay.record.painLevel) }}</text>
        </view>
        <view class="display-item" v-if="selectedDay.record?.mood">
          <text class="label">心情：</text>
          <text>{{ getMoodName(selectedDay.record.mood) }}</text>
        </view>
        <view class="display-item" v-if="selectedDay.record?.specialNeeds">
          <text class="label">她的需求：</text>
          <text>{{ selectedDay.record.specialNeeds }}</text>
        </view>
        <view class="display-item" v-if="selectedDay.record?.note">
          <text class="label">备注：</text>
          <text>{{ selectedDay.record.note }}</text>
        </view>
        <view class="owner-tip" v-if="!selectedDay.record">她这天没有留下记录哦 ❤️</view>
        
        <!-- 今日关怀建议 -->
        <view class="care-section" v-if="dayCareData">
          <view class="care-header">
            <text class="c-title">如何照顾她 💖</text>
            <text class="c-phase">{{ dayCareData.phaseName }}</text>
          </view>
          
          <view class="care-block emotion" v-if="dayCareData.emotionAdvice">
            <view class="b-title">💭 情绪解码</view>
            <view class="b-text">{{ dayCareData.emotionAdvice }}</view>
          </view>

          <view class="care-block action" v-if="dayCareData.actionAdvice || dayCareData.careTips?.length">
            <view class="b-title">🛠️ 行动指南</view>
            <view class="b-text">{{ dayCareData.actionAdvice }}</view>
            <view class="tips-list">
              <view class="t-item" v-for="(t, idx) in dayCareData.careTips" :key="idx">
                <text class="dot">•</text> <text>{{ t }}</text>
              </view>
            </view>
          </view>

          <view class="care-block food" v-if="dayCareData.foodsToEat?.length || dayCareData.foodsToAvoid?.length">
            <view class="food-row">
              <view class="f-col eat" v-if="dayCareData.foodsToEat?.length">
                <view class="f-title">✅ 适宜</view>
                <view class="f-item" v-for="f in dayCareData.foodsToEat" :key="f">{{ f }}</view>
              </view>
              <view class="f-col avoid" v-if="dayCareData.foodsToAvoid?.length">
                <view class="f-title">❌ 忌口</view>
                <view class="f-item" v-for="f in dayCareData.foodsToAvoid" :key="f">{{ f }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 趋势分析 -->
    <view class="analysis-section card" v-if="analysisData.cycleTrends?.length">
      <view class="s-header">
        <text class="date">周期趋势</text>
      </view>
      <view class="chart-box">
        <u-chart 
          canvasId="periodTrend" 
          type="line" 
          :chartData="trendChartData" 
          :canvasWidth="300"
          :canvasHeight="180"
        />
      </view>
      <view class="analysis-tip">
        最近平均周期：{{ avgCycleLength }}天，状态{{ stabilityText }}。
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { periodApi } from '@/api';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';
import uChart from '@/components/u-chart/u-chart.vue';

const user = useUserStore();
const isOwner = computed(() => user.info?.roleInCouple === 'owner');
const themeClass = computed(() => user.themeClass);

const currentMonth = ref(dayjs().startOf('month'));
const records = ref<any[]>([]);
const overview = ref<any>({});
const analysisData = ref<any>({});
const selectedDay = ref<any>(null);

const recordForm = ref({
  isPeriod: false,
  flow: 2,
  mood: 'smile',
  note: '',
  painLevel: 0,
  specialNeeds: ''
});
const dayCareData = ref<any>(null);

const currentMonthText = computed(() => currentMonth.value.format('YYYY年MM月'));

const days = computed(() => {
  const start = currentMonth.value.startOf('month');
  const end = currentMonth.value.endOf('month');
  const startDay = start.day() || 7; // 1-7
  
  const result = [];
  
  // 填充上月
  for (let i = 1; i < startDay; i++) {
    const d = start.subtract(startDay - i, 'day');
    result.push(generateDayObj(d, false));
  }
  
  // 本月
  for (let i = 1; i <= end.date(); i++) {
    const d = start.date(i);
    result.push(generateDayObj(d, true));
  }
  
  // 填充下月
  const remain = 42 - result.length;
  for (let i = 1; i <= remain; i++) {
    const d = end.add(i, 'day');
    result.push(generateDayObj(d, false));
  }
  
  return result;
});

function generateDayObj(d: dayjs.Dayjs, isCurrent: boolean) {
  const dateStr = d.format('YYYY-MM-DD');
  const record = records.value.find(r => r.recordDate === dateStr);
  
  // 预测逻辑 (简化)
  const isPredict = overview.value.predictStartDate && 
                   d.isAfter(dayjs(overview.value.predictStartDate).subtract(1, 'day')) && 
                   d.isBefore(dayjs(overview.value.predictEndDate).add(1, 'day'));
  
  const isOvulation = overview.value.ovulationDate === dateStr;

  return {
    day: d.date(),
    dateStr,
    isCurrentMonth: isCurrent,
    isToday: d.isSame(dayjs(), 'day'),
    isPeriod: record?.isPeriod,
    isPredict,
    isOvulation,
    hasRecord: !!record,
    record
  };
}

async function loadData() {
  const targetId = isOwner.value ? user.partner?.id : undefined;
  overview.value = await periodApi.overview(targetId);
  records.value = await periodApi.calendar(currentMonth.value.format('YYYY-MM'), targetId);
  analysisData.value = await periodApi.analysis(targetId);
}

const trendChartData = computed(() => {
  if (!analysisData.value.cycleTrends) return { categories: [], series: [] };
  return {
    categories: analysisData.value.cycleDates.map((d: string) => dayjs(d).format('M.D')),
    series: [{
      name: '周期长度',
      data: analysisData.value.cycleTrends
    }]
  };
});

const avgCycleLength = computed(() => {
  const trends = analysisData.value.cycleTrends;
  if (!trends?.length) return 0;
  const sum = trends.reduce((a: number, b: number) => a + b, 0);
  return (sum / trends.length).toFixed(1);
});

const stabilityText = computed(() => {
  const trends = analysisData.value.cycleTrends;
  if (!trends || trends.length < 2) return '观察中';
  const max = Math.max(...trends);
  const min = Math.min(...trends);
  return (max - min) <= 3 ? '非常稳定' : '略有波动';
});

async function onDayClick(day: any) {
  selectedDay.value = {
    ...day,
    fullDate: dayjs(day.dateStr).format('M月D日')
  };
  
  if (day.record) {
    recordForm.value = {
      isPeriod: day.record.isPeriod,
      flow: day.record.flow || 2,
      mood: day.record.mood || 'smile',
      note: day.record.note || '',
      painLevel: day.record.painLevel || 0,
      specialNeeds: day.record.specialNeeds || ''
    };
  } else {
    recordForm.value = {
      isPeriod: false,
      flow: 2,
      mood: 'smile',
      note: '',
      painLevel: 0,
      specialNeeds: ''
    };
  }

  // Load care data if owner
  if (isOwner.value) {
    dayCareData.value = null;
    try {
      const targetId = user.partner?.id;
      dayCareData.value = await periodApi.dayCare(day.dateStr, targetId);
    } catch(e) {}
  }
}

async function saveRecord() {
  uni.showLoading({ title: '保存中...' });
  try {
    await periodApi.saveRecord({
      recordDate: selectedDay.value.dateStr,
      ...recordForm.value
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
    loadData();
  } catch (e) {}
}

function getMoodName(mood: string) {
  const moods: any = { smile: '😊 开心', normal: '😐 一般', sad: '😢 难过', angry: '😡 生气' };
  return moods[mood] || '未知';
}

function getPainName(level: number) {
  const pains = ['无', '轻微', '中度', '严重'];
  return pains[level] || '未知';
}

function prevMonth() { currentMonth.value = currentMonth.value.subtract(1, 'month'); }
function nextMonth() { currentMonth.value = currentMonth.value.add(1, 'month'); }
function back() { uni.navigateBack(); }

watch(currentMonth, loadData);
onMounted(() => {
  loadData();
  onDayClick(generateDayObj(dayjs(), true));
});
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding: 30rpx;
}

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 0 40rpx;
  .title { font-size: 34rpx; font-weight: bold; color: #333; }
  .back, .btn { font-size: 40rpx; color: #666; padding: 10rpx 20rpx; }
  .actions { display: flex; gap: 20rpx; }
}

.weeks {
  display: flex; margin-bottom: 20rpx;
  text { flex: 1; text-align: center; font-size: 24rpx; color: #999; }
}

.days-grid {
  display: flex; flex-wrap: wrap;
}
.day-cell {
  width: 14.28%; height: 100rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
  
  .day-num { font-size: 30rpx; color: #333; z-index: 1; }
  &.not-current { opacity: 0.3; }
  &.is-today .day-num { color: var(--primary-color); font-weight: bold; }
  
  &.is-period {
    &::after {
      content: ''; position: absolute; width: 60rpx; height: 60rpx;
      background: #FFE0E9; border-radius: 50%; z-index: 0;
    }
    .day-num { color: #FF4D8D; }
  }
  
  &.is-predict {
    &::after {
      content: ''; position: absolute; width: 60rpx; height: 60rpx;
      border: 2rpx dashed #FFB6C1; border-radius: 50%; z-index: 0;
    }
  }

  &.is-ovulation {
    &::after {
      content: ''; position: absolute; width: 60rpx; height: 60rpx;
      background: #F3E5F5; border-radius: 50%; z-index: 0;
    }
    .day-num { color: #8E24AA; }
  }

  .indicator {
    width: 6rpx; height: 6rpx; background: #FF6FA0; border-radius: 50%;
    position: absolute; bottom: 10rpx;
  }
}

.legend {
  margin-top: 30rpx; display: flex; justify-content: space-around; padding: 20rpx;
  .l-item { display: flex; align-items: center; gap: 10rpx; font-size: 24rpx; color: #666; }
  .dot { width: 20rpx; height: 20rpx; border-radius: 50%; }
  .dot.period { background: #FFE0E9; border: 1rpx solid #FF4D8D; }
  .dot.predict { border: 2rpx dashed #FFB6C1; }
  .dot.ovulation { background: #F3E5F5; border: 1rpx solid #8E24AA; }
}

.record-section {
  margin-top: 30rpx; padding: 30rpx;
  .s-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 30rpx;
    .date { font-size: 32rpx; font-weight: bold; }
    .status-tag {
      font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx; background: #f5f5f5; color: #999;
      &.period { background: #FFF0F5; color: #FF6FA0; }
    }
  }
}

.form-label { font-size: 26rpx; color: #666; margin: 30rpx 0 16rpx; }
.form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }

.options-grid {
  display: flex; gap: 20rpx;
  .opt-item {
    flex: 1; height: 70rpx; display: flex; align-items: center; justify-content: center;
    background: #f9f9f9; border-radius: 12rpx; font-size: 26rpx; color: #666;
    transition: all 0.3s;
    &.active { background: var(--bg-color); color: var(--primary-color); border: 1rpx solid var(--primary-color); }
  }
  &.mood .opt-item { font-size: 40rpx; }
}

.textarea {
  width: 100%; height: 160rpx; background: #f9f9f9; border-radius: 12rpx;
  padding: 20rpx; font-size: 26rpx; margin-top: 20rpx; box-sizing: border-box;
}

.btn-primary { margin-top: 40rpx; width: 100%; }

.record-display {
  .display-item { margin-bottom: 16rpx; font-size: 28rpx; color: #333; .label { color: #999; } }
  .owner-tip { text-align: center; color: #bbb; font-size: 24rpx; padding: 40rpx 0; }
}

.analysis-section {
  margin-top: 30rpx; padding: 30rpx;
  .chart-box {
    margin: 20rpx 0;
    display: flex; justify-content: center;
  }
  .analysis-tip {
    font-size: 22rpx; color: #999; text-align: center; margin-top: 10rpx;
  }
}

.care-section {
  background: #FFF0F5;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: 30rpx;
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
