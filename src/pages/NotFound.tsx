import { Compass, Home, Search } from "lucide-react";
import { Link, useLocation } from "react-router";

import { Button } from "@/components/ui/button";

/**
 * 404 page. Renders the same shell as the marketing pages so an
 * unhandled URL does not visually "leak" the development scaffold.
 *
 * Notes:
 *  - The 404 markup is rendered directly (no `motion.div` with
 *    `initial: opacity 0`) so the page is visible even when JS is
 *    loading or disabled.
 *  - The "Back to home" CTA and a "Search the studies" link cover
 *    the two most common recovery paths from a bad URL.
 *  - The current pathname is shown so users can confirm what they
 *    actually typed, which is helpful when a teammate shares a
 *    stale link.
 */
export default function NotFound() {
  const location = useLocation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8f7] px-6 py-16 text-[#18322f]">
      <div className="w-full max-w-xl rounded-2xl border border-[#dbe6e2] bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#e7f4ef] text-[#286c59]">
          <Compass className="size-6" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#397768]">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">We couldn't find that page</h1>
        <p className="mt-3 text-sm leading-6 text-[#5e766f] sm:text-base">
          The link may be outdated, or the page may have moved. The path the
          browser requested was:
        </p>
        <code className="mt-3 inline-block max-w-full truncate rounded-md bg-[#f4f7f6] px-2.5 py-1.5 font-mono text-xs text-[#3b5c54]">
          {location.pathname}
        </code>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 cursor-pointer gap-2 bg-[#18322f] px-5 text-sm font-semibold text-white hover:bg-[#2a4b45]">
            <Link to="/">
              <Home className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 cursor-pointer gap-2 border-[#d5e2de] px-5 text-sm font-semibold text-[#526965] hover:bg-[#f5f8f7]"
          >
            <a href="/#studies">
              <Search className="size-4" />
              Browse the studies
            </a>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-5 text-[#83938f]">
          If you reached this page from a link in an email or document, the
          link is likely out of date — please contact whoever shared it.
        </p>
      </div>
    </main>
  );
}
