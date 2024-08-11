import { LiveMessage } from "@/generated/schema";
import { apiSingleton } from "../api/api-singleton";

export type LiveNotifierEventMap = {
  message: (event: CustomEvent<LiveMessage>) => void;
  error: (event: CustomEvent<Error>) => void;
};

export type LiveNotifierEvents = keyof LiveNotifierEventMap;

class LiveNotifier {
  protocol = "ws";
  host = window.location.host;
  connectionString = "";

  ws: WebSocket | undefined;
  connectionAttempt = 0;

  eventPublisher: EventTarget;

  constructor() {
    const { authToken } = apiSingleton;

    this.eventPublisher = new EventTarget();

    this.protocol = window.location.protocol === "http:" ? "ws" : "wss";
    this.host = window.location.host;

    this.connectionString =
      this.protocol +
      "://" +
      this.host +
      "/websocket/live-notifier?token=" +
      authToken;
  }

  connect() {
    this.connectionAttempt += 1;

    const { authToken } = apiSingleton;
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const host = window.location.host;
    const ws = new WebSocket(
      protocol + "://" + host + "/websocket/live-notifier?token=" + authToken,
    );

    ws.onmessage = (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as LiveMessage;
      this.eventPublisher.dispatchEvent(
        new CustomEvent<LiveMessage>("message", { detail: message }),
      );
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ws.onclose = (_event) => {
      if (this.connectionAttempt >= 3) {
        this.eventPublisher.dispatchEvent(
          new CustomEvent<Error>("error", {
            detail: new Error(
              "Failed to connect to live-notifier websocket, reconnecting in 1 min...",
            ),
          }),
        );
        this.connectionAttempt = 0;
        this.scheduleReconnect(60_000);
        return;
      }
      this.scheduleReconnect(2500);
    };

    ws.onopen = () => {
      this.connectionAttempt = 0;
    };

    this.ws = ws;

    return {
      ws,
      disconnect: () => {
        this.connectionAttempt = 0;
        ws.onclose = () => {}
        ws.close(1000);
      },
    };
  }

  scheduleReconnect(timeMs: number) {
    setTimeout(() => {
      this.connect();
    }, timeMs);
  }

  addEventListener<T extends LiveNotifierEvents>(
    type: T,
    callback: LiveNotifierEventMap[T],
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    this.eventPublisher.addEventListener(
      type,
      callback as unknown as EventListenerOrEventListenerObject,
      options,
    );
  }

  removeEventListener<T extends LiveNotifierEvents>(
    type: LiveNotifierEvents,
    callback: LiveNotifierEventMap[T],
    options?: boolean | EventListenerOptions | undefined,
  ): void {
    this.eventPublisher.removeEventListener(
      type,
      callback as unknown as EventListenerOrEventListenerObject,
      options,
    );
  }
}

export default LiveNotifier;
