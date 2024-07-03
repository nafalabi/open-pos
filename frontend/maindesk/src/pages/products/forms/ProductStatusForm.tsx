import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProductForm } from "./form-schema";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

type ProductStatusFormProps = {
  form: UseFormReturn<ProductForm>;
};

// eslint-disable-next-line no-empty-pattern
const ProductStatusForm = ({}: ProductStatusFormProps) => {
  return (
    <Card x-chunk="dashboard-07-chunk-3">
      <CardHeader>
        <CardTitle>Product Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label
              htmlFor="status"
              className="text-nowrap text-muted-foreground"
            >
              Status{" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="inline" />
                </TooltipTrigger>
                <TooltipContent>not implemented</TooltipContent>
              </Tooltip>
            </Label>
            <Select disabled>
              <SelectTrigger id="status" aria-label="Select status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStatusForm;
