<template>
  <view class="report-page">
    <view class="header-bg"></view>
    
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack"><wd-icon name="arrow-left" size="24px" color="#fff" /></view>
      <text class="title">宠爱报表</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="content">
      <!-- Tabs -->
      <view class="tabs">
        <view 
          v-for="item in tabs" 
          :key="item.value"
          class="tab-item"
          :class="{ active: currentTab === item.value }"
          @click="switchTab(item.value)"
        >
          {{ item.label }}
        </view>
      </view>

      <view v-if="loading" class="loading-state">
        <wd-loading color="#FF69B4" size="36px" />
        <text>正在生成爱的时光机...</text>
      </view>

      <view v-else-if="!data" class="empty-state">
        <image src="/static/empty.png" class="empty-img" />
        <text>暂无数据</text>
      </view>

      <view v-else class="report-content">
        <!-- Section 1: Data Overview -->
        <view class="card overview-card">
          <view class="days-title">我们相爱的第 <text class="highlight">{{ data.coupleDays }}</text> 天</view>
          
          <view class="stats-grid">
            <view class="stat-item">
              <text class="label">宝贝发起</text>
              <text class="value">{{ data.petRequestCount }} <text class="unit">次</text></text>
            </view>
            <view class="stat-item">
              <text class="label">管家完成</text>
              <text class="value">{{ data.ownerFinishCount }} <text class="unit">次</text></text>
            </view>
            <view class="stat-item">
              <text class="label">消耗积分</text>
              <text class="value">{{ data.petCostPoints }} <text class="unit">分</text></text>
            </view>
            <view class="stat-item">
              <text class="label">获得打赏</text>
              <text class="value">{{ data.ownerRewardPoints }} <text class="unit">分</text></text>
            </view>
          </view>

          <view class="balance-bar">
            <view class="balance-title">
              <text>互宠平衡指数</text>
              <text class="index-val">{{ data.balanceIndex }}%</text>
            </view>
            <view class="progress-bg">
              <view class="progress-fill" :style="{ width: data.balanceIndex + '%' }"></view>
            </view>
            <view class="balance-hint">指数越高，说明「有求必应」越完美哦～</view>
          </view>
        </view>

        <!-- Section 2: Heatmap -->
        <view class="card heat-card">
          <view class="card-title"><wd-icon name="chart-pie" size="18px" color="#FF69B4" class="icon" /> 宠爱心动热力日历</view>
          <view class="heat-grid">
            <view 
              v-for="(day, index) in heatmapDays" 
              :key="index"
              class="heat-cell"
              :class="getHeatClass(day.count)"
              :title="day.date + ': ' + day.count + '次'"
            ></view>
          </view>
          <view class="heat-legend">
            <text>少</text>
            <view class="heat-cell lvl-0"></view>
            <view class="heat-cell lvl-1"></view>
            <view class="heat-cell lvl-2"></view>
            <view class="heat-cell lvl-3"></view>
            <view class="heat-cell lvl-4"></view>
            <text>多</text>
          </view>
        </view>

        <!-- Section 3: Trend Chart -->
        <view class="card chart-card">
          <view class="card-title"><wd-icon name="chart-bar" size="18px" color="#FF69B4" class="icon" /> 积分流动趋势</view>
          <view class="chart-container">
            <u-chart 
              v-if="lineChartData.series && lineChartData.series.length > 0"
              canvasId="pointsTrendChart"
              type="line"
              :chartData="lineChartData"
              :canvasWidth="screenWidth - 60"
              :canvasHeight="220"
            />
            <view v-else class="no-chart-data">暂无趋势数据</view>
          </view>
        </view>

        <!-- Section 4: Pie Chart -->
        <view class="card chart-card">
          <view class="card-title"><wd-icon name="star" size="18px" color="#FF69B4" class="icon" /> 宝贝最爱点什么</view>
          <view class="chart-container">
            <u-chart 
              v-if="pieChartData.series && pieChartData.series[0].data.length > 0"
              canvasId="topServicesChart"
              type="ring"
              :chartData="pieChartData"
              :canvasWidth="screenWidth - 60"
              :canvasHeight="220"
            />
            <view v-else class="no-chart-data">暂无偏好数据</view>
          </view>
        </view>

        <!-- Section 5: Highlight -->
        <view class="card highlight-card">
          <view class="card-title"><wd-icon name="aperture" size="18px" color="#FF69B4" class="icon" /> 高光时刻</view>
          <view class="highlight-item">
            <text class="hl-label">最高满意度</text>
            <text class="hl-value">{{ data.bestService || '还没有评价哦' }}</text>
          </view>
          <view class="highlight-item">
            <text class="hl-label">最心动打赏</text>
            <text class="hl-value">{{ data.highlightMoment }}</text>
          </view>
        </view>

        <!-- Section 6: Emotional Summary -->
        <view class="card summary-card">
          <image src="/static/heart-bg.png" class="bg-img" mode="aspectFill" />
          <view class="summary-content">
            <view class="quote-mark">“</view>
            <view class="summary-text">{{ data.emotionalSummary }}</view>
            <view class="quote-mark right">”</view>
          </view>
        </view>
        
        <view class="bottom-space"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { reportApi } from '@/api';
