import { RefreshCw } from "lucide-react";
import { Link, useRouteError } from "react-router";

const RELOAD_KEY = "verdi.reloadedForUpdate";

/**
 * Shown instead of a blank screen when a page fails. After a deploy, an open tab may ask for a
 * page file that no longer exists ("Failed to fetch dynamically imported module"): reload once
 * to pick up the new version.
 */
export function RouteError() {
  const err = useRouteError();
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const staleBuild = /dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically/i.test(msg);

  if (staleBuild) {
    let already = false;
    try {
      already = sessionStorage.getItem(RELOAD_KEY) === location.pathname;
      sessionStorage.setItem(RELOAD_KEY, location.pathname);
    } catch {
      /* private mode */
    }
    if (!already) {
      location.reload();
      return null;
    }
  }
  console.error(err);

  return (
    <div className="container-x py-24 text-center" role="alert" data-testid="route-error">
      <p className="num text-6xl text-paper-3">Oops</p>
      <h1 className="mt-2 text-3xl font-semibold">{staleBuild ? "The website was just updated" : "Something went wrong on this page"}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">{staleBuild ? "Please reload to get the latest version." : "Please try again. If it keeps happening, call or WhatsApp us and we will help."}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn-dark" onClick={() => location.reload()}>
          <RefreshCw className="size-4" /> Try again
        </button>
        <Link to="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
