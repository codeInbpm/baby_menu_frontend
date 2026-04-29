<template>
  <view class="footprint-item" @click="$emit('click', footprint)">
    <view class="item-header">
      <view class="header-left">
        <text class="location-name">{{ footprint.name }}</text>
        <view class="tags" v-if="footprint.tags || footprint.isSpecial">
          <text class="tag special" v-if="footprint.isSpecial">✨ 特别纪念</text>
          <text class="tag" v-for="tag in tagList" :key="tag">{{ tag }}</text>
        </view>
      </view>
      <text class="visit-date">{{ formatDate(footprint.visitDate) }}</text>
    </view>

    <view class="description" v-if="footprint.description">
      {{ footprint.description }}
    </view>

    <view class="media-preview" v-if="footprint.medias && footprint.medias.length > 0">
      <view class="image-grid">
        <view 
          v-for="(media, index) in previewMedias" 
          :key="index" 
          class="preview-item"
        >
          <image v-if="media.type === 1" :src="media.url" mode="aspectFill" class="img" />
          <view v-else class="video-box">
            <image :src="media.url + '?vframe/jpg/offset/1'" mode="aspectFill" class="img" />
            <wd-icon name="play-circle" size="24px" color="#FFF" class="play-icon" />
          </view>
          <view class="more-overlay" v-if="index === 2 && footprint.medias.length > 3">
            <text>+{{ footprint.medias.length - 3 }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="item-footer">
      <view class="address">
        <wd-icon name="location" size="14px" color="#999" />
        <text class="address-text">{{ footprint.address || '未知地点' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  footprint: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);

const tagList = computed(() => {
  if (!props.footprint.tags) return [];
  return props.footprint.tags.split(',').filter((t: string) => t.trim());
});

const previewMedias = computed(() => {
  if (!props.footprint.medias) return [];
  return props.footprint.medias.slice(0, 3);
});

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}
</script>

<style lang="scss" scoped>
.footprint-item {
  background: #FFF;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  &:active {
    opacity: 0.9;
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
  
  .header-left {
    flex: 1;
    margin-right: 20rpx;
  }
  
  .location-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .visit-date {
    font-size: 24rpx;
    color: #999;
    flex-shrink: 0;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  
  .tag {
    font-size: 20rpx;
    padding: 2rpx 12rpx;
    border-radius: 20rpx;
    background: #F5F5F5;
    color: #666;
    
    &.special {
      background: #FFF0F5;
      color: #FF69B4;
      font-weight: bold;
    }
  }
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.media-preview {
  margin-bottom: 20rpx;
  
  .image-grid {
    display: flex;
    gap: 15rpx;
  }
  
  .preview-item {
    flex: 1;
    height: 180rpx;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
    background: #F8F8F8;
    
    .img {
      width: 100%;
      height: 100%;
    }
    
    .video-box {
      width: 100%;
      height: 100%;
      position: relative;
      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    
    .more-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      color: #FFF;
      font-size: 32rpx;
      font-weight: bold;
    }
  }
}

.item-footer {
  .address {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .address-text {
      font-size: 22rpx;
      color: #999;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
