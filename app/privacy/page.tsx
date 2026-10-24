const sections = [
  {
    title: "1. Who we are",
    paragraphs: [
      "This Privacy Policy explains how TicketBase handles personal data when you use the website, create an account, list tickets, place an order or contact us.",
      "TicketBase is operated by Ticket House Ltd, registered in Citywest, Co. Dublin, Ireland. CRO number: 465530. Contact: info@ticketbase.org. Ticket House Ltd is responsible for personal data processed for the purposes described in this policy, subject to applicable data protection law."
    ]
  },
  {
    title: "2. Personal data we may collect",
    paragraphs: [
      "Depending on how you use TicketBase, we may process account details such as your name, email address and account identifiers; listing information; order and transaction details; buyer and seller communications; and information needed to investigate disputes or suspected fraud.",
      "We may also process technical information such as IP address, browser and device details, security logs and website usage data where these are collected by the services actually used on the website.",
      "Payment details may be processed by the payment service used for a transaction. The precise payment information visible to TicketBase depends on the payment method and system configuration. We do not intend to collect special category data for ordinary ticket transactions."
    ]
  },
  {
    title: "3. Why we use personal data",
    paragraphs: [
      "We use personal data where necessary to create and administer accounts, publish listings, process orders, facilitate ticket transfers, coordinate refunds and payouts, respond to enquiries, protect the platform and comply with legal obligations.",
      "Depending on the purpose, our legal basis may be performance of a contract, compliance with a legal obligation, our legitimate interests in operating and securing the platform, or consent where consent is required. Where we rely on legitimate interests, we consider the impact on your rights and interests."
    ]
  },
  {
    title: "4. Information shared between buyers and sellers",
    paragraphs: [
      "To complete a transaction, a buyer and seller may need to receive relevant information from one another, such as a name, contact detail or ticketing-account information required for the ticket transfer.",
      "Users should provide only information necessary for the transaction and should not use another user's information for unrelated purposes, marketing or harassment."
    ]
  },
  {
    title: "5. Service providers and other recipients",
    paragraphs: [
      "We may share personal data with service providers that support the operation of TicketBase, such as hosting, security, communications, customer support, payment processing and technical services, but only where relevant to the service and subject to appropriate safeguards.",
      "We may also disclose information where required by law, to competent authorities, to protect users or the platform, or in connection with a business restructuring where legally permitted.",
      "The specific providers used by TicketBase must be identified and verified before this policy is published. This policy does not imply that any particular provider is currently used."
    ]
  },
  {
    title: "6. International transfers",
    paragraphs: [
      "If personal data is transferred outside the European Economic Area, we will do so in accordance with applicable data protection law and use an appropriate transfer mechanism where required, such as an adequacy decision or approved contractual safeguards.",
      "The actual countries and transfer mechanisms depend on the providers and systems configured for TicketBase and must be verified before publication."
    ]
  },
  {
    title: "7. How long we keep personal data",
    paragraphs: [
      "We retain personal data only for as long as reasonably necessary for the purposes described in this policy, including account administration, transaction records, customer support, dispute handling, security and legal compliance.",
      "Retention periods vary by data type and legal requirements. We may retain certain transaction or accounting records for periods required by law, while deleting or anonymising data that is no longer needed.",
      "TicketBase must establish and document actual retention periods for account records, transaction records, support communications, technical logs and any verification records before this policy is published."
    ]
  },
  {
    title: "8. Closing your account",
    paragraphs: [
      "You may contact us to request account closure or deletion of personal data. We may need to retain certain information where required by law, for legitimate record-keeping, to resolve disputes or to establish, exercise or defend legal claims.",
      "Closing an account does not automatically erase transaction records that we are legally required or otherwise permitted to retain."
    ]
  },
  {
    title: "9. Your data protection rights",
    paragraphs: [
      "Subject to the conditions and exceptions in applicable law, you may have the right to access your personal data, correct inaccurate data, request erasure, restrict processing, object to certain processing, receive data in a portable format, and withdraw consent where processing is based on consent.",
      "To exercise a right, contact info@ticketbase.org. We may need to verify your identity before responding. You also have the right to complain to the relevant data protection supervisory authority."
    ]
  },
  {
    title: "10. Cookies and analytics",
    paragraphs: [
      "TicketBase may use strictly necessary cookies or similar technologies to operate the website, maintain security and remember essential settings. Any analytics, advertising or other non-essential technologies must be disclosed and configured in accordance with applicable consent requirements.",
      "The actual cookies, analytics tools and consent controls used on the website must be audited before this policy is published. Do not assume that a particular analytics provider is used unless it has been verified."
    ]
  },
  {
    title: "11. Security",
    paragraphs: [
      "We take appropriate technical and organisational measures intended to protect personal data against unauthorised access, loss, misuse or alteration.",
      "No website or transmission method can be guaranteed to be completely secure. Users should keep their account credentials confidential and contact us promptly if they suspect unauthorised access."
    ]
  },
  {
    title: "12. Age requirements",
    paragraphs: [
      "TicketBase is intended for adults aged 18 or over. We do not knowingly seek to provide accounts to children under 18. If you believe a child has provided personal data to us, contact info@ticketbase.org."
    ]
  },
  {
    title: "13. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy to reflect changes to TicketBase, our data processing practices or legal requirements. The latest version will be published on this page. Where required by law, we will provide additional notice or seek consent."
    ]
  },
  {
    title: "14. Complaints",
    paragraphs: [
      "If you have a concern about how your personal data is handled, please contact us first at info@ticketbase.org so we can review it.",
      "You may also lodge a complaint with the Irish Data Protection Commission. Information is available at https://www.dataprotection.ie/."
    ]
  },
  {
    title: "15. Contact",
    paragraphs: [
      "For privacy questions or to exercise your data protection rights, contact info@ticketbase.org.",
      "Ticket House Ltd, Citywest, Co. Dublin, Ireland. CRO number: 465530."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 text-white sm:px-8 sm:py-16">
      <div className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">TicketBase</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 max-w-3xl leading-7 text-white/65">
          This draft must be checked against TicketBase&apos;s actual providers, cookies, data flows and retention periods before publication.
        </p>
      </div>
      <div className="space-y-9">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-4xl whitespace-pre-line leading-7 text-white/75">
                {paragraph.startsWith("https://") ? (
                  <a href={paragraph} target="_blank" rel="noreferrer" className="text-blue-300 underline underline-offset-4 hover:text-white">{paragraph}</a>
                ) : paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
