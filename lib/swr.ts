"use client"

import useSWR, { type SWRConfiguration, mutate } from "swr"

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
  dedupingInterval: 10000, // 10 seconds
  focusThrottleInterval: 30000, // 30 seconds
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json())

export { useSWR as useSWRBase, mutate }
