import GenericImage from "@/maindesk/src/layout/generic-image";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { XIcon } from "lucide-react";
import { ChangeEvent } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ProductForm } from "./form-schema";

type ProductImageFormProps = {
  form: UseFormReturn<ProductForm>;
};

const imageValidator = z
  .custom<FileList>()
  .transform((file) => file.length > 0 && file.item(0))
  .refine((file) => !file || (!!file && file.size <= 4 * 1024 * 1024), {
    message: "The profile picture must be a maximum of 10MB.",
  })
  .refine((file) => !file || (!!file && file.type?.startsWith("image")), {
    message: "Only images are allowed to be sent.",
  });

const ProductImageForm = ({ form }: ProductImageFormProps) => {
  return (
    <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 relative">
          <Controller
            control={form.control}
            name="image"
            render={({ field }) => {
              const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
                const files = event.target.files;
                if (!files) return;
                if (!files[0]) return;

                const { success, error } = imageValidator.safeParse(files);
                if (!success) {
                  const errors = error.issues;
                  toast.error("Error selecting image", {
                    description: errors.reduce(
                      (a, b) => a + " " + b.message,
                      "",
                    ),
                  });
                  return;
                }

                URL.revokeObjectURL(field.value);
                const objUrl = URL.createObjectURL(files[0]);
                form.setValue("image", objUrl);
              };
              const clearImage = () => {
                form.setValue("image", "");
              };
              return (
                <>
                  <GenericImage
                    src={field.value}
                    containerProps={{
                      style: {
                        minHeight: 250,
                        width: "100%",
                        cursor: "pointer",
                      },
                      onClick: (e) => {
                        const parentEL = e.currentTarget.parentNode;
                        const input = parentEL?.querySelector("input");
                        input?.click();
                      },
                    }}
                  />
                  <Input onChange={handleChange} type="file" />
                  {field.value && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 absolute right-2 top-2 z-30"
                      type="button"
                      onClick={clearImage}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageForm;
