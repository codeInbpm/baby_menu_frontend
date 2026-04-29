<template>
  <view class="u-chart-wrapper" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <canvas 
      :canvas-id="canvasId" 
      :id="canvasId" 
      class="ucharts" 
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" 
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, getCurrentInstance } from 'vue';
import uCharts from '@qiun/ucharts';

const props = defineProps({
  canvasId: { type: String, required: true },
  type: { type: String, default: 'line' },
  chartData: { type: Object, required: true },
  canvasWidth: { type: Number, default: 350 },
  canvasHeight: { type: Number, default: 250 },
  opts: { type: Object, default: () => ({}) }
});

let uChartsInstance: any = null;
const instance = getCurrentInstance();

function initChart() {
  try {
    if (!props.chartData || !props.chartData.series || props.chartData.series.length === 0) return;
    const ctx = uni.createCanvasContext(props.canvasId, instance?.proxy);
    const chartOpts: any = {
      type: props.type,
      context: ctx,
      width: props.canvasWidth,
      height: props.canvasHeight,
      categories: props.chartData.categories || [],
      series: props.chartData.series,
      animation: true,
      background: '#FFFFFF',
      color: ['#FF69B4', '#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc'],
      padding: [15, 15, 0, 15],
      legend: {
        show: true,
        position: 'bottom',
        float: 'center',
        padding: 5,
        margin: 5
      },
      ...props.opts
    };
    
    if (props.type === 'line') {
      chartOpts.xAxis = {
        disableGrid: true,
        labelCount: 5
      };
      chartOpts.yAxis = {
        gridType: 'dash',
        dashLength: 2,
        min: 0
      };
      chartOpts.extra = {
        line: { type: 'curve', width: 2 }
      };
    } else if (props.type === 'pie' || props.type === 'ring') {
      const pieOpts = {
        activeOpacity: 0.5,
        activeRadius: 10,
        offsetAngle: 0,
        labelWidth: 15,
        border: true,
        borderWidth: 2,
        borderColor: '#FFFFFF'
      };
      chartOpts.extra = {
        pie: pieOpts,
        ring: {
          ...pieOpts,
          innerRadius: 70,
          ringWidth: 30
        }
      };
    }

    uChartsInstance = new uCharts(chartOpts);
  } catch (e) {
    console.error('uCharts init failed:', e);
  }
}

function touchStart(e: any) {
  if (uChartsInstance) {
    uChartsInstance.touchLegend(e);
    uChartsInstance.showToolTip(e);
  }
}
function touchMove(e: any) {
  if (uChartsInstance) {
    uChartsInstance.showToolTip(e);
  }
}
function touchEnd(e: any) {
  if (uChartsInstance) {
    uChartsInstance.touchLegend(e);
    uChartsInstance.showToolTip(e);
  }
}

watch(() => props.chartData, () => {
  nextTick(() => {
    initChart();
  });
}, { deep: true });

onMounted(() => {
  setTimeout(() => {
    initChart();
  }, 200);
});
</script>

<style scoped>
.u-chart-wrapper {
  position: relative;
}
.ucharts {
  width: 100%;
  height: 100%;
}
</style>
