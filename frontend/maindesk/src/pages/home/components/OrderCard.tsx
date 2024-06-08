import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

const OrderCard = () => {
  return (
    <Card className="w-[280px] px-4 py-4">
      <div className="flex mb-2">
        <div className="mr-auto">21/04/2022 10:57</div>
        <Badge variant="secondary">Pending</Badge>
      </div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Budi</h4>
      <div className="flex mt-2">
        <p className="text-sm text-muted-foreground">5 items</p>
        <p className="ml-auto text-sm">Order/12/241/123213</p>
      </div>
    </Card>
  );
};
export default OrderCard;
