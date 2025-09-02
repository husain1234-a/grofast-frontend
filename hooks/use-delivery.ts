"use client"

import useSWR from "swr"
import { deliveryApi, type DeliveryPartnerResponse } from "@/lib/api-client"
import type { GeneratedComponentType } from "@/lib/openapi-client"

export function useDeliveryMe() {
  const swr = useSWR<GeneratedComponentType<DeliveryPartnerResponse>>("/delivery/me", () => deliveryApi.me())
  return swr
}

export async function setAvailability(
  is_available: boolean,
  current_location?: { latitude?: number; longitude?: number },
) {
  const res = await deliveryApi.updateStatus({ is_available, current_location })
  return res
}

export async function postCurrentLocation(lat: number, lng: number, order_id?: number) {
  return deliveryApi.sendLocation({ latitude: lat, longitude: lng, order_id })
}
