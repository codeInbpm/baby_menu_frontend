<template>
  <view class="page" :class="user.themeClass">
    <!-- Header background -->
    <view class="header-bg"></view>
    
    <view class="content">
      <!-- Custom Nav Bar -->
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="arrow-left" size="24px" color="#333" />
        </view>
      </view>

      <view class="title-bar">
        <text class="title">Our Bucket List</text>
        <text class="subtitle">属于我们的小心愿</text>
      </view>

      <!-- Tabs -->
      <view class="tabs">
        <view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
          进行中 <text class="count" v-if="ongoingCount > 0">{{ ongoingCount }}</text>
        </view>
        <view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
          已完成 <text class="count" v-if="completedCount > 0">{{ completedCount }}</text>
        </view>
      </view>

      <!-- Filter Bar -->
      <view class="filter-bar">
        <picker mode="selector" :range="categoryOptions" @change="onFilterCategory">
          <view class="filter-item" :class="{ active: filterCategory }">
            {{ filterCategory || '全部分类' }}
            <wd-icon name="arrow-down" size="14px" />
          </view>
        </picker>
        <picker mode="selector" :range="yearOptions" @change="onFilterYear">
          <view class="filter-item" :class="{ active: filterYear }">
            {{ filterYear ? filterYear + '年' : '全部年份' }}
            <wd-icon name="arrow-down" size="14px" />
          </view>
        </picker>
        <view class="filter-item clear-btn" v-if="filterCategory || filterYear" @click="clearFilters">
          <wd-icon name="close" size="14px" /> 清空
        </view>
      </view>

      <!-- List -->
      <scroll-view 
        scroll-y 
        class="list-scroll"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
        <view class="list" v-if="list.length > 0">
          <view 
            class="card" 
            v-for="item in list" 
            :key="item.id" 
            @click="goDetail(item.id)"
          >
            <image v-if="item.coverUrl" class="card-bg" :src="item.coverUrl" mode="aspectFill" />
            <view class="card-bg-placeholder" v-else>
              <wd-icon name="picture" size="40px" color="rgba(255,255,255,0.3)"/>
            </view>
            <view class="card-mask"></view>
            <view class="card-content">
              <view class="top-bar">
                <text class="category" v-if="item.category">{{ item.category }}</text>
                <text class="date" v-if="item.targetDate">目标: {{ item.targetDate }}</text>
              </view>
              <view class="title-wrap">
                <text class="title">{{ item.title }}</text>
              </view>
              
              <!-- 进度条区域 -->
              <view class="progress-wrap">
                <view class="avatars">
                  <image 
                    class="avatar" 
                    :class="{ checked: item.ownerChecked }"
                    :src="getAvatar('owner')" 
                    mode="aspectFill" 
                  />
                  <image 
                    class="avatar" 
                    :class="{ checked: item.petChecked }"
                    :src="getAvatar('pet')" 
                    mode="aspectFill" 
                  />
                </view>
                <view class="status-text">
                  <text v-if="item.status === 1">已共同完成 ❤️</text>
                  <text v-else>{{ (item.ownerChecked ? 1 : 0) + (item.petChecked ? 1 : 0) }} / 2 已打卡</text>
                </view>
              </view>
            </view>
            
            <!-- 完成印章 -->
            <view class="completed-stamp" v-if="item.status === 1">
              <text>Completed</text>
            </view>
          </view>
        </view>
        
        <view class="empty" v-else-if="!loading">
          <image class="empty-img" src="/static/empty.png" mode="aspectFit" v-if="false" />
          <text class="empty-icon">📝</text>
          <text class="empty-text" v-if="currentTab === 0">还没有一起想做的事吗？\n来添加第一个愿望吧～</text>
          <text class="empty-text" v-else>还没有共同完成的事项哦～\n加油去实现它们吧！</text>
        </view>
        
        <!-- Bottom padding for scroll -->
        <view style="height: 160rpx;"></view>
      </scroll-view>
    </view>

    <!-- FAB -->
    <view class="fab-btn" @click="onAdd">
      <wd-icon name="add" size="24px" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { bucketApi } from '@/api';
