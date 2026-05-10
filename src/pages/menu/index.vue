<template>
  <view class="page-root" :style="themeStore.themeStyle">
    <view class="menu-page" :class="user.themeClass">
    <!-- 沉浸式背景图 - 仅在默认皮肤下显示 -->
    <image v-if="themeStore.currentSkinCode === 'default'" class="bg-img" :src="'/static/bg.png'" mode="aspectFill" />

    <view class="main-content">
      <!-- 顶部 -->
      <view class="topbar">
        <view class="user">
          <image class="avatar" :src="coupleAvatar" mode="aspectFill" />
          <view class="title-block">
            <view class="title">宝贝的专属菜单</view>
            <view class="subtitle">全都是你的最爱 💜</view>
          </view>
        </view>
        <view class="topbar-right">
          <view class="icon-btn" @click="goGames">
            <text class="iconfont">🎮</text>
          </view>
          <view class="icon-btn" @click="goRequests">
            <text class="iconfont">⌗</text>
          </view>
          <view class="icon-btn" @click="goManage">
            <text class="iconfont">🛍️</text>
          </view>
        </view>
      </view>



      <!-- 第二行：当前分类标签 + 管理菜谱 + 添加菜谱 + 搜索 -->
      <view class="cat-bar">
        <view class="cur-cat">{{ currentCategoryName }}</view>
        <view class="actions">
          <view class="pill outline" @click="goManage">管理菜谱</view>
          <view class="pill outline" @click="goAddItem">+ 添加菜谱</view>
          <view class="search">
            <text class="search-icon">🔍</text>
            <input class="search-input" v-model="keyword" placeholder="搜索" />
          </view>
        </view>
      </view>

      <view class="body">
        <!-- 左侧分类 -->
        <scroll-view class="side" scroll-y>
          <view
            v-for="c in categories"
            :key="c.id"
            class="side-item"
            :class="{ active: c.id === currentCategoryId }"
            @click="onCategory(c)"
          >
            {{ c.name }} {{ c.icon || '' }}
          </view>
        </scroll-view>

        <!-- 右侧菜单项 -->
        <scroll-view class="content" scroll-y>
          <view class="content-title">{{ currentCategoryTitle }}</view>
          <view v-for="it in filteredItems" :key="it.id" class="dish-card">
            <image class="dish-img" :src="it.imageUrl || defaultImg" mode="aspectFill" />
            <view class="dish-info">
              <view class="dish-name">{{ it.name }}</view>
              <view v-if="it.duration" class="duration-tag">{{ it.duration }} 分钟</view>
            </view>
            <view
              v-if="isPet"
              class="add-btn"
              :class="{ added: cart.has(it.id) }"
              @click="cart.toggle({ id: it.id, name: it.name, imageUrl: it.imageUrl })"
            >
              <text>{{ cart.has(it.id) ? '✓' : '+' }}</text>
            </view>
          </view>
          <view v-if="!filteredItems.length" class="empty">这个分类还没有菜单，点右上角「添加菜谱」～</view>
        </scroll-view>
      </view>
    </view>

    <!-- 悬浮购物车 -->
    <view v-if="isPet" class="cart-fab" @click="onCartTap">
      <text class="cart-icon">🛒</text>
      <view v-if="cart.count" class="badge">{{ cart.count }}</view>
    </view>
    
    <!-- 主人提示灯 -->
    <view v-if="!isPet" class="owner-hint">
       专属管家，请等待小宝贝点单哦～
    </view>

    <!-- 通知宝贝 弹窗 -->
    <view v-if="confirmShow" class="modal-mask" @click="closeConfirm">
      <view class="modal" @click.stop="() => {}">
        <view class="modal-title">通知宝贝？</view>
        <view class="modal-body">
          <view v-for="i in cart.items" :key="i.id" class="modal-row">· {{ i.name }}</view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn ghost" @click="closeConfirm">再想想</view>
          <view class="modal-btn primary" @click="sendRequest">马上通知！</view>
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { menuApi, requestApi, userApi, SUBSCRIBE_TEMPLATE_ID } from '@/api';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { useThemeStore } from '@/store/theme';

const cart = useCartStore();
const user = useUserStore();
const themeStore = useThemeStore();

const categories = ref<any[]>([]);
const items = ref<any[]>([]);
const currentCategoryId = ref<number | null>(null);
const keyword = ref('');
const confirmShow = ref(false);

const isFreeForPrincess = ref(false);
const currentCardId = ref<number | null>(null);

onLoad((options) => {
  if (options?.from === 'princessServiceCard' && options?.cardId) {
    isFreeForPrincess.value = true;
    currentCardId.value = Number(options.cardId);
  }
});

const defaultImg = '/static/dish_placeholder.png';
const coupleAvatar = computed(() => user.info?.avatar || '/static/love.png');
const isPet = computed(() => user.info?.roleInCouple === 'pet');

