import { Button } from "@/shared/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ProductForm, ProductFormSchema } from "./forms/form-schema";
import { exceptionCatcher } from "../../utils/exceptions";
import { toast } from "sonner";
import { urlToBlob } from "../../utils/file-handling";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadImage } from "../../api/images";
import { patchProduct, viewProduct } from "../../api/products";
import ProductDetailForm from "./forms/ProductDetailForm";
import ProductCategoryForm from "./forms/ProductCategoryForm";
import ProductStatusForm from "./forms/ProductStatusForm";
import ProductImageForm from "./forms/ProductImageForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Model_Product } from "@/generated/models";

const defaultValues: ProductForm = {
  name: "",
  description: "",
  image: "",
  price: 0,
  stock: 0,
  categories: [],
};

const convertData = (product: Model_Product): ProductForm => {
  return {
    ...product,
    categories:
      product.categories?.map(({ id, name }) => ({
        value: id,
        label: name,
      })) ?? [],
  };
};

const ProductEditPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues,
    resolver: zodResolver(ProductFormSchema),
  });

  const { data } = useQuery({
    queryKey: ["products", productId],
    queryFn: async () => {
      if (!productId) {
        toast.error("Product id was not provided");
        return defaultValues;
      }
      const [result, error] = await viewProduct(productId);
      if (error) {
        toast.error("Can't retrieve initial product data");
        return defaultValues;
      }
      return convertData(result.data);
    },
    initialData: defaultValues,
  });

  useEffect(() => {
    form.reset(data);
  }, [data, form]);

  const handleSubmit = form.handleSubmit(
    async (formData) => {
      if (!formData.id) {
        toast.error("Can't update product, the data provided is invalid");
        return;
      }

      const blobUri = formData.image;

      const [imageUri, err] = await exceptionCatcher(async () => {
        if (!blobUri) return "";
        if (!blobUri.startsWith("blob:")) return blobUri;

        const blob = await urlToBlob(blobUri);
        const file = new File([blob], "product-picture");
        const [data, error] = await uploadImage(file);
        if (error) throw new Error(error.message);
        return data.data;
      });
      if (err) {
        toast.error("Error processing product image", {
          description: err?.message,
        });
        return;
      }

      const [, error] = await patchProduct(formData.id, {
        ...formData,
        image: imageUri,
        categories: formData.categories.map(({ value }) => value),
      });
      if (error) {
        toast.error("Error while updating product", {
          description: error.message,
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("Success updating product");
      navigate(-1);
    },
    async (validationErr) => {
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
    <form
      className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Product
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              Save Product
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <ProductDetailForm form={form} />
            <ProductCategoryForm form={form} />
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <ProductStatusForm form={form} />
            <ProductImageForm form={form} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            Discard
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={form.formState.isSubmitting}
          >
            Save Product
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductEditPage;
