<template>
  <view class="page" :class="user.themeClass">
    <view class="bg-pattern"></view>
    <view class="content-wrap">
      
      <!-- 顶部最近纪念日卡片 -->
      <view class="top-card" v-if="closestMemorial" @click.stop="onEdit(closestMemorial.id)">
        <view class="tag">最近的纪念日</view>
        <view class="left-info">
          <view class="title">{{ closestMemorial.text }}</view>
          <view class="days-wrap">
            <text class="num">{{ closestMemorial.days }}</text>
            <text class="unit">天</text>
          </view>
          <view class="target-date">目标日：{{ closestMemorial.targetDate }}</view>
        </view>
        <view class="right-img">
          <!-- 这里用emoji模拟蛋糕/图片效果 -->
          <view class="img-placeholder">{{ closestMemorial.icon }}</view>
        </view>
      </view>

      <!-- 列表 -->
      <view class="list" v-if="displayList.length > 0">
        <view class="list-item" v-for="item in displayList" :key="item.id" @click.stop="onEdit(item.id)">
          <view class="item-left">
            <text class="icon">{{ item.icon }}</text>
            <text class="name">{{ item.text }}</text>
          </view>
          <view class="item-right">
            <text class="days">{{ item.days }}</text>
            <text class="unit">天</text>
          </view>
        </view>
      </view>

      <view class="empty" v-else>
        <text class="icon">📅</text>
        <text>还没有记录任何纪念日呢</text>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-btn" @click="onAdd">
      <text>+</text>
    </view>

    <!-- 添加/编辑纪念日弹窗 -->
    <wd-popup v-model="showAdd" position="bottom" custom-style="border-radius: 32rpx 32rpx 0 0;">
      <view class="popup-content">
        <view class="pop-header">{{ form.id ? '编辑纪念日' : '添加纪念日' }}</view>
        <view class="form">
          <view class="form-item">
            <text class="label">标题</text>
            <input class="input" v-model="form.title" placeholder="例如：我的生日、我们在一起" />
          </view>
          <view class="form-item">
            <text class="label">日期</text>
            <picker mode="date" :value="form.memorialDate" @change="onDateChange">
              <view class="picker-val" :class="{ placeholder: !form.memorialDate }">
                {{ form.memorialDate || '请选择日期' }}
              </view>
            </picker>
          </view>
          <view class="form-item row-item">
            <text class="label">历法</text>
            <view class="radio-group">
              <view class="radio-item" :class="{ active: form.calendarType === 0 }" @click="form.calendarType = 0">公历</view>
              <view class="radio-item" :class="{ active: form.calendarType === 1 }" @click="form.calendarType = 1">农历</view>
            </view>
          </view>
          <view class="form-item row-item">
            <text class="label">记录方式</text>
            <view class="radio-group">
              <view class="radio-item" :class="{ active: form.recordType === 1 }" @click="form.recordType = 1">累计日</view>
              <view class="radio-item" :class="{ active: form.recordType === 0 }" @click="form.recordType = 0">倒数日</view>
            </view>
          </view>
          <view class="form-item switch-item" v-if="form.recordType === 0">
            <text class="label">每年重复 (如生日、结婚纪念日)</text>
            <wd-switch v-model="form.isAnnualRemind" active-color="#F6666E" />
          </view>
          <view class="form-item switch-item">
            <text class="label">设为主纪念日 (首页展示)</text>
            <wd-switch v-model="form.isMain" active-color="#F6666E" />
          </view>
        </view>
        <view class="pop-footer">
          <view class="btn cancel" @click="showAdd = false">取消</view>
          <view v-if="form.id" class="btn delete" @click="onDelete(form.id)">删除</view>
          <view class="btn confirm" @click="submitAdd">保存</view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { memorialApi } from '@/api';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const memorials = ref<any[]>([]);
const showAdd = ref(false);

const form = ref<any>({
  id: null,
  title: '',
  memorialDate: '',
  description: '',
  isAnnualRemind: true,
  isMain: false,
  calendarType: 0,
  recordType: 0,
});

async function load() {
  const res = await memorialApi.list();
  memorials.value = res || [];
  
  try {
    const mainMemorial = await memorialApi.getMainMemorial();
    user.setMainMemorial(mainMemorial);
  } catch(e) {}
}

onShow(load);

