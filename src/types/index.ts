export type ProductCategory = 
  | 'grilled_meat'
  | 'grilled_chicken'
  | 'sandwiches'
  | 'single_meals'
  | 'family_meals'
  | 'extras';

export interface ProductWeights {
  quarter?: number;
  half?: number;
  three_quarter?: number;
  full?: number;
  piece?: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  image_url?: string;
  weights: ProductWeights;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  price: number;
  items: any[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  weight: keyof ProductWeights;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_notes?: string;
  items: CartItem[];
  total_amount: number;
  status: string;
  created_at: string;
}