const currentCategoryName = computed(() => {
  const c = categories.value.find((x) => x.id === currentCategoryId.value);
  return c ? c.name : '私房菜';
});
const currentCategoryTitle = computed(() => {
  const c = categories.value.find((x) => x.id === currentCategoryId.value);
  return c ? `${c.name} ${c.icon || ''}` : '';
});

const filteredItems = computed(() => {
  let arr = items.value;
  if (keyword.value.trim()) {
    arr = arr.filter((i) => i.name.includes(keyword.value.trim()));
  }
  return arr;
});

async function loadAll() {
  // 检查绑定状态
  try {
    const me = await userApi.me();
    // 重要：同步更新 user.info，确保 isPet 等 computed 能拿到最新角色
    if (me.user) {
      user.setLogin(user.token, me.user, me.bound);
    }
    user.setPartner(me.partner);
    if (!me.bound) {
      uni.reLaunch({ url: '/pages/bind/index' });
      return;
    }
  } catch {}
  categories.value = await menuApi.categories();
  if (categories.value.length) {
    onCategory(categories.value[0]);
  }
}



async function onCategory(c: any) {
  currentCategoryId.value = c.id;
  items.value = await menuApi.items(c.id);
}

function goManage() { uni.navigateTo({ url: '/pages/manage/category' }); }
function goAddItem() {
  uni.navigateTo({ url: `/pages/manage/item?categoryId=${currentCategoryId.value || ''}` });
}
function goRequests() { uni.navigateTo({ url: '/pages/request/list' }); }
function goGames() { uni.navigateTo({ url: '/pages/game/index' }); }

function onCartTap() {
  if (!cart.count) {
    uni.showToast({ title: '还没选呢～', icon: 'none' });
    return;
  }
  confirmShow.value = true;
}

function closeConfirm() {
  confirmShow.value = false;
}

async function sendRequest() {
  // 微信订阅消息授权
  // @ts-ignore
  if (uni.requestSubscribeMessage) {
    try {
      await new Promise((resolve, reject) =>
        // @ts-ignore
        uni.requestSubscribeMessage({
          tmplIds: [SUBSCRIBE_TEMPLATE_ID],
          success: resolve,
          fail: reject,
        })
      );
    } catch (e) {
      console.warn('订阅授权失败', e);
    }
  }
  uni.showLoading({ title: '发送中…' });
  try {
    const params: any = { itemIds: cart.ids };
    if (isFreeForPrincess.value) {
      params.isFreeForPrincess = true;
      params.cardId = currentCardId.value;
    }
    await requestApi.create(params);
    uni.hideLoading();
    confirmShow.value = false;
    cart.clear();
    uni.showToast({ title: '已通知管家 ❤️', icon: 'success' });
    if (isFreeForPrincess.value) {
      setTimeout(() => {
        uni.switchTab({ url: '/pages/request/list' });
      }, 1500);
    }
  } catch {
    uni.hideLoading();
  }
}

onMounted(loadAll);
</script>

<style lang="scss" scoped>
page {
  height: 100%;
}

.menu-page {
  height: 100vh;
  position: relative;
  background: var(--bg-color);
}

/* 沉浸式背景图 */
.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 480rpx;
  z-index: 0;
}

/* 主内容区域，通过圆角盖在背景图上方 */
.main-content {
  position: relative;
  z-index: 1;
  /* 留出上方的空间给背景图展示，动态结合状态栏高度 */
  margin-top: calc(240rpx + var(--status-bar-height));
  background: var(--bg-color);
  border-radius: 40rpx 40rpx 0 0;
  height: calc(100vh - 240rpx - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4rpx 16rpx var(--card-shadow);
}

/* ===== topbar ===== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx 16rpx;
}
.user { display: flex; align-items: center; }
.avatar {
  width: 96rpx; height: 96rpx; border-radius: 24rpx; margin-right: 20rpx;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx var(--card-shadow);
}
.title-block .title {
  font-size: 36rpx; font-weight: 700; color: #2c2c2c;
}
.title-block .subtitle {
  font-size: 22rpx; color: #999; margin-top: 6rpx;
}
.topbar-right { display: flex; gap: 16rpx; }
.icon-btn {
  width: 64rpx; height: 64rpx; border-radius: 16rpx;
  background: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, .04);
}

/* ===== cat-bar ===== */
.cat-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10rpx 28rpx 20rpx;
}
.cur-cat {
  font-size: 28rpx; color: var(--text-color); font-weight: 600;
  opacity: 0.8;
}
.actions { display: flex; align-items: center; gap: 14rpx; }
.pill.outline {
  font-size: 24rpx; color: var(--primary-color);
  border: 2rpx solid var(--primary-color); padding: 8rpx 18rpx; border-radius: 999rpx;
  background: var(--card-bg);
}
.search {
  display: flex; align-items: center; background: var(--bg-color);
  border-radius: 999rpx; padding: 6rpx 16rpx; height: 48rpx;
  opacity: 0.8;
  border: 1rpx solid rgba(255,255,255,0.1);
}
.search-icon { font-size: 22rpx; color: var(--secondary-text); margin-right: 6rpx; }
.search-input { font-size: 24rpx; width: 90rpx; color: var(--text-color); }

