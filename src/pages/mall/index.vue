<template>
  <view class="mall-page" :class="user.themeClass">
    <view class="header">
      <view class="points-info">
        <text class="label">我的可用积分</text>
        <view class="points">
          <wd-icon name="star-on" size="24px" color="#FFD700" class="star-icon" />
          <text class="num">{{ user.info?.points || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- Tabs -->
    <view class="tabs">
      <view class="tab" :class="{ active: currentTab === 0 }" @click="currentTab = 0">兑换商城</view>
      <view class="tab" :class="{ active: currentTab === 1 }" @click="currentTab = 1">我的权益</view>
      <view class="tab-indicator" :style="{ left: currentTab === 0 ? '25%' : '75%' }"></view>
    </view>

    <!-- 商城列表 -->
    <scroll-view scroll-y class="list-container" v-if="currentTab === 0">
      <view class="empty" v-if="items.length === 0">暂无商品上架</view>
      <view class="mall-item" v-for="item in items" :key="item.id">
        <view class="icon-wrap">{{ item.icon || '🎁' }}</view>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="desc">{{ item.description }}</view>
          <view class="meta">
            <text class="price">{{ item.price }} 积分</text>
            <text class="validity" v-if="item.validityDays">有效期 {{ item.validityDays }} 天</text>
            <text class="validity" v-else>永久有效</text>
          </view>
        </view>
        <view class="action">
          <button 
            class="btn-redeem" 
            :class="{ disabled: (user.info?.points || 0) < item.price }"
            @click="handleRedeem(item)">
            兑换
          </button>
        </view>
      </view>
      <view class="spacer"></view>
    </scroll-view>

    <!-- 我的权益列表 -->
    <scroll-view scroll-y class="list-container" v-if="currentTab === 1">
      <view class="empty" v-if="inventory.length === 0">暂无已兑换的权益</view>
      <view class="mall-item inv-item" v-for="inv in inventory" :key="inv.id">
        <view class="icon-wrap" :class="{ used: inv.status === 1 }">{{ getIconByType(inv.itemType) }}</view>
        <view class="info">
          <view class="name" :class="{ used: inv.status === 1 }">{{ inv.itemName }}</view>
          <view class="desc" v-if="inv.status === 1">已于 {{ formatDate(inv.useTime) }} 使用</view>
          <view class="desc" v-else-if="inv.expireTime">过期时间: {{ formatDate(inv.expireTime) }}</view>
          <view class="desc" v-else>永久有效</view>
        </view>
        <view class="action">
          <view class="status-tag used" v-if="inv.status === 1 && inv.itemType !== 1">已使用</view>
          <template v-else-if="inv.itemType === 1 && inv.status === 1">
             <view class="remind-group">
               <text class="remind-status">已提醒</text>
               <button class="btn-remind" @click="handleRemind(inv)">再次提醒</button>
             </view>
          </template>
          <button v-else class="btn-use" @click="handleUse(inv)">立即使用</button>
        </view>
      </view>
      <view class="spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { mallApi, userApi } from '@/api';
import { requestSubscribe } from '@/utils/subscribe';
import { useSubscribeGuide } from '@/utils/subscribeGuide';

const user = useUserStore();
const currentTab = ref(0);
const items = ref<any[]>([]);
const inventory = ref<any[]>([]);

onMounted(() => {
  loadData();
});

async function loadData() {
  uni.showLoading({ title: '加载中' });
  try {
    const [me, itemsRes, invRes] = await Promise.all([
      userApi.me(),
      mallApi.items(),
      mallApi.inventory()
    ]);
    user.setLogin(user.token, me.user, me.bound);
    items.value = itemsRes || [];
    inventory.value = invRes || [];
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
  
  const { checkAndPrompt } = useSubscribeGuide('mall');
  checkAndPrompt();
}

function handleRedeem(item: any) {
  if ((user.info?.points || 0) < item.price) {
    uni.showToast({ title: '积分不足，快去完成服务赚取吧', icon: 'none' });
    return;
  }
  uni.showModal({
    title: '确认兑换',
    content: `确定要花费 ${item.price} 积分兑换【${item.name}】吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '兑换中' });
        try {
          await mallApi.redeem(item.id);
          uni.showToast({ title: '兑换成功！', icon: 'success' });
          loadData();
        } catch (e: any) {
          uni.showToast({ title: e.message || '兑换失败', icon: 'none' });
        }
      }
    }
  });
}

function handleUse(inv: any) {
  uni.showModal({
    title: '确认激活',
    content: inv.itemType === 1 ? '确认立即激活【公主主动服务卡】吗？激活后系统会马上发送高优先级提醒给公主！' : `确定要使用【${inv.itemName}】吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中' });
        try {
          await mallApi.useItem(inv.id);
          uni.showToast({ title: '已成功激活并提醒！', icon: 'success' });
          loadData();
        } catch (e: any) {
          uni.showToast({ title: e.message || '操作失败', icon: 'none' });
        }
      }
    }
  });
}

function handleRemind(inv: any) {
  uni.showModal({
    title: '再次提醒公主',
    content: '公主可能在忙没有看到哦，确定要再发送一次强力提醒吗？（每张卡最多可再提醒2次）',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '发送中' });
        try {
          await mallApi.remind(inv.id);
          uni.showToast({ title: '提醒已再次发送！', icon: 'success' });
          loadData();
        } catch (e: any) {
          uni.showToast({ title: e.message || '发送失败', icon: 'none' });
        }
      }
    }
  });
}

