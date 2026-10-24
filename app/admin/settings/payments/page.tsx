import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { savePaymentSettings } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentSettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-black";

const labelClass = "block text-sm font-medium text-neutral-700";

export default async function PaymentSettingsPage({
  searchParams,
}: PaymentSettingsPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [settings, params] = await Promise.all([
    prisma.paymentSettings.findUnique({
      where: { id: 1 },
    }),
    searchParams,
  ]);

  const revolutSlots = [
    settings?.revolutInstruction1 ?? "",
    settings?.revolutInstruction2 ?? "",
    settings?.revolutInstruction3 ?? "",
    settings?.revolutInstruction4 ?? "",
    settings?.revolutInstruction5 ?? "",
  ];
  const paypalSlots = [
    settings?.paypalInstruction1 ?? "",
    settings?.paypalInstruction2 ?? "",
    settings?.paypalInstruction3 ?? "",
    settings?.paypalInstruction4 ?? "",
    settings?.paypalInstruction5 ?? "",
  ];
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </Link>

          <Link
            href="/admin"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-black"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
          Platform configuration
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Payment settings
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-neutral-500">
          Manage the payment methods and instructions displayed to buyers
          during checkout. Changes apply to future orders.
        </p>

        {params.saved === "1" && (
          <div className="mt-7 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Payment settings saved successfully.
          </div>
        )}

        {params.error === "too-long" && (
          <div
            role="alert"
            className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Payment instructions must not exceed 5,000 characters per method.
          </div>
        )}

        {params.error === "no-methods" && (
          <div
            role="alert"
            className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            At least one payment method must remain enabled.
          </div>
        )}

        <form action={savePaymentSettings} className="mt-9 space-y-6">
          {/* Bank transfer */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                  Method 01
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Bank Transfer
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Add the account details and transfer reference instructions
                  buyers should follow.
                </p>
              </div>

              <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="bankTransferEnabled"
                  defaultChecked={settings?.bankTransferEnabled ?? true}
                  className="size-4 accent-black"
                />
                Enabled
              </label>
            </div>

            <label className={`${labelClass} mt-6`}>
              Bank transfer instructions
              <textarea
                name="bankTransferInstructions"
                rows={6}
                maxLength={5000}
                defaultValue={settings?.bankTransferInstructions ?? ""}
                className={inputClass}
                placeholder={"Bank: Your bank name\nAccount holder: Your business name\nIBAN: Your IBAN\nBIC/SWIFT: Your BIC\nReference: Use the order number shown at checkout"}
              />
            </label>
          </section>

          {/* Revolut */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                  Method 02
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Revolut
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Add your Revolut payment link or account details and
                  instructions for the buyer.
                </p>
              </div>

              <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="revolutEnabled"
                  defaultChecked={settings?.revolutEnabled ?? true}
                  className="size-4 accent-black"
                />
                Enabled
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium">Upcoming orders — slots are used in order</p>
              {revolutSlots.map((value, index) => (
                <label key={index} className={labelClass}>
                  Revolut slot {index + 1}
                  <textarea
                    name={`revolutInstruction${index + 1}`}
                    rows={3}
                    maxLength={5000}
                    defaultValue={value}
                    className={inputClass}
                    placeholder="Payment link or account details and buyer instructions"
                  />
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="resetRevolutQueue" className="size-4 accent-black" />
                Reset queue to slot 1 after saving
              </label>
            </div>
          </section>

          {/* PayPal */}          <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                  Method 03
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  PayPal
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Add your PayPal address or payment link with instructions
                  for completing the payment.
                </p>
              </div>

              <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="paypalEnabled"
                  defaultChecked={settings?.paypalEnabled ?? true}
                  className="size-4 accent-black"
                />
                Enabled
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium">Upcoming orders — slots are used in order</p>
              {paypalSlots.map((value, index) => (
                <label key={index} className={labelClass}>
                  PayPal slot {index + 1}
                  <textarea
                    name={`paypalInstruction${index + 1}`}
                    rows={3}
                    maxLength={5000}
                    defaultValue={value}
                    className={inputClass}
                    placeholder="Payment link or account email and buyer instructions"
                  />
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="resetPaypalQueue" className="size-4 accent-black" />
                Reset queue to slot 1 after saving
              </label>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center">
            <p className="max-w-xl text-xs leading-5 text-neutral-500">
              Only enter payment details you intend to share with buyers.
              Never include account passwords, PINs or security codes.
            </p>

            <button
              type="submit"
              className="rounded-lg bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Save payment settings
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}