<template>
  <view class="page">
    <view class="bg-pattern"></view>
    
    <view class="header">
      <view class="title">时光相册</view>
      <view class="subtitle">共 {{ albums.length }} 张我们的回忆</view>
    </view>

    <!-- 多维度时间轴分组展示 -->
    <view class="timeline" v-if="albums.length > 0">
      <view class="year-section" v-for="yearGroup in groupedAlbums" :key="yearGroup.year">
        <!-- 年份节点 -->
        <view class="year-header" @click="toggle('year', yearGroup.year)">
          <view class="year-dot"></view>
          <text class="year-text">{{ yearGroup.year }}年</text>
          <text class="count-tag">{{ yearGroup.count }}张</text>
          <view class="collapse-icon">
            <text class="icon-arrow" :class="{ 'is-collapsed': isCollapsed('year', yearGroup.year) }">▼</text>
          </view>
        </view>
        
        <!-- 月份节点 -->
        <view class="months-wrap" v-show="!isCollapsed('year', yearGroup.year)">
          <view class="month-section" v-for="monthGroup in yearGroup.months" :key="monthGroup.month">
            <view class="month-header" @click="toggle('month', yearGroup.year, monthGroup.month)">
              <text class="month-text">{{ monthGroup.month }}月</text>
              <text class="count-tag">{{ monthGroup.count }}张</text>
              <view class="collapse-icon">
                <text class="icon-arrow" :class="{ 'is-collapsed': isCollapsed('month', yearGroup.year, monthGroup.month) }">▼</text>
              </view>
            </view>
            
            <!-- 日期节点 -->
            <view class="days-wrap" v-show="!isCollapsed('month', yearGroup.year, monthGroup.month)">
              <view class="day-section" v-for="dayGroup in monthGroup.days" :key="dayGroup.day">
                <view class="day-header" @click="toggle('day', yearGroup.year, monthGroup.month, dayGroup.day)">
                  <text class="day-text">{{ monthGroup.month }}月{{ dayGroup.day }}日</text>
                  <text class="count-tag">{{ dayGroup.list.length }}张</text>
                  <view class="collapse-icon">
                    <text class="icon-arrow" :class="{ 'is-collapsed': isCollapsed('day', yearGroup.year, monthGroup.month, dayGroup.day) }">▼</text>
                  </view>
                </view>
                
                <!-- 照片网格 -->
                <view class="grid" v-show="!isCollapsed('day', yearGroup.year, monthGroup.month, dayGroup.day)">
                  <view class="img-box" v-for="item in dayGroup.list" :key="item.id">
                    <image class="img" :src="item.imageUrl" mode="aspectFill" @click="previewImage(item)" lazy-load />
                    
                    <view class="info-overlay">
                      <text class="time">{{ formatTime(item.createTime) }}</text>
                    </view>
                    
                    <view class="actions">
                      <text class="btn icon-btn cover" @click.stop="setCover(item.id)">封面</text>
                      <text class="btn icon-btn del" @click.stop="deletePhoto(item.id)">×</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="icon">📸</text>
      <text>相册空空的，快来上传你们的甜蜜瞬间吧</text>
    </view>

    <!-- 悬浮上传按钮 -->
    <view class="fab-btn" @click="onUploadClick">
      <text class="icon">+</text>
    </view>

    <!-- 上传描述对话框 -->
    <wd-popup v-model="showUploadModal" position="bottom" custom-style="border-radius: 32rpx 32rpx 0 0;">
      <view class="upload-modal">
        <view class="modal-header">添加回忆描述</view>
        <view class="modal-content">
          <textarea class="textarea" v-model="uploadDescription" placeholder="为这批照片写点什么吧...(选填)" :maxlength="100"></textarea>
          <view class="selected-count">已选 {{ selectedImages.length }} 张照片</view>
        </view>
        <view class="modal-footer">
          <view class="btn cancel" @click="closeUploadModal">取消</view>
          <view class="btn confirm" @click="startUpload">开始上传</view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { albumApi } from '@/api';
import { useUserStore } from '@/store/user';
import { BASE_URL } from '@/utils/request';
import dayjs from 'dayjs';

const user = useUserStore();
const albums = ref<any[]>([]);

// Timeline logic
const collapsedState = ref<Record<string, boolean>>({});

const groupedAlbums = computed(() => {
  const groups: Record<number, Record<number, Record<number, any[]>>> = {};
  
  albums.value.forEach(item => {
    const d = dayjs(item.createTime);
    const y = d.year();
    const m = d.month() + 1; // 1-12
    const day = d.date();
    
    if (!groups[y]) groups[y] = {};
    if (!groups[y][m]) groups[y][m] = {};
    if (!groups[y][m][day]) groups[y][m][day] = [];
    
    groups[y][m][day].push(item);
  });
  
  const sortedYears = Object.keys(groups).map(Number).sort((a, b) => b - a);
  
  return sortedYears.map(year => {
    const mGroups = groups[year];
    const sortedMonths = Object.keys(mGroups).map(Number).sort((a, b) => b - a);
    let yearCount = 0;
    
    const months = sortedMonths.map(month => {
      const dGroups = mGroups[month];
      const sortedDays = Object.keys(dGroups).map(Number).sort((a, b) => b - a);
      let monthCount = 0;
      
      const days = sortedDays.map(day => {
        const list = dGroups[day];
        monthCount += list.length;
        return {
          day,
          list
        };
      });
      
      yearCount += monthCount;
      
      return {
        month,
        count: monthCount,
        days
      };
    });
    
    return {
      year,
      count: yearCount,
      months
    };
  });
});

