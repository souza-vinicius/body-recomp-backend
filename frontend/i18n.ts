import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'pt-BR', 'pt-PT', 'es', 'de'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'en';

  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
