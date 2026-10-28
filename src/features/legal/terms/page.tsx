import React from 'react';

export function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: October 28, 2026 • Effective for all Tagiva users
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-foreground space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By registering for, accessing, or using the Tagiva service (provided through tagiva.com),
            you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
            If you do not agree to these terms, you are not authorized to access or use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground">
            Tagiva is a cloud-based software-as-a-service (SaaS) platform engineered for freelancers,
            independent professionals, and boutique agencies in Indonesia to create, download, send,
            and track professional digital invoices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">3. User Accounts &amp; Security</h2>
          <p className="text-muted-foreground">
            To use Tagiva, you must authenticate through your verified Google account via Google OAuth.
            You are entirely responsible for safeguarding your credentials and for all actions and transactions
            conducted under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">4. Plans, Quotas &amp; Payments</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
            <li>
              <strong>Free Starter Plan:</strong> Provides storage for up to 3 saved invoices in total.
              Deleting an unissued Draft invoice restores 1 slot. Invoices in Sent, Overdue, or Paid status
              cannot be deleted on the Free plan to maintain sequential financial audit integrity.
            </li>
            <li>
              <strong>Pro Plan:</strong> Unlocks unlimited invoice creation, removes platform watermarks,
              enables business logo uploads, and permits direct in-app email delivery.
            </li>
            <li>
              <strong>Payments:</strong> All transactions are processed through licensed payment gateways
              operating in Indonesia. Subscription fees are non-refundable unless mandated by applicable consumer protection laws.
            </li>
            <li>
              <strong>Lapsed Account Status:</strong> If a Pro subscription expires, the account transitions to
              Lapsed status. Existing invoices and client links remain safe and viewable, but creating new invoices
              is subject to the Free plan 3-invoice total cap.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">5. Data Ownership &amp; Intellectual Property</h2>
          <p className="text-muted-foreground">
            You retain exclusive ownership and intellectual property rights over all business profiles, client information,
            and transaction line items entered into Tagiva. Tagiva does not sell, rent, or license your proprietary
            commercial data to any third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            Tagiva is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Tagiva is not a bank,
            accounting firm, or registered tax advisory service. You remain solely responsible for tax reporting,
            rate accuracy, and the legal compliance of your business transactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">7. Contact Us</h2>
          <p className="text-muted-foreground">
            For inquiries, support, or legal clarifications regarding these terms, please contact our team at{' '}
            <a href="mailto:support@tagiva.com" className="text-primary font-medium underline">
              support@tagiva.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
