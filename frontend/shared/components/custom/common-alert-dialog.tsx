import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { ReactNode } from "react";

const CommonAlertDialog = ({
  open,
  onOpenChange,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Ok",
  onCancel,
  onConfirm,
  withTrigger,
  triggerText,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  message: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  withTrigger?: boolean;
  triggerText?: string;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {withTrigger && <AlertDialogTrigger>{triggerText}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CommonAlertDialog;
