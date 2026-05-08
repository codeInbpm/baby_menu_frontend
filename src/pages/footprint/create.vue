<template>
  <view class="create-page">
    <view class="header-bg"></view>
    
    <view class="content">
      <view class="card form-card">
        <view class="form-title">🌍 记录新的足迹</view>
        
        <view class="form-item" @click="chooseLocation">
          <text class="label">打卡地点</text>
          <view class="value-box location-box">
            <wd-icon name="location" size="18px" color="#FF69B4" />
            <text class="val-text" :class="{ empty: !formData.name }">{{ formData.name || '点击选择地点' }}</text>
            <wd-icon name="arrow-right" size="16px" color="#ccc" />
          </view>
        </view>
        <view class="sub-address" v-if="formData.address">{{ formData.address }}</view>
        
        <view class="form-item">
          <text class="label">打卡日期</text>
          <picker mode="date" :value="formData.visitDate" @change="onDateChange">
            <view class="value-box">
              <text class="val-text">{{ formData.visitDate }}</text>
              <wd-icon name="arrow-right" size="16px" color="#ccc" />
            </view>
          </picker>
        </view>
        
        <view class="form-item switch-item">
          <text class="label">特别纪念地 <text class="hint">(点亮专属星星)</text></text>
          <switch :checked="formData.isSpecial" color="#FF69B4" @change="onSpecialChange" />
        </view>
        
        <view class="input-section">
          <text class="label">心情描述</text>
          <textarea 
            class="desc-input" 
            v-model="formData.description" 
            placeholder="写下关于这里的特别回忆吧..." 
            :maxlength="200"
          ></textarea>
          <view class="word-count">{{ formData.description.length }}/200</view>
        </view>
      </view>

      <view class="card media-card">
        <view class="form-title">📸 留住瞬间 <text class="hint">(图片/短视频)</text></view>
        <view class="upload-grid">
          <view class="media-preview" v-for="(media, index) in mediaList" :key="index">
            <image v-if="media.type === 1" :src="media.url" mode="aspectFill" class="img" />
            <view v-else class="video-box">
              <image :src="media.url + '?vframe/jpg/offset/1'" mode="aspectFill" class="img" />
              <wd-icon name="play-circle" size="24px" color="#FFF" class="play-icon" />
            </view>
            <view class="del-btn" @click="removeMedia(index)">
              <wd-icon name="close" size="14px" color="#FFF" />
            </view>
          </view>
          <view class="upload-btn" @click="chooseMedia" v-if="mediaList.length < 9">
            <wd-icon name="add" size="30px" color="#ccc" />
          </view>
        </view>
      </view>

      <view class="btn-wrap">
        <button class="submit-btn" :class="{ disabled: !canSubmit }" @click="submit" :loading="submitting">
          点亮足迹
        </button>
      </view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'wot-design-uni';
import { footprintApi } from '@/api';
import dayjs from 'dayjs';

const toast = useToast();
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const formData = ref({
  name: '',
  address: '',
  latitude: 0,
  longitude: 0,
  visitDate: dayjs().format('YYYY-MM-DD'),
  isSpecial: false,
  description: '',
  tags: ''
});

const mediaList = ref<{url: string, type: number, sort: number}[]>([]);
const submitting = ref(false);

const canSubmit = computed(() => {
  return formData.value.name && formData.value.latitude && formData.value.visitDate;
});

function onDateChange(e: any) {
  formData.value.visitDate = e.detail.value;
}

function onSpecialChange(e: any) {
  formData.value.isSpecial = e.detail.value;
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      formData.value.name = res.name;
      formData.value.address = res.address;
      formData.value.latitude = res.latitude;
      formData.value.longitude = res.longitude;
    },
    fail: (err) => {
      console.error(err);
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        toast.error('需要位置权限才能打卡哦');
      }
    }
  });
}

function chooseMedia() {
  uni.chooseMedia({
    count: 9 - mediaList.value.length,
    mediaType: ['image', 'video'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const token = uni.getStorageSync('token');
      for (const file of res.tempFiles) {
        toast.loading('上传中...');
        try {
          const isVideo = file.fileType === 'video';
          const uploadRes = await new Promise<any>((resolve, reject) => {
            uni.uploadFile({
              url: `${BASE_URL}/upload/${isVideo ? 'video' : 'image'}`,
              filePath: file.tempFilePath,
              name: 'file',
              header: { 'Authorization': `Bearer ${token}` },
              success: (uploadResult) => {
                const data = JSON.parse(uploadResult.data);
                if (data.code === 0) resolve(data.data.url);
                else reject(data.message || data.msg);
              },
              fail: reject
            });
          });
          
          mediaList.value.push({
            url: uploadRes,
            type: isVideo ? 2 : 1,
            sort: mediaList.value.length
          });
        } catch (e) {
          toast.error('上传失败');
        } finally {
          toast.close();
        }
      }
    }
  });
}

function removeMedia(index: number) {
  mediaList.value.splice(index, 1);
}

async function submit() {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  
  try {
    const reqData = {
      ...formData.value,
      medias: mediaList.value
    };
    await footprintApi.add(reqData);
    toast.success('打卡成功！');
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    toast.error('保存失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background-color: #F8F5FB;
  position: relative;
  padding-bottom: 60rpx;
}

.header-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 10;
  padding: 40rpx 30rpx;
}

.card {
  background: #FFF;
  border-radius: 32rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.08);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  .hint { font-size: 24rpx; color: #999; font-weight: normal; margin-left: 10rpx; }
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #F5F5F5;
  
  .label { font-size: 28rpx; color: #333; }
  .hint { font-size: 22rpx; color: #999; }
  
  .value-box {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .val-text {
      font-size: 28rpx;
      color: #333;
      &.empty { color: #999; }
    }
  }
}

.sub-address {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: -10rpx;
  margin-bottom: 20rpx;
}

.switch-item {
  border-bottom: none;
}

.input-section {
  margin-top: 30rpx;
  .label { font-size: 28rpx; color: #333; margin-bottom: 20rpx; display: block; }
  .desc-input {
    width: 100%;
    height: 160rpx;
    background: #F9F9F9;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  .word-count {
    text-align: right;
    font-size: 22rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .media-preview, .upload-btn {
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    background: #F5F5F5;
    position: relative;
    overflow: hidden;
  }
  
  .img { width: 100%; height: 100%; }
  
  .video-box {
    width: 100%; height: 100%; position: relative;
    .play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  }
  
  .del-btn {
    position: absolute;
    top: 8rpx; right: 8rpx;
    width: 32rpx; height: 32rpx;
    background: rgba(0,0,0,0.5);
    border-radius: 16rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .upload-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2rpx dashed #E0E0E0;
    background: #FAFAFA;
  }
}

.btn-wrap {
  margin-top: 60rpx;
  .submit-btn {
    background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
    color: #FFF;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    height: 90rpx;
    line-height: 90rpx;
    border: none;
    box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.3);
    
    &.disabled {
      background: #E0E0E0;
      box-shadow: none;
      color: #999;
    }
  }
}
</style>
