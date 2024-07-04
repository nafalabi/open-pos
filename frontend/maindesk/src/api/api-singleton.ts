import { LOCALSTORAGE_PREFIX } from "../constant/common";
import { debounce } from "../utils/function-utils";
import { doRefreshToken } from "./auth";
import { RequestorReturnType, ResponseData, ResponseError } from "./types";

type FetchArgs = Parameters<typeof fetch>;

const API_URL = window.location.protocol + "//" + window.location.host + "/api";
const LOCALSTORAGE_AUTH_KEY = LOCALSTORAGE_PREFIX + "AUTH_TOKEN";
const LOCALSTORAGE_REFRESH_KEY = LOCALSTORAGE_PREFIX + "REFRESH_TOKEN";

export class ApiSingleton {
  authToken = "";
  refreshToken = "";
  fetch = fetch;
  requestor = new Requestor(fetch);

  isBussy: boolean = false;
  cache?: Promise<boolean>;

  constructor() {
    this.loadToken();
    this.setup();
  }

  loadToken() {
    this.authToken = localStorage.getItem(LOCALSTORAGE_AUTH_KEY) ?? "";
    this.refreshToken = localStorage.getItem(LOCALSTORAGE_REFRESH_KEY) ?? "";
  }

  setup() {
    this.fetch = async (...args: FetchArgs) => {
      const input = args[0];
      const init = args[1];
      const response = await fetch(input, {
        ...init,
        mode: "cors",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...init?.headers,
        },
      });
      if (response.status == 401) {
        if (!this.cache) {
          this.cache = this.handleRefreshToken();
        }
        const ok = await this.cache;
        this.clearCache();
        if (ok) {
          return this.fetch(...args);
        }
      }
      return response;
    };
    this.requestor = new Requestor(this.fetch);
  }

  setToken(authToken: string = "", refreshToken: string = "") {
    this.authToken = authToken;
    localStorage.setItem(LOCALSTORAGE_AUTH_KEY, authToken);
    localStorage.setItem(LOCALSTORAGE_REFRESH_KEY, refreshToken);

    this.setup();
  }

  clearCache = debounce(() => {
    delete this.cache;
  }, 200);

  async handleRefreshToken() {
    const [result, error] = await doRefreshToken({
      refresh_token: this.refreshToken,
    });

    if (error) {
      this.setToken();
      return false;
    }

    this.setToken(result.data.access_token, result.data.refresh_token);

    return true;
  }
}

export class Requestor {
  fetch = fetch;

  constructor(_fetch: typeof fetch) {
    this.fetch = _fetch;
  }

  async _getErrorMessage(
    response: Response,
  ): Promise<ResponseError | undefined> {
    const code = response.status;
    if (code === 200) return undefined;

    const data = await response.json();
    const message: string = data?.message;

    return {
      code,
      message,
    };
  }

  async GET<TData>(
    url: string,
    params?: Record<string, string | null | undefined>,
  ): Promise<RequestorReturnType<TData>> {
    const urlParams = params
      ? "?" + new URLSearchParams(eliminateFalsyValues(params)).toString()
      : "";
    const response = await this.fetch(API_URL + url + urlParams);

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }

  async POST<TData>(
    url: string,
    payload: Record<string, unknown>,
  ): Promise<RequestorReturnType<TData>> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }

  async POST_formdata<TData>(url: string, payload: FormData) {
    const response = await this.fetch(API_URL + url, {
      method: "POST",
      body: payload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }

  async PATCH<TData>(
    url: string,
    payload: Record<string, unknown>,
  ): Promise<RequestorReturnType<TData>> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }

  async DELETE<TData>(
    url: string,
    params?: Record<string, string>,
  ): Promise<RequestorReturnType<TData>> {
    const urlParams = params
      ? "?" + new URLSearchParams(eliminateFalsyValues(params)).toString()
      : "";
    const response = await this.fetch(API_URL + url + urlParams, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }
}

const eliminateFalsyValues = <TObj extends Record<string, unknown>>(
  obj: TObj,
) => {
  Object.keys(obj).forEach((key) => {
    if (!obj[key]) delete obj[key];
  });
  return obj as Record<string, string>;
};

export const apiSingleton = new ApiSingleton();