function getDaysInfo(item: any) {
  const today = dayjs().startOf('day');
  
  let originalSolarDate = dayjs(item.memorialDate).startOf('day');
  let lunarInfo: any = null;

  if (item.calendarType === 1) {
    const [y, m, d] = item.memorialDate.split('-').map(Number);
    const lunar = Lunar.fromYmd(y, m, d);
    const solar = lunar.getSolar();
    originalSolarDate = dayjs(`${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`).startOf('day');
    lunarInfo = { y, m, d };
  }

  let title = item.title;
  if (item.userId && item.userId !== user.info?.id) {
    if (title.includes('我的')) {
      const partnerName = user.partner?.nickname || 'TA';
      title = title.replace('我的', partnerName + '的');
    }
  }

  // 1: 累计日
  if (item.recordType === 1) {
    const days = today.diff(originalSolarDate, 'day');
    return {
      type: 'past',
      days: Math.max(0, days),
      text: `${title}已有`,
      targetDate: originalSolarDate.format('YYYY年MM月DD日'),
      icon: title.includes('生日') ? '🎂' : '❤️'
    };
  } else {
    // 0: 倒数日
    let nextSolarDate = originalSolarDate;
    if (item.isAnnualRemind) {
      if (item.calendarType === 1 && lunarInfo) {
        const thisYearLunar = Lunar.fromYmd(today.year(), lunarInfo.m, lunarInfo.d);
        const thisYearSolar = thisYearLunar.getSolar();
        let candidate = dayjs(`${thisYearSolar.getYear()}-${thisYearSolar.getMonth()}-${thisYearSolar.getDay()}`).startOf('day');
        
        if (candidate.isBefore(today)) {
          const nextYearLunar = Lunar.fromYmd(today.year() + 1, lunarInfo.m, lunarInfo.d);
          const nextYearSolar = nextYearLunar.getSolar();
          candidate = dayjs(`${nextYearSolar.getYear()}-${nextYearSolar.getMonth()}-${nextYearSolar.getDay()}`).startOf('day');
        }
        nextSolarDate = candidate;
      } else {
        nextSolarDate = originalSolarDate.year(today.year());
        if (nextSolarDate.isBefore(today)) {
          nextSolarDate = nextSolarDate.add(1, 'year');
        }
      }
    }

    const days = nextSolarDate.diff(today, 'day');
    return {
      type: 'future',
      days: Math.max(0, days),
      text: `${title}还有`,
      targetDate: nextSolarDate.format('YYYY年MM月DD日') + (item.calendarType === 1 ? '(农)' : ''),
      icon: title.includes('生日') ? '🎂' : (title.includes('在一起') ? '❤️' : '🎉')
    };
  }
}

const displayList = computed(() => {
  return memorials.value.map(item => ({ ...item, ...getDaysInfo(item) }));
});

const closestMemorial = computed(() => {
  if (displayList.value.length === 0) return null;
  const futures = displayList.value.filter(x => x.type === 'future');
  if (futures.length > 0) {
    return futures.reduce((min, cur) => cur.days < min.days ? cur : min);
  }
  return displayList.value[0];
});

function onDateChange(e: any) { form.value.memorialDate = e.detail.value; }

function onAdd() {
  form.value = { id: null, title: '', memorialDate: '', description: '', isAnnualRemind: true, isMain: false, calendarType: 0, recordType: 0 };
  showAdd.value = true;
}

function onEdit(id: number) {
  const item = memorials.value.find(x => x.id === id);
  if (item) {
    form.value = { 
      ...item,
      isAnnualRemind: item.isAnnualRemind === true || item.isAnnualRemind === 1,
      isMain: item.isMain === true || item.isMain === 1,
      calendarType: item.calendarType || 0,
      recordType: item.recordType || 0
    };
    showAdd.value = true;
  }
}

