export enum OrderStatus {
  StatusCanceled = "canceled",
  StatusPaid = "paid",
  StatusPending = "pending",
}
export enum PaymentMethod {
  PaymentMethodCash = "cash",
  PaymentMethodQris = "qris",
  PaymentMethodTransfer = "trans",
}
export enum UserLevel {
  Admin = 0,
  Manager = 2,
  Owner = 1,
  Worker = 3,
}
