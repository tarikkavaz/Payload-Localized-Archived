'use client'
import React from 'react'
import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/routing'
import { TypedLocale } from 'payload'
import localization from '@/i18n/localization'
import { cn } from '@/utilities/cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LocaleSwitcherProps = {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()

  async function getTranslatedSlug(currentLocale: string, newLocale: string, collection?: string, slug?: string) {
    try {
      if (!slug) return null;
      
      // Determine collection type from valid collections
      const validCollections = ['posts', 'products', 'works', 'pages'];
      const col = collection && validCollections.includes(collection) ? collection : 'pages';

      // Fetch document ID using current locale
      const res = await fetch(`/api/${col}?where[slug][equals]=${slug}&locale=${currentLocale}`);
      const data = await res.json();
      
      if (data?.docs?.[0]?.id) {
        // Fetch translated version
        const translationRes = await fetch(`/api/${col}/${data.docs[0].id}?locale=${newLocale}`);
        const translationData = await translationRes.json();
        return translationData?.slug;
      }
    } catch (err) {
      console.error('Error fetching translation:', err);
    }
    return null;
  }

  async function onSelectChange(newLocale: TypedLocale) {
    startTransition(async () => {
      try {
        const currentPath = pathname.replace(/^\/[a-z]{2}\//, '/'); // Remove existing locale
        const isHome = currentPath === '/';
        
        if (isHome) {
          router.replace('/', { locale: newLocale });
          return;
        }

        // Extract route parts without locale
        const pathParts = currentPath.split('/').filter(Boolean);
        const validCollections = ['posts', 'products', 'works'];

        // Handle direct pages (single segment like /test)
        if (pathParts.length === 1) {
          const pageSlug = pathParts[0];
          const translatedSlug = await getTranslatedSlug(locale, newLocale, 'pages', pageSlug);
          router.replace(`/${translatedSlug || pageSlug}`, { locale: newLocale });
        }
        // Handle collection items (two segments like /posts/slug)
        else if (pathParts.length === 2) {
          const [collection, slug] = pathParts;
          if (validCollections.includes(collection)) {
            const translatedSlug = await getTranslatedSlug(locale, newLocale, collection, slug);
            router.replace(`/${collection}/${translatedSlug || slug}`, { locale: newLocale });
          }
        }
        // Fallback for other cases
        else {
          router.replace(currentPath, { locale: newLocale });
        }
      } catch (error) {
        console.error('Locale switch failed:', error);
        router.replace(pathname, { locale: newLocale });
      }
    });
  }

  return (
    <Select onValueChange={onSelectChange} value={locale}>
      <SelectTrigger 
        className={cn(
          "w-auto p-0 pl-0 text-sm font-medium text-black bg-transparent border-none md:ml-9 dark:text-white",
          className
        )}
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {localization.locales
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((locale) => (
            <SelectItem value={locale.code} key={locale.code}>
              {locale.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}