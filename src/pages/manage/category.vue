<template>
  <view class="page">
    <view class="header">
      <view class="title">管理分类</view>
      <view class="btn-add" @click="onAdd">+ 新建分类</view>
    </view>
    <view class="list">
      <view v-for="c in list" :key="c.id" class="row">
        <view class="info">
          <text class="name">{{ c.name }}</text>
          <text class="icon">{{ c.icon }}</text>
        </view>
        <view class="ops">
          <text class="op" @click="onEdit(c)">编辑</text>
          <text class="op danger" @click="onDel(c)">删除</text>
        </view>
      </view>
    </view>

    <!-- 弹窗 -->
    <view v-if="show" class="mask" @click="show = false">
      <view class="dialog" @click.stop>
        <view class="d-title">{{ form.id ? '编辑分类' : '新建分类' }}</view>
        <input class="d-input" v-model="form.name" placeholder="分类名" />
        <input class="d-input" v-model="form.icon" placeholder="emoji 图标，例如 🍎" />
        <input class="d-input" v-model.number="form.sort" placeholder="排序" type="number" />
        <view class="d-actions">
          <view class="d-btn ghost" @click="show = false">取消</view>
          <view class="d-btn primary" @click="onSave">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { menuApi } from '@/api';

const list = ref<any[]>([]);
const show = ref(false);
const form = ref<any>({ name: '', icon: '', sort: 99 });

async function load() { list.value = await menuApi.categories(); }

function onAdd() { form.value = { name: '', icon: '', sort: 99 }; show.value = true; }
function onEdit(c: any) { form.value = { ...c }; show.value = true; }

async function onSave() {
  if (!form.value.name) { uni.showToast({ title: '请输入分类名', icon: 'none' }); return; }
  await menuApi.saveCategory(form.value);
  show.value = false;
  await load();
}

function onDel(c: any) {
  uni.showModal({
    title: '提示', content: `删除分类「${c.name}」？`,
    success: async (r) => {
      if (r.confirm) { await menuApi.removeCategory(c.id); await load(); }
    }
  });
}

onMounted(load);
</script>

<style lang="scss" scoped>
.page { padding: 32rpx; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.title { font-size: 32rpx; font-weight: 700; color: #333; }
.btn-add {
  background: linear-gradient(135deg, #FF8FB3, #FF6FA0);
  color: #fff; padding: 12rpx 24rpx; border-radius: 999rpx; font-size: 26rpx;
}
.list .row {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; padding: 24rpx; border-radius: 20rpx; margin-bottom: 16rpx;
}
.info .name { font-size: 30rpx; color: #333; margin-right: 12rpx; }
.info .icon { font-size: 30rpx; }
.ops .op { font-size: 26rpx; color: #FF6FA0; margin-left: 24rpx; }
.ops .op.danger { color: #ff5b5b; }

.mask { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.dialog { width: 600rpx; background: #fff; border-radius: 24rpx; padding: 32rpx; }
.d-title { font-size: 32rpx; font-weight: 700; text-align: center; margin-bottom: 24rpx; color: #FF6FA0; }
.d-input { background: #FFF5F8; padding: 18rpx 24rpx; border-radius: 16rpx; margin-bottom: 16rpx; font-size: 28rpx; }
.d-actions { display: flex; gap: 16rpx; margin-top: 16rpx; }
.d-btn { flex: 1; padding: 20rpx 0; text-align: center; border-radius: 999rpx; font-size: 28rpx; }
.d-btn.ghost { background: #f4f4f4; color: #666; }
.d-btn.primary { background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff; }
</style>
