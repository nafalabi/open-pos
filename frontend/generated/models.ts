/* Do not change, this code is generated from Golang structs */

export interface Model_UserPayload {
  name: string;
  email: string;
  phone: string;
  level: number;
  password: string;
}
export interface Model_CategoryPayload {
  name: string;
}
export interface Model_ProductPayload {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categories: string[];
}
export interface Model_OrderItemPayload {
  product_id: string;
  quantity: number;
}
export interface Model_OrderPayload {
  items: Model_OrderItemPayload[];
  payment_method: string;
  remarks: string;
}
