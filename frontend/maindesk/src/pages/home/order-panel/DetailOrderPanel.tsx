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
import { OrderStatus } from "@/generated/enums";
import PaymentQris from "./PaymentQris";
import NoteOrderPaid from "./NoteOrderPaid";
import SummaryOrder from "./SummaryOrder";
import { Skeleton } from "@/shared/components/ui/skeleton";
import NoteOrderCompleted from "./NoteOrderCompleted";
import CancelOrder from "./CancelOrder";
import { useQueryPaymentMethodDetail } from "../query/useQueryPaymentMethodDetail";

const DetailOrderPanel = () => {
  const navigate = useNavigate();

  const orderId = useParams().id;

  const { data } = useQueryOrderById(orderId);
  const { data: paymentMethodDetail } = useQueryPaymentMethodDetail(
    data?.payment_method,
  );
  const methodName = paymentMethodDetail ? `(${paymentMethodDetail.name})` : "";

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
          <div className="grid gap-2">
            <SummaryOrder order={data} />
            {data.status === OrderStatus.StatusPaid && (
              <NoteOrderPaid order={data} />
            )}
            {data.status === OrderStatus.StatusCompleted && (
              <NoteOrderCompleted />
            )}
            {data.status === OrderStatus.StatusPending && (
              <>
                {data.payment_method === "cash" && <PaymentCash order={data} />}
                {data.payment_method === "midtrans_qris" && <PaymentQris />}
                <CancelOrder order={data} />
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
