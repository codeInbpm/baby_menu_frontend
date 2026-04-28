// 全局请求封装
import { useUserStore } from '@/store/user';

// !!! 部署时改成你自己的后端地址
// export const BASE_URL = 'https://your-domain.com/api';
export const BASE_URL = 'http://127.0.0.1:8080/api';
// 本地调试可用： http://127.0.0.1:8080/api （需开启微信开发者工具的「不校验合法域名」）

export interface ApiResp<T = any> {
  code: number;
  message: string;
  data: T;
}

export function request<T = any>(opts: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  needAuth?: boolean;
}): Promise<T> {
  const user = useUserStore();
  let url = BASE_URL + opts.url;
  if (opts.params) {
    const qs = Object.entries(opts.params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: opts.method || 'GET',
      data: opts.data,
      header: {
        'Content-Type': 'application/json',
        ...(opts.needAuth !== false && user.token ? { Authorization: 'Bearer ' + user.token } : {}),
      },
      success: (r: any) => {
        const body = r.data as ApiResp<T>;
        if (body.code === 0) return resolve(body.data);
        if (body.code === 401) {
          user.logout();
          uni.reLaunch({ url: '/pages/login/index' });
        }
        uni.showToast({ title: body.message || '请求失败', icon: 'none' });
        reject(body);
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}
