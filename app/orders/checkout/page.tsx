"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/api-client"
import { useRouter } from "next/navigation"

const schema = z.object({
  delivery_address: z
    .string()
    .min(10, "Please enter a valid address")
    .max(200)
    .regex(/^[a-zA-Z0-9\s,.-]+$/),
  delivery_time_slot: z.enum(["9-11", "11-13", "13-15", "15-17", "17-19", "19-21"]),
  payment_method: z.enum(["cash", "card", "upi", "wallet"]),
  special_instructions: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

export default function CheckoutPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      delivery_time_slot: "15-17",
      payment_method: "card",
    },
  })

  const onSubmit = async (values: FormValues) => {
    const order = await api.createOrder(values)
    router.push(`/orders/${order.id}`)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery address</label>
          <textarea
            {...register("delivery_address")}
            rows={3}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="123 Main St, Apt 4B, City, State 12345"
          />
          {formState.errors.delivery_address && (
            <p className="text-sm text-red-600 mt-1">{formState.errors.delivery_address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time slot</label>
            <select {...register("delivery_time_slot")} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
              {["9-11", "11-13", "13-15", "15-17", "17-19", "19-21"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment method</label>
            <select {...register("payment_method")} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
              {["cash", "card", "upi", "wallet"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Special instructions</label>
          <input
            {...register("special_instructions")}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Ring doorbell twice"
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="rounded-md bg-green-600 text-white px-4 py-2 text-sm">
            Place order
          </button>
          {formState.isSubmitting && <span className="text-sm text-gray-600">Submitting...</span>}
        </div>
      </form>
    </main>
  )
}
