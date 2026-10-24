import Link from "next/link";

const faqs = [
  ["How do I buy a ticket?", "Open an event listing, check the event and ticket details, and follow checkout. Review the total price before confirming."],
  ["What is the buyer service fee?", "TicketBase charges a 1% buyer service fee. The fee and total amount should be displayed before you confirm your purchase."],
  ["How are tickets transferred?", "The seller must transfer the ticket using the method described in the listing or order instructions. You may need an account with the original ticket provider."],
  ["When should I confirm receipt?", "Check that you can access the ticket before confirming receipt. If the transfer is incomplete, contact support instead."],
  ["What if the seller does not transfer my ticket?", "Under the current TicketBase draft terms, if the seller fails to transfer the ticket within 24 hours, the buyer is entitled to a full refund including the 1% buyer service fee, subject to applicable law."],
  ["When does the seller receive payment?", "The intended process is to arrange payout after successful ticket transfer and buyer confirmation. Processing may depend on the payment method and necessary checks."],
  ["How can I contact support?", "Email info@ticketbase.org. For order issues, include your order number. Never send passwords or payment-card security codes."]
];

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 text-white sm:px-8 sm:py-20">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Support</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Help &amp; FAQ</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">Answers to common questions about buying tickets, transfers, payments and orders.</p>
      <div className="mt-12 space-y-4">
        {faqs.map(([question, answer]) => (
          <section key={question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <h2 className="text-lg font-semibold sm:text-xl">{question}</h2>
            <p className="mt-3 leading-7 text-white/65">{answer}</p>
          </section>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-blue-300/20 bg-[#153D60] p-7 sm:p-9">
        <h2 className="text-2xl font-semibold">Still need help?</h2>
        <p className="mt-3 leading-7 text-white/75">Email info@ticketbase.org with your question and order details if applicable.</p>
        <a href="mailto:info@ticketbase.org" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-[#153D60] hover:bg-blue-100">Contact support</a>
        <p className="mt-5 text-sm text-white/60">Read our <Link className="underline" href="/terms">Terms and Conditions</Link> and <Link className="underline" href="/privacy">Privacy Policy</Link>.</p>
      </section>
    </main>
  );
}