async function submitAdd() {
  if (!form.value.title) return uni.showToast({ title: '请输入标题', icon: 'none' });
  if (!form.value.memorialDate) return uni.showToast({ title: '请选择日期', icon: 'none' });
  
  uni.showLoading({ title: '保存中...' });
  try {
    if (form.value.id) {
      await memorialApi.update(form.value);
    } else {
      await memorialApi.add(form.value);
    }
    uni.showToast({ title: '保存成功', icon: 'success' });
    showAdd.value = false;
    load();
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
}

function onDelete(id: number) {
  uni.showModal({
    title: '提示', content: '确定删除该纪念日吗？',
    success: async (res) => {
      if (res.confirm) {
        await memorialApi.remove(id);
        uni.showToast({ title: '已删除', icon: 'success' });
        showAdd.value = false;
        load();
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--primary-color);
  position: relative;
  padding-bottom: 200rpx;
  overflow: hidden;
}

/* 简单的背景花纹装饰 */
.bg-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(#fff 15%, transparent 16%), radial-gradient(#fff 15%, transparent 16%);
  background-size: 60rpx 60rpx;
  background-position: 0 0, 30rpx 30rpx;
  pointer-events: none;
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding: 40rpx 30rpx;
}

/* 顶部大卡片 */
.top-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 40rpx;
  position: relative;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
  margin-bottom: 30rpx;
  min-height: 280rpx;
  display: flex;
  justify-content: space-between;
  
  .tag {
    position: absolute;
    top: 0; right: 0;
    background: #FFD55F;
    color: #555;
    font-size: 24rpx;
    font-weight: 600;
    padding: 12rpx 30rpx;
    border-radius: 0 32rpx 0 20rpx;
  }
  
  .left-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 20rpx;
    
    .title {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .days-wrap {
      display: flex;
      align-items: baseline;
      margin-bottom: 20rpx;
      .num {
        font-size: 80rpx;
        font-weight: 700;
        color: var(--primary-color);
        line-height: 1;
      }
      .unit {
        font-size: 28rpx;
        color: #333;
        margin-left: 10rpx;
      }
    }
    
    .target-date {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .right-img {
    width: 180rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    .img-placeholder {
      font-size: 140rpx;
      line-height: 1;
      filter: drop-shadow(0 10rpx 10rpx rgba(0,0,0,0.1));
    }
  }
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.list-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .item-left {
    display: flex;
    align-items: center;
    .icon {
      font-size: 40rpx;
      margin-right: 20rpx;
    }
    .name {
      font-size: 30rpx;
      color: #333;
    }
  }
  
  .item-right {
    .days {
      font-size: 34rpx;
      color: #999;
      margin-right: 4rpx;
    }
    .unit {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.empty {
  margin-top: 100rpx;
  display: flex; flex-direction: column; align-items: center;
  .icon { font-size: 80rpx; margin-bottom: 20rpx; opacity: 0.8; }
  color: #fff; font-size: 28rpx; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.fab-btn {
  position: fixed;
  right: 40rpx; bottom: 80rpx;
  width: 110rpx; height: 110rpx;
  border-radius: 55rpx;
  background: #fff;
  color: var(--primary-color);
  font-size: 60rpx;
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
  font-weight: 300;
  z-index: 10;
}

/* Popup Form */
.popup-content {
  background: #fff;
  padding: 40rpx 40rpx 60rpx;
  .pop-header { font-size: 36rpx; font-weight: 700; text-align: center; margin-bottom: 40rpx; color: #333; }
  .form-item {
    margin-bottom: 30rpx;
    .label { font-size: 28rpx; color: #666; margin-bottom: 16rpx; display: block; }
    .input { background: #f9f9f9; height: 88rpx; padding: 0 24rpx; border-radius: 16rpx; font-size: 28rpx; }
    .picker-val {
      background: #f9f9f9; height: 88rpx; padding: 0 24rpx; border-radius: 16rpx; font-size: 28rpx;
      line-height: 88rpx; color: #333;
      &.placeholder { color: #999; }
    }
  }
  .switch-item {
    display: flex; justify-content: space-between; align-items: center;
    .label { margin-bottom: 0; }
  }
  .row-item {
    display: flex; justify-content: space-between; align-items: center;
    .label { margin-bottom: 0; }
  }
  .radio-group {
    display: flex; background: #f5f5f5; border-radius: 12rpx; padding: 4rpx;
    .radio-item {
      padding: 10rpx 24rpx; font-size: 24rpx; color: #666; border-radius: 8rpx;
      transition: all 0.3s;
      &.active { background: #fff; color: var(--primary-color); font-weight: 600; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
    }
  }
  .pop-footer {
    display: flex; gap: 20rpx; margin-top: 50rpx;
    .btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; justify-content: center; align-items: center; font-size: 30rpx; font-weight: 600; }
    .cancel { background: #f5f5f5; color: #666; }
    .delete { background: #FFF0F0; color: #FF4D4F; }
    .confirm { background: var(--primary-color); color: #fff; box-shadow: 0 6rpx 20rpx var(--card-shadow); }
  }
}
</style>
