import { Button } from "@/shared/components/ui/button";

const products = [
  {
    id: 1,
    name: "Coffee Machine",
    description: "High-quality coffee machine for your home",
    price: 99.99,
    image: "/placeholder.svg",
    category: "Coffee Machines",
  },
  {
    id: 2,
    name: "Arabica Coffee Beans",
    description: "Freshly roasted premium coffee beans",
    price: 15.99,
    image: "/placeholder.svg",
    category: "Coffee",
  },
  {
    id: 3,
    name: "Milk Frother",
    description: "Create professional-grade milk foam at home",
    price: 49.99,
    image: "/placeholder.svg",
    category: "Barista Tools",
  },
  {
    id: 4,
    name: "Ceramic Mugs",
    description: "Set of 4 stylish ceramic mugs",
    price: 24.99,
    image: "/placeholder.svg",
    category: "Cafe Accessories",
  },
];

const MenuItems = () => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md">
          <img
            src="/placeholder.svg"
            alt={product.name}
            width={300}
            height={200}
            className="rounded-t-lg object-cover w-full h-48"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-gray-500 mb-4">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-bold">
                ${product.price.toFixed(2)}
              </span>
              <Button size="sm" onClick={() => {}}>
                Add
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuItems;
