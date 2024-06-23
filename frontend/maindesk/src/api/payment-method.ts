import { Model_PaymentMethod } from "@/generated/models";
import { apiSingleton } from "./api-singleton";

export const getPaymentMethodList = () => {
  const { requestor } = apiSingleton;
  return requestor.GET<Model_PaymentMethod[]>("/payment-methods");
};

export const getPaymentMethodDetail = (id: string) => {
  const { requestor } = apiSingleton;
  return requestor.GET<Model_PaymentMethod>("/payment-methods/" + id);
};

export const getPaymentFee = (
  code: string,
  params: { totalamount: string },
) => {
  const { requestor } = apiSingleton;
  return requestor.GET<{ payment_fee: number }>(
    "/payment-methods/" + code + "/fee",
    params,
  );
};
