import React from 'react';
import {
  CreditCard,
  ReceiptText,
  Share2,
  Zap,
  TrendingUp,
  CheckCircle2,
  Link2,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';

const VALUE_PROPOSITIONS = [
  {
    title: 'Get Paid Faster',
    description:
      'Professional invoices that get paid up to 3x faster with direct QRIS & BCA/Mandiri payment instructions.',
    icon: CreditCard,
    topBorder: 'border-t-[#2563eb]',
    iconWrapper: 'bg-[#dbe1ff]/60 text-[#004ac6]',
    tagIcon: TrendingUp,
    tagColor: 'text-[#004ac6]',
    tagText: 'Less follow-up stress',
  },
  {
    title: '100% Tax & Legal Compliant',
    description:
      'Auto-calculated 11% PPN with standardized formatting ready for your clients’ finance teams.',
    icon: ReceiptText,
    topBorder: 'border-t-[#3d7c00]',
    iconWrapper: 'bg-[#acf774]/30 text-[#2e6100]',
    tagIcon: CheckCircle2,
    tagColor: 'text-[#2e6100]',
    tagText: 'Finance-team approved',
  },
  {
    title: 'Shareable Links & Instant PDF',
    description:
      'Send clean, branded web links or download crisp A4 PDFs in one click. No clunky email attachments needed.',
    icon: Share2,
    topBorder: 'border-t-[#565e74]',
    iconWrapper: 'bg-[#dae2fd] text-[#5c647a]',
    tagIcon: Link2,
    tagColor: 'text-[#004ac6]',
    tagText: 'One-tap WhatsApp ready',
  },
  {
    title: 'Zero Setup Headache',
    description:
      'Create invoices in seconds without complicated accounting software. Start directly right in your browser.',
    icon: Zap,
    topBorder: 'border-t-[#0b1c30]',
    iconWrapper: 'bg-[#e5eeff] text-[#0b1c30]',
    tagIcon: Sparkles,
    tagColor: 'text-[#434655]',
    tagText: 'Ready in under 60 seconds',
  },
];

export function FeaturesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="features">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-3">
          <BadgeCheck className="size-4" aria-hidden="true" />
          <span>Built for Indonesia&apos;s Modern Workforce</span>
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight">
          Why Freelancers &amp; Agencies Choose Tagiva
        </h2>
        <p className="mt-3 text-base text-[#434655] leading-relaxed max-w-2xl mx-auto">
          Everything you need to invoice clients with absolute confidence, look like an enterprise studio, and collect payments on schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUE_PROPOSITIONS.map((prop, idx) => {
          const Icon = prop.icon;
          const TagIcon = prop.tagIcon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white border-t-2 ${prop.topBorder} border-x border-b border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${prop.iconWrapper}`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30] mb-2">
                  {prop.title}
                </h3>
                <p className="text-sm text-[#434655] leading-relaxed">
                  {prop.description}
                </p>
              </div>

              <div
                className={`mt-6 pt-3 border-t border-[#e5eeff] flex items-center gap-1.5 text-xs font-semibold ${prop.tagColor}`}
              >
                <TagIcon className="size-4" aria-hidden="true" />
                <span>{prop.tagText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
