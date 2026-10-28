import React from 'react';
import Link from 'next/link';

export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy &amp; Personal Data Protection
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: October 28, 2026 • Compliance with Personal Data Protection Law (UU No. 27 of 2022)
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-foreground space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">1. UU PDP No. 27/2022 Compliance Commitment</h2>
          <p className="text-muted-foreground">
            Tagiva is dedicated to safeguarding user privacy and personal data integrity in strict adherence
            to the Law of the Republic of Indonesia Number 27 of 2022 on Personal Data Protection (UU PDP).
            This Privacy Policy explains how we collect, process, store, and protect your information when
            accessing tagiva.com and associated invoicing tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">2. Personal Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
            <li>
              <strong>Account Information (Google OAuth):</strong> Full name, verified email address,
              profile picture, and unique Google ID provided during PKCE sign-in.
            </li>
            <li>
              <strong>Business Profile Information:</strong> Business name, business address, phone/WhatsApp number,
              and banking/transfer payment instructions entered voluntarily.
            </li>
            <li>
              <strong>Client &amp; Transaction Details:</strong> Client names, client addresses, client email addresses,
              invoice line items, monetary amounts, and payment notes.
            </li>
            <li>
              <strong>Media Assets:</strong> Business logos uploaded for placement on invoices (validated via file magic-bytes).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">3. Legal Basis &amp; Processing Purposes</h2>
          <p className="text-muted-foreground">
            We process your personal and business data solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
            <li>Deliver automated invoice generation, tax computation, and PDF export functionality.</li>
            <li>Generate secure, cryptographically random public tokens (/i/[token]) for client invoice review.</li>
            <li>Send invoice delivery emails and due-date notifications upon your request.</li>
            <li>Process subscription billing securely via licensed payment gateways.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">4. Data Security &amp; Cloud Storage</h2>
          <p className="text-muted-foreground">
            Your data is hosted in high-security cloud facilities with end-to-end encryption in transit (TLS 1.3)
            and at rest (AES-256). Database records are guarded by strict PostgreSQL Row Level Security (RLS)
            policies, ensuring invoice records can only ever be accessed or updated by their authenticated owner.
          </p>
        </section>

        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-3 text-foreground">
            5. Data Subject Rights &amp; Account Deletion Procedure (UU PDP)
          </h2>
          <p className="text-muted-foreground mb-4">
            Under UU PDP No. 27/2022, you possess enforceable rights to access, rectify, restrict processing,
            and demand permanent erasure (right to erasure) of all your personal data.
          </p>
          <div className="bg-background rounded-lg p-5 border border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              How to Submit a Permanent Account &amp; Data Deletion Request:
            </h3>
            <p className="text-sm text-muted-foreground">
              Send an email request to{' '}
              <a href="mailto:support@tagiva.com" className="text-primary font-bold underline">
                support@tagiva.com
              </a>{' '}
              from the <strong>Google email address registered to your Tagiva account</strong> with the subject line:{' '}
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono font-semibold">
                Request for Personal Data Deletion - [Your Email]
              </code>.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>72-Hour Resolution Guarantee (SLA):</strong> The Tagiva data protection team will verify
              your identity and permanently purge all account records, business profiles, client entries, invoices,
              and uploaded logo assets from our active database systems within <strong>72 hours (3 business days)</strong>,
              followed by an official written confirmation email.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">6. Cookies &amp; Tracking Policy</h2>
          <p className="text-muted-foreground">
            Tagiva utilizes strictly essential session cookies required for authentication and account protection.
            We do not deploy third-party advertising cookies, cross-domain behavioral trackers, or device fingerprinting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">7. Data Protection Officer Contact</h2>
          <p className="text-muted-foreground">
            If you have questions regarding this privacy policy or wish to exercise your data rights, please contact:
          </p>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p><strong>Tagiva Data Protection Support</strong></p>
            <p>
              Email:{' '}
              <a href="mailto:support@tagiva.com" className="text-primary underline">
                support@tagiva.com
              </a>
            </p>
            <p>
              Website:{' '}
              <Link href="/" className="text-primary underline">
                https://tagiva.com
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
