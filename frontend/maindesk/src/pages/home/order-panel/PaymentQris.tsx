import { Model_Order } from "@/generated/models";
import { getPaymentInfo, refreshOrderStatus } from "@/maindesk/src/api/orders";
import { Button } from "@/shared/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isAfter } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const useCheckOrderStatus = (order: Model_Order) => {
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const doCheckOrderStatus = async () => {
    setLoading(true);
    // intentionaly lag the request to prevent spamming
    const [[result, error]] = await Promise.all([
      refreshOrderStatus(order.id),
      new Promise((res) => {
        setTimeout(() => res(null), 1000);
      }),
    ]);
    setLoading(false);

    if (error) {
      toast.error("Failed to check the order status");
      return;
    }

    if (result.data.status !== order.status) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  };

  return { checkingOrderStatus: isLoading, doCheckOrderStatus };
};

const PaymentQris = ({ order }: { order: Model_Order }) => {
  const { checkingOrderStatus, doCheckOrderStatus } =
    useCheckOrderStatus(order);
  const { data } = useQuery({
    queryKey: ["payment-info", order.id],
    queryFn: async () => {
      const [result, error] = await getPaymentInfo(order.id);
      if (error) return null;
      return result?.data;
    },
    initialData: null,
  });

  const isExpired = useMemo(() => {
    if (!data?.expire_at) return false;
    const expireDate = new Date(data?.expire_at);
    const now = new Date();
    return isAfter(now, expireDate);
  }, [data]);

  return (
    <div className="mt-1 grid gap-2">
      <div className="border border-input rounded-md p-2">
        <div className="text-sm text-center font-medium mt-2">
          Please scan this QRIS to pay
        </div>
        {data?.expire_at && (
          <div className="mt-1 text-xs text-center font-normal">
            Expire at:{" "}
            <span className="font-medium">
              {format(new Date(data.expire_at), "dd MMM yyyy HH:mm")}
            </span>
          </div>
        )}

        {isExpired ? (
          <div className="h-auto w-full min-h-[220px] squared text-center content-center bg-gray-100 rounded-sm mt-4 text-gray-700">
            QRIS is expired
          </div>
        ) : (
          <img
            className="h-auto w-full min-h-[220px] squared"
            src={data?.midtrans_detail?.qr_link}
          />
        )}
      </div>
      <Button
        size="sm"
        className="w-full h-8"
        disabled={checkingOrderStatus}
        onClick={doCheckOrderStatus}
        type="button"
      >
        {checkingOrderStatus && (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        )}
        Check Status
      </Button>
    </div>
  );
};

export default PaymentQris;
