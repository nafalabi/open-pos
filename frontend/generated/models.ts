/* Do not change, this code is generated from Golang structs */

export interface Model_User {
  name: string;
  email: string;
  phone: string;
  level: number;
  id: string;
  created_at: string;
  updated_at: string;
}
export interface Model_UserFillable {
  name: string;
  email: string;
  phone: string;
  level: number;
  password: string;
}
export interface Model_Category {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
}
export interface Model_Product {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categories: string[];
  id: string;
  created_at: string;
  updated_at: string;
}
export interface Model_ProductFillable {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categories: string[];
}
