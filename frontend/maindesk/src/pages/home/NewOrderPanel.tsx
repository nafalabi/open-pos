import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "./state/order";
import { useForm } from "react-hook-form";
import { OrderPayload, OrderPayloadSchema } from "@/generated/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductList from "./forms/ProductList";
import PriceDetail from "./forms/PriceDetail";
import { useEffect } from "react";

const defaultValues: OrderPayload = {
  items: [],
  payment_method: "cash",
  recipient: "",
  remarks: "",
};

const NewOrderPanel = () => {
  const navigate = useNavigate();
  const products = useOrderStore((state) => state.products);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(OrderPayloadSchema),
  });

  useEffect(() => {
    const items = [...(form.getValues("items") ?? [])];
    products.forEach((product) => {
      const exist = (items ?? []).some(
        (item) => item.product_id === product.id
      );
      if (exist) return;
      items.push({
        product_id: product.id,
        quantity: 1,
      });
    });
    form.setValue("items", items);
  }, [form, products]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>
          New Order
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
      <CardContent>
        <ProductList form={form} />
        <PriceDetail form={form} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button size="sm" className="w-full" onClick={() => {}}>
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewOrderPanel;
