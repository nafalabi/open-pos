import { getCategories } from "@/maindesk/src/api/categories";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/shadcn";
import { useQuery } from "@tanstack/react-query";
import { HTMLAttributes } from "react";

const fetchParams: Parameters<typeof getCategories>[0] = {
  page: String(1),
  pagesize: String(100),
};

type CategorySelectorProps = {
  className?: HTMLAttributes<"div">["className"];
  selectedId?: string;
  onChangeSelection: (id?: string) => void;
};

const CategorySelector = ({
  className,
  selectedId,
  onChangeSelection,
}: CategorySelectorProps) => {
  const { data } = useQuery({
    queryKey: ["categories", fetchParams],
    queryFn: async () => {
      const [result, error] = await getCategories(fetchParams);
      if (error) return [];
      return result.data ?? [];
    },
    initialData: [],
  });

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge
        variant={!selectedId ? "default" : "secondary"}
        className="cursor-pointer"
        onClick={() => onChangeSelection()}
      >
        All
      </Badge>
      {data.map((category) => (
        <Badge
          key={category.id}
          variant={selectedId === category.id ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => {
            if (selectedId === category.id) return onChangeSelection();
            onChangeSelection(category.id);
          }}
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default CategorySelector;
