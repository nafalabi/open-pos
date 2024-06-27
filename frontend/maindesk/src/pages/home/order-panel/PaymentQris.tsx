import { Model_Order } from "@/generated/models";
import { getPaymentInfo } from "@/maindesk/src/api/orders";
import { useQuery } from "@tanstack/react-query";

const PaymentQris = ({ order }: { order: Model_Order }) => {
  const { data } = useQuery({
    queryKey: ["payment-info", order.id],
    queryFn: async () => {
      const [result, error] = await getPaymentInfo(order.id);
      if (error) return null;
      return result?.data;
    },
    initialData: null,
  });
  console.log(data);
  return (
    <div className="border border-input rounded-md p-2 mt-1">
      <div className="text-sm text-center font-medium mb-1 mt-2"> Please scan this QRIS to pay</div>

      <img
        className="h-auto w-full squared"
        src={data?.midtrans_detail?.qr_link}
      />
    </div>
  );
};

export default PaymentQris;
