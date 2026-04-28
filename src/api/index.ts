import { request } from '@/utils/request';

export const authApi = {
  login: (data: { code: string; nickname?: string; avatar?: string; gender?: number }) =>
    request<{ token: string; user: any; bound: boolean }>({
      url: '/auth/login', method: 'POST', data, needAuth: false,
    }),
};

export const userApi = {
  me: () => request<{ user: any; partner: any; bound: boolean }>({ url: '/user/me' }),
};

export const coupleApi = {
  invite:  () => request<{ code: string }>({ url: '/couple/invite', method: 'POST' }),
  bind:    (inviteCode: string) => request({ url: '/couple/bind', method: 'POST', data: { inviteCode } }),
  unbind:  () => request({ url: '/couple/unbind', method: 'POST' }),
};

export const menuApi = {
  categories: () => request<any[]>({ url: '/menu/category' }),
  saveCategory: (c: any) => request({ url: '/menu/category', method: 'POST', data: c }),
  removeCategory: (id: number) => request({ url: `/menu/category/${id}`, method: 'DELETE' }),
  items: (categoryId?: number) => request<any[]>({ url: '/menu/item', params: { categoryId } }),
  saveItem: (it: any) => request({ url: '/menu/item', method: 'POST', data: it }),
  removeItem: (id: number) => request({ url: `/menu/item/${id}`, method: 'DELETE' }),
};

export const requestApi = {
  create: (itemIds: number[]) => request({ url: '/request', method: 'POST', data: { itemIds } }),
  list:   (status?: number)   => request<any[]>({ url: '/request', params: { status } }),
  detail: (id: number)        => request<any>({ url: `/request/${id}` }),
  accept: (id: number)        => request({ url: `/request/${id}/accept`, method: 'POST' }),
  reject: (id: number)        => request({ url: `/request/${id}/reject`, method: 'POST' }),
  finish: (id: number)        => request({ url: `/request/${id}/finish`, method: 'POST' }),
};

// 微信订阅消息模板 ID
// 当前使用公共模板「留言提醒」(字段: thing1 用户名称 / thing2 备注消息 / time3 留言日期)
// 如果你换了别的模板，把下面这串替换为你「我的模板」里看到的模板 ID
export const SUBSCRIBE_TEMPLATE_ID = '9GAg4lS81ULSg8ZBF0Ot3WMtntNQrnYhXAkUQXaNgNes';
