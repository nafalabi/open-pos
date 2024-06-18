import { Model_Order } from "@/generated/models";
import { CircleCheckBigIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type PaymentPaidProps = {
  order: Model_Order;
};

// eslint-disable-next-line no-empty-pattern
const PaymentPaid = ({ }: PaymentPaidProps) => {
  const handleComplete = () => {};
  return (
    <div className="grid gap-2">
      <div className="flex flex-col items-center justify-center bg-green-50 border-green-800 text-green-800 border rounded-lg px-2 py-3 mt-2">
        <div className="text-md">Order is paid</div>
        <div className="mt-2 mb-2">
          <CircleCheckBigIcon className="h-8 w-8" />
        </div>
        <div className="text-sm text-center">
          if the customer already received the order you can mark it as complete
        </div>
      </div>
      <Button className="mt-2" onClick={handleComplete}>
        Complete
      </Button>
    </div>
  );
};

export default PaymentPaid;
