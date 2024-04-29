import { Toaster } from "@/shared/components/ui/sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./guard/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster theme="light" closeButton />
    </AuthProvider>
  );
}

export default App;
