<template>
  <view class="title-page">
    <view class="header">
      <view class="stats-card">
        <view class="stat-item">
          <text class="num">{{ unlockedCount }}</text>
          <text class="label">已解锁称号</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item">
          <text class="num">{{ totalCount }}</text>
          <text class="label">总称号数</text>
        </view>
      </view>
    </view>

    <view class="title-list">
      <view v-for="group in groupedTitles" :key="group.level" class="level-group">
        <view class="group-header">
          <text class="group-name">{{ getLevelName(group.level) }}</text>
          <text class="group-desc">{{ getLevelDesc(group.level) }}</text>
        </view>

        <view class="title-grid">
          <view 
            v-for="title in group.items" 
            :key="title.titleCode" 
            class="title-card" 
            :class="[title.level, { locked: !title.unlocked, active: title.isCurrent }]"
            @click="onTitleClick(title)"
          >
            <view class="card-bg"></view>
            <view class="status-badge" v-if="title.isCurrent">佩戴中</view>
            <view class="lock-icon" v-if="!title.unlocked">
              <wd-icon name="lock" size="16px" color="rgba(255,255,255,0.4)" />
            </view>
            
            <view class="title-name">{{ title.titleName }}</view>
            <view class="unlock-info">
              <text v-if="title.unlocked">{{ title.unlockTime.split(' ')[0] }} 解锁</text>
              <text v-else>尚未解锁</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <wd-popup v-model="showDetail" position="bottom" custom-class="detail-popup" :safe-area-inset-bottom="true">
      <view class="detail-content" v-if="selectedTitle">
        <view class="detail-header">
          <view class="title-icon" :class="selectedTitle.level">
            {{ selectedTitle.titleName }}
          </view>
          <view class="level-badge" :class="selectedTitle.level">
            {{ getLevelName(selectedTitle.level) }}
          </view>
        </view>
        
        <view class="desc-box">
          <view class="label">称号描述</view>
          <view class="text">{{ selectedTitle.description }}</view>
        </view>

        <view class="condition-box" v-if="!selectedTitle.unlocked">
          <view class="label">解锁条件</view>
          <view class="text">{{ formatCondition(selectedTitle.unlockCondition) }}</view>
        </view>

        <view class="btn-wrap">
          <button 
            v-if="selectedTitle.unlocked && !selectedTitle.isCurrent" 
            class="wear-btn" 
            @click="handleWear"
          >立即佩戴</button>
          <button 
            v-else-if="selectedTitle.isCurrent" 
            class="wear-btn disabled" 
            disabled
          >佩戴中</button>
          <button 
            v-else 
            class="wear-btn locked" 
            @click="showDetail = false"
          >继续努力</button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTitleStore } from '@/store/title';
import { useToast } from 'wot-design-uni';

const titleStore = useTitleStore();
const toast = useToast();
const showDetail = ref(false);
const selectedTitle = ref<any>(null);

onMounted(() => {
  titleStore.fetchTitleList();
});

const unlockedCount = computed(() => titleStore.titleList.filter(t => t.unlocked).length);
const totalCount = computed(() => titleStore.titleList.length);

const groupedTitles = computed(() => {
  const levels = ['legend', 'rare', 'normal'];
  return levels.map(level => ({
    level,
    items: titleStore.titleList.filter(t => t.level === level)
  })).filter(g => g.items.length > 0);
});

function getLevelName(level: string) {
  switch (level) {
    case 'normal': return '普通称号';
    case 'rare': return '稀有称号';
    case 'legend': return '传说称号';
    default: return '';
  }
}

function getLevelDesc(level: string) {
  switch (level) {
    case 'normal': return '记录点点滴滴的平凡小确幸';
    case 'rare': return '这是属于你们之间的默契印记';
    case 'legend': return '只有至死不渝的爱才能点亮';
    default: return '';
  }
}

function onTitleClick(title: any) {
  selectedTitle.value = title;
  showDetail.value = true;
}

async function handleWear() {
  if (!selectedTitle.value) return;
  try {
    toast.loading('处理中...');
    await titleStore.wearTitle(selectedTitle.value.titleCode);
    toast.success('佩戴成功');
    showDetail.value = false;
  } catch (e: any) {
    toast.error(e.message || '佩戴失败');
  }
}

