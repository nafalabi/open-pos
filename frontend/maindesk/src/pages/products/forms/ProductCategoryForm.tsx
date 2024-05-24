import { Category } from "@/generated/schema";
import { getCategories, postCategory } from "@/maindesk/src/api/categories";
import MultiSelect from "@/shared/components/custom/multi-select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { ProductForm } from "./form-schema";

type ProductCategoryFormProps = {
  form: UseFormReturn<ProductForm>;
};

const convertCategoryToOption = (category: Category) => {
  return {
    label: category.name,
    value: category.id,
  };
};

const fetchCategories = async (keyword: string) => {
  const [result, error] = await getCategories({
    pagesize: "5",
    page: "1",
    q: keyword,
  });

  if (error) {
    toast.error("Failed to fetch categories", { description: error.message });
    return [];
  }

  const categories = result?.data;
  return categories.map((category) => convertCategoryToOption(category));
};

const createCategory = async (name: string) => {
  const [result, error] = await postCategory({ name });

  if (error) {
    toast.error("Failed to create category", { description: error.message });
    return;
  }

  const category = result.data;
  return convertCategoryToOption(category);
};

const ProductCategoryForm = ({ form }: ProductCategoryFormProps) => {
  return (
    <Card x-chunk="dashboard-07-chunk-2">
      <CardHeader>
        <CardTitle>Product Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="grid col-span-3 gap-3">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="categories"
              control={form.control}
              render={({ field }) => (
                <MultiSelect
                  onSearch={(keyword) => fetchCategories(keyword)}
                  onChange={value => form.setValue('categories', value)}
                  value={field.value ?? []}
                  creatable
                  triggerSearchOnFocus
                  onCreateNew={(name) => createCategory(name)}
                />
              )}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t p-4"></CardFooter>
    </Card>
  );
};

export default ProductCategoryForm;
