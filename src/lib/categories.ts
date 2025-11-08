import { ProductCategory } from '@/types';

export const categoryNames: Record<ProductCategory, string> = {
  grilled_meat: 'مشويات اللحوم',
  grilled_chicken: 'مشويات الدجاج',
  sandwiches: 'السندوتشات',
  single_meals: 'الوجبات الفردية',
  family_meals: 'الوجبات العائلية',
  extras: 'الإضافات'
};

export const weightNames: Record<string, string> = {
  quarter: '¼ كيلو',
  half: '½ كيلو',
  three_quarter: '¾ كيلو',
  full: '1 كيلو',
  piece: 'قطعة'
};
