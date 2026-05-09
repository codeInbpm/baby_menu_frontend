<template>
  <view class="mall-page">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="24px" />
      </view>
      <view class="points-badge">
        <text class="label">我的积分</text>
        <text class="value">{{ points }}</text>
      </view>
      <view class="my-rights-btn" @click="goInventory">
        <wd-icon name="app" size="20px" />
        <text>我的特权</text>
      </view>
    </view>

    <view class="hero-section">
      <view class="title">管家积分商城</view>
      <view class="subtitle">兑换你的专属特权与护身符</view>
    </view>

    <view class="item-grid">
      <view 
        v-for="item in items" 
        :key="item.id" 
        class="mall-item-card"
        @click="showDetail(item)"
      >
        <view class="item-icon-wrap" :class="'type-' + item.itemType">
          <ExemptionIcon v-if="item.itemType === 2" :size="80" />
          <text v-else class="emoji">{{ item.icon || '🎁' }}</text>
        </view>
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <view class="price-row">
            <text class="price">{{ item.price }}</text>
            <text class="unit">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <wd-popup v-model="showPopup" position="center" custom-class="detail-popup">
      <view class="detail-content" v-if="selectedItem">
        <view class="detail-icon">
          <ExemptionIcon v-if="selectedItem.itemType === 2" :size="120" />
          <text v-else class="emoji-large">{{ selectedItem.icon }}</text>
        </view>
        <view class="detail-name">{{ selectedItem.name }}</view>
        <view class="detail-desc">{{ selectedItem.description }}</view>
        
        <view class="detail-limit" v-if="selectedItem.itemType === 2">
          <wd-icon name="info-circle" size="14px" />
          <text>每个自然月限兑换1次</text>
        </view>

        <view class="detail-footer">
          <view class="cost">
            <text class="val">{{ selectedItem.price }}</text>
            <text class="lab">积分</text>
          </view>
          <button 
            class="redeem-btn" 
            :disabled="points < selectedItem.price"
            @click="handleRedeem"
          >
            {{ points < selectedItem.price ? '积分不足' : '立即兑换' }}
          </button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
    <wd-message-box id="wd-message-box" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { mallApi, userApi, pointsApi } from '@/api';
import { useToast, useMessageBox } from 'wot-design-uni';
import ExemptionIcon from '@/components/ExemptionIcon/ExemptionIcon.vue';

const toast = useToast();
const messageBox = useMessageBox();
const items = ref<any[]>([]);
const points = ref(0);
const showPopup = ref(false);
const selectedItem = ref<any>(null);

async function loadData() {
  try {
    const [itemList, pointInfo] = await Promise.all([
      mallApi.items(),
      pointsApi.info()
    ]);
    items.value = itemList;
    points.value = pointInfo.points;
  } catch (e) {
    toast.error('加载失败');
  }
}

function showDetail(item: any) {
  selectedItem.value = item;
  showPopup.value = true;
}

async function handleRedeem() {
  if (!selectedItem.value) return;
  
  try {
    await messageBox.confirm({
      title: '确认兑换',
      content: `确定消耗 ${selectedItem.value.price} 积分兑换「${selectedItem.value.name}」吗？`,
      confirmButtonText: '立即兑换'
    });

    toast.loading('兑换中...');
    await mallApi.redeem(selectedItem.value.id);
    toast.success('兑换成功！');
    showPopup.value = false;
    loadData();
  } catch (e: any) {
    if (e !== 'cancel') toast.error(e.message || '兑换失败');
  }
}

function goInventory() {
  uni.navigateTo({ url: '/pages/mall/inventory' });
}

function goBack() {
  uni.navigateBack();
}

onMounted(loadData);
</script>

<style lang="scss" scoped>
.mall-page {
  min-height: 100vh;
  background: #0f1220;
  color: #fff;
  padding: 0 30rpx 60rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 0;
  position: sticky;
  top: 0;
  background: #0f1220;
  z-index: 10;
}

.points-badge {
  background: rgba(255,255,255,0.05);
  padding: 10rpx 30rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  .label { font-size: 22rpx; color: rgba(255,255,255,0.5); }
  .value { font-size: 32rpx; font-weight: bold; color: #d4af37; }
}

.my-rights-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.hero-section {
  padding: 40rpx 0 60rpx;
  .title { font-size: 48rpx; font-weight: 900; color: #fff; text-shadow: 0 0 20rpx rgba(212,175,55,0.2); }
  .subtitle { font-size: 24rpx; color: rgba(255,255,255,0.5); margin-top: 10rpx; }
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.mall-item-card {
  background: rgba(255,255,255,0.03);
  border: 1rpx solid rgba(255,255,255,0.05);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  
  &:active { background: rgba(255,255,255,0.08); transform: scale(0.98); }
  
  .item-icon-wrap {
    width: 140rpx; height: 140rpx;
    background: rgba(255,255,255,0.02);
    border-radius: 50%;
    display: flex; justify-content: center; align-items: center;
    margin-bottom: 24rpx;
    box-shadow: inset 0 0 20rpx rgba(0,0,0,0.2);
    
    &.type-2 { border: 2rpx solid rgba(212, 175, 55, 0.2); }
  }
  
  .emoji { font-size: 80rpx; }
  
  .item-info {
    text-align: center;
    .item-name { font-size: 28rpx; color: #eee; font-weight: 600; display: block; margin-bottom: 12rpx; }
    .price-row {
      display: flex; align-items: baseline; justify-content: center; gap: 4rpx;
      .price { font-size: 36rpx; font-weight: bold; color: #d4af37; }
      .unit { font-size: 20rpx; color: rgba(255,255,255,0.4); }
    }
  }
}

.detail-popup {
  width: 600rpx;
  border-radius: 32rpx;
  overflow: hidden;
  background: #1e2439;
}

.detail-content {
  padding: 60rpx 40rpx;
  text-align: center;
  background: #1e2439;
  
  .detail-icon { margin-bottom: 40rpx; }
  .emoji-large { font-size: 120rpx; }
  .detail-name { font-size: 40rpx; font-weight: bold; color: #d4af37; margin-bottom: 24rpx; }
  .detail-desc { font-size: 26rpx; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 40rpx; }
  
  .detail-limit {
    background: rgba(212, 175, 55, 0.1);
    color: #d4af37; font-size: 22rpx;
    padding: 10rpx 24rpx; border-radius: 8rpx;
    display: inline-flex; align-items: center; gap: 8rpx;
    margin-bottom: 40rpx;
  }
  
  .detail-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 40rpx; padding-top: 40rpx; border-top: 1rpx solid rgba(255,255,255,0.05);
    
    .cost {
      text-align: left;
      .val { font-size: 44rpx; font-weight: bold; color: #fff; }
      .lab { font-size: 22rpx; color: rgba(255,255,255,0.4); margin-left: 8rpx; }
    }
    
    .redeem-btn {
      margin: 0; padding: 0 48rpx; height: 88rpx; line-height: 88rpx;
      background: linear-gradient(90deg, #d4af37, #f9e295);
      color: #0f1220; font-size: 30rpx; font-weight: bold;
      border-radius: 44rpx;
      
      &[disabled] { background: #444; color: #888; }
    }
  }
}
</style>
