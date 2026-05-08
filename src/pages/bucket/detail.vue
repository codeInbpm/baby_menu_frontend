<template>
  <view class="page" :class="user.themeClass">
    <view class="header">
      <view class="nav-bar">
        <wd-icon name="arrow-left" size="20px" @click="goBack" />
        <text class="title">{{ isAdd ? '新增愿望' : '愿望详情' }}</text>
        <view class="right-btn"></view>
      </view>
    </view>

    <!-- Cover Image Upload/Display -->
    <view class="cover-section" @click="onUploadCover">
      <image v-if="form.coverUrl" class="cover-img" :src="form.coverUrl" mode="aspectFill" />
      <view class="cover-placeholder" v-else>
        <text class="icon">📸</text>
        <text class="text">{{ isAdd ? '添加一张浪漫的封面图吧～' : '还没有封面图哦' }}</text>
      </view>
      <view class="edit-badge" v-if="isAdd">更换</view>
    </view>

    <view class="content">
      <view class="card">
        <!-- Add Mode -->
        <template v-if="isAdd">
          <view class="form-item">
            <text class="label">愿望标题</text>
            <input class="input title-input" v-model="form.title" placeholder="例如：一起去大理看苍山洱海" maxlength="30" />
          </view>
          
          <view class="form-item">
            <text class="label">详细描述 (可选)</text>
            <textarea class="textarea" v-model="form.description" placeholder="写下关于这个愿望的更多细节..." :auto-height="true"></textarea>
          </view>
          
          <view class="form-item row">
            <text class="label">分类标签</text>
            <picker mode="selector" :range="categoryList" @change="onCategoryChange">
              <view class="picker-val" :class="{ placeholder: !form.category }">
                {{ form.category || '请选择分类标签' }}
              </view>
            </picker>
          </view>
          
          <view class="form-item row">
            <text class="label">目标日期</text>
            <picker mode="date" :value="form.targetDate" @change="onDateChange">
              <view class="picker-val" :class="{ placeholder: !form.targetDate }">
                {{ form.targetDate || '选一个目标日期 (可选)' }}
              </view>
            </picker>
          </view>
          
          <button class="btn-submit" @click="submitAdd">放入心愿单 ❤️</button>
        </template>
        
        <!-- Detail Mode -->
        <template v-else>
          <view class="detail-header">
            <view class="tags">
              <text class="tag category" v-if="form.category">{{ form.category }}</text>
              <text class="tag date" v-if="form.targetDate">目标：{{ form.targetDate }}</text>
            </view>
            <view class="title">{{ form.title }}</view>
            <view class="desc" v-if="form.description">{{ form.description }}</view>
          </view>
          
          <view class="divider"></view>
          
          <!-- Progress -->
          <view class="progress-section">
            <view class="section-title">完成进度</view>
            
            <view class="check-box">
              <view class="user-check">
                <image class="avatar" :class="{ checked: form.ownerChecked }" :src="getAvatar('owner')" />
                <view class="info">
                  <text class="name">管家</text>
                  <text class="status checked" v-if="form.ownerChecked">已打卡</text>
                  <text class="status" v-else>待完成</text>
                </view>
                <button 
                  class="btn-check" 
                  :class="{ disabled: form.ownerChecked }" 
                  v-if="user.info?.roleInCouple === 'owner' && form.status === 0"
                  @click="onCheck"
                >
                  {{ form.ownerChecked ? '已打卡' : '打卡' }}
                </button>
              </view>
              
              <view class="user-check">
                <image class="avatar" :class="{ checked: form.petChecked }" :src="getAvatar('pet')" />
                <view class="info">
                  <text class="name">小宝贝</text>
                  <text class="status checked" v-if="form.petChecked">已打卡</text>
                  <text class="status" v-else>待完成</text>
                </view>
                <button 
                  class="btn-check" 
                  :class="{ disabled: form.petChecked }" 
                  v-if="user.info?.roleInCouple === 'pet' && form.status === 0"
                  @click="onCheck"
                >
                  {{ form.petChecked ? '已打卡' : '打卡' }}
                </button>
              </view>
            </view>
          </view>
          
          <!-- Memorial Notes -->
          <view class="memorial-section" v-if="form.status === 1">
            <view class="section-title">共同感言 ❤️</view>
            <view class="complete-time">完成于：{{ formatTime(form.completeTime) }}</view>
            
            <view class="notes-wrap">
              <view class="note-item" v-if="form.memorialNoteOwner">
                <image class="small-avatar" :src="getAvatar('owner')" />
                <view class="bubble">{{ form.memorialNoteOwner }}</view>
              </view>
              <view class="note-item right" v-if="form.memorialNotePet">
                <view class="bubble">{{ form.memorialNotePet }}</view>
                <image class="small-avatar" :src="getAvatar('pet')" />
              </view>
            </view>
            
            <!-- Add note btn -->
            <button class="btn-note" @click="showNoteModal = true" v-if="!hasMyNote">写下你的感言</button>
          </view>
          
          <!-- Delete -->
          <view class="actions">
            <text class="btn-delete" @click="onDelete">删除愿望</text>
          </view>
        </template>
      </view>
    </view>

    <!-- Note Modal -->
    <wd-popup v-model="showNoteModal" position="bottom" custom-style="border-radius: 32rpx 32rpx 0 0;">
      <view class="note-modal">
        <view class="modal-title">写下完成感言</view>
        <textarea class="textarea" v-model="tempNote" placeholder="那一刻的心情是怎样的呢..." :auto-focus="true"></textarea>
        <view class="modal-footer">
          <button class="btn-cancel" @click="showNoteModal = false">取消</button>
          <button class="btn-confirm" @click="submitNote">保存</button>
        </view>
      </view>
    </wd-popup>
    
    <!-- Celebration -->
    <view class="celebration" v-if="showCelebration">
      <view class="confetti" v-for="i in 20" :key="i" :style="getConfettiStyle(i)">🎉</view>
      <view class="celeb-text">愿望达成！双方各获得 10 积分！</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { bucketApi } from '@/api';
