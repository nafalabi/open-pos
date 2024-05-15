import { type ReactNode } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

import { Navbar } from "./navbar";
import { Header } from "./header";

type BaseLayoutProps = {
  children: ReactNode;
};

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Navbar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header />
          <main className="p-4 sm:px-6 sm:py-0 max-w-[1700px] w-full self-center flex">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BaseLayout;
