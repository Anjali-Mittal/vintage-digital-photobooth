import { RouterProvider } from "react-router";
import { router } from "./routes";
import { BoothProvider } from "../context/BoothContext";

export default function App() {
  return (
    <BoothProvider>
      <RouterProvider router={router} />
    </BoothProvider>
  );
}
