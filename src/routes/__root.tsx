import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/lib/cart-store";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-cream px-4">
      <div className="text-center max-w-md">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
          Lost in the spice market
        </p>

        <h1 className="font-display text-7xl text-primary">404</h1>

        <p className="mt-3 text-muted-foreground">
          This page wandered off. Let's get you back home.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl text-primary">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Please try again later.
        </p>

        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Ashok Naturals — Pure Indian Spices & Natural Foods",
        },
        {
          name: "description",
          content:
            "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599.",
        },
        {
          property: "og:title",
          content: "Ashok Naturals — Pure Indian Spices & Natural Foods",
        },
        {
          property: "og:description",
          content:
            "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:title",
          content: "Ashok Naturals — Pure Indian Spices & Natural Foods",
        },
        {
          name: "twitter:description",
          content:
            "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599.",
        },
        {
          property: "og:image",
          content:
            "https://storage.googleapis.com/gpt-engineer-file-uploads/zBnXVbmYrNVFVR97eB191xq96pH2/social-images/social-1778560306281-1000250954.webp",
        },
        {
          name: "twitter:image",
          content:
            "https://storage.googleapis.com/gpt-engineer-file-uploads/zBnXVbmYrNVFVR97eB191xq96pH2/social-images/social-1778560306281-1000250954.webp",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [{ rel: "stylesheet", href: appCss }],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Outlet />
          </main>

          <Footer />

          {/* WhatsApp Floating Button */}
          <a
            href="https://wa.me/919414857764?text=Hello%20Ashok%20Naturals"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50"
          >
            <div className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.86 11.86 0 0012.06 0C5.5 0 .16 5.35.16 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.87 11.87 0 005.76 1.47h.01c6.56 0 11.9-5.35 11.9-11.93 0-3.19-1.24-6.18-3.45-8.4zM12.07 21.3a9.3 9.3 0 01-4.74-1.3l-.34-.2-3.74.98 1-3.64-.22-.37a9.33 9.33 0 01-1.42-4.97c0-5.14 4.19-9.33 9.35-9.33 2.5 0 4.85.97 6.62 2.74a9.27 9.27 0 012.74 6.6c0 5.15-4.2 9.34-9.35 9.34zm5.13-6.97c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.18.28-.73.91-.9 1.1-.16.18-.33.21-.6.07-.28-.14-1.16-.43-2.2-1.37-.81-.72-1.36-1.61-1.52-1.88-.16-.28-.02-.42.12-.56.13-.13.28-.33.42-.49.14-.16.18-.28.28-.47.1-.18.05-.35-.02-.49-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5h-.55c-.18 0-.49.07-.74.35-.26.28-.98.96-.98 2.34s1 2.72 1.14 2.91c.14.18 1.97 3.01 4.78 4.22.67.29 1.2.47 1.61.6.68.22 1.3.19 1.8.12.55-.08 1.66-.68 1.9-1.34.23-.65.23-1.21.16-1.33-.07-.11-.25-.18-.53-.32z" />
              </svg>
            </div>
          </a>
        </div>

        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
