import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createIsomorphicFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import type { ClassValue } from 'clsx'

// format a DateValue (CalendarDate/ZonedDateTime) to "DD Mon YYYY"

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const getFlashCookie = createIsomorphicFn()
  .server(() => {
    const toastCookie = getCookie('toast')

    if (!toastCookie) return null

    const toastContents = JSON.parse(toastCookie) as {
      intent: 'success' | 'error' | 'info' | 'warning'
      message: string
      description?: string
    }

    deleteCookie('toast')

    return toastContents
  })
  .client(() => {
    const toastCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('toast='))
      ?.split('=')[1]

    if (!toastCookie) return null

    const toastContents = JSON.parse(decodeURIComponent(toastCookie)) as {
      intent: 'success' | 'error' | 'info' | 'warning'
      message: string
      description?: string
    }

    // Remove the cookie by setting it to expire in the past
    document.cookie = 'toast=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    return toastContents
  })

export const setFlashCookie = createIsomorphicFn()
  .server(
    (data: {
      intent: 'success' | 'error' | 'info' | 'warning'
      message: string
      description?: string
    }) => {
      setCookie('toast', JSON.stringify(data), {
        httpOnly: false,
        maxAge: 60, // 60 seconds
      })
    },
  )
  .client(
    (data: {
      intent: 'success' | 'error' | 'info' | 'warning'
      message: string
      description?: string
    }) => {
      document.cookie = `toast=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${60 * 5}`
    },
  )

export const getSidebarState = createIsomorphicFn()
  .server(() => {
    
    const sidebarState = getCookie('sidebar_state')
    
    if (!sidebarState) return false
    return JSON.parse(sidebarState)
  })
  .client(() => {
    const sidebarState = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar_state='))
      ?.split('=')[1]
    if (!sidebarState) return false
    return JSON.parse(decodeURIComponent(sidebarState)) 
  })

export const getNameInitials = (name: string) => {
  const names = name.trim().split(/\s+/).filter(Boolean)

  if (names.length === 0) {
    return ''
  }

  if (names.length > 1) {
    const firstInitial = names[0].charAt(0)
    const lastInitial = names[names.length - 1].charAt(0)
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  return names[0].slice(0, 2).toUpperCase()
}

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount / 100)
}

/**
 * Capitalizes the first letter of each field name in a comma-separated string.
 * Example: "name, price, description" => "Name, Price, Description"
 */
export const capitalizeFields = (fields: string) => {
  if (!fields) return ''
  return fields
    .split(',')
    .map((f) => {
      const trimmed = f.trim()
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    })
    .join(', ')
}

/**
 * Converts a comma-separated string of field names to sentence case for each field.
 * Example: "categoryId, stockCount" => "Category id, Stock count"
 */
export function toSentenceCaseFields(fields: string): string {
  if (!fields) return ''
  return fields
    .split(',')
    .map((f) => {
      let str = f.trim()
      str = str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Za-z])([0-9])/g, '$1 $2')
        .replace(/([0-9])([A-Za-z])/g, '$1 $2')
        .replace(/^./, (s) => s.toUpperCase())
        .trim()
      return str
    })
    .join(', ')
}
