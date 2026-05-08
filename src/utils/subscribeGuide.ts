import { requestSubscribe } from './subscribe';

export function useSubscribeGuide(pageName, delay = 1500) {
  const checkAndPrompt = () => {
    // 1. 先检查设置，如果用户已经勾选了“总是保持以上选择”且允许了
    // 则直接进行静默订阅请求（不会弹窗），以补充额度
    // @ts-ignore
    uni.getSetting({
      withSubscriptions: true,
      success: (res) => {
        const subSetting = res.subscriptionsSetting;
        // 如果主开关打开，且对应的模板 ID 被设置为 'accept'
        // 注意：这里的 'accept' 意味着用户勾选了“总是保持以上选择”
        const SUBSCRIBE_TEMPLATE_ID = 'bcMzwddS-N1kX6edujEwu1pDmt0rXPYCXhCzD7HdAhk';
        if (subSetting?.mainSwitch && subSetting.itemSettings && subSetting.itemSettings[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
          console.log(`[SubscribeGuide] User has "Always Accept" for ${pageName}, requesting silently.`);
          requestSubscribe();
          return;
        }

        // 2. 如果没勾选“总是”，或者没授权过，则执行带频率限制的弹窗引导
        const now = Date.now();
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        const storageKey = `last_prompt_subscribe_${pageName}`;
        const lastPrompt = uni.getStorageSync(storageKey);

        if (!lastPrompt || (now - Number(lastPrompt) > ONE_WEEK)) {
          setTimeout(() => {
            uni.showModal({
              title: '开启消息提醒',
              content: '为了不错过宝贝的消息（如服务提醒、积分红包等），建议开启订阅消息通知哦～',
              confirmText: '去开启',
              cancelText: '不需要',
              success: (res) => {
                if (res.confirm) {
                  requestSubscribe();
                }
                // 记录本次提示时间，无论用户点什么（避免频繁打扰）
                uni.setStorageSync(storageKey, String(now));
              }
            });
          }, delay);
        }
      }
    });
  };

  return {
    checkAndPrompt
  };
}
