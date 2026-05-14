@@ -1,132 +0,0 @@
/* eslint-disable */

// @ts-nocheck

import { Route as rootRouteImport } from './routes/__root'
import { Route as TermsRouteImport } from './routes/terms'
import { Route as ShippingRouteImport } from './routes/shipping'
import { Route as ProductsRouteImport } from './routes/products'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as OrderSuccessRouteImport } from './routes/order-success'
import { Route as FaqRouteImport } from './routes/faq'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as CheckoutRouteImport } from './routes/checkout'
import { Route as CartRouteImport } from './routes/cart'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as AboutRouteImport } from './routes/about'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProductsSlugRouteImport } from './routes/products.$slug'
import { Route as ApiPublicRazorpayCallbackRouteImport } from './routes/api/public/razorpay-callback'

/* Routes */
const TermsRoute = TermsRouteImport.update({
  id: '/terms',
  path: '/terms',
  getParentRoute: () => rootRouteImport,
} as any)

const ShippingRoute = ShippingRouteImport.update({
  id: '/shipping',
  path: '/shipping',
  getParentRoute: () => rootRouteImport,
} as any)

const ProductsRoute = ProductsRouteImport.update({
  id: '/products',
  path: '/products',
  getParentRoute: () => rootRouteImport,
} as any)

const PrivacyRoute = PrivacyRouteImport.update({
  id: '/privacy',
  path: '/privacy',
  getParentRoute: () => rootRouteImport,
} as any)

const OrderSuccessRoute = OrderSuccessRouteImport.update({
  id: '/order-success',
  path: '/order-success',
  getParentRoute: () => rootRouteImport,
} as any)

const FaqRoute = FaqRouteImport.update({
  id: '/faq',
  path: '/faq',
  getParentRoute: () => rootRouteImport,
} as any)

const ContactRoute = ContactRouteImport.update({
  id: '/contact',
  path: '/contact',
  getParentRoute: () => rootRouteImport,
} as any)

const CheckoutRoute = CheckoutRouteImport.update({
  id: '/checkout',
  path: '/checkout',
  getParentRoute: () => rootRouteImport,
} as any)

const CartRoute = CartRouteImport.update({
  id: '/cart',
  path: '/cart',
  getParentRoute: () => rootRouteImport,
} as any)

const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)

const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const ProductsSlugRoute = ProductsSlugRouteImport.update({
  id: '/$slug',
  path: '/$slug',
  getParentRoute: () => ProductsRoute,
} as any)

const ApiPublicRazorpayCallbackRoute = ApiPublicRazorpayCallbackRouteImport.update({
  id: '/api/public/razorpay-callback',
  path: '/api/public/razorpay-callback',
  getParentRoute: () => rootRouteImport,
} as any)

/* ROOT CHILDREN */
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  AdminRoute,
  AuthRoute,
  CartRoute,
  CheckoutRoute,
  ContactRoute,
  FaqRoute,
  OrderSuccessRoute,
  PrivacyRoute,
  ProductsRoute,
  ShippingRoute,
  TermsRoute,
  ApiPublicRazorpayCallbackRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
