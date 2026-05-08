export interface TitleIconData {
  id: string;
  name: string;
  desc: string;
  svg: string;
}

// 统一 viewBox="0 0 100 100"
export const titleIcons: Record<string, TitleIconData> = {
  // ================= 管家系 (OWNER) =================
  'icon_owner_massage_1': {
    id: 'icon_owner_massage_1',
    name: '按摩入门生',
    desc: '小萌新拿着按摩油瓶',
    svg: `<path d="M40 20 h20 v10 h-20 z" fill="#FFB347"/><path d="M35 30 h30 v50 c0 10 -30 10 -30 0 z" fill="#FFCC80"/><path d="M45 50 h10 v10 h-10 z" fill="#FFF"/>`
  },
  'icon_owner_massage_2': {
    id: 'icon_owner_massage_2',
    name: '按摩能手',
    desc: '按摩油瓶发光特效',
    svg: `<path d="M40 20 h20 v10 h-20 z" fill="#FFA726"/><path d="M35 30 h30 v50 c0 10 -30 10 -30 0 z" fill="#FFB74D"/><path d="M45 50 h10 v10 h-10 z" fill="#FFF"/><circle cx="25" cy="40" r="5" fill="#FFD54F"/><circle cx="75" cy="55" r="4" fill="#FFD54F"/>`
  },
  'icon_owner_massage_3': {
    id: 'icon_owner_massage_3',
    name: '顶级按摩大师',
    desc: '金色大师按摩手牌',
    svg: `<rect x="25" y="20" width="50" height="60" rx="10" fill="#FFCA28"/><path d="M35 40 h30 v20 h-30 z" fill="#FFF"/><circle cx="50" cy="50" r="8" fill="#FF8F00"/>`
  },
  'icon_owner_chef_1': {
    id: 'icon_owner_chef_1',
    name: '奶茶学徒',
    desc: '一杯基础奶茶',
    svg: `<path d="M30 20 h40 l-5 60 h-30 z" fill="#FFE0B2"/><path d="M28 20 h44 v5 h-44 z" fill="#FF9800"/><circle cx="40" cy="70" r="4" fill="#5D4037"/><circle cx="50" cy="65" r="4" fill="#5D4037"/><circle cx="60" cy="70" r="4" fill="#5D4037"/>`
  },
  'icon_owner_chef_2': {
    id: 'icon_owner_chef_2',
    name: '私房菜主厨',
    desc: '银色小锅与锅铲',
    svg: `<path d="M20 50 h60 v15 c0 15 -60 15 -60 0 z" fill="#B0BEC5"/><path d="M10 55 h10 v5 h-10 z" fill="#78909C"/><path d="M50 20 v30" stroke="#78909C" stroke-width="4"/>`
  },
  'icon_owner_chef_3': {
    id: 'icon_owner_chef_3',
    name: '宝贝的专属大厨',
    desc: '高高的星级厨师帽',
    svg: `<path d="M30 50 h40 v30 h-40 z" fill="#FFF" stroke="#FFB74D" stroke-width="4"/><path d="M20 50 c0 -20 15 -30 30 -30 c15 0 30 10 30 30 z" fill="#FFF" stroke="#FFB74D" stroke-width="4"/><path d="M40 60 h20 v5 h-20 z" fill="#FF9800"/>`
  },
  'icon_owner_service_1': {
    id: 'icon_owner_service_1',
    name: '合格管家',
    desc: '经典红色领结',
    svg: `<path d="M20 30 l25 20 l-25 20 z" fill="#E53935"/><path d="M80 30 l-25 20 l25 20 z" fill="#E53935"/><circle cx="50" cy="50" r="8" fill="#B71C1C"/>`
  },
  'icon_owner_service_2': {
    id: 'icon_owner_service_2',
    name: '宠爱执行官',
    desc: '带心形的领结',
    svg: `<path d="M20 30 l25 20 l-25 20 z" fill="#D81B60"/><path d="M80 30 l-25 20 l25 20 z" fill="#D81B60"/><circle cx="50" cy="50" r="10" fill="#880E4F"/><path d="M45 48 a5 5 0 0 1 10 0 l-5 5 z" fill="#FFF"/>`
  },
  'icon_owner_service_3': {
    id: 'icon_owner_service_3',
    name: '宝贝的唯一管家',
    desc: '金边领结与皇冠',
    svg: `<path d="M15 30 l30 20 l-30 20 z" fill="#1565C0" stroke="#FFD54F" stroke-width="2"/><path d="M85 30 l-30 20 l30 20 z" fill="#1565C0" stroke="#FFD54F" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="#0D47A1"/><path d="M40 10 l10 10 l10 -10 l-10 15 z" fill="#FFC107"/>`
  },
  'icon_owner_romance_1': {
    id: 'icon_owner_romance_1',
    name: '鲜花小哥',
    desc: '一朵红玫瑰',
    svg: `<path d="M45 50 v40" stroke="#43A047" stroke-width="6"/><circle cx="50" cy="35" r="20" fill="#E53935"/><circle cx="45" cy="30" r="10" fill="#EF5350"/><circle cx="55" cy="30" r="10" fill="#EF5350"/>`
  },
  'icon_owner_romance_2': {
    id: 'icon_owner_romance_2',
    name: '氛围营造大师',
    desc: '红玫瑰与星星点缀',
    svg: `<path d="M45 50 v40" stroke="#2E7D32" stroke-width="6"/><circle cx="50" cy="35" r="20" fill="#D32F2F"/><path d="M30 15 l5 15 l-15 -5 z" fill="#FFEB3B"/><path d="M75 25 l5 10 l-10 -5 z" fill="#FFEB3B"/>`
  },
  'icon_owner_romance_3': {
    id: 'icon_owner_romance_3',
    name: '永恒的宠爱者',
    desc: '闪耀钻戒',
    svg: `<circle cx="50" cy="60" r="25" fill="none" stroke="#FFD54F" stroke-width="6"/><path d="M35 35 h30 l-15 -20 z" fill="#81D4FA"/><path d="M35 35 l15 15 l15 -15 z" fill="#4FC3F7"/><path d="M30 35 h40 l-5 -5 h-30 z" fill="#E1F5FE"/>`
  },

  // ================= 公主系 (PET) =================
  'icon_pet_cute_1': {
    id: 'icon_pet_cute_1',
    name: '被宠小可爱',
    desc: '粉色小爱心',
    svg: `<path d="M50 80 l-30 -30 a20 20 0 0 1 30 -15 a20 20 0 0 1 30 15 z" fill="#F48FB1"/>`
  },
  'icon_pet_cute_2': {
    id: 'icon_pet_cute_2',
    name: '被宠小仙女',
    desc: '粉色蝴蝶结',
    svg: `<path d="M20 20 l30 30 l-30 30 z" fill="#F06292"/><path d="M80 20 l-30 30 l30 30 z" fill="#F06292"/><circle cx="50" cy="50" r="10" fill="#E91E63"/>`
  },
  'icon_pet_cute_3': {
    id: 'icon_pet_cute_3',
    name: '顶级被宠对象',
    desc: '仙女棒与星光',
    svg: `<path d="M20 80 l60 -60" stroke="#FFCC80" stroke-width="6"/><path d="M80 20 l0 -15 l10 20 l15 0 l-20 10 l5 15 l-10 -15 l-15 10 l10 -20 z" fill="#FFE082"/>`
  },
  'icon_pet_happy_1': {
    id: 'icon_pet_happy_1',
    name: '幸福接收器',
    desc: '小信封冒出爱心',
    svg: `<rect x="20" y="40" width="60" height="40" fill="#FFF" stroke="#FFCDD2" stroke-width="4"/><path d="M20 40 l30 20 l30 -20" fill="none" stroke="#FFCDD2" stroke-width="4"/><path d="M50 30 l-10 -10 a6 6 0 0 1 10 -5 a6 6 0 0 1 10 5 z" fill="#EF5350"/>`
  },
  'icon_pet_happy_2': {
    id: 'icon_pet_happy_2',
    name: '宠爱收集者',
    desc: '粉色小布袋',
    svg: `<path d="M30 40 h40 c10 40 -50 40 -40 0 z" fill="#F8BBD0"/><path d="M35 25 h30 l-15 15 z" fill="#F48FB1"/><path d="M40 50 l10 10 l10 -10 z" fill="#E91E63"/>`
  },
  'icon_pet_happy_3': {
    id: 'icon_pet_happy_3',
    name: '被世界温柔以待的人',
    desc: '长着翅膀的红心',
    svg: `<path d="M10 50 q20 -30 40 0" fill="none" stroke="#81D4FA" stroke-width="6"/><path d="M90 50 q-20 -30 -40 0" fill="none" stroke="#81D4FA" stroke-width="6"/><path d="M50 75 l-20 -20 a12 12 0 0 1 20 -10 a12 12 0 0 1 20 10 z" fill="#EF5350"/>`
  },
  'icon_pet_special_1': {
    id: 'icon_pet_special_1',
    name: '按摩小公主',
    desc: '粉红皇冠结合精油元素',
    svg: `<path d="M20 70 l10 -40 l20 15 l20 -15 l10 40 z" fill="#F48FB1"/><circle cx="50" cy="55" r="8" fill="#FFF"/>`
  },
  'icon_pet_special_2': {
    id: 'icon_pet_special_2',
    name: '奶茶公主',
    desc: '粉金色的专属奶茶',
    svg: `<path d="M30 20 h40 l-5 60 h-30 z" fill="#FCE4EC"/><path d="M28 20 h44 v5 h-44 z" fill="#F06292"/><circle cx="40" cy="70" r="5" fill="#E91E63"/><circle cx="60" cy="65" r="5" fill="#E91E63"/>`
  },
  'icon_pet_special_3': {
    id: 'icon_pet_special_3',
    name: '公主殿下',
    desc: '奢华的公主皇冠',
    svg: `<path d="M15 75 l15 -50 l20 20 l20 -20 l15 50 z" fill="#FFCA28"/><circle cx="30" cy="25" r="5" fill="#EF5350"/><circle cx="50" cy="45" r="6" fill="#42A5F5"/><circle cx="70" cy="25" r="5" fill="#EF5350"/><rect x="20" y="80" width="60" height="10" rx="5" fill="#FFA000"/>`
  },
  'icon_pet_gen_1': {
    id: 'icon_pet_gen_1',
    name: '幸福小宝贝',
    desc: '粉色礼盒',
    svg: `<rect x="25" y="40" width="50" height="40" fill="#F8BBD0"/><rect x="20" y="30" width="60" height="10" fill="#F48FB1"/><path d="M45 40 v40" stroke="#E91E63" stroke-width="6"/><path d="M35 15 l15 15 l15 -15" fill="none" stroke="#E91E63" stroke-width="6"/>`
  },
  'icon_pet_gen_2': {
    id: 'icon_pet_gen_2',
    name: '管家最爱',
    desc: '璀璨的粉钻',
    svg: `<path d="M25 35 h50 l-25 45 z" fill="#F06292"/><path d="M25 35 l25 -20 l25 20 z" fill="#F48FB1"/><path d="M40 35 l10 -20 l10 20 z" fill="#FCE4EC"/>`
  }
};
