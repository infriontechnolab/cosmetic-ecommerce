import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — MAISON',
  description: 'Read our Terms of Service before using the MAISON platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[900px] mx-auto px-6 py-16">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-6">
          <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Terms of Service
        </div>
        <h1 className="text-[clamp(32px,4vw,56px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">
          Terms of <span className="text-acid">Service</span>
        </h1>
        <p className="text-chalk-3 text-sm mb-10">Last updated: March 2026</p>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">1. Acceptance of Terms</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              By accessing or using the MAISON platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services. Your continued use of the platform following any updates to these terms constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">2. Use of the Platform</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              The MAISON platform is intended solely for personal, non-commercial use by end consumers. You may not use automated tools, bots, or scrapers to extract data from the platform, nor may you attempt to reverse-engineer, decompile, or disassemble any part of our software. Any fraudulent activity, including the use of stolen payment credentials or the creation of fake accounts, is strictly prohibited and may result in immediate termination of access and referral to law enforcement.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">3. Account &amp; Registration</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              When creating an account on MAISON, you must provide accurate, current, and complete information as prompted by the registration form. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. MAISON reserves the right to suspend or terminate any account that violates these terms or is involved in suspicious activity, with or without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">4. Orders, Pricing &amp; Payment</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              All prices displayed on the platform are in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. MAISON reserves the right to refuse or cancel any order that appears to be fraudulent, involves pricing errors, or violates our policies. Payments are processed securely through Razorpay, and MAISON does not store your full card details on its servers. Order confirmation is subject to successful payment verification and product availability.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">5. Shipping &amp; Delivery</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              Delivery timelines provided at checkout are estimates only and may vary depending on your location and courier availability. MAISON is not liable for delays caused by third-party logistics providers, weather events, or other circumstances beyond our control. Risk of loss and title for items purchased pass to you upon delivery to the shipping address provided at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">6. Returns &amp; Refunds</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              Returns are accepted within 7 days of delivery for eligible items, provided the product is unopened, unused, and in its original packaging. Defective or damaged products may be returned regardless of whether they have been opened. Refunds for approved returns are processed within 5&ndash;7 business days to the original payment method. Certain categories such as sale items and personalised products may be excluded from our return policy.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">7. Intellectual Property</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              All content on the MAISON platform&mdash;including text, graphics, logos, images, product descriptions, and software&mdash;is the property of MAISON or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on this platform without prior written permission from MAISON.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">8. Disclaimers &amp; Limitation of Liability</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              The MAISON platform and all products sold through it are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. MAISON shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform. In no event shall MAISON&apos;s total liability to you exceed the amount paid by you for the specific order giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">9. Governing Law</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and its amendments. Any disputes arising out of or relating to these terms or the use of the platform shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">10. Changes to Terms</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              MAISON reserves the right to update or modify these Terms of Service at any time without prior individual notice. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. It is your responsibility to review these terms periodically, and your continued use of the platform after any modifications constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-chalk font-display mb-3">11. Contact</h2>
            <p className="text-chalk-2 text-sm leading-relaxed">
              If you have any questions or concerns about these Terms of Service, please reach out to us at{' '}
              <a href="mailto:maison-support@example.com" className="text-acid hover:underline">maison-support@example.com</a>{' '}
              or visit our <Link href="/contact" className="text-acid hover:underline">Contact page</Link>. We aim to respond to all inquiries within 24 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
