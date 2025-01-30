**Key differences between the initial and current codebase:**

There are also some component changes in the Header and Footer, such as the Logo, Theme Selector, and Locale Switcher.

---




src/app/(frontend)/[locale]/[slug]/page.tsx
```diff
 import { generateMeta } from '@/utilities/generateMeta'
 import PageClient from './page.client'
 import { TypedLocale } from 'payload'
+import { routing } from '@/i18n/routing'
 
...
 
-  const params = pages.docs
-    ?.filter((doc) => {
-      return doc.slug !== 'home'
-    })
-    .map(({ slug }) => {
-      return { slug }
-    })
-
-  return params
+  return pages.docs
+    ?.filter((doc) => doc.slug !== 'home')
+    .flatMap(({ slug }) => 
+      routing.locales.map(locale => ({
+        slug,
+        locale
+      }))
+    )

```

src/app/(frontend)/[locale]/posts/[slug]/page.tsx
```diff
 import { generateMeta } from '@/utilities/generateMeta'
 import PageClient from './page.client'
 import { TypedLocale } from 'payload'
+import { routing } from '@/i18n/routing'
 
...
 
-  const params = posts.docs.map(({ slug }) => {
-    return { slug }
-  })
-
-  return params
+  return posts.docs.flatMap(({ slug }) => 
+    routing.locales.map(locale => ({
+      slug,
+      locale
+    }))
+  )
 }
 
...

     where: {
       slug: {
         equals: slug,
+      },
+      _status: {
+        equals: 'published',
       },
     },
   })

```

src/collections/Pages/index.ts
```diff
-    ...slugField(),
+    ...slugField('title', { slugOverrides: { localized: true } }),
```

src/collections/Posts/index.ts
```diff
-    ...slugField(),
+    ...slugField('title', { slugOverrides: { localized: true } }),
```

src/fields/slug/formatSlug.ts
```diff
-    .replace(/ /g, '-')
-    .replace(/[^\w-]+/g, '')
-    .toLowerCase()
+.replace(/[ıİ]/g, 'i')
+.replace(/[öÖ]/g, 'o')
+.replace(/[şŞ]/g, 's')
+.replace(/[ğĞ]/g, 'g')
+.replace(/[üÜ]/g, 'u')
+.replace(/[Çç]/g, 'c')
+.replace(/[~!@#$%^&*()_+=\[\]{};:'"`\\|,<.>/?]/g, '-')
+.replace(/ /g, '-')
+.replace(/[^\w-]+/g, '')
+.replace(/-+/g, '-')
+.toLowerCase()
 
 export const formatSlugHook =
   (fallback: string): FieldHook =>
