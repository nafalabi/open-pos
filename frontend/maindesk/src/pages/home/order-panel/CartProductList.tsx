import { OrderPayload } from "@/generated/schema";
import { Button } from "@/shared/components/ui/button";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useCartStore } from "../state/cart";
import { currency } from "@/maindesk/src/utils/currency";
import { TrashIcon } from "lucide-react";
import GenericImage from "@/maindesk/src/layout/generic-image";

const CartProductList = ({ form }: { form: UseFormReturn<OrderPayload> }) => {
  const { products, removeProduct } = useCartStore((state) => ({
    products: state.products,
    removeProduct: state.removeProduct,
  }));
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const getProductInfo = (id: string) => {
    return products.find((product) => product.id === id);
  };

  return (
    <div className="max-h-[calc(100vh-550px)] min-h-[200px] overflow-auto mr-[-1.5rem] pr-[1.5rem]">
      <div>
        {fields.length === 0 ? (
          <p className="text-gray-500 text-center min-h-[200px] content-center">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((item, index) => {
              const productInfo = getProductInfo(item.product_id);
              if (!productInfo) return null;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center">
                    <GenericImage
                      src={productInfo.image}
                      fallbackSrc="/placeholder.svg"
                      containerProps={{
                        className: "mr-4 min-h-12 min-w-12 h-12 w-12",
                      }}
                    />
                    <div className="text-sm">
                      <h3 className="text-gray-900 font-bold">
                        {productInfo.name}
                      </h3>
                      <p className="text-gray-500">
                        {currency(productInfo.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        update(index, {
                          product_id: item.product_id,
                          quantity: item.quantity + 1,
                        });
                      }}
                    >
                      +
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    {item.quantity > 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          update(index, {
                            product_id: item.product_id,
                            quantity: item.quantity - 1,
                          });
                        }}
                      >
                        -
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          removeProduct(item.product_id);
                        }}
                        className="border border-red-500 text-desctructive hover:text-destructive px-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartProductList;