import { useUserStore } from '@/store/user';
import { BASE_URL } from '@/utils/request';

const user = useUserStore();
const isAdd = ref(true);
const id = ref<number | null>(null);

const form = ref<any>({
  title: '',
  description: '',
  category: '',
  coverUrl: '',
  targetDate: '',
});

const showNoteModal = ref(false);
const tempNote = ref('');
const showCelebration = ref(false);

const categoryList = ref<string[]>([]);

// Computed for checking if current user has left note
const hasMyNote = ref(false);

onLoad((options: any) => {
  loadCategories();
  if (options.action === 'add') {
    isAdd.value = true;
  } else if (options.id) {
    isAdd.value = false;
    id.value = Number(options.id);
    loadDetail();
  }
});

async function loadDetail() {
  try {
    const res = await bucketApi.detail(id.value!);
    form.value = res;
    
    const role = user.info?.roleInCouple;
    if (role === 'owner') hasMyNote.value = !!res.memorialNoteOwner;
    if (role === 'pet') hasMyNote.value = !!res.memorialNotePet;
  } catch(e: any) {
    uni.showToast({ title: e.message || '加载失败', icon: 'none' });
  }
}

function goBack() {
  uni.navigateBack();
}

async function loadCategories() {
  try {
    categoryList.value = await bucketApi.tags();
  } catch (e) {
    categoryList.value = ['旅行', '约会', '居家', '纪念日', '美食', '其他'];
  }
}

function onCategoryChange(e: any) {
  const index = e.detail.value;
  form.value.category = categoryList.value[index];
}

function onDateChange(e: any) {
  form.value.targetDate = e.detail.value;
}

async function onUploadCover() {
  if (!isAdd.value && form.value.status === 1) return; // Cannot upload if completed and not adding
  
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];
      uni.showLoading({ title: '上传中...' });
      try {
        const url = await uploadSingleFile(tempPath);
        form.value.coverUrl = url;
        uni.showToast({ title: '上传成功', icon: 'success' });
      } catch (err: any) {
        uni.showToast({ title: err.message, icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  });
}

function uploadSingleFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/upload/image',
      filePath: path,
      name: 'file',
      header: { Authorization: 'Bearer ' + user.token },
      success: (r) => {
        if (r.statusCode !== 200) return reject(new Error('服务器错误'));
        const body = JSON.parse(r.data);
        if (body.code === 0) resolve(body.data.url.startsWith('http') ? body.data.url : BASE_URL.replace('/api', '') + body.data.url);
        else reject(new Error(body.message));
      },
      fail: () => reject(new Error('上传失败'))
    });
  });
}