import UChart from '@/components/u-chart/u-chart.vue';
import dayjs from 'dayjs';

const statusBarHeight = ref(20);
const screenWidth = ref(375);
const loading = ref(true);
const data = ref<any>(null);

const tabs = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' },
  { label: '本年', value: 'year' }
];
const currentTab = ref('month');

onLoad((options: any) => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  screenWidth.value = sysInfo.windowWidth;
  if (options.type) {
    currentTab.value = options.type;
  }
  fetchData();
});

function goBack() {
  uni.navigateBack();
}

function switchTab(val: string) {
  if (currentTab.value === val) return;
  currentTab.value = val;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await reportApi.overview(currentTab.value);
    data.value = res;
  } catch (e) {
    console.error('Failed to load report:', e);
  } finally {
    loading.value = false;
  }
}

// 构造热力图数据（补全空缺日期，形成矩阵）
const heatmapDays = computed(() => {
  if (!data.value || !data.value.heatCalendar) return [];
  const map = new Map();
  data.value.heatCalendar.forEach((item: any) => {
    map.set(item.date, item.count);
  });
  
  let daysCount = 30;
  if (currentTab.value === 'week') daysCount = 7;
  else if (currentTab.value === 'quarter') daysCount = 90;
  else if (currentTab.value === 'year') daysCount = 365;

  const result = [];
  const today = dayjs();
  // 生成过去 N 天的数据
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = today.subtract(i, 'day').format('YYYY-MM-DD');
    result.push({
      date: d,
      count: map.get(d) || 0
    });
  }
  return result;
});

function getHeatClass(count: number) {
  if (count === 0) return 'lvl-0';
  if (count <= 2) return 'lvl-1';
  if (count <= 4) return 'lvl-2';
  if (count <= 6) return 'lvl-3';
  return 'lvl-4';
}

const lineChartData = computed(() => {
  if (!data.value || !data.value.pointsTrend || data.value.pointsTrend.length === 0) {
    return { categories: [], series: [] };
  }
  
  // 截取最近 15 个点以防太拥挤
  const list = data.value.pointsTrend.slice(-15);
  
  const categories = list.map((item: any) => {
    const parts = item.date.split('-');
    return `${parts[1]}-${parts[2]}`;
  });
  
  const costData = list.map((item: any) => item.cost);
  const earnData = list.map((item: any) => item.earn);
  
  return {
    categories,
    series: [
      { name: '宝贝花费', data: costData },
      { name: '管家收益', data: earnData }
    ]
  };
});

const pieChartData = computed(() => {
  if (!data.value || !data.value.topServices || data.value.topServices.length === 0) {
    return { series: [] };
  }
  
  const seriesData = data.value.topServices.map((item: any) => ({
    name: item.name,
    value: item.count
  }));
  
  return {
    series: [{
      data: seriesData
    }]
  };
});
</script>

<style lang="scss" scoped>
.report-page {
  min-height: 100vh;
  background-color: #F8F5FB;
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 0;
}

