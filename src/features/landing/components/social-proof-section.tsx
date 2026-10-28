import React from 'react';
import { Star } from 'lucide-react';

const METRICS = [
  {
    value: 'Rp 4.2M+',
    title: 'Invoiced Across Indonesia',
    subtitle: 'Processed smoothly without rejected templates',
    valueColor: 'text-[#004ac6]',
  },
  {
    value: '1,200+',
    title: 'Freelancers & Boutique Agencies',
    subtitle: 'From Jakarta, Bandung, Surabaya, to Bali',
    valueColor: 'text-[#004ac6]',
  },
  {
    value: '99.8%',
    title: 'On-Time Client Payments',
    subtitle: 'Driven by clear Indonesian banking instructions',
    valueColor: 'text-[#2e6100]',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Corporate clients in Jakarta used to delay my payments because my old Canva invoices lacked standard PPN 11% line breakdowns. With Tagiva, corporate finance departments approve and disburse within 48 hours.',
    name: 'Raditya Wicaksono',
    role: 'Senior Product Designer • Jakarta Selatan',
    initials: 'RW',
    avatarBg: 'bg-[#dbe1ff] text-[#004ac6]',
  },
  {
    quote:
      'Sending clients an interactive invoice link via WhatsApp where they see the BCA account number and total due is pure gold. It feels as premium as a multimillion-rupiah agency platform without any setup.',
    name: 'Stephanie Putri',
    role: 'Founder, Sinar Studio • Bandung',
    initials: 'SP',
    avatarBg: 'bg-[#dae2fd] text-[#5c647a]',
  },
  {
    quote:
      'I consult for fintech startups in Singapore and tech agencies in BSD. The instant currency toggling (IDR & USD) and pixel-perfect A4 PDF exports saved me 5 hours of manual admin every single month.',
    name: 'Fikri Hakimi',
    role: 'Full-stack Consultant • Tangerang Selatan',
    initials: 'FH',
    avatarBg: 'bg-[#acf774]/40 text-[#2e6100]',
  },
];

export function SocialProofSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="testimonials">
      {/* Metrics Banner */}
      <div className="p-8 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] mb-16 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#dce9ff]">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="text-center py-3 md:py-0 px-2">
              <div className={`text-3xl sm:text-4xl font-bold tracking-tight ${metric.valueColor}`}>
                {metric.value}
              </div>
              <div className="text-sm sm:text-base font-semibold text-[#0b1c30] mt-1">
                {metric.title}
              </div>
              <p className="text-xs text-[#434655] mt-0.5">
                {metric.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#004ac6]">
            Trusted Community
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-1">
            Loved by Indonesia’s Independent Talent
          </h3>
        </div>
        <span className="text-sm text-[#434655]">
          Real stories from creators who ditched spreadsheets
        </span>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#004ac6]" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, starIdx) => (
                  <Star key={starIdx} className="size-4 stroke-[1.5] text-[#004ac6]" />
                ))}
              </div>
              <p className="text-sm text-[#0b1c30] leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#e5eeff] flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.avatarBg}`}
              >
                {item.initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0b1c30] truncate">
                  {item.name}
                </div>
                <div className="text-xs text-[#434655] truncate">
                  {item.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
