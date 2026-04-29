<template>
  <view class="detail-page">
    <view class="media-section" v-if="footprint.medias && footprint.medias.length > 0">
      <swiper class="media-swiper" indicator-dots circular indicator-active-color="#FF69B4">
        <swiper-item v-for="(media, index) in footprint.medias" :key="index">
          <image v-if="media.type === 1" :src="media.url" mode="aspectFill" class="media-content" @click="previewImage(media.url)" />
          <video v-else :src="media.url" class="media-content" controls></video>
        </swiper-item>
      </swiper>
    </view>
    <view class="header-placeholder" v-else></view>

    <view class="content-card">
      <view class="info-header">
        <view class="title-row">
          <text class="title">{{ footprint.name }}</text>
          <wd-icon name="delete" size="20px" color="#FF6666" @click="handleDelete" />
        </view>
        <view class="date-row">
          <wd-icon name="calendar" size="14px" color="#FF69B4" />
          <text class="date-text">打卡于 {{ footprint.visitDate }}</text>
          <text class="tag special" v-if="footprint.isSpecial">✨ 特别纪念地</text>
        </view>
        <view class="address-row" @click="openMap">
          <wd-icon name="location" size="14px" color="#999" />
          <text class="address-text">{{ footprint.address || '未知地址' }}</text>
          <wd-icon name="arrow-right" size="12px" color="#ccc" />
        </view>
      </view>

      <view class="tags-section" v-if="tagList.length > 0">
        <text class="tag" v-for="tag in tagList" :key="tag">{{ tag }}</text>
      </view>

      <view class="description-section" v-if="footprint.description">
        <view class="section-title">心情足迹</view>
        <text class="description-text">{{ footprint.description }}</text>
      </view>

      <view class="footer-info">
        <text>发布于 {{ formatDate(footprint.createTime) }}</text>
      </view>
    </view>
    
    <wd-message-box id="wd-message-box" />
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { footprintApi } from '@/api';
import { useToast, useMessage } from 'wot-design-uni';
import dayjs from 'dayjs';

const toast = useToast();
const messageBox = useMessage();
const footprint = ref<any>({});
const footprintId = ref<number | null>(null);

onLoad((options: any) => {
  if (options.id) {
    footprintId.value = Number(options.id);
    fetchDetail();
  }
});

async function fetchDetail() {
  if (!footprintId.value) return;
  try {
    const res = await footprintApi.detail(footprintId.value);
    footprint.value = res;
  } catch (e) {
    console.error(e);
    toast.error('加载详情失败');
  }
}

const tagList = computed(() => {
  if (!footprint.value.tags) return [];
  return footprint.value.tags.split(',').filter((t: string) => t.trim());
});

function formatDate(date: string) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

function previewImage(url: string) {
  const urls = footprint.value.medias.filter((m: any) => m.type === 1).map((m: any) => m.url);
  uni.previewImage({
    current: url,
    urls
  });
}

function openMap() {
  uni.openLocation({
    latitude: Number(footprint.value.latitude),
    longitude: Number(footprint.value.longitude),
    name: footprint.value.name,
    address: footprint.value.address
  });
}

function handleDelete() {
  messageBox.confirm({
    title: '提示',
    msg: '确定要删除这条足迹记忆吗？',
    type: 'warning'
  }).then(async () => {
    try {
      await footprintApi.remove(footprintId.value!);
      toast.success('已删除');
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    } catch (e) {
      toast.error('删除失败');
    }
  }).catch(() => {});
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: #F8F5FB;
  padding-bottom: 50rpx;
}

.media-section {
  width: 100%;
  height: 600rpx;
  
  .media-swiper {
    width: 100%;
    height: 100%;
  }
  
  .media-content {
    width: 100%;
    height: 100%;
  }
}

.header-placeholder {
  height: 200rpx;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
}

.content-card {
  margin: -60rpx 30rpx 0;
  background: #FFF;
  border-radius: 40rpx;
  padding: 40rpx;
  position: relative;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.info-header {
  margin-bottom: 40rpx;
  
  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .date-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
    
    .date-text {
      font-size: 26rpx;
      color: #666;
    }
    
    .tag.special {
      background: #FFF0F5;
      color: #FF69B4;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      font-weight: bold;
    }
  }
  
  .address-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .address-text {
      font-size: 24rpx;
      color: #999;
      flex: 1;
    }
  }
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 40rpx;
  
  .tag {
    font-size: 24rpx;
    padding: 6rpx 20rpx;
    border-radius: 30rpx;
    background: #F5F5F5;
    color: #666;
  }
}

.description-section {
  background: #FAFAFA;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #FF69B4;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .description-text {
    font-size: 30rpx;
    color: #444;
    line-height: 1.8;
  }
}

.footer-info {
  text-align: center;
  font-size: 22rpx;
  color: #CCC;
  margin-top: 60rpx;
}
</style>
