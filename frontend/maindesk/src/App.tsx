import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/shared/components/ui/sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./guard/AuthProvider";
import { GlobalAlertParent } from "./layout/global-alert";
import { LiveNotifierProvider } from "./hooks/useLiveNotifier";

export const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LiveNotifierProvider>
          <RouterProvider router={router} />
          <Toaster theme="light" richColors closeButton />
          <GlobalAlertParent />
        </LiveNotifierProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