async function submitAdd() {
  if (!form.value.title) return uni.showToast({ title: '请输入愿望标题', icon: 'none' });
  
  uni.showLoading({ title: '保存中...' });
  try {
    await bucketApi.add(form.value);
    uni.showToast({ title: '已添加到心愿单', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch(e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
}

async function onCheck() {
  const role = user.info?.roleInCouple;
  if (role === 'owner' && form.value.ownerChecked) return;
  if (role === 'pet' && form.value.petChecked) return;
  
  uni.showLoading({ title: '打卡中...' });
  try {
    await bucketApi.check(id.value!);
    uni.showToast({ title: '打卡成功', icon: 'success' });
    
    // Check if it completes it
    if ((role === 'owner' && form.value.petChecked) || (role === 'pet' && form.value.ownerChecked)) {
      triggerCelebration();
    }
    loadDetail();
  } catch(e: any) {
    uni.showToast({ title: e.message || '打卡失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
}

function triggerCelebration() {
  showCelebration.value = true;
  try {
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.src = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
    innerAudioContext.play();
  } catch(e){}
  
  setTimeout(() => {
    showCelebration.value = false;
  }, 4000);
}

function getConfettiStyle(i: number) {
  const left = Math.random() * 100;
  const duration = 2 + Math.random() * 2;
  const delay = Math.random() * 1;
  return `left: ${left}%; animation: fall ${duration}s ${delay}s linear forwards;`;
}

async function submitNote() {
  if (!tempNote.value) return;
  uni.showLoading({ title: '保存中...' });
  try {
    await bucketApi.updateNote(id.value!, tempNote.value);
    showNoteModal.value = false;
    uni.showToast({ title: '已保存感言', icon: 'success' });
    loadDetail();
  } catch(e:any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
}

async function onDelete() {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个愿望吗？',
    success: async (res) => {
      if (res.confirm) {
        await bucketApi.remove(id.value!);
        uni.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
      }
    }
  });
}

function getAvatar(role: string) {
  if (user.info?.roleInCouple === role) {
    return user.info?.avatar || '/static/love.png';
  } else if (user.partner?.roleInCouple === role) {
    return user.partner?.avatar || '/static/love.png';
  }
  return '/static/love.png';
}

function formatTime(str: string) {
  if (!str) return '';
  const d = new Date(str.replace(/-/g, '/').replace('T', ' '));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fdfafb;
  padding-bottom: 60rpx;
}

.header {
  padding-top: var(--status-bar-height, 40px);
  background: transparent;
  position: absolute;
  top: 0; width: 100%; z-index: 10;
  
  .nav-bar {
    height: 44px;
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 30rpx;
    color: #fff; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
    
    .title { font-size: 32rpx; font-weight: bold; }
    .right-btn { width: 20px; } // placeholder for balance
  }
}

.cover-section {
  width: 100%; height: 500rpx;
  background: linear-gradient(135deg, #FFB6C1, #FFC0CB);
  position: relative;
  
  .cover-img { width: 100%; height: 100%; }
  
  .cover-placeholder {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    color: rgba(255,255,255,0.8);
    .icon { font-size: 80rpx; margin-bottom: 20rpx; }
    .text { font-size: 28rpx; }
  }
  
  .edit-badge {
    position: absolute; bottom: 60rpx; right: 40rpx;
    background: rgba(0,0,0,0.5); color: #fff;
    padding: 8rpx 24rpx; border-radius: 999rpx; font-size: 24rpx;
  }
}

.content {
  margin-top: -40rpx;
  position: relative; z-index: 2;
  padding: 0 30rpx;
}

.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 -10rpx 40rpx rgba(0,0,0,0.05);
  min-height: 500rpx;
}

/* Form Styles */
.form-item {
  margin-bottom: 40rpx;
  .label { display: block; font-size: 28rpx; color: #666; margin-bottom: 16rpx; font-weight: bold; }
  .input { background: #f9f9f9; height: 90rpx; border-radius: 16rpx; padding: 0 24rpx; font-size: 30rpx; }
  .title-input { font-size: 36rpx; font-weight: bold; }
  .textarea { background: #f9f9f9; width: 100%; border-radius: 16rpx; padding: 24rpx; font-size: 30rpx; min-height: 160rpx; box-sizing: border-box; }
  
  &.row {
    display: flex; justify-content: space-between; align-items: center;
    .label { margin-bottom: 0; }
    .input { width: 60%; text-align: right; background: transparent; padding: 0; }
  }
  
  .picker-val {
    font-size: 30rpx; color: #333;
    &.placeholder { color: #ccc; }
  }
}

.btn-submit {
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  color: #fff; font-size: 32rpx; font-weight: bold; border-radius: 999rpx;
  height: 96rpx; line-height: 96rpx; margin-top: 60rpx;
  box-shadow: 0 10rpx 20rpx rgba(255,154,158,0.3);
  &::after { border: none; }
}

/* Detail Styles */
.detail-header {
  margin-bottom: 40rpx;
  .tags {
    display: flex; gap: 16rpx; margin-bottom: 20rpx;
    .tag { font-size: 22rpx; padding: 6rpx 16rpx; border-radius: 8rpx; }
    .category { background: #FFF0F6; color: #FF6FA0; }
    .date { background: #F5F5F5; color: #666; }
  }
  .title { font-size: 44rpx; font-weight: 900; color: #333; margin-bottom: 20rpx; line-height: 1.4; }
  .desc { font-size: 28rpx; color: #666; line-height: 1.6; }
}

.divider { height: 2rpx; background: #f5f5f5; margin: 40rpx 0; }

.section-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 30rpx; }

.check-box {
  display: flex; flex-direction: column; gap: 30rpx;
}
.user-check {
  display: flex; align-items: center; background: #fdfafb; padding: 24rpx; border-radius: 24rpx;
  
  .avatar {
    width: 80rpx; height: 80rpx; border-radius: 50%; filter: grayscale(100%); margin-right: 24rpx;
    &.checked { filter: grayscale(0%); border: 4rpx solid #FF6FA0; }
  }
  
  .info {
    flex: 1; display: flex; flex-direction: column; gap: 8rpx;
    .name { font-size: 28rpx; color: #333; font-weight: bold; }
    .status { font-size: 24rpx; color: #999; }
    .status.checked { color: #1FCB6A; }
  }
  
  .btn-check {
    margin: 0; padding: 0 32rpx; height: 60rpx; line-height: 60rpx; border-radius: 30rpx; font-size: 26rpx;
    background: #FF6FA0; color: #fff; font-weight: bold;
    &::after { border: none; }
    &.disabled { background: #eee; color: #999; }
  }
}

.memorial-section {
  margin-top: 60rpx;
  background: #FFF0F6; padding: 40rpx 30rpx; border-radius: 32rpx;
  
  .complete-time { font-size: 24rpx; color: #999; text-align: center; margin-bottom: 30rpx; }
  
  .notes-wrap { display: flex; flex-direction: column; gap: 30rpx; margin-bottom: 40rpx; }
  .note-item {
    display: flex; align-items: flex-start; gap: 20rpx;
    .small-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; flex-shrink: 0; }
    .bubble { background: #fff; padding: 20rpx 30rpx; border-radius: 16rpx 16rpx 16rpx 0; font-size: 28rpx; color: #333; line-height: 1.5; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); max-width: 80%; }
    
    &.right {
      justify-content: flex-end;
      .bubble { border-radius: 16rpx 16rpx 0 16rpx; background: #FF6FA0; color: #fff; }
    }
  }
  
  .btn-note { background: #fff; color: #FF6FA0; font-size: 28rpx; font-weight: bold; border-radius: 999rpx; border: 2rpx solid #FF6FA0; &::after { border: none; } }
}

.actions {
  margin-top: 60rpx; text-align: center;
  .btn-delete { font-size: 26rpx; color: #999; padding: 20rpx; }
}

.note-modal {
  padding: 40rpx; background: #fff;
  .modal-title { font-size: 32rpx; font-weight: bold; text-align: center; margin-bottom: 30rpx; }
  .textarea { width: 100%; background: #f9f9f9; padding: 24rpx; border-radius: 16rpx; box-sizing: border-box; height: 200rpx; font-size: 28rpx; margin-bottom: 40rpx; }
  .modal-footer {
    display: flex; gap: 20rpx;
    button { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 30rpx; &::after { border:none; } }
    .btn-cancel { background: #f5f5f5; color: #666; }
    .btn-confirm { background: #FF6FA0; color: #fff; font-weight: bold; }
  }
}

.celebration {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  display: flex; justify-content: center; align-items: center;
  background: rgba(0,0,0,0.4);
  
  .confetti { position: absolute; top: -100rpx; font-size: 60rpx; opacity: 0; }
  
  .celeb-text {
    background: #fff; padding: 30rpx 50rpx; border-radius: 999rpx;
    font-size: 36rpx; font-weight: bold; color: #FF6FA0;
    box-shadow: 0 10rpx 40rpx rgba(255,111,160,0.4);
    animation: bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
}

@keyframes bounce {
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
</style>
