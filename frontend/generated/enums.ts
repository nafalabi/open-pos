export enum OrderStatus {
  StatusCanceled = "canceled",
  StatusCompleted = "completed",
  StatusPaid = "paid",
  StatusPending = "pending",
}
export enum TransactionType {
  TransactionPay = "pay",
  TransactionRefund = "refund",
}
export enum UserLevel {
  Admin = 0,
  Manager = 2,
  Owner = 1,
  Worker = 3,
}