function getIconByType(type: number) {
  const map: Record<number, string> = {
    1: '💖', 2: '🏅', 3: '🖼️', 4: '💌', 5: '🎨'
  };
  return map[type] || '🎁';
}

function formatDate(ds: string) {
  if (!ds) return '';
  const d = new Date(ds);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.mall-page {
  min-height: 100vh;
  background-color: #0f1220; /* Deep tech background */
  color: #fff;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  background: linear-gradient(135deg, #1a1f35 0%, #0f1220 100%);
  border-bottom: 1rpx solid rgba(255,255,255,0.05);
  
  .points-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .label {
      font-size: 26rpx;
      color: rgba(255,255,255,0.6);
      margin-bottom: 12rpx;
    }
    
    .points {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .num {
        font-size: 72rpx;
        font-weight: bold;
        background: linear-gradient(to right, #FFD700, #FDB931);
        -webkit-background-clip: text;
        color: transparent;
      }
      .star-icon {
        margin-top: -10rpx;
      }
    }
  }
}

.tabs {
  display: flex;
  position: relative;
  height: 90rpx;
  background-color: rgba(26, 31, 53, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;
  
  .tab {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30rpx;
    color: rgba(255,255,255,0.5);
    transition: all 0.3s;
    font-weight: 500;
    
    &.active {
      color: #00E5FF; /* Cyberpunk cyan */
    }
  }
  
  .tab-indicator {
    position: absolute;
    bottom: 0;
    width: 60rpx;
    height: 6rpx;
    background: linear-gradient(90deg, #00E5FF, #0088FF);
    border-radius: 6rpx;
    transform: translateX(-50%);
    transition: all 0.3s ease;
  }
}

.list-container {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}

.empty {
  text-align: center;
  color: rgba(255,255,255,0.3);
  margin-top: 100rpx;
  font-size: 28rpx;
}

.mall-item {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border: 1rpx solid rgba(255,255,255,0.06);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
  
  .icon-wrap {
    width: 100rpx;
    height: 100rpx;
    border-radius: 20rpx;
    background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,136,255,0.1));
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50rpx;
    margin-right: 24rpx;
    border: 1px solid rgba(0,229,255,0.2);
    
    &.used {
      filter: grayscale(1);
      opacity: 0.5;
    }
  }
  
  .info {
    flex: 1;
    
    .name {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 8rpx;
      &.used {
        color: rgba(255,255,255,0.5);
      }
    }
    
    .desc {
      font-size: 24rpx;
      color: rgba(255,255,255,0.5);
      line-height: 1.4;
      margin-bottom: 16rpx;
    }
    
    .meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .price {
        font-size: 26rpx;
        color: #FFD700;
        font-weight: bold;
      }
      
      .validity {
        font-size: 22rpx;
        color: rgba(0,229,255,0.7);
        background: rgba(0,229,255,0.1);
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
  }
  
  .action {
    margin-left: 20rpx;
    
    .btn-redeem {
      background: linear-gradient(135deg, #00E5FF 0%, #0088FF 100%);
      color: #fff;
      font-size: 26rpx;
      padding: 0 36rpx;
      height: 64rpx;
      line-height: 64rpx;
      border-radius: 32rpx;
      font-weight: bold;
      
      &.disabled {
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.3);
      }
    }
    
    .btn-use {
      background: linear-gradient(135deg, #FF69B4 0%, #9C27B0 100%);
      color: #fff;
      font-size: 26rpx;
      padding: 0 36rpx;
      height: 64rpx;
      line-height: 64rpx;
      border-radius: 32rpx;
      font-weight: bold;
    }
    
    .remind-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;
      
      .remind-status {
        font-size: 22rpx;
        color: #00E5FF;
      }
      
      .btn-remind {
        background: rgba(0,229,255,0.1);
        color: #00E5FF;
        border: 1px solid rgba(0,229,255,0.3);
        font-size: 24rpx;
        padding: 0 24rpx;
        height: 50rpx;
        line-height: 48rpx;
        border-radius: 25rpx;
        &::after { display: none; }
      }
    }
    
    .status-tag {
      font-size: 24rpx;
      color: rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.05);
      padding: 8rpx 20rpx;
      border-radius: 32rpx;
    }
  }
}

.spacer {
  height: 60rpx;
}
</style>