import { useUserStore } from '@/store/user';

const user = useUserStore();

const currentTab = ref(0);
const list = ref<any[]>([]);
const ongoingCount = ref(0);
const completedCount = ref(0);

const page = ref(1);
const size = 10;
const hasMore = ref(true);
const loading = ref(false);
const isRefreshing = ref(false);

const filterCategory = ref('');
const filterYear = ref<number | undefined>(undefined);

const categoryOptions = ref<string[]>(['全部分类']);
const yearOptions = ref<string[]>(['全部年份']);

async function loadFilterOptions() {
  try {
    const tags = await bucketApi.tags();
    categoryOptions.value = ['全部分类', ...tags];
  } catch (e) {
    categoryOptions.value = ['全部分类', '旅行', '约会', '居家', '纪念日', '美食', '其他'];
  }
  
  const currentYear = new Date().getFullYear();
  yearOptions.value = ['全部年份'];
  for (let i = 0; i < 5; i++) {
    yearOptions.value.push((currentYear - i).toString());
  }
}

function onFilterCategory(e: any) {
  const index = e.detail.value;
  filterCategory.value = index == 0 ? '' : categoryOptions.value[index];
  onRefresh();
}

function onFilterYear(e: any) {
  const index = e.detail.value;
  filterYear.value = index == 0 ? undefined : Number(yearOptions.value[index]);
  onRefresh();
}

function clearFilters() {
  filterCategory.value = '';
  filterYear.value = undefined;
  onRefresh();
}

function switchTab(index: number) {
  if (currentTab.value === index) return;
  currentTab.value = index;
  onRefresh();
}

