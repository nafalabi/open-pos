import { Loader2 } from "lucide-react";

export const SpinnerBox = () => {
  return (
    <div className="flex justify-center h-screen items-center w-full">
      <Loader2 className="h-16 w-16 animate-spin border-foreground" />
    </div>
  );
};

export default SpinnerBox;