function formatCondition(jsonStr: string) {
  if (!jsonStr) return '未知条件';
  try {
    const c = JSON.parse(jsonStr);
    let parts = [];
    if (c.category) parts.push(`完成 [${c.category}] 类服务 ≥ ${c.count} 次`);
    if (c.received_category) parts.push(`收到 [${c.received_category}] 类服务 ≥ ${c.count} 次`);
    if (c.total_service) parts.push(`累计完成服务 ≥ ${c.total_service} 次`);
    if (c.received_service) parts.push(`累计收到服务 ≥ ${c.received_service} 次`);
    if (c.min_reward_points) parts.push(`累计收到奖励积分 ≥ ${c.min_reward_points}`);
    if (c.received_points) parts.push(`累计获得奖励积分 ≥ ${c.received_points}`);
    if (c.min_avg_score) parts.push(`平均评分 ≥ ${c.min_avg_score}`);
    if (c.rare_title_count) parts.push(`解锁稀有称号 ≥ ${c.rare_title_count} 个`);
    if (c.legend_title_count) parts.push(`解锁传说称号 ≥ ${c.legend_title_count} 个`);
    return parts.join(' 且 ');
  } catch (e) {
    return '满足特定条件即可解锁';
  }
}
</script>

<style lang="scss" scoped>
.title-page {
  min-height: 100vh;
  background: #F8F5FB;
  padding-bottom: 50rpx;
}

.header {
  height: 320rpx;
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%);
  padding: 40rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
}

.stats-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 32rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(255, 154, 158, 0.2);
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .num { font-size: 40rpx; font-weight: 900; color: #FF6FA0; }
    .label { font-size: 22rpx; color: #999; margin-top: 4rpx; }
  }
  .divider { width: 1rpx; height: 60rpx; background: #EEE; }
}

.title-list {
  padding: 40rpx 30rpx;
}

.level-group {
  margin-bottom: 60rpx;
  
  .group-header {
    margin-bottom: 24rpx;
    padding-left: 10rpx;
    .group-name { font-size: 32rpx; font-weight: bold; color: #333; margin-right: 16rpx; }
    .group-desc { font-size: 24rpx; color: #999; }
  }
}

.title-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.title-card {
  height: 160rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  background: #FFF;
  transition: all 0.3s;
  
  &:active { transform: scale(0.96); }

  .title-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    z-index: 2;
    text-align: center;
    margin-bottom: 8rpx;
  }
  
  .unlock-info {
    font-size: 20rpx;
    color: #999;
    z-index: 2;
  }

  /* 等级样式 */
  &.rare {
    background: linear-gradient(135deg, #FFF8F0 0%, #FFF 100%);
    border: 2rpx solid #FFE4B5;
    .title-name { color: #CD853F; }
  }
  
  &.legend {
    background: linear-gradient(135deg, #FFF0F5 0%, #FFF 100%);
    border: 2rpx solid #FFB6C1;
    box-shadow: 0 0 20rpx rgba(255,182,193,0.3);
    .title-name { color: #FF1493; }
    &::after {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%);
      opacity: 0.5;
      z-index: 1;
    }
  }

  &.locked {
    background: #F5F5F5;
    border: none;
    .title-name { color: #999; }
    .unlock-info { color: #CCC; }
  }

  &.active {
    border: 4rpx solid #FF69B4;
  }

  .status-badge {
    position: absolute; top: 0; right: 0;
    background: #FF69B4; color: #FFF;
    font-size: 16rpx; padding: 4rpx 12rpx;
    border-bottom-left-radius: 12rpx;
    z-index: 3;
  }
  
  .lock-icon {
    position: absolute; top: 12rpx; left: 12rpx;
    opacity: 0.5;
  }
}

.detail-popup {
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
}

.detail-content {
  padding: 50rpx 40rpx;
  
  .detail-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50rpx;
    
    .title-icon {
      font-size: 44rpx; font-weight: bold; padding: 20rpx 60rpx;
      border-radius: 20rpx; background: #F5F5F5; color: #333;
      margin-bottom: 20rpx;
      
      &.rare { background: #FFEBCD; color: #CD853F; }
      &.legend { 
        background: #FFB6C1; color: #FFF; 
        box-shadow: 0 0 30rpx rgba(255,105,180,0.4);
      }
    }
    
    .level-badge {
      font-size: 24rpx; color: #999;
      &.rare { color: #CD853F; }
      &.legend { color: #FF69B4; font-weight: bold; }
    }
  }

  .label { font-size: 24rpx; color: #999; margin-bottom: 12rpx; }
  .text { font-size: 28rpx; color: #444; line-height: 1.6; }
  
  .desc-box, .condition-box {
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #EEE;
  }

  .btn-wrap {
    margin-top: 60rpx;
    .wear-btn {
      width: 100%; height: 90rpx; line-height: 90rpx;
      background: linear-gradient(135deg, #FF9A9E, #FF69B4);
      color: #FFF; font-weight: bold; border-radius: 45rpx;
      border: none;
      
      &.disabled { background: #EEE; color: #999; box-shadow: none; }
      &.locked { background: #AAA; }
    }
  }
}
</style>
