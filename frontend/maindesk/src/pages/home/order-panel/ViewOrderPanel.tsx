import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2Icon, XIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryOrderById } from "../query/useQueryOrderById";

const ViewOrderPanel = () => {
  const navigate = useNavigate();
  const isLoading = true;

  const orderId = useParams().id;

  const { data } = useQueryOrderById(orderId);

  const handleSubmit = () => {};

  return (
    <Card className="relative">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-3"
              onClick={() => navigate("/home")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-150px)] overflow-hidden overflow-y-auto">
          {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button size="sm" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Process
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ViewOrderPanel;
