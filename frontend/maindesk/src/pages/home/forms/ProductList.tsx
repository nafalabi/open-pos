import { OrderPayload } from "@/generated/schema";
import { Button } from "@/shared/components/ui/button";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useOrderStore } from "../state/order";
import { currency } from "@/maindesk/src/utils/currency";

type ProductListProps = {
  form: UseFormReturn<OrderPayload>;
};

const ProductList = ({ form }: ProductListProps) => {
  const { products, removeProduct } = useOrderStore((state) => ({
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
    <div>
      {fields.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {fields.map((item, index) => {
            const productInfo = getProductInfo(item.product_id);
            if (!productInfo) return null;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-1"
              >
                <div className="flex items-center">
                  <img
                    src={productInfo.image}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                    width={50}
                    height={50}
                    className="rounded-md mr-4"
                  />
                  <div>
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
                    onClick={() => {
                      if (item.quantity > 1) {
                        update(index, {
                          product_id: item.product_id,
                          quantity: item.quantity - 1,
                        });
                      } else {
                        removeProduct(item.product_id);
                      }
                    }}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      update(index, {
                        product_id: item.product_id,
                        quantity: item.quantity + 1,
                      });
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
