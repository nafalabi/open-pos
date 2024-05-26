import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/shared/components/ui/sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./guard/AuthProvider";
import { GlobalAlertParent } from "./layout/global-alert";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster theme="light" richColors closeButton />
        <GlobalAlertParent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
