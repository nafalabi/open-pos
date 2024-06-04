/* Do not change, this code is generated from Golang structs */

export interface Model_User {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  level: number;
}
export interface Model_Category {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}
export interface Model_Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categories: Model_Category[];
}
export interface Model_OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product?: Model_Product;
  quantity: number;
  price_each: number;
  total: number;
}
export interface Model_Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  recipient: string;
  items: Model_OrderItem[];
  total: number;
  payment_method: string;
  status: string;
  external_ref: string;
  remarks: string;
}
