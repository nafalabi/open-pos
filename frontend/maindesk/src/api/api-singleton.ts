import { LOCALSTORAGE_PREFIX } from "../constant/common";

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

type Pagination = {
  current_page: number;
  page_size: number;
  total_items: number;
  total_page: number;
};
type ResponseData<T> = { code: number; data: T; pagination?: Pagination };
type ResponseError = { code: number; message: string };
type RequestorReturnType<T> = [
  result: ResponseData<T> | undefined,
  error: ResponseError | undefined,
  response: Response,
];

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

  async GET<TData, TParams = { [key: string]: string }>(
    url: string,
    params?: TParams,
  ): Promise<RequestorReturnType<TData>> {
    const urlParams = params ? new URLSearchParams(params).toString() : "";
    const response = await this.fetch(API_URL + url + urlParams);

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response];

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response];
  }

  async POST<TData, TPayload = { [key: string]: string }>(
    url: string,
    payload: TPayload,
  ): Promise<RequestorReturnType<TData>> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response];

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response];
  }

  async PATCH<TData, TPayload>(
    url: string,
    payload: TPayload,
  ): Promise<RequestorReturnType<TData>> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response];

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response];
  }

  async DELETE<TData, TPayload>(
    url: string,
    payload?: TPayload,
  ): Promise<RequestorReturnType<TData>> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });

    const error = await this._getErrorMessage(response);
    if (error) return [undefined, error, response];

    const data: ResponseData<TData> = await response.json();
    return [data, undefined, response];
  }
}

export const apiSingleton = new ApiSingleton();