/* ===== body ===== */
.body {
  flex: 1;
  display: flex; padding: 0 0 0 28rpx;
  overflow: hidden; /* 让里面的 scroll-view 独立滚动 */
}

.side {
  width: 160rpx;
  background: transparent;
  height: 100%;
}
.side-item {
  font-size: 26rpx; color: var(--secondary-text);
  padding: 26rpx 14rpx;
  border-radius: 16rpx;
  margin-bottom: 8rpx;
  text-align: left;
}
.side-item.active {
  background: var(--card-bg);
  color: var(--primary-color);
  font-weight: 700;
  box-shadow: 0 2rpx 10rpx var(--card-shadow);
}

.content {
  flex: 1;
  padding: 0 28rpx 0 20rpx;
  height: 100%;
}
.content-title {
  font-size: 28rpx; font-weight: 700; color: var(--text-color); padding: 8rpx 0 16rpx;
}

.dish-card {
  position: relative;
  background: var(--card-bg);
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx var(--card-shadow);
  border: 1rpx solid rgba(255,255,255,0.05);
}
.dish-img {
  width: 160rpx; height: 160rpx;
  border-radius: 20rpx; background: var(--bg-color);
  margin-right: 24rpx;
}
.dish-info { flex: 1; }
.dish-name { font-size: 30rpx; color: var(--text-color); font-weight: 600; }
.duration-tag {
  display: inline-block; margin-top: 14rpx;
  background: var(--bg-color); color: var(--primary-color);
  border: 2rpx solid var(--primary-color);
  border-radius: 999rpx;
  padding: 4rpx 16rpx; font-size: 22rpx;
  opacity: 0.8;
}
.add-btn {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: var(--primary-color); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; font-weight: 700;
  box-shadow: 0 4rpx 10rpx var(--card-shadow);
}
.add-btn.added { background: var(--primary-color); box-shadow: 0 4rpx 10rpx var(--card-shadow); }

.empty {
  text-align: center; color: #B8A8B0; padding: 80rpx 0; font-size: 26rpx;
}

/* ===== floating cart ===== */
.cart-fab {
  position: fixed; bottom: 60rpx; right: 40rpx;
  width: 110rpx; height: 110rpx; background: var(--gradient);
  border-radius: 55rpx; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx var(--card-shadow); z-index: 100;
}
.cart-icon { font-size: 50rpx; }
.cart-fab .badge {
  position: absolute; top: -6rpx; right: -6rpx; background: #ff3b30; color: #fff;
  font-size: 22rpx; min-width: 32rpx; height: 32rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}

.owner-hint {
  position: fixed; bottom: 60rpx; left: 50%; transform: translateX(-50%);
  background: var(--primary-color); color: #fff; opacity: 0.9;
  padding: 16rpx 40rpx; border-radius: 999rpx;
  font-size: 26rpx; box-shadow: 0 8rpx 24rpx var(--card-shadow);
  z-index: 100; white-space: nowrap;
}

/* ===== modal ===== */
.modal-mask {
  position: fixed; inset: 0; background: rgba(0, 0, 0, .4);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
}
.modal {
  width: 600rpx; background: var(--card-bg); border-radius: 32rpx;
  padding: 40rpx 32rpx; text-align: center;
  border: 1rpx solid rgba(255,255,255,0.1);
}
.modal-title { font-size: 34rpx; font-weight: 700; color: var(--primary-color); }
.modal-body { padding: 24rpx 0; max-height: 400rpx; overflow-y: auto; }
.modal-row { font-size: 28rpx; color: var(--text-color); margin: 10rpx 0; text-align: left; opacity: 0.8; }
.modal-actions { display: flex; gap: 20rpx; margin-top: 16rpx; }
.modal-btn {
  flex: 1; padding: 22rpx 0; border-radius: 999rpx;
  font-size: 28rpx;
}
.modal-btn.ghost { background: #f4f4f4; color: #666; }
.modal-btn.primary {
  background: var(--gradient); color: #fff; font-weight: 600;
}

/* ===== free mode banner ===== */
.free-mode-banner {
  background: linear-gradient(90deg, #FFF0F6, #FFE4E1);
  color: #FF1493;
  padding: 16rpx 28rpx;
  margin: 0 28rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 20, 147, 0.1);
  border: 2rpx solid #FFC0CB;
}


</style>
