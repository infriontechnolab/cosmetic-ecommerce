import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — MAISON',
  description: 'Learn how MAISON collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[900px] mx-auto px-6 py-16">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-6">
          <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Privacy Policy
        </div>
        <h1 className="text-[clamp(32px,4vw,56px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">
          Privacy <span className="text-acid">Policy</span>
        </h1>
        <p className="text-chalk-3 text-sm mb-10">Last updated: March 2026</p>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">1. What Data We Collect</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              When you use the MAISON platform, we collect personal information such as your name, email address, phone number, and shipping address. We also collect payment metadata through our payment processor Razorpay, though we never store your full card details on our servers. Additionally, we may collect browsing behaviour, order history, and device information to improve your shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">2. How We Use Your Data</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              We use your personal data to fulfil and deliver orders, manage your account, and provide customer support. With your consent, we may send you marketing emails about new arrivals, promotions, and personalised recommendations&mdash;you can opt out at any time via the unsubscribe link in any email. We also use data for fraud prevention, security monitoring, and aggregated analytics to improve our platform and product offerings.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">3. Cookies &amp; Tracking</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              MAISON uses session cookies to keep you logged in and preference cookies to remember your settings such as currency and language. We may also use analytics cookies to understand how visitors interact with our platform, helping us improve navigation and content. You can disable cookies through your browser settings, though this may affect certain features of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">4. Data Sharing</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              MAISON does not sell, rent, or trade your personal data to third parties for marketing purposes. We share data only with trusted service providers who assist in operating our platform, including Razorpay for payment processing and logistics partners for order delivery. Any third-party service providers are bound by non-disclosure agreements and are permitted to use your data solely for the purposes of fulfilling their services to MAISON. Aggregated, anonymised data may be used for analytics and reporting.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">5. Data Retention</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              Your account data is retained for the duration of your active account and for a period of 2 years following account closure, after which it is permanently deleted. Order and transaction records are retained for 7 years in compliance with applicable tax and legal requirements under Indian law. You may request early deletion of your account data at any time, subject to our legal retention obligations.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">6. Your Rights</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              You have the right to access, correct, or request deletion of your personal data held by MAISON at any time. To exercise these rights, please email us at{' '}
              <a href="mailto:maison-support@example.com" className="text-acid hover:underline">maison-support@example.com</a>{' '}
              with your request and account details. We will respond to all data-related requests within 30 days of receipt.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">7. Security</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              We employ industry-standard security measures to protect your personal data, including TLS encryption for all data transmitted between your browser and our servers. Passwords are hashed using bcrypt and are never stored in plain text. We conduct regular security audits and vulnerability assessments to ensure the ongoing integrity and confidentiality of your information.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              The MAISON platform is not intended for use by individuals under the age of 18. We do not knowingly collect or solicit personal data from minors. If we become aware that we have inadvertently collected data from a user under 18, we will take prompt steps to delete that information from our records.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">9. Changes to This Policy</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              MAISON may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any updates will be posted on this page with a revised &ldquo;Last updated&rdquo; date. Your continued use of the platform after such changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">10. Contact / Data Controller</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              MAISON acts as the data controller for personal data collected through this platform. For any privacy-related questions, data access requests, or concerns, please contact us at{' '}
              <a href="mailto:maison-support@example.com" className="text-acid hover:underline">maison-support@example.com</a>{' '}
              or visit our <Link href="/contact" className="text-acid hover:underline">Contact page</Link>. We are committed to resolving any privacy concerns promptly and transparently.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
