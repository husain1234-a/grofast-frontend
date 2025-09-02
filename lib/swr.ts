"use client"

import useSWR, { type SWRConfiguration, mutate } from "swr"

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: true,
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json())

export { useSWR as useSWRBase, mutate }
