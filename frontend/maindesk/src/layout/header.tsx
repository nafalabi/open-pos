import { BreadcrumbMain } from "./breadcrumb-main";
import { SearchField } from "./search-field";
import { DropdownAccount } from "./dropdown-account";
import { MobileNavbar } from "./navbar";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <MobileNavbar />
      <BreadcrumbMain />
      <SearchField />
      <DropdownAccount />
    </header>
  );
};
