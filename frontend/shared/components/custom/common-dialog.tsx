import { ComponentProps, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const CommonDialog = ({
  open,
  onOpenChange,
  title,
  description,
  content,
  footer,
  withTrigger,
  triggerText,
  ContainerEl = "div",
  containerProps,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  withTrigger?: boolean;
  triggerText?: string;
  ContainerEl?: "form" | "div";
  containerProps?: ComponentProps<"div" | "form">;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {withTrigger && <DialogTrigger>{triggerText}</DialogTrigger>}
      <DialogContent>
        <ContainerEl {...(containerProps as object)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {content}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </ContainerEl>
      </DialogContent>
    </Dialog>
  );
};

export default CommonDialog;
