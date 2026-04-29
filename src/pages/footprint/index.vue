<template>
  <view class="footprint-page">
    <!-- Custom Nav Bar -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack"><wd-icon name="arrow-left" size="24px" color="#333" /></view>
      <view class="tab-switch">
        <view 
          class="switch-item" 
          :class="{ active: viewMode === 'map' }" 
          @click="viewMode = 'map'"
        >地图</view>
        <view 
          class="switch-item" 
          :class="{ active: viewMode === 'list' }" 
          @click="viewMode = 'list'"
        >列表</view>
      </view>
      <view class="placeholder"></view>
    </view>

    <!-- Map View -->
    <view class="map-container" v-show="viewMode === 'map'">
      <map
        class="map-view"
        :latitude="centerLat"
        :longitude="centerLng"
        :markers="markers"
        :scale="12"
        show-location
        @markertap="onMarkerTap"
      ></map>

      <!-- Top floating stats -->
      <view class="map-stats" :style="{ top: (statusBarHeight + 60) + 'px' }">
        我们一起走过了 <text class="highlight">{{ footprintList.length }}</text> 个地方 🌍
      </view>
    </view>

    <!-- List View -->
    <scroll-view 
      class="list-container" 
      scroll-y 
      v-show="viewMode === 'list'"
      :style="{ paddingTop: (statusBarHeight + 50) + 'px' }"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="list-content">
        <view v-if="groupedFootprints.length === 0" class="empty-state">
          <image src="/static/empty.png" class="empty-img" />
          <text>还没有记录下足迹呢，快去打卡吧～</text>
        </view>
        
        <view v-for="group in groupedFootprints" :key="group.title" class="group-section">
          <view class="group-title">
            <view class="dot"></view>
            <text>{{ group.title }}</text>
          </view>
          <FootprintListItem 
            v-for="item in group.items" 
            :key="item.id" 
            :footprint="item"
            @click="goDetail(item.id)"
          />
        </view>
        
        <view class="bottom-space"></view>
      </view>
    </scroll-view>

    <!-- Floating add button -->
    <view class="add-btn" @click="goAdd">
      <wd-icon name="add" size="28px" color="#FFF" />
    </view>

    <!-- Map Marker Detail Popup -->
    <wd-popup v-model="showPopup" position="bottom" :safe-area-inset-bottom="true" custom-class="detail-popup">
      <view class="popup-content" v-if="currentFootprint">
        <view class="popup-header">
          <text class="title">{{ currentFootprint.name }}</text>
          <wd-icon name="close" size="20px" color="#999" @click="showPopup = false" />
        </view>
        <view class="date-bar">
          <wd-icon name="calendar" size="14px" color="#FF69B4" />
          <text class="date-text">打卡于 {{ currentFootprint.visitDate }}</text>
          <text class="tag" v-if="currentFootprint.isSpecial">✨ 特别纪念</text>
        </view>
        <view class="desc" v-if="currentFootprint.description">{{ currentFootprint.description }}</view>
        <view class="action-bar">
          <wd-button size="small" plain @click="goDetail(currentFootprint.id)">查看详情</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { footprintApi } from '@/api';
import FootprintListItem from './FootprintListItem.vue';
import dayjs from 'dayjs';

const viewMode = ref('map'); // 'map' or 'list'
const statusBarHeight = ref(20);
const footprintList = ref<any[]>([]);
const centerLat = ref(39.9042);
const centerLng = ref(116.4074);
const showPopup = ref(false);
const currentFootprint = ref<any>(null);
const isRefreshing = ref(false);

onShow(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      centerLat.value = res.latitude;
      centerLng.value = res.longitude;
    }
  });

  fetchList();
});

async function fetchList() {
  try {
    const res = await footprintApi.list();
    footprintList.value = res || [];
    
    if (footprintList.value.length > 0 && viewMode.value === 'map') {
      centerLat.value = footprintList.value[0].latitude;
      centerLng.value = footprintList.value[0].longitude;
    }
  } catch (e) {
    console.error('Failed to fetch footprint list', e);
  } finally {
    isRefreshing.value = false;
  }
}