// Upload logic
const showUploadModal = ref(false);
const uploadDescription = ref('');
const selectedImages = ref<string[]>([]);

function closeUploadModal() {
  showUploadModal.value = false;
}

async function load() {
  const list = await albumApi.list() || [];
  // Sort overall list descending by createTime
  albums.value = list.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf());
  
  // By default, expand only the most recent 2 years
  groupedAlbums.value.forEach((yGroup, i) => {
    if (i >= 2) {
      collapsedState.value[`${yGroup.year}`] = true;
    }
  });
}

onShow(load);

function toggle(type: string, year: number, month?: number, day?: number) {
  let key = `${year}`;
  if (type === 'month') key = `${year}-${month}`;
  if (type === 'day') key = `${year}-${month}-${day}`;
  collapsedState.value[key] = !collapsedState.value[key];
}

function isCollapsed(type: string, year: number, month?: number, day?: number) {
  let key = `${year}`;
  if (type === 'month') key = `${year}-${month}`;
  if (type === 'day') key = `${year}-${month}-${day}`;
  return !!collapsedState.value[key];
}

function formatTime(time: string) {
  if (!time) return '';
  return dayjs(time).format('HH:mm');
}

function previewImage(item: any) {
  const index = albums.value.findIndex(x => x.id === item.id);
  uni.navigateTo({
    url: `/pages/album/preview?current=${index}`,
    success: (res) => {
      res.eventChannel.emit('acceptDataFromOpenerPage', { data: albums.value });
    }
  });
}

async function setCover(id: number) {
  uni.showModal({
    title: '提示', content: '设为相册封面并展示在我的主页？',
    success: async (res) => {
      if (res.confirm) {
        await albumApi.setCover(id);
        uni.showToast({ title: '设置成功', icon: 'success' });
        const target = albums.value.find(x => x.id === id);
        if (target && user.coupleInfo) {
          user.setCoupleInfo({ ...user.coupleInfo, albumCoverUrl: target.imageUrl });
        }
      }
    }
  });
}

function deletePhoto(id: number) {
  uni.showModal({
    title: '删除照片', content: '确定要删除这张照片吗？',
    success: async (res) => {
      if (res.confirm) {
        await albumApi.remove(id);
        uni.showToast({ title: '已删除', icon: 'success' });
        load();
      }
    }
  });
}

function onUploadClick() {
  uni.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    success: (res) => {
      selectedImages.value = res.tempFilePaths as string[];
      uploadDescription.value = '';
      showUploadModal.value = true;
    }
  });
}

async function startUpload() {
  showUploadModal.value = false;
  uni.showLoading({ title: `正在上传(0/${selectedImages.value.length})...` });

  let successUrls: string[] = [];
  let failCount = 0;

  for (let i = 0; i < selectedImages.value.length; i++) {
    uni.showLoading({ title: `上传中(${i + 1}/${selectedImages.value.length})...` });
    try {
      const uploadedUrl = await uploadSingleFile(selectedImages.value[i]);
      successUrls.push(uploadedUrl);
    } catch (e) {
      failCount++;
    }
  }

  uni.hideLoading();
  
  if (successUrls.length > 0) {
    uni.showLoading({ title: '入库处理中...' });
    try {
      await albumApi.uploadBatch(successUrls, uploadDescription.value);
      uni.showToast({ title: '上传完成', icon: 'success' });
      load();
    } catch (e: any) {
      uni.showToast({ title: e.message || '入库失败', icon: 'none' });
    }
  } else if (failCount > 0) {
    uni.showToast({ title: '上传全部失败', icon: 'none' });
  }
}

function uploadSingleFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/upload/image',
      filePath: path,
      name: 'file',
      header: { Authorization: 'Bearer ' + user.token },
      success: (r) => {
        try {
          const body = JSON.parse(r.data);
          if (body.code === 0) {
            let url = body.data.url;
            url = url.startsWith('http') ? url : BASE_URL.replace('/api', '') + url;
            resolve(url);
          } else {
            reject(new Error(body.message));
          }
        } catch { reject(new Error('JSON解析失败')); }
      },
      fail: (e) => reject(e)
    });
  });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FCF4F6;
  position: relative;
  padding-bottom: 200rpx;
  overflow-x: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.2;
  background-image: radial-gradient(#FFB6C1 15%, transparent 16%), radial-gradient(#FFB6C1 15%, transparent 16%);
  background-size: 60rpx 60rpx;
  background-position: 0 0, 30rpx 30rpx;
  pointer-events: none;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  position: relative;
  z-index: 1;
  .title { font-size: 52rpx; font-weight: 900; color: #333; margin-bottom: 12rpx; text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05); }
  .subtitle { font-size: 28rpx; color: #888; font-weight: 500; }
}

.timeline {
  padding: 0 30rpx;
  position: relative;
  z-index: 1;
}

.year-section {
  margin-bottom: 40rpx;
}

.year-header {
  display: flex; align-items: center; margin-bottom: 24rpx; position: relative; z-index: 2;
  .year-dot {
    width: 36rpx; height: 36rpx; border-radius: 50%;
    background: linear-gradient(135deg, #FF69B4, #FF1493);
    box-shadow: 0 4rpx 12rpx rgba(255,105,180,0.4);
    border: 6rpx solid #FCF4F6;
    margin-right: 20rpx;
  }
  .year-text { font-size: 40rpx; font-weight: 800; background: linear-gradient(to right, #FF1493, #8A2BE2); -webkit-background-clip: text; color: transparent; }
}

.months-wrap {
  position: relative;
  margin-left: 16rpx;
  border-left: 4rpx solid rgba(255,182,193,0.4);
  padding-left: 30rpx;
  padding-bottom: 10rpx;
}

.month-section {
  margin-bottom: 30rpx;
  position: relative;
}

.month-header {
  display: flex; align-items: center; margin-bottom: 20rpx; position: relative;
  &::before {
    content: ''; position: absolute; 
    left: -32rpx;
    top: 50%; transform: translate(-50%, -50%);
    width: 20rpx; height: 20rpx; border-radius: 50%; background: #FF69B4;
    border: 4rpx solid #FCF4F6;
    z-index: 2;
  }
  .month-text { font-size: 32rpx; font-weight: 700; color: #444; }
}

.days-wrap {
  padding-left: 10rpx;
}

.day-section {
  margin-bottom: 20rpx;
}

.day-header {
  display: flex; align-items: center; margin-bottom: 16rpx; position: relative;
  &::before {
    content: ''; position: absolute; 
    left: -16rpx; top: 50%; transform: translate(-50%, -50%);
    width: 12rpx; height: 12rpx; border-radius: 50%; background: #FFB6C1;
  }
  .day-text { font-size: 28rpx; font-weight: 600; color: #666; }
}

.count-tag {
  font-size: 22rpx; color: #999; margin-left: 16rpx; background: rgba(0,0,0,0.04); padding: 4rpx 16rpx; border-radius: 20rpx;
}

.collapse-icon {
  margin-left: auto;
  .icon-arrow {
    display: inline-block;
    font-size: 24rpx; color: #FFB6C1;
    transition: transform 0.3s;
  }
  .icon-arrow.is-collapsed {
    transform: rotate(-90deg);
  }
}

.grid {
  display: flex; flex-wrap: wrap; padding-left: 0;
}
.img-box {
  width: calc(33.33% - 12rpx);
  margin: 6rpx;
  height: 200rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  animation: fadeIn 0.5s ease;
  
  .img { width: 100%; height: 100%; display: block; }
  
  .info-overlay {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 8rpx 12rpx;
    background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
    .time { color: #fff; font-size: 20rpx; font-weight: 600; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.5); }
  }

  .actions {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12rpx 10rpx;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
    display: flex; justify-content: space-between; align-items: center;
    opacity: 1; /* For mobile visibility */
  }
  
  .btn { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 8rpx; color: #fff; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
  .btn.del { background: rgba(255,77,79,0.8); width: 36rpx; height: 36rpx; padding: 0; display: flex; justify-content: center; align-items: center; border-radius: 50%; font-size: 24rpx; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.empty {
  margin-top: 150rpx;
  display: flex; flex-direction: column; align-items: center;
  position: relative; z-index: 1;
  .icon { font-size: 100rpx; margin-bottom: 20rpx; opacity: 0.6; filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.1)); }
  color: #999; font-size: 28rpx;
}

.fab-btn {
  position: fixed; right: 40rpx; bottom: 80rpx; width: 110rpx; height: 110rpx; border-radius: 55rpx;
  background: linear-gradient(135deg, #FF69B4, #FF1493); color: #fff;
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(255,105,180,0.4); z-index: 10;
  .icon { font-size: 60rpx; font-weight: 300; }
}

/* Upload Modal */
.upload-modal {
  background: #fff; padding: 40rpx 40rpx 60rpx;
  .modal-header { font-size: 36rpx; font-weight: 700; text-align: center; margin-bottom: 30rpx; color: #333; }
  .modal-content {
    background: #f9f9f9; border-radius: 20rpx; padding: 24rpx;
    .textarea { width: 100%; height: 160rpx; font-size: 28rpx; color: #333; line-height: 1.5; }
    .selected-count { text-align: right; font-size: 24rpx; color: #999; margin-top: 12rpx; }
  }
  .modal-footer {
    display: flex; gap: 20rpx; margin-top: 40rpx;
    .btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; justify-content: center; align-items: center; font-size: 30rpx; font-weight: 600; }
    .cancel { background: #f5f5f5; color: #666; }
    .confirm { background: #FF69B4; color: #fff; box-shadow: 0 6rpx 20rpx rgba(255,105,180,0.3); }
  }
}
</style>
