import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Link, useMatches } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";

export const BreadcrumbMain = () => {
  const matches = useMatches();

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {matches.map((entry, index) => (
          <Fragment key={entry.id}>
            {index != matches.length - 1 ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={entry.pathname}>{entry.id}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{entry.id}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
