import { LOCALSTORAGE_PREFIX } from "../constant/common";
import { RequestorReturnType, ResponseData, ResponseError } from "./types";

type FetchArgs = Parameters<typeof fetch>;

const API_URL = window.location.protocol + "//" + window.location.host + "/api";
const LOCALSTORAGE_AUTH_KEY = LOCALSTORAGE_PREFIX + "AUTH_TOKEN";

export class ApiSingleton {
  authToken = "";
  fetch = fetch;
  requestor = new Requestor(fetch);

  constructor() {
    this.loadToken();
    this.setup();
  }

  loadToken() {
    this.authToken = localStorage.getItem(LOCALSTORAGE_AUTH_KEY) ?? "";
  }

  setup() {
    this.fetch = (...args: FetchArgs) => {
      const input = args[0];
      const init = args[1];
      return fetch(input, {
        ...init,
        mode: "cors",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          ...init?.headers,
        },
      });
    };
    this.requestor = new Requestor(this.fetch);
  }

  updateToken(authToken: string = "") {
    this.authToken = authToken;
    localStorage.setItem(LOCALSTORAGE_AUTH_KEY, authToken);

    this.setup();
  }
}

export class Requestor {
  fetch = fetch;

  constructor(_fetch: typeof fetch) {
    this.fetch = _fetch;
  }

  async _getErrorMessage(
    response: Response
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

  async GET<TData, TParams = { [key: string]: string }>(
    url: string,
    params?: TParams
  ): Promise<RequestorReturnType<TData>> {
    const urlParams = params
      ? "?" + new URLSearchParams(eliminateNullishValues(params)).toString()
      : "";
    const response = await this.fetch(API_URL + url + urlParams);

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response] as const;

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response] as const;
  }

  async POST<TData, TPayload = { [key: string]: string }>(
    url: string,
    payload: TPayload
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

  async PATCH<TData, TPayload>(
    url: string,
    payload: TPayload
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
    params?: Record<string, string>
  ): Promise<RequestorReturnType<TData>> {
    const urlParams = params
      ? "?" + new URLSearchParams(eliminateNullishValues(params)).toString()
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

const eliminateNullishValues = <TObj extends Record<string, unknown>>(
  obj: TObj
) => {
  Object.keys(obj).forEach((key) => {
    if (!obj[key]) delete obj[key];
  });
  return obj;
};

export const apiSingleton = new ApiSingleton();
