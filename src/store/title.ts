import { defineStore } from 'pinia';
import { ref } from 'vue';
import { titleApi } from '@/api';

export const useTitleStore = defineStore('title', () => {
  const currentTitle = ref<any>(null);
  const titleList = ref<any[]>([]);

  async function fetchCurrentTitle() {
    try {
      const res = await titleApi.current();
      currentTitle.value = res;
    } catch (e) {
      console.error('Fetch current title failed', e);
    }
  }

  async function checkTitles() {
    try {
      await titleApi.check();
    } catch (e) {}
  }

  async function fetchTitleList() {
    try {
      await checkTitles();
      const res = await titleApi.list();
      titleList.value = res;
      // 同时更新当前佩戴
      currentTitle.value = res.find(t => t.isCurrent) || null;
    } catch (e) {
      console.error('Fetch title list failed', e);
    }
  }

  async function wearTitle(code: string) {
    await titleApi.wear(code);
    await fetchTitleList();
  }

  return {
    currentTitle,
    titleList,
    fetchCurrentTitle,
    fetchTitleList,
    wearTitle,
    checkTitles
  };
});
