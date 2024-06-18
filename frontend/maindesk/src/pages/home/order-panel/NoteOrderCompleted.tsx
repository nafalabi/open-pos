import { PackageCheckIcon } from "lucide-react";

const NoteOrderCompleted = () => {
  return (
    <div className="flex flex-col items-center justify-center border-input border rounded-lg px-2 py-3 mt-2">
      <div className="text-md">Order completed</div>
      <div className="mt-2 mb-2">
        <PackageCheckIcon className="h-8 w-8" />
      </div>
      <div className="text-sm text-center"></div>
    </div>
  );
};

export default NoteOrderCompleted;