async function fetchList(isLoadMore = false) {
  if (loading.value) return;
  if (!isLoadMore) {
    page.value = 1;
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  
  loading.value = true;
  try {
    const res = await bucketApi.list(page.value, size, currentTab.value, filterCategory.value || undefined, filterYear.value);
    if (res) {
      if (isLoadMore) {
        list.value.push(...res.records);
      } else {
        list.value = res.records;
      }
      
      // Update count locally for simple display, ideally backend should return counts.
      if (currentTab.value === 0) ongoingCount.value = res.total || 0;
      if (currentTab.value === 1) completedCount.value = res.total || 0;
      
      if (res.records.length < size) {
        hasMore.value = false;
      } else {
        page.value++;
      }
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

async function onRefresh() {
  isRefreshing.value = true;
  await fetchList(false);
}

function loadMore() {
  fetchList(true);
}

onShow(() => {
  loadFilterOptions();
  fetchList(false);
  // Optional: fetch count of the other tab if we want accurate badges
  if (currentTab.value === 0) {
    bucketApi.list(1, 1, 1).then(res => { if(res) completedCount.value = res.total; }).catch(()=>{});
  } else {
    bucketApi.list(1, 1, 0).then(res => { if(res) ongoingCount.value = res.total; }).catch(()=>{});
  }
});

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/bucket/detail?id=${id}` });
}

function onAdd() {
  uni.navigateTo({ url: '/pages/bucket/detail?action=add' });
}

function goBack() {
  uni.navigateBack();
}

function getAvatar(role: string) {
  if (user.info?.roleInCouple === role) {
    return user.info?.avatar || '/static/love.png';
  } else if (user.partner?.roleInCouple === role) {
    return user.partner?.avatar || '/static/love.png';
  }
  // Default to someone if roles are not strict
  return '/static/love.png';
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fdfafb;
  position: relative;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 400rpx;
  background: linear-gradient(180deg, rgba(255,182,193,0.3) 0%, rgba(253,250,251,0) 100%);
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.nav-bar {
  padding-top: var(--status-bar-height, 40px);
  height: 44px;
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  
  .back-btn {
    padding: 10rpx;
    margin-left: -10rpx;
  }
}

.title-bar {
  padding: 20rpx 40rpx 40rpx;
  .title {
    font-size: 56rpx;
    font-weight: 900;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
    font-family: 'Georgia', serif;
  }
  .subtitle {
    font-size: 28rpx;
    color: #666;
  }
}

.tabs {
  display: flex;
  padding: 0 40rpx;
  margin-bottom: 30rpx;
  gap: 40rpx;
  
  .tab-item {
    font-size: 32rpx;
    font-weight: 500;
    color: #999;
    padding-bottom: 12rpx;
    position: relative;
    transition: all 0.3s;
    
    &.active {
      color: #333;
      font-weight: 700;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 6rpx;
        background: var(--primary-color);
        border-radius: 6rpx;
      }
    }
    
    .count {
      font-size: 22rpx;
      background: #eee;
      color: #666;
      padding: 2rpx 12rpx;
      border-radius: 20rpx;
      margin-left: 8rpx;
      vertical-align: super;
    }
  }
}

.filter-bar {
  display: flex;
  padding: 0 40rpx;
  margin-bottom: 20rpx;
  gap: 20rpx;
  align-items: center;
  
  .filter-item {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    padding: 8rpx 20rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    color: #666;
    gap: 8rpx;
    transition: all 0.3s;
    
    &.active {
      background: #FFF0F6;
      color: #FF6FA0;
      border: 1rpx solid #FF6FA0;
    }
    
    &.clear-btn {
      background: transparent;
      color: #999;
      border: 1rpx solid #ddd;
    }
  }
}

.list-scroll {
  flex: 1;
  height: 0; // Trigger flex constraint
}

.list {
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.card {
  position: relative;
  height: 280rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.08);
  background: #333; // Fallback
  
  .card-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  
  .card-bg-placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #FFB6C1, #FFC0CB);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 0;
  }
  
  .card-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%);
    z-index: 1;
  }
  
  .card-content {
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .category {
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(8rpx);
      color: #fff;
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 999rpx;
      border: 1rpx solid rgba(255,255,255,0.3);
    }
    
    .date {
      color: rgba(255,255,255,0.9);
      font-size: 24rpx;
      text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
    }
  }
  
  .title-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    .title {
      color: #fff;
      font-size: 36rpx;
      font-weight: 700;
      text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
  
  .progress-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10rpx);
    padding: 12rpx 20rpx;
    border-radius: 20rpx;
    border: 1rpx solid rgba(255,255,255,0.2);
    
    .avatars {
      display: flex;
      .avatar {
        width: 48rpx; height: 48rpx;
        border-radius: 50%;
        border: 2rpx solid #fff;
        margin-left: -12rpx;
        filter: grayscale(100%) opacity(0.6);
        transition: all 0.3s;
        
        &:first-child { margin-left: 0; }
        
        &.checked {
          filter: grayscale(0%) opacity(1);
          border-color: #FF6FA0;
          box-shadow: 0 0 10rpx rgba(255,111,160,0.5);
        }
      }
    }
    
    .status-text {
      color: #fff;
      font-size: 24rpx;
      font-weight: 500;
      text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
    }
  }
  
  .completed-stamp {
    position: absolute;
    top: -20rpx; right: 20rpx;
    z-index: 3;
    transform: rotate(15deg);
    opacity: 0.8;
    
    text {
      display: inline-block;
      color: #fff;
      border: 4rpx solid #fff;
      padding: 8rpx 24rpx;
      border-radius: 12rpx;
      font-size: 36rpx;
      font-weight: 900;
      letter-spacing: 2rpx;
      text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.3);
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
    opacity: 0.8;
  }
  
  .empty-text {
    color: #999;
    font-size: 28rpx;
    text-align: center;
    line-height: 1.6;
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx; bottom: 80rpx;
  width: 110rpx; height: 110rpx;
  border-radius: 55rpx;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(255,154,158,0.4);
  z-index: 100;
  
  &:active {
    transform: scale(0.95);
  }
}
</style>
