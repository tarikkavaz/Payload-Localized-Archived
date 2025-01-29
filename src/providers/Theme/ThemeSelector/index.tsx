'use client'

import { cn } from '@/utilities/cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

type ThemeSelectorProps = {
  className?: string
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')
  const t = useTranslations()

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'auto')
  }, [])

  return (
    <Select onValueChange={onThemeChange} value={value}>
    <SelectTrigger 
      className={cn(
        "w-auto p-0 pl-0 text-sm font-medium text-black bg-transparent border-none dark:text-white",
        className
      )}
    >
      <SelectValue placeholder="Theme" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="auto">{t('auto')}</SelectItem>
      <SelectItem value="light">{t('light')}</SelectItem>
      <SelectItem value="dark">{t('dark')}</SelectItem>
    </SelectContent>
  </Select>
  )
}