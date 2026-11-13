import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { DatasheetProvider } from "./components/Datasheet";
import { Layout } from "./components/Layout";
import { MotionProvider } from "./components/motion";
import { Spinner, ToastProvider } from "./components/ui";
import { BasketProvider } from "./lib/basket";
import { CatalogueProvider } from "./lib/catalogue";
import { CompareProvider } from "./lib/compare";
import Home from "./pages/Home";

const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Compare = lazy(() => import("./pages/Compare"));
const Enquiry = lazy(() => import("./pages/Enquiry"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnLesson = lazy(() => import("./pages/LearnLesson"));
const Tools = lazy(() => import("./pages/Tools"));
const Contact = lazy(() => import("./pages/Contact"));
const Field = lazy(() => import("./pages/Field"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPrices = lazy(() => import("./pages/admin/Prices"));

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted">
          <Spinner />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function Providers() {
  return (
    <MotionProvider>
    <ToastProvider>
      <CatalogueProvider>
        <BasketProvider>
          <CompareProvider>
            <DatasheetProvider>
              <Outlet />
            </DatasheetProvider>
          </CompareProvider>
        </BasketProvider>
      </CatalogueProvider>
    </ToastProvider>
    </MotionProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <Providers />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/products", element: <Page><Products /></Page> },
          { path: "/category/:categorySlug", element: <Page><Products /></Page> },
          { path: "/products/:slug", element: <Page><ProductDetail /></Page> },
          { path: "/compare", element: <Page><Compare /></Page> },
          { path: "/enquiry", element: <Page><Enquiry /></Page> },
          { path: "/learn", element: <Page><Learn /></Page> },
          { path: "/learn/:lesson", element: <Page><LearnLesson /></Page> },
          { path: "/solar-tools", element: <Page><Tools /></Page> },
          { path: "/solar-tools/:tool", element: <Page><Tools /></Page> },
          { path: "/contact", element: <Page><Contact /></Page> },
          { path: "/in-the-field", element: <Page><Field /></Page> },
          {
            path: "/admin",
            element: <Page><AdminLayout /></Page>,
            children: [
              { index: true, element: <Page><AdminDashboard /></Page> },
              { path: "prices", element: <Page><AdminPrices /></Page> },
            ],
          },
          { path: "*", element: <Page><NotFound /></Page> },
        ],
      },
    ],
  },
]);
