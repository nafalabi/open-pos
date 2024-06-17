import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2Icon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../state/cart";
import { useForm } from "react-hook-form";
import { OrderPayload, OrderPayloadSchema } from "@/generated/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import CartProductList from "./CartProductList";
import CartPriceDetail from "./CartPriceDetail";
import { useEffect } from "react";
import { postOrder } from "../../../api/orders";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const defaultValues: OrderPayload = {
  items: [],
  payment_method: "cash",
  recipient: "",
  remarks: "",
};

const CartOrderPanel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { products, reset } = useCartStore((state) => ({
    products: state.products,
    reset: state.reset,
  }));

  const form = useForm({
    defaultValues,
    resolver: zodResolver(OrderPayloadSchema),
  });

  useEffect(() => {
    const items = [...(form.getValues("items") ?? [])];
    const newItems: typeof items = [];
    products.forEach((product) => {
      const exist = items.find((item) => item.product_id === product.id);
      if (exist) {
        return newItems.push(exist);
      }
      newItems.push({
        product_id: product.id,
        quantity: 1,
      });
    });
    form.setValue("items", newItems);
  }, [form, products]);

  const handleSubmit = form.handleSubmit(
    async (payload) => {
      const [result, error] = await postOrder(payload);
      if (error) {
        toast.error("Error creating order", { description: error.message });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      const id = result.data.id;
      navigate("/home/checkout/" + id);
      form.reset();
      reset();
    },
    async () => {
      toast.error("Error creating order", {
        description: "Please check your order details",
      });
    },
  );

  return (
    <Card className="relative">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            New Order
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="absolute top-4 right-3"
              onClick={() => navigate("/home")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-150px)] overflow-hidden overflow-y-auto">
          <CartProductList form={form} />
          <CartPriceDetail form={form} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            size="sm"
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Order
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CartOrderPanel;
