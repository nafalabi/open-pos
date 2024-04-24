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

type RequestorReturn<T> = Promise<[Response, T]>;

export class Requestor {
  fetch = fetch;

  constructor(_fetch: typeof fetch) {
    this.fetch = _fetch;
  }

  async GET<TData, TParams = { [key: string]: string }>(
    url: string,
    params?: TParams,
  ): RequestorReturn<TData> {
    const urlParams = params ? new URLSearchParams(params).toString() : "";
    const response = await this.fetch(API_URL + url + urlParams);
    const data: TData = await response.json();
    return [response, data];
  }

  async POST<TData, TPayload = { [key: string]: string }>(
    url: string,
    payload: TPayload,
  ): RequestorReturn<TData> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });
    const data: TData = await response.json();
    return [response, data];
  }

  async PATCH<TData, TPayload>(
    url: string,
    payload: TPayload,
  ): RequestorReturn<TData> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });
    const data: TData = await response.json();
    return [response, data];
  }

  async DELETE<TData, TPayload>(
    url: string,
    payload?: TPayload,
  ): RequestorReturn<TData> {
    const sPayload = JSON.stringify(payload);
    const response = await this.fetch(API_URL + url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: sPayload,
    });
    const data: TData = await response.json();
    return [response, data];
  }
}

export const apiSingleton = new ApiSingleton();
