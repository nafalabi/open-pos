import { CategoryPayloadSchema } from "@/generated/schema";
import CommonDialog from "@/shared/components/custom/common-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { postCategory } from "../../api/categories";
import { useQueryClient } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useState } from "react";

const defaultValues = {
  name: "",
};

export type CategoryAddDialogRef = {
  openDialog: () => void;
};

const CategoryAddDialog = forwardRef<CategoryAddDialogRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues,
    resolver: zodResolver(CategoryPayloadSchema),
  });

  useImperativeHandle(
    ref,
    () => ({
      openDialog: () => {
        setOpen(true);
      },
    }),
    []
  );

  const handleSubmit = form.handleSubmit(
    async (formData) => {
      const [, error] = await postCategory(formData);
      if (error) {
        toast.error("Failed to add category", {
          description: error.message,
        });
        return;
      }
      toast.success("Success adding category");
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      setOpen(false);
    },
    (validationErr) => {
      let toastMessage = "Please check these fields (";

      let isLeading = true;
      Object.keys(validationErr).forEach((key) => {
        if (!isLeading) toastMessage += ", ";
        toastMessage += `'${key}'`;
        isLeading = false;
      });

      toastMessage += ")";

      toast.error("Validation error", {
        description: toastMessage,
      });
    }
  );

  return (
    <CommonDialog
      open={open}
      onOpenChange={setOpen}
      title="Add Category"
      content={
        <div className="grid gap-4 py-4 mt-3 mb-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input {...form.register("name")} className="col-span-3" />
          </div>
        </div>
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </>
      }
      ContainerEl="form"
      containerProps={{
        onSubmit: handleSubmit,
      }}
    />
  );
});

export default CategoryAddDialog;
