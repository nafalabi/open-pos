import {
  Home,
  LineChart,
  LucideIcon,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/shadcn.ts";

type Menuitem = {
  name: string;
  icon: LucideIcon;
  link: string;
};

const menus: Menuitem[] = [
  {
    name: "Dashboard",
    icon: Home,
    link: "/",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    link: "/orders",
  },
  {
    name: "Products",
    icon: Package,
    link: "/products",
  },
  {
    name: "Customers",
    icon: Users2,
    link: "/customers",
  },
  {
    name: "Analytics",
    icon: LineChart,
    link: "/analytics",
  },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          to="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        {menus.map((menu) => (
          <Tooltip key={menu.name}>
            <TooltipTrigger asChild>
              <Link
                to={menu.link}
                className={cn(
                  pathname === menu.link
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                )}
              >
                <menu.icon className="h-5 w-5" />
                <span className="sr-only">{menu.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{menu.name}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export const MobileNavbar = () => {
  const { pathname } = useLocation();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            to="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.link}
              className={cn(
                pathname === menu.link
                  ? "text-foreground"
                  : "text-muted-foreground",

                "flex items-center gap-4 px-2.5 hover:text-foreground",
              )}
            >
              <menu.icon className="h-5 w-5" />
              {menu.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
