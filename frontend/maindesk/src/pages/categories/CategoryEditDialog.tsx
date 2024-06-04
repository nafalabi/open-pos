import { CategoryPayloadSchema } from "@/generated/schema";
import { type Model_Category } from "@/generated/models";
import CommonDialog from "@/shared/components/custom/common-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { patchCategory, viewCategory } from "../../api/categories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const defaultValues = {
  id: "",
  name: "",
};

const convData = (category: Model_Category) => {
  return {
    id: category.id,
    name: category.name,
  };
};

export type CategoryEditDialogRef = {
  openDialog: (id: string) => void;
};

const CategoryEditDialog = forwardRef<CategoryEditDialogRef>((_, ref) => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues,
    resolver: zodResolver(CategoryPayloadSchema),
  });

  const { data } = useQuery({
    queryKey: ["categories", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        if (open) toast.error("Failed to retrieve category data");
        return defaultValues;
      }
      const [result, error] = await viewCategory(categoryId);
      if (error) {
        toast.error("Failed to retrieve category data");
        return defaultValues;
      }
      return convData(result.data);
    },
    initialData: defaultValues,
  });

  useEffect(() => {
    form.reset(data);
  }, [data, form]);

  useImperativeHandle(
    ref,
    () => ({
      openDialog: (id: string) => {
        setOpen(true);
        setCategoryId(id);
      },
    }),
    []
  );

  const handleCloseDialog = () => {
    setOpen(false);
    setCategoryId(null);
  };

  const handleSubmit = form.handleSubmit(
    async (formData) => {
      if (!categoryId) return toast.error("Failed to edit category");

      const [, error] = await patchCategory(categoryId, formData);
      if (error) {
        toast.error("Failed to edit category", {
          description: error.message,
        });
        return;
      }

      toast.success("Success editing category");
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      handleCloseDialog();
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
      onOpenChange={handleCloseDialog}
      title="Edit Category"
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

export default CategoryEditDialog;
