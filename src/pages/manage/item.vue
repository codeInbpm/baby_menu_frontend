<template>
  <view class="page">
    <view class="title">{{ form.id ? '编辑菜谱' : '添加菜谱' }}</view>

    <view class="form-row">
      <view class="label">所属分类</view>
      <picker mode="selector" :range="categories" range-key="name" @change="onPickCategory">
        <view class="picker">
          {{ pickedCategoryName || '请选择' }} <text class="arrow">›</text>
        </view>
      </picker>
    </view>

    <view class="form-row">
      <view class="label">菜谱名称</view>
      <input class="input" v-model="form.name" placeholder="例如：按按头" />
    </view>

    <view class="form-row">
      <view class="label">图片</view>
      <view class="img-box" @click="onChooseImage">
        <image v-if="form.imageUrl" class="preview" :src="form.imageUrl" mode="aspectFill" />
        <text v-else class="img-plus">+</text>
      </view>
    </view>

    <view class="form-row">
      <view class="label">描述</view>
      <textarea class="textarea" v-model="form.description" placeholder="可选" />
    </view>

    <view class="form-row inline">
      <view class="label">时长(分钟)</view>
      <input class="input small" v-model.number="form.duration" type="number" placeholder="例如 5" />
    </view>

    <view class="form-row inline">
      <view class="label">积分成本</view>
      <input class="input small" v-model.number="form.pointsCost" type="number" placeholder="默认 5" />
    </view>

    <button class="btn-primary" @click="onSave">保存菜谱</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { menuApi } from '@/api';
import { BASE_URL } from '@/utils/request';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const categories = ref<any[]>([]);
const form = ref<any>({
  id: undefined,
  categoryId: undefined,
  name: '',
  imageUrl: '',
  description: '',
  duration: undefined,
  pointsCost: 5,
  sort: 99,
});

const pickedCategoryName = computed(() => {
  const c = categories.value.find((x) => x.id === form.value.categoryId);
  return c ? c.name : '';
});

onLoad((opts: any) => {
  if (opts?.categoryId) form.value.categoryId = Number(opts.categoryId);
});

async function loadCats() {
  categories.value = await menuApi.categories();
  if (!form.value.categoryId && categories.value.length) {
    form.value.categoryId = categories.value[0].id;
  }
}
function onPickCategory(e: any) {
  form.value.categoryId = categories.value[e.detail.value].id;
}

function onChooseImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const path = res.tempFilePaths[0];
      uni.uploadFile({
        url: BASE_URL + '/upload/image',
        filePath: path,
        name: 'file',
        header: { Authorization: 'Bearer ' + user.token },
        success: (r) => {
          try {
            const body = JSON.parse(r.data);
            if (body.code === 0) form.value.imageUrl = BASE_URL.replace('/api', '') + body.data.url;
            else uni.showToast({ title: body.message, icon: 'none' });
          } catch { uni.showToast({ title: '上传异常', icon: 'none' }); }
        },
      });
    },
  });
}

async function onSave() {
  if (!form.value.categoryId) { uni.showToast({ title: '请选择分类', icon: 'none' }); return; }
  if (!form.value.name) { uni.showToast({ title: '请输入名称', icon: 'none' }); return; }
  await menuApi.saveItem(form.value);
  uni.showToast({ title: '已保存', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 600);
}

onMounted(loadCats);
</script>

<style lang="scss" scoped>
.page { padding: 32rpx; }
.title { font-size: 34rpx; font-weight: 700; color: #FF6FA0; margin-bottom: 24rpx; text-align: center; }
.form-row { background: #fff; padding: 24rpx; border-radius: 20rpx; margin-bottom: 16rpx; }
.form-row.inline { display: flex; align-items: center; justify-content: space-between; }
.label { font-size: 28rpx; color: #555; margin-bottom: 12rpx; }
.input { font-size: 28rpx; padding: 12rpx 0; }
.input.small { width: 200rpx; text-align: right; }
.textarea { width: 100%; font-size: 28rpx; min-height: 120rpx; }
.picker { font-size: 28rpx; padding: 12rpx 0; color: #333; }
.arrow { color: #aaa; float: right; }
.img-box {
  width: 200rpx; height: 200rpx; border-radius: 16rpx; background: #FFF5F8;
  display: flex; align-items: center; justify-content: center;
  border: 2rpx dashed #FF6FA0;
}
.img-plus { font-size: 60rpx; color: #FF6FA0; }
.preview { width: 200rpx; height: 200rpx; border-radius: 16rpx; }
.btn-primary {
  margin-top: 32rpx; width: 100%;
  background: linear-gradient(135deg, #FF8FB3, #FF6FA0); color: #fff;
  border-radius: 999rpx; padding: 22rpx 0; font-size: 30rpx;
}
</style>
