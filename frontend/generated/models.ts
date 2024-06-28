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
  sub_total: number;
  payment_fee: number;
  payment_method: string;
  status: string;
  external_ref: string;
  remarks: string;
}

export interface Model_Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  expect_amount: number;
  input_amount: number;
  tip_amount: number;
  change_amount: number;
  payment_fee: number;
  type: string;
  gateway: string;
  payment_type: string;
  reference: string;
  notes: string;
  order_id: string;
}
export interface Model_PaymentMethod {
  code: string;
  name: string;
  fee_type: string;
  variable: number;
}
export interface Model_PaymentInfo {
  id: string;
  created_at: string;
  updated_at: string;
  order_id: string;
  payment_gateway: string;
  payment_type: string;
  gross_amount: number;
  midtrans_detail?: Model_MidtransDetail;
  expire_at: string;
}
export interface Model_MidtransDetail {
  ref_id: string;
  status_code: string;
  transaction_status: string;
  qr_link: string;
  qr_string: string;
  virtual_account: string;
}
export interface Model_MidtransEvent {
  id: string;
  created_at: string;
  updated_at: string;
  order_id: string;
  ref_id: string;
  raw_data: string;
  event_type: string;
}
