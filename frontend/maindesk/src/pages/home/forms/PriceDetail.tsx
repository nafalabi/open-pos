import { OrderPayload } from "@/generated/schema";
import { Separator } from "@/shared/components/ui/separator";
import { UseFormReturn } from "react-hook-form";

type PriceDetailProps = {
  form: UseFormReturn<OrderPayload>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-pattern
const PriceDetail = ({ }: PriceDetailProps) => {
  const subtotal = 181.96;
  const paymentFee = subtotal * 0.03;
  const discount = 0.1 * subtotal;
  const tax = 0.08 * subtotal;
  const total = subtotal + paymentFee - discount + tax;

  return (
    <>
      <Separator className="my-4" />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Subtotal</span>
          <span className="text-gray-900 font-bold">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Payment Fee</span>
          <span className="text-gray-900 font-bold">
            ${paymentFee.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Discount</span>
          <span className="text-gray-900 font-bold">
            -${discount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Tax</span>
          <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Total</span>
          <span className="text-gray-900 font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
};

export default PriceDetail;
