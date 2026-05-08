import { SUBSCRIBE_TEMPLATE_ID } from '@/api';

export function requestSubscribe() {
  return new Promise((resolve) => {
    // @ts-ignore
    if (!uni.requestSubscribeMessage) {
      resolve(false);
      return;
    }

    uni.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success: (res) => {
        console.log('[requestSubscribe] Result:', res);
        if (res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: (err) => {
        console.error('[requestSubscribe] Error:', err);
        resolve(false);
      }
    });
  });
}
