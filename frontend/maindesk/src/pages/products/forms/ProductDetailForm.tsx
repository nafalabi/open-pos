import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProductForm } from "./form-schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

type ProductDetailFormProps = {
  form: UseFormReturn<ProductForm>;
};

const ProductDetailForm = ({ form }: ProductDetailFormProps) => {
  return (
    <Card x-chunk="dashboard-07-chunk-0">
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input {...form.register("name")} type="text" className="w-full" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea {...form.register("description")} className="min-h-32" />
          </div>

          <div className="grid grid-cols-4 gap-3 items-center">
            <Label htmlFor="name">Price</Label>
            <Input
              {...form.register("price", {
                valueAsNumber: true,
              })}
              type="number"
              className="w-full col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 gap-3 items-center">
            <Label htmlFor="name" className="text-nowrap text-muted-foreground">
              Stock{" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="inline" />
                </TooltipTrigger>
                <TooltipContent>not implemented</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              {...form.register("stock", {
                valueAsNumber: true,
              })}
              type="number"
              className="w-full col-span-3"
              disabled
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetailForm;
