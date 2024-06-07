import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Link, type UIMatch, useMatches } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";

type BreadcrumbTextHandle = {
  crumb?: () => string;
};

export const BreadcrumbMain = () => {
  const matches = useMatches() as UIMatch<
    unknown,
    BreadcrumbTextHandle | undefined
  >[];

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {matches.map((entry, index) => {
          const crumbTextFn = entry.handle?.crumb;
          if (!crumbTextFn) return null;
          return (
            <Fragment key={entry.id}>
              {index != matches.length - 1 ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={entry.pathname}>{crumbTextFn()}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{crumbTextFn()}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