.nav-bar {
  position: relative;
  z-index: 10;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  .back-btn { padding: 10rpx; }
  .title { color: #FFF; font-size: 34rpx; font-weight: bold; }
  .placeholder { width: 44px; }
}

.content {
  position: relative;
  z-index: 10;
  padding: 20rpx 30rpx;
}

.tabs {
  display: flex;
  justify-content: space-between;
  background: rgba(255,255,255,0.2);
  border-radius: 40rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
  backdrop-filter: blur(10px);
  
  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #FFF;
    padding: 16rpx 0;
    border-radius: 32rpx;
    transition: all 0.3s;
    
    &.active {
      background: #FFF;
      color: #FF69B4;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    }
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
  .empty-img { width: 200rpx; height: 200rpx; margin-bottom: 20rpx; opacity: 0.5; }
  text { margin-top: 20rpx; }
}

.card {
  background: #FFF;
  border-radius: 32rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  .icon { margin-right: 12rpx; }
}

/* Overview Card */
.overview-card {
  .days-title {
    text-align: center;
    font-size: 32rpx;
    color: #666;
    margin-bottom: 40rpx;
    .highlight {
      font-size: 64rpx;
      font-weight: 900;
      color: #FF69B4;
      margin: 0 10rpx;
      font-family: 'DIN Alternate', sans-serif;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
  
  .stat-item {
    background: #FFF5F9;
    padding: 24rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    
    .label { font-size: 24rpx; color: #888; margin-bottom: 8rpx; }
    .value { font-size: 40rpx; font-weight: bold; color: #333; font-family: 'DIN Alternate', sans-serif; }
    .unit { font-size: 24rpx; color: #999; font-weight: normal; margin-left: 4rpx; }
  }
}

.balance-bar {
  .balance-title {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
    .index-val { font-weight: bold; color: #FF69B4; font-size: 32rpx; }
  }
  .progress-bg {
    height: 16rpx;
    background: #EEEEEE;
    border-radius: 8rpx;
    overflow: hidden;
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFB6C1, #FF69B4);
      border-radius: 8rpx;
      transition: width 1s ease-in-out;
    }
  }
  .balance-hint { font-size: 22rpx; color: #999; margin-top: 12rpx; text-align: right; }
}

/* Heatmap Card */
.heat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 20rpx;
  .heat-cell {
    width: 28rpx;
    height: 28rpx;
    border-radius: 6rpx;
    background: #EBEDF0;
    &.lvl-0 { background: #EBEDF0; }
    &.lvl-1 { background: #FCD6E3; }
    &.lvl-2 { background: #FBAEC9; }
    &.lvl-3 { background: #F786B0; }
    &.lvl-4 { background: #FF69B4; box-shadow: 0 0 8rpx rgba(255,105,180,0.5); }
  }
}
.heat-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 22rpx;
  color: #999;
  gap: 6rpx;
  text { margin: 0 4rpx; }
  .heat-cell { width: 20rpx; height: 20rpx; border-radius: 4rpx; }
}

/* Chart Container */
.chart-container {
  height: 220px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.no-chart-data {
  color: #999;
  font-size: 28rpx;
}

/* Highlight Card */
.highlight-item {
  background: #FAFAFA;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  &:last-child { margin-bottom: 0; }
  
  .hl-label { font-size: 24rpx; color: #888; margin-bottom: 12rpx; }
  .hl-value { font-size: 28rpx; color: #333; font-weight: 500; line-height: 1.5; }
}

/* Summary Card */
.summary-card {
  position: relative;
  background: linear-gradient(135deg, #FF69B4 0%, #FF8C00 100%);
  color: #FFF;
  overflow: hidden;
  .bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; }
  
  .summary-content {
    position: relative;
    z-index: 1;
    padding: 20rpx;
  }
  
  .quote-mark { font-size: 80rpx; font-family: Georgia, serif; line-height: 1; opacity: 0.5; }
  .quote-mark.right { text-align: right; margin-top: -20rpx; }
  
  .summary-text {
    font-size: 30rpx;
    line-height: 1.8;
    text-align: justify;
    padding: 0 20rpx;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  }
}

.bottom-space { height: 60rpx; }
</style>
