/**
 * 默认分类配置
 */

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

/**
 * 获取默认分类列表
 */
export function getDefaultCategories(): DefaultCategory[] {
  return [
    // ========== 收入分类 ==========
    {
      name: '压岁钱',
      icon: 'gift',
      color: '#FF6B6B',
      type: 'income',
    },
    {
      name: '红包',
      icon: 'envelope',
      color: '#FF8E53',
      type: 'income',
    },
    {
      name: '工资',
      icon: 'wallet',
      color: '#4CAF50',
      type: 'income',
    },
    {
      name: '奖金',
      icon: 'star',
      color: '#FFC107',
      type: 'income',
    },
    {
      name: '麻将',
      icon: 'dice',
      color: '#9C27B0',
      type: 'income',
    },

    // ========== 支出分类 ==========
    {
      name: '餐饮',
      icon: 'utensils',
      color: '#FF5722',
      type: 'expense',
    },
    {
      name: '交通',
      icon: 'car',
      color: '#607D8B',
      type: 'expense',
    },
    {
      name: '购物',
      icon: 'shopping-bag',
      color: '#E91E63',
      type: 'expense',
    },
    {
      name: '娱乐',
      icon: 'gamepad',
      color: '#9C27B0',
      type: 'expense',
    },
    {
      name: '医疗',
      icon: 'heart-pulse',
      color: '#F44336',
      type: 'expense',
    },
    {
      name: '麻将',
      icon: 'dice',
      color: '#795548',
      type: 'expense',
    },
    {
      name: '淘宝',
      icon: 'cart-shopping',
      color: '#FF9800',
      type: 'expense',
    },
  ];
}
