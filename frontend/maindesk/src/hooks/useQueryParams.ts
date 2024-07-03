import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PaginationParams } from "../api/types";

type ParamsValue<TParamKeys extends readonly string[]> = {
  [key in TParamKeys[number]]: string | null;
} & PaginationParams & {
    sortkey: string | null;
    sortdirection: "asc" | "desc" | null;
  };

const useQueryParams = <const TParamKeys extends ReadonlyArray<string>>({
  paramkeys,
  defaults = {
    pagesize: "10",
    page: "1",
  } as Partial<ParamsValue<TParamKeys>>,
}: {
  paramkeys: TParamKeys;
  defaults?: Partial<ParamsValue<TParamKeys>>;
}) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    const genericParams: { [key: string]: string | null } = {};
    paramkeys.forEach((key) => {
      genericParams[key] = urlSearchParams.get(key);
    });
    const paginationParams = {
      page: String(Number(urlSearchParams.get("page")) || ""),
      pagesize: String(Number(urlSearchParams.get("pagesize")) || ""),
    };
    const sortingParams = {
      sortkey: urlSearchParams.get("sortkey"),
      sortdirection: urlSearchParams.get("sortdirection"),
    };
    const combined: { [key: string]: string | null } = {
      ...genericParams,
      ...paginationParams,
      ...sortingParams,
    };

    if (defaults) {
      Object.entries(defaults).forEach(([key, value]) => {
        if (!combined[key]) {
          combined[key] = value;
        }
      });
    }

    return combined as ParamsValue<TParamKeys>;
  }, [urlSearchParams]);

  const setPage = useCallback(
    (page: number) => {
      urlSearchParams.set("page", String(page));
      setUrlSearchParams(urlSearchParams);
    },
    [urlSearchParams, setUrlSearchParams],
  );

  const setPageSize = useCallback(
    (pagesize: number) => {
      urlSearchParams.set("pagesize", String(pagesize));
      setUrlSearchParams(urlSearchParams);
    },
    [urlSearchParams, setUrlSearchParams],
  );

  const setSorting = useCallback(
    (key: string, direction: "asc" | "desc") => {
      urlSearchParams.set("sortkey", key);
      urlSearchParams.set("sortdirection", direction);
      setUrlSearchParams(urlSearchParams);
    },
    [urlSearchParams, setUrlSearchParams],
  );

  const clearSorting = useCallback(() => {
    urlSearchParams.delete("sortkey");
    urlSearchParams.delete("sortdirection");
    setUrlSearchParams(urlSearchParams);
  }, [urlSearchParams, setUrlSearchParams]);

  const setQueryParams = useCallback(
    (params: Partial<typeof queryParams>) => {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== null) {
          urlSearchParams.set(key, val);
        } else {
          urlSearchParams.delete(key);
        }
      });
      setUrlSearchParams(urlSearchParams);
    },
    [urlSearchParams, setUrlSearchParams],
  );

  return {
    queryParams,
    setPage,
    setPageSize,
    setSorting,
    clearSorting,
    setQueryParams,
  };
};

export default useQueryParams;
