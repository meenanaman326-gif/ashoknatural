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
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Lost in the spice market</p>
        <h1 className="font-display text-7xl text-primary">404</h1>
        <p className="mt-3 text-muted-foreground">This page wandered off. Let's get you back home.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-gold hover:text-gold-foreground transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl text-primary">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
  Please try again later.
</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ashok Naturals — Pure Indian Spices & Natural Foods" },
      { name: "description", content: "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599." },
      { property: "og:title", content: "Ashok Naturals — Pure Indian Spices & Natural Foods" },
      { property: "og:description", content: "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Ashok Naturals — Pure Indian Spices & Natural Foods" },
      { name: "twitter:description", content: "Stone-ground spices, raw forest honey & natural foods, sourced directly from Indian farms. 100% pure, lab tested, free shipping above ₹599." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zBnXVbmYrNVFVR97eB191xq96pH2/social-images/social-1778560306281-1000250954.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zBnXVbmYrNVFVR97eB191xq96pH2/social-images/social-1778560306281-1000250954.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

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

          <a
            href="https://wa.me/919414857764?text=Hello%20Ashok%20Ashok%20Naturals"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50"
          >
            <div className="bg-green-500 text-white p-4 rounded-full shadow-lg">
              WhatsApp
            </div>
          </a>

        </div>

        <Toaster />

      </CartProvider>
    </QueryClientProvider>
  );
}
