import CommonAlertDialog from "@/shared/components/custom/common-alert-dialog";
import { ComponentProps, useCallback, useEffect, useState } from "react";

type CommonAlertProps = ComponentProps<typeof CommonAlertDialog>;
type Options = Omit<
  CommonAlertProps,
  "open" | "withTrigger" | "triggerText" | "onOpenChange"
>;

export let showAlert: (options: Options) => void = () => { };

const defaultOptions = {
  message: "",
  title: "",
};

export const GlobalAlertParent = () => {
  const [options, setOptions] = useState<Options>(defaultOptions);
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback((options: Options) => {
    setOptions({
      ...options,
    });
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback(() => {
    setOpen(false);
    setOptions(defaultOptions);
  }, []);

  useEffect(() => {
    showAlert = handleOpen;
    return () => {
      showAlert = () => { };
    };
  }, [handleOpen]);

  return (
    <CommonAlertDialog
      {...options}
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
};
