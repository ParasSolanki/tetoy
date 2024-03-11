/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignupRouteImport } from './routes/signup/route'
import { Route as SigninRouteImport } from './routes/signin/route'
import { Route as AuthRouteImport } from './routes/_auth/route'
import { Route as AuthIndexRouteImport } from './routes/_auth/index.route'
import { Route as AuthStoragesRouteImport } from './routes/_auth/storages/route'
import { Route as AuthProductsRouteImport } from './routes/_auth/products/route'
import { Route as AuthCategoriesRouteImport } from './routes/_auth/categories/route'

// Create Virtual Routes

const AuthSettingsLazyImport = createFileRoute('/_auth/_settings')()
const AuthProfileLazyImport = createFileRoute('/_auth/_profile')()
const AuthProfileProfileIndexLazyImport = createFileRoute(
  '/_auth/_profile/profile/',
)()
const AuthSettingsSettingsSecurityLazyImport = createFileRoute(
  '/_auth/_settings/settings/security',
)()
const AuthSettingsSettingsAppearanceLazyImport = createFileRoute(
  '/_auth/_settings/settings/appearance',
)()

// Create/Update Routes

const SignupRouteRoute = SignupRouteImport.update({
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/signup/route.lazy').then((d) => d.Route))

const SigninRouteRoute = SigninRouteImport.update({
  path: '/signin',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/signin/route.lazy').then((d) => d.Route))

const AuthRouteRoute = AuthRouteImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/_auth/route.lazy').then((d) => d.Route))

const AuthIndexRouteRoute = AuthIndexRouteImport.update({
  path: '/',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/index.route.lazy').then((d) => d.Route),
)

const AuthSettingsLazyRoute = AuthSettingsLazyImport.update({
  id: '/_settings',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/_settings.lazy').then((d) => d.Route),
)

const AuthProfileLazyRoute = AuthProfileLazyImport.update({
  id: '/_profile',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/_profile.lazy').then((d) => d.Route),
)

const AuthStoragesRouteRoute = AuthStoragesRouteImport.update({
  path: '/storages',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/storages/route.lazy').then((d) => d.Route),
)

const AuthProductsRouteRoute = AuthProductsRouteImport.update({
  path: '/products',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/products/route.lazy').then((d) => d.Route),
)

const AuthCategoriesRouteRoute = AuthCategoriesRouteImport.update({
  path: '/categories',
  getParentRoute: () => AuthRouteRoute,
} as any).lazy(() =>
  import('./routes/_auth/categories/route.lazy').then((d) => d.Route),
)

const AuthProfileProfileIndexLazyRoute =
  AuthProfileProfileIndexLazyImport.update({
    path: '/profile/',
    getParentRoute: () => AuthProfileLazyRoute,
  } as any).lazy(() =>
    import('./routes/_auth/_profile/profile.index.lazy').then((d) => d.Route),
  )

const AuthSettingsSettingsSecurityLazyRoute =
  AuthSettingsSettingsSecurityLazyImport.update({
    path: '/settings/security',
    getParentRoute: () => AuthSettingsLazyRoute,
  } as any).lazy(() =>
    import('./routes/_auth/_settings/settings.security.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthSettingsSettingsAppearanceLazyRoute =
  AuthSettingsSettingsAppearanceLazyImport.update({
    path: '/settings/appearance',
    getParentRoute: () => AuthSettingsLazyRoute,
  } as any).lazy(() =>
    import('./routes/_auth/_settings/settings.appearance.lazy').then(
      (d) => d.Route,
    ),
  )

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_auth': {
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRoute
    }
    '/signin': {
      preLoaderRoute: typeof SigninRouteImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      preLoaderRoute: typeof SignupRouteImport
      parentRoute: typeof rootRoute
    }
    '/_auth/categories': {
      preLoaderRoute: typeof AuthCategoriesRouteImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/products': {
      preLoaderRoute: typeof AuthProductsRouteImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/storages': {
      preLoaderRoute: typeof AuthStoragesRouteImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/_profile': {
      preLoaderRoute: typeof AuthProfileLazyImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/_settings': {
      preLoaderRoute: typeof AuthSettingsLazyImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/': {
      preLoaderRoute: typeof AuthIndexRouteImport
      parentRoute: typeof AuthRouteImport
    }
    '/_auth/_settings/settings/appearance': {
      preLoaderRoute: typeof AuthSettingsSettingsAppearanceLazyImport
      parentRoute: typeof AuthSettingsLazyImport
    }
    '/_auth/_settings/settings/security': {
      preLoaderRoute: typeof AuthSettingsSettingsSecurityLazyImport
      parentRoute: typeof AuthSettingsLazyImport
    }
    '/_auth/_profile/profile/': {
      preLoaderRoute: typeof AuthProfileProfileIndexLazyImport
      parentRoute: typeof AuthProfileLazyImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  AuthRouteRoute.addChildren([
    AuthCategoriesRouteRoute,
    AuthProductsRouteRoute,
    AuthStoragesRouteRoute,
    AuthProfileLazyRoute.addChildren([AuthProfileProfileIndexLazyRoute]),
    AuthSettingsLazyRoute.addChildren([
      AuthSettingsSettingsAppearanceLazyRoute,
      AuthSettingsSettingsSecurityLazyRoute,
    ]),
    AuthIndexRouteRoute,
  ]),
  SigninRouteRoute,
  SignupRouteRoute,
])

/* prettier-ignore-end */
