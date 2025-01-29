import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
.replace(/[ıİ]/g, 'i')
.replace(/[öÖ]/g, 'o')
.replace(/[şŞ]/g, 's')
.replace(/[ğĞ]/g, 'g')
.replace(/[üÜ]/g, 'u')
.replace(/[Çç]/g, 'c')
.replace(/[~!@#$%^&*()_+=\[\]{};:'"`\\|,<.>/?]/g, '-')
.replace(/ /g, '-')
.replace(/[^\w-]+/g, '')
.replace(/-+/g, '-')
.toLowerCase()

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, value, originalDoc, operation }) => {
    if (operation === 'create' && !value) {
      const fallbackValue = data?.[fallback] || originalDoc?.[fallback]
      return fallbackValue ? formatSlug(fallbackValue) : ''
    }
    return value ? formatSlug(value) : originalDoc?.slug
  }
