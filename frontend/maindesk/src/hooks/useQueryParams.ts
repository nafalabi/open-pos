import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PaginationParams } from "../api/types";

type Args<TParamKeys extends readonly string[]> = {
  paramkeys: TParamKeys;
};

type ParamsValue<TParamKeys extends readonly string[]> = {
  [key in TParamKeys[number]]: string | null;
} & PaginationParams & {
    sortkey: string | null;
    sortdirection: "asc" | "desc" | null;
  };

const useQueryParams = <TParamKeys extends readonly string[]>({
  paramkeys,
}: Args<TParamKeys>) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    const genericParams: { [key: string]: string | null } = {};
    paramkeys.forEach((key) => {
      genericParams[key] = urlSearchParams.get(key);
    });
    const paginationParams = {
      page: Number(urlSearchParams.get("page")) || String(1),
      pagesize: Number(urlSearchParams.get("pagesize")) || String(10),
    };
    const sortingParams = {
      sortkey: urlSearchParams.get("sortkey"),
      sortdirection: urlSearchParams.get("sortdirection"),
    };
    return {
      ...genericParams,
      ...paginationParams,
      ...sortingParams,
    } as ParamsValue<TParamKeys>;
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
    (params: typeof queryParams) => {
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
