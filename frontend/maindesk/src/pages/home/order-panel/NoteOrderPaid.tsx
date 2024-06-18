import { Model_Order } from "@/generated/models";
import { CircleCheckBigIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { z } from "zod";
import { OrderStatus } from "@/generated/enums";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeOrder } from "@/maindesk/src/api/orders";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type NoteOrderPaidProps = {
  order: Model_Order;
};

const schema = z.object({
  id: z.string(),
  status: z.literal(OrderStatus.StatusPaid),
});

const NoteOrderPaid = ({ order }: NoteOrderPaidProps) => {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: order,
    resolver: zodResolver(schema),
  });

  const handleSubmit = form.handleSubmit(
    async (values) => {
      console.log("values", values);
      const [, error] = await completeOrder(values.id);
      if (error) {
        toast.error("Failed to complete order", {
          description: error.message,
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Success completing an order");
    },
    (errors) => {
      Object.values(errors).forEach((err) => {
        toast.error("Failed to complete order", {
          description: err.message,
        });
      });
    },
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <div className="flex flex-col items-center justify-center bg-green-50 border-green-800 text-green-800 border rounded-lg px-2 py-3 mt-2">
          <div className="text-md">Order is paid</div>
          <div className="mt-2 mb-2">
            <CircleCheckBigIcon className="h-8 w-8" />
          </div>
          <div className="text-sm text-center">
            if the customer already received the order you can mark it as
            complete
          </div>
        </div>
        <Button
          className="mt-2"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Complete
        </Button>
      </div>
    </form>
  );
};

export default NoteOrderPaid;
