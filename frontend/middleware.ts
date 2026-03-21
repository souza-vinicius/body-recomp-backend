import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt-BR|pt-PT|en|es|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
