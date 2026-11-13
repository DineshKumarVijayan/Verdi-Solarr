import { Link } from "react-router";
import { usePageMeta } from "../lib/seo";

export default function NotFound() {
  usePageMeta("Page not found", undefined, { noindex: true });
  return (
    <div className="container-x py-28 text-center">
      <p className="num text-7xl text-paper-3">404</p>
      <h1 className="mt-2 text-3xl font-semibold">This page went behind a cloud.</h1>
      <p className="mt-2 text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="btn-dark">
          Home
        </Link>
        <Link to="/products" className="btn-ghost">
          Browse products
        </Link>
      </div>
    </div>
  );
}
