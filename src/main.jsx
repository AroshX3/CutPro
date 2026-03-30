import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./layout";
import Home from "./components/Home/Home";
import CuttingEngine from "./components/Cutting/Cutting";
import About from "./components/About/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 
    children: [
      { path: "/", element: <Home /> },
      { path: "/cuttingCenter", element: <CuttingEngine /> },
      { path: "/about", element: <About/> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
