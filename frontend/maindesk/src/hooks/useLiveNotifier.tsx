import { createContext, useContext, useEffect } from "react";
import LiveNotifier, {
  LiveNotifierEventMap,
  LiveNotifierEvents,
} from "../websocket/live-notifier";

const lnInstance = new LiveNotifier();
lnInstance.connect()

type LiveNotifierContextValue = {
  liveNotifier: LiveNotifier;
};

export const LiveNotifierContext = createContext<LiveNotifierContextValue>({
  liveNotifier: lnInstance,
});

export const LiveNotifierProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <LiveNotifierContext.Provider value={{ liveNotifier: lnInstance }}>
      {children}
    </LiveNotifierContext.Provider>
  );
};

export const useLiveNotifier = <T extends LiveNotifierEvents>(
  type: T,
  callback: LiveNotifierEventMap[T],
  deps: Array<unknown>,
) => {
  const { liveNotifier } = useContext(LiveNotifierContext);

  useEffect(() => {
    liveNotifier?.addEventListener(type, callback);
    return () => liveNotifier?.removeEventListener(type, callback);
  }, [deps]);
};
