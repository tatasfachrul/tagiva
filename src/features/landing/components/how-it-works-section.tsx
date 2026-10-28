import React from 'react';
import { Edit3, Building2, Send } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: 'Fill Details & Line Items',
    description:
      'Input your client’s name, company, and project line items with unit pricing. Your numbers compute automatically in real time.',
    tagIcon: Edit3,
    tagColor: 'text-[#004ac6]',
    tagText: 'Autofills repeat clients instantly',
  },
  {
    step: '2',
    title: 'Toggle 11% PPN & Bank Details',
    description:
      'Apply one-click PPN 11% tax calculation and pick your receiving bank (BCA, Mandiri, BRI, BSI) for crystal-clear transfer info.',
    tagIcon: Building2,
    tagColor: 'text-[#2e6100]',
    tagText: 'Includes bank account & holder name',
  },
  {
    step: '3',
    title: 'Share Instant Link or Export PDF',
    description:
      'Generate a shareable live payment link for WhatsApp/Email or download an ISO-compliant high-resolution A4 PDF for corporate accounting.',
    tagIcon: Send,
    tagColor: 'text-[#004ac6]',
    tagText: 'Ready for client signature & payment',
  },
];

export function HowItWorksSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="how-it-works">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-wider text-[#004ac6]">
          Effortless Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mt-1">
          Create &amp; Send in 3 Simple Steps
        </h2>
        <p className="text-base text-[#434655] mt-2">
          From draft to client payment in minutes. No complex accounting knowledge required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((item) => {
          const TagIcon = item.tagIcon;
          return (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#004ac6] text-white font-bold text-base mb-4 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30] mb-2">{item.title}</h3>
                <p className="text-sm text-[#434655] leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-[#eff4ff] text-xs text-[#0b1c30] flex items-center gap-2">
                <TagIcon className={`size-4 shrink-0 ${item.tagColor}`} />
                <span className="font-medium">{item.tagText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