-  ({ originalDoc, value }) => {
-    return value ? formatSlug(value) : originalDoc.slug
+  ({ data, value, originalDoc, operation }) => {
+    if (operation === 'create' && !value) {
+      const fallbackValue = data?.[fallback] || originalDoc?.[fallback]
+      return fallbackValue ? formatSlug(fallbackValue) : ''
+    }
+    return value ? formatSlug(value) : originalDoc?.slug
   }

```

src/fields/slug/index.ts
```diff
     type: 'text',
     index: true,
     label: 'Slug',
+    localized: true,
     ...(slugOverrides || {}),
     hooks: {
```

src/providers/Theme/ThemeSelector/index.tsx
```diff
 'use client'
 
+import { cn } from '@/utilities/cn'
 import {
   Select,
   SelectContent,
   SelectValue,
 } from '@/components/ui/select'
 import React, { useState } from 'react'
+import { useTranslations } from 'next-intl'
 
 import type { Theme } from './types'
 
 import { useTheme } from '..'
 import { themeLocalStorageKey } from './types'
 
-export const ThemeSelector: React.FC = () => {
+type ThemeSelectorProps = {
+  className?: string
+}
+
+export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
   const { setTheme } = useTheme()
   const [value, setValue] = useState('')
+  const t = useTranslations()
 
   const onThemeChange = (themeToSet: Theme & 'auto') => {
     if (themeToSet === 'auto') {
@@ -35,14 +42,19 @@
 
   return (
     <Select onValueChange={onThemeChange} value={value}>
-      <SelectTrigger className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none">
-        <SelectValue placeholder="Theme" />
-      </SelectTrigger>
-      <SelectContent>
-        <SelectItem value="auto">Auto</SelectItem>
-        <SelectItem value="light">Light</SelectItem>
-        <SelectItem value="dark">Dark</SelectItem>
-      </SelectContent>
-    </Select>
+    <SelectTrigger 
+      className={cn(
+        "w-auto p-0 pl-0 text-sm font-medium text-black bg-transparent border-none dark:text-white",
+        className
+      )}
+    >
+      <SelectValue placeholder="Theme" />
+    </SelectTrigger>
+    <SelectContent>
+      <SelectItem value="auto">{t('auto')}</SelectItem>
+      <SelectItem value="light">{t('light')}</SelectItem>
+      <SelectItem value="dark">{t('dark')}</SelectItem>
+    </SelectContent>
+  </Select>
```

src/components/Logo/Logo.tsx
```diff
- export const Logo = () => {
-   return (
-     /* eslint-disable @next/next/no-img-element */
-     <img
-       alt="Payload Logo"
-       className="max-w-[9.375rem] invert dark:invert-0"
-       src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/src/admin/assets/images/payload-logo-light.svg"
-     />
-   )
- }
+ import clsx from 'clsx'

+ 
+ interface Props {
+   className?: string
+   loading?: 'lazy' | 'eager'
+   priority?: 'auto' | 'high' | 'low'
+ }
+ 
+ export const Logo = (props: Props) => {
+   const { loading: loadingFromProps, priority: priorityFromProps, className } = props
+ 
+   const loading = loadingFromProps || 'lazy'
+   const priority = priorityFromProps || 'low'
+ 
+   return (
+     /* eslint-disable @next/next/no-img-element */
+     <img
+       alt="Payload Logo"
+       width={193}
+       height={34}
+       loading={loading}
+       fetchPriority={priority}
+       decoding="async"
+       className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
+ payload-logo-light.svg"
+     />
+   )
+ }
```

src/components/LocaleSwitcher/index.tsx

```diff
+'use client'
+import React from 'react'
+import { useTransition } from 'react'
+import { useLocale } from 'next-intl'
+import { useParams } from 'next/navigation'
+import { usePathname, useRouter } from '@/i18n/routing'
+import { TypedLocale } from 'payload'
+import localization from '@/i18n/localization'
+import { cn } from '@/utilities/cn'
+import {
+  Select,
+  SelectContent,
+  SelectItem,
+  SelectTrigger,
+  SelectValue,
+} from '@/components/ui/select'
+
+type LocaleSwitcherProps = {
+  className?: string
+}
+
+export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
+  const locale = useLocale()
+  const router = useRouter()
+  const [, startTransition] = useTransition()
+  const pathname = usePathname()
+  const params = useParams()
+
+  async function getTranslatedSlug(currentLocale: string, newLocale: string, collection?: string, slug?: string) {
+    try {
+      if (!slug) return null;
+      
+      // Determine collection type from valid collections
+      const validCollections = ['posts', 'products', 'works', 'pages'];
+      const col = collection && validCollections.includes(collection) ? collection : 'pages';
+
+      // Fetch document ID using current locale
+      const res = await fetch(`/api/${col}?where[slug][equals]=${slug}&locale=${currentLocale}`);
+      const data = await res.json();
+      
+      if (data?.docs?.[0]?.id) {
+        // Fetch translated version
+        const translationRes = await fetch(`/api/${col}/${data.docs[0].id}?locale=${newLocale}`);
+        const translationData = await translationRes.json();
+        return translationData?.slug;
+      }
+    } catch (err) {
+      console.error('Error fetching translation:', err);
+    }
+    return null;
+  }
+
+  async function onSelectChange(newLocale: TypedLocale) {
+    startTransition(async () => {
+      try {
+        const currentPath = pathname.replace(/^\/[a-z]{2}\//, '/'); // Remove existing locale
+        const isHome = currentPath === '/';
+        
+        if (isHome) {
+          router.replace('/', { locale: newLocale });
+          return;
+        }
+
+        // Extract route parts without locale
+        const pathParts = currentPath.split('/').filter(Boolean);
+        const validCollections = ['posts', 'products', 'works'];
+
+        // Handle direct pages (single segment like /test)
+        if (pathParts.length === 1) {
+          const pageSlug = pathParts[0];
+          const translatedSlug = await getTranslatedSlug(locale, newLocale, 'pages', pageSlug);
+          router.replace(`/${translatedSlug || pageSlug}`, { locale: newLocale });
+        }
+        // Handle collection items (two segments like /posts/slug)
+        else if (pathParts.length === 2) {
+          const [collection, slug] = pathParts;
+          if (validCollections.includes(collection)) {
+            const translatedSlug = await getTranslatedSlug(locale, newLocale, collection, slug);
+            router.replace(`/${collection}/${translatedSlug || slug}`, { locale: newLocale });
+          }
+        }
+        // Fallback for other cases
+        else {
+          router.replace(currentPath, { locale: newLocale });
+        }
+      } catch (error) {
+        console.error('Locale switch failed:', error);
+        router.replace(pathname, { locale: newLocale });
+      }
+    });
+  }
+
+  return (
+    <Select onValueChange={onSelectChange} value={locale}>
+      <SelectTrigger 
+        className={cn(
+          "w-auto p-0 pl-0 text-sm font-medium text-black bg-transparent border-none md:ml-9 dark:text-white",
+          className
+        )}
+      >
+        <SelectValue placeholder="Language" />
+      </SelectTrigger>
+      <SelectContent>
+        {localization.locales
+          .sort((a, b) => a.label.localeCompare(b.label))
+          .map((locale) => (
+            <SelectItem value={locale.code} key={locale.code}>
+              {locale.label}
+            </SelectItem>
+          ))}
+      </SelectContent>
+    </Select>
+  )
+}
```

src/globals/Footer/Component.tsx 

```diff
 import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
+import { LocaleSwitcher } from '@/components/LocaleSwitcher'
 import { CMSLink } from '@/components/Link'
 import { TypedLocale } from 'payload'
+import { Logo } from '@/components/Logo/Logo'

...
 
   return (
-    <footer className="border-t border-border bg-black dark:bg-card text-white">
+    <footer className="border-t border-border bg-black dark:bg-card text-white" data-theme="dark">
       <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
         <Link className="flex items-center" href="/">
-          <picture>
-            <img
-              alt="Payload Logo"
-              className="max-w-[6rem] invert-0"
-              src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/src/admin/assets/images/payload-logo-light.svg"
-            />
-          </picture>
+          <Logo className="h-8" />
         </Link>
 
         <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
-          <ThemeSelector />
           <nav className="flex flex-col md:flex-row gap-4">
             {navItems.map(({ link }, i) => {
               return <CMSLink className="text-white" key={i} {...link} />
             })}
           </nav>
+          <LocaleSwitcher className="ml-5" />
+          <ThemeSelector  />
         </div>
       </div>
     </footer>

```

src/globals/Header/Component.client.tsx

```diff
 'use client'
 import { useHeaderTheme } from '@/providers/HeaderTheme'
 import Link from 'next/link'
-import { useParams } from 'next/navigation'
-import React, { useEffect, useState, useTransition } from 'react'

+import React, { useEffect, useState } from 'react'
 import type { Header } from '@/payload-types'
 import { Logo } from '@/components/Logo/Logo'
 import { HeaderNav } from './Nav'
-import { useLocale } from 'next-intl'
-import localization from '@/i18n/localization'
-import {
-  Select,
-  SelectContent,
-  SelectItem,
-  SelectTrigger,
-  SelectValue,
-} from '@/components/ui/select'
-import { TypedLocale } from 'payload'
-import { usePathname, useRouter } from '@/i18n/routing'
+import { usePathname } from '@/i18n/routing'
 
 interface HeaderClientProps {
   header: Header
 }
 
...
 
   return (
     <header
-      className="container relative z-20 py-8 flex justify-end gap-2"
+      className="container relative z-20 flex justify-end gap-2 py-8"
       {...(theme ? { 'data-theme': theme } : {})}
     >
       <Link href="/" className="me-auto">
-        <Logo />
+        <Logo className='invert dark:invert-0' />
       </Link>
-      <LocaleSwitcher />
       <HeaderNav header={header} />
     </header>
-  )
-}
-
-function LocaleSwitcher() {
-  // inspired by https://github.com/amannn/next-intl/blob/main/examples/example-app-router/src/components/LocaleSwitcherSelect.tsx
-  const locale = useLocale()
-  const router = useRouter()
-  const [, startTransition] = useTransition()
-  const pathname = usePathname()
-  const params = useParams()
-
-  function onSelectChange(value: TypedLocale) {
-    startTransition(() => {
-      router.replace(
-        // @ts-expect-error -- TypeScript will validate that only known `params`
-        // are used in combination with a given `pathname`. Since the two will
-        // always match for the current route, we can skip runtime checks.
-        { pathname, params },
-        { locale: value },
-      )
-    })
-  }
-
-  return (
-    <Select onValueChange={onSelectChange} value={locale}>
-      <SelectTrigger className="w-auto text-sm bg-transparent gap-2 pl-0 md:pl-3 border-none">
-        <SelectValue placeholder="Theme" />
-      </SelectTrigger>
-      <SelectContent>
-        {localization.locales
-          .sort((a, b) => a.label.localeCompare(b.label)) // Ordenar por label
-          .map((locale) => (
-            <SelectItem value={locale.code} key={locale.code}>
-              {locale.label}
-            </SelectItem>
-          ))}
-      </SelectContent>
-    </Select>
   )
```

src/globals/Header/Nav/index.tsx

```diff
 import type { Header as HeaderType } from '@/payload-types'
 
+import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
+import { LocaleSwitcher } from '@/components/LocaleSwitcher'

 
   return (
    <nav className="flex gap-3 items-center">
       {navItems.map(({ link }, i) => {
         return <CMSLink key={i} {...link} appearance="link" />
       })}
+      <LocaleSwitcher />
+      <ThemeSelector />
       <Link href="/search">
         <span className="sr-only">{t('search')}</span>
         <SearchIcon className="w-5 text-primary" />

```
