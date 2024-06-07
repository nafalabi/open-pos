import { Badge } from "@/shared/components/ui/badge";

const CategorySelector = () => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {["Coffee Machines", "Coffee", "Barista Tools", "Cafe Accessories"].map(
        (category) => (
          <Badge
            key={category}
            variant={category === "Coffee" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => {}}
          >
            {category}
          </Badge>
        )
      )}
    </div>
  );
};

export default CategorySelector;
