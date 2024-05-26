import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

type PaginationProps = {
  page: number;
  pagesize: number;
  totalrecords: number;
  totalpage: number;
  onChangePage: (page: number) => void;
  onChangePageSize: (page: number) => void;
};

const Pagination = ({
  page,
  pagesize,
  totalrecords,
  totalpage,
  onChangePage,
  onChangePageSize,
}: PaginationProps) => {
  const startingRowNum = (page - 1) * pagesize + 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalpage;
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-xs text-muted-foreground">
        Page size&nbsp;
        <DropdownMenu>
          <DropdownMenuTrigger className="border border-input rounded-md font-bold py-1 w-10">
            {String(pagesize)}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[5, 10, 25, 50, 100].map((num) => (
              <DropdownMenuItem key={num} onClick={() => onChangePageSize(num)}>
                {String(num)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        &nbsp;&middot;&nbsp; Showing{" "}
        <strong>
          {startingRowNum}-
          {Math.min(startingRowNum + pagesize - 1, totalrecords)}
        </strong>{" "}
        of&nbsp;
        <strong>{totalrecords}</strong> products
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onChangePage(page - 1);
          }}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onChangePage(page + 1);
          }}
          disabled={isLastPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
