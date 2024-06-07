import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NewOrderPanel = () => {
  const navigate = useNavigate()

  const [cart] = useState([
    {
      id: 1,
      name: "Coffee Machine",
      description: "High-quality coffee machine for your home",
      price: 99.99,
      image: "/placeholder.svg",
      category: "Coffee Machines",
      quantity: 1,
    },
    {
      id: 2,
      name: "Arabica Coffee Beans",
      description: "Freshly roasted premium coffee beans",
      price: 15.99,
      image: "/placeholder.svg",
      category: "Coffee",
      quantity: 2,
    },
    {
      id: 3,
      name: "Milk Frother",
      description: "Create professional-grade milk foam at home",
      price: 49.99,
      image: "/placeholder.svg",
      category: "Barista Tools",
      quantity: 1,
    },
  ]);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const paymentFee = subtotal * 0.03;
  const discount = 0.1 * subtotal;
  const tax = 0.08 * subtotal;
  const total = subtotal + paymentFee - discount + tax;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          New Order
          <Button variant="ghost" size="sm" className="absolute top-4 right-3" onClick={() => navigate("/home")}>
            <XIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-1"
              >
                <div className="flex items-center">
                  <img
                    src="/placeholder.svg"
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md mr-4"
                  />
                  <div>
                    <h3 className="text-gray-900 font-bold">{item.name}</h3>
                    <p className="text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Separator className="my-4" />
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold">Subtotal</span>
            <span className="text-gray-900 font-bold">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold">Payment Fee</span>
            <span className="text-gray-900 font-bold">
              ${paymentFee.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold">Discount</span>
            <span className="text-gray-900 font-bold">
              -${discount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold">Tax</span>
            <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold">Total</span>
            <span className="text-gray-900 font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
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
