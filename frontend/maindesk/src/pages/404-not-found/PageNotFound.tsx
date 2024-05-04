import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { BadgeAlert } from "lucide-react";

const PageNotFound = () => {
  return (
    <div className="flex">
      <Alert className="w-auto">
        <BadgeAlert className="h-4 w-4" />
        <AlertTitle>404 Not Found</AlertTitle>
        <AlertDescription>
          The page you are accessing can't be found
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PageNotFound;
