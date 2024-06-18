import { OrderStatus } from "@/generated/enums";
import { Model_Order } from "@/generated/models";
import { cancelOrder } from "@/maindesk/src/api/orders";
import { Button } from "@/shared/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  status: z.literal(OrderStatus.StatusPending, {
    message: "Can only cancel pending orders",
  }),
});

const CancelOrder = ({ order }: { order: Model_Order }) => {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: order,
    resolver: zodResolver(schema),
  });

  const handleSubmit = form.handleSubmit(
    async (values) => {
      console.log("values", values);
      const [, error] = await cancelOrder(values.id);
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
      <Button
        size="sm"
        className="w-full"
        type="submit"
        variant="destructive"
        disabled={form.formState.isSubmitting}
      >
        Cancel Order
      </Button>
    </form>
  );
};

export default CancelOrder;
