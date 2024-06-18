import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { XIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentCash from "./PaymentCash";
import { useQueryOrderById } from "../query/useQueryOrderById";
import { OrderStatus, PaymentMethod } from "@/generated/enums";
import PaymentBankTransfer from "./PaymentBankTransfer";
import PaymentQris from "./PaymentQris";
import PaymentPaid from "./PaymentPaid";
import SummaryOrder from "./SummaryOrder";
import { Skeleton } from "@/shared/components/ui/skeleton";

const paymentMethodNames: Record<string, string> = {
  [PaymentMethod.PaymentMethodCash]: "Cash",
  [PaymentMethod.PaymentMethodTransfer]: "Transfer",
  [PaymentMethod.PaymentMethodQris]: "QRIS",
};

const DetailOrderPanel = () => {
  const navigate = useNavigate();

  const orderId = useParams().id;

  const { data } = useQueryOrderById(orderId);
  const methodName = data ? `(${paymentMethodNames[data.payment_method]})` : "";

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>
          Order pay {methodName}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-3"
            onClick={() => navigate("/home")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-150px)] overflow-hidden overflow-y-auto">
        {!data ? (
          <DetailOrderSkeleton />
        ) : (
          <div className="grid gap-4">
            <SummaryOrder order={data} />
            {data.status === OrderStatus.StatusPaid ? (
              <PaymentPaid order={data} />
            ) : (
              <>
                {data.payment_method === PaymentMethod.PaymentMethodCash && (
                  <PaymentCash order={data} />
                )}
                {data.payment_method ===
                  PaymentMethod.PaymentMethodTransfer && (
                  <PaymentBankTransfer />
                )}
                {data.payment_method === PaymentMethod.PaymentMethodQris && (
                  <PaymentQris />
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailOrderPanel;

const DetailOrderSkeleton = () => (
  <div className="grid gap-2">
    <div className="flex w-full justify-between mb-4">
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <div className="my-4 grid gap-2">
      <div className="flex w-full justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      <div className="flex w-full justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      <div className="flex w-full justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="mt-4 h-8 w-full" />
  </div>
);