async function onRefresh() {
  isRefreshing.value = true;
  await fetchList();
}

const markers = computed(() => {
  return footprintList.value.map((item) => ({
    id: item.id,
    latitude: item.latitude,
    longitude: item.longitude,
    iconPath: item.isSpecial ? '/static/marker-heart-special.png' : '/static/marker-heart.png',
    width: item.isSpecial ? 40 : 30,
    height: item.isSpecial ? 40 : 30,
    callout: {
      content: item.name,
      color: '#FF69B4',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#FFFFFF',
      padding: 6,
      display: 'ALWAYS'
    }
  }));
});

const groupedFootprints = computed(() => {
  const groups: { title: string, items: any[] }[] = [];
  const map = new Map<string, any[]>();
  
  // footprintList is already sorted by date desc from backend
  footprintList.value.forEach(item => {
    const monthStr = dayjs(item.visitDate).format('YYYY年MM月');
    if (!map.has(monthStr)) {
      map.set(monthStr, []);
    }
    map.get(monthStr)!.push(item);
  });
  
  map.forEach((items, title) => {
    groups.push({ title, items });
  });
  
  return groups;
});

function onMarkerTap(e: any) {
  const markerId = e.detail.markerId;
  const target = footprintList.value.find(item => item.id === markerId);
  if (target) {
    currentFootprint.value = target;
    showPopup.value = true;
  }
}

function goBack() {
  uni.navigateBack();
}

function goAdd() {
  uni.navigateTo({ url: '/pages/footprint/create' });
}

function goDetail(id: number) {
  showPopup.value = false;
  uni.navigateTo({ url: `/pages/footprint/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
.footprint-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #F8F5FB;
}

.nav-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  
  .back-btn { padding: 10rpx; }
  .tab-switch {
    display: flex;
    background: #F0F0F0;
    border-radius: 30rpx;
    padding: 4rpx;
    
    .switch-item {
      padding: 10rpx 40rpx;
      font-size: 26rpx;
      color: #666;
      border-radius: 26rpx;
      transition: all 0.3s;
      
      &.active {
        background: #FFF;
        color: #FF69B4;
        font-weight: bold;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      }
    }
  }
  .placeholder { width: 44px; }
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

.map-stats {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  z-index: 10;
  
  .highlight {
    color: #FF69B4;
    font-weight: bold;
    font-size: 32rpx;
    margin: 0 8rpx;
  }
}

.list-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.list-content {
  padding: 30rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;
  .empty-img { width: 240rpx; height: 240rpx; margin-bottom: 30rpx; opacity: 0.6; }
}

.group-section {
  margin-bottom: 40rpx;
  
  .group-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    padding-left: 10rpx;
    
    .dot {
      width: 12rpx;
      height: 12rpx;
      background: #FF69B4;
      border-radius: 50%;
    }
  }
}

.add-btn {
  position: absolute;
  right: 40rpx;
  bottom: 120rpx;
  width: 110rpx;
  height: 110rpx;
  background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
  border-radius: 55rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.4);
  z-index: 90;
}

.detail-popup {
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
}

.popup-content {
  padding: 40rpx 30rpx;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    .title { font-size: 34rpx; font-weight: bold; }
  }
  
  .date-bar {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 20rpx;
    .date-text { font-size: 24rpx; color: #666; }
    .tag { font-size: 18rpx; color: #FF69B4; background: #FFF0F5; padding: 2rpx 10rpx; border-radius: 10rpx; }
  }
  
  .desc { font-size: 26rpx; color: #444; margin-bottom: 30rpx; }
  
  .action-bar {
    display: flex;
    justify-content: flex-end;
  }
}

.bottom-space { height: 160rpx; }
</style>
