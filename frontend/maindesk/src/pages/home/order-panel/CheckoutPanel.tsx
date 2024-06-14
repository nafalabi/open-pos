import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2Icon, XIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentCash from "../forms/PaymentCash";
import { useQueryOrderById } from "../query/useQueryOrderById";
import { PaymentMethod } from "@/generated/enums";
import PaymentBankTransfer from "../forms/PaymentBankTransfer";
import PaymentQris from "../forms/PaymentQris";

const paymentMethodNames: Record<string, string> = {
  [PaymentMethod.PaymentMethodCash]: "Cash",
  [PaymentMethod.PaymentMethodTransfer]: "Transfer",
  [PaymentMethod.PaymentMethodQris]: "QRIS",
}

const CheckoutPanel = () => {
  const navigate = useNavigate();
  const isLoading = true;

  const orderId = useParams().id;

  const { data } = useQueryOrderById(orderId);
  const methodName = data ? `(${paymentMethodNames[data.payment_method]})` : ""

  const handleSubmit = () => { };

  return (
    <Card className="relative">
      <form onSubmit={handleSubmit}>
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
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {data.payment_method === PaymentMethod.PaymentMethodCash && (
                <PaymentCash order={data} />
              )}
              {data.payment_method === PaymentMethod.PaymentMethodTransfer && (
                <PaymentBankTransfer />
              )}
              {data.payment_method === PaymentMethod.PaymentMethodQris && (
                <PaymentQris />
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button size="sm" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Process
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CheckoutPanel;
