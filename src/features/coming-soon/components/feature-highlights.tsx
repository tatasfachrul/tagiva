import { FileText, ShieldCheck, Zap, Share2 } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: FileText,
    title: 'Compliant A4 Invoicing',
    description: 'Crisp single-page invoices with PPN 11% automated tax calculations & Indonesian banking details.',
  },
  {
    icon: Zap,
    title: 'Instant PDF Generation',
    description: 'Generate production-ready client PDFs in milliseconds with zero layout jitter.',
  },
  {
    icon: ShieldCheck,
    title: 'Atomic Numbering',
    description: 'Guaranteed sequential INV numbering per fiscal year with custom alphanumeric prefixes.',
  },
  {
    icon: Share2,
    title: 'WhatsApp-Ready Links',
    description: 'Share lightweight, mobile-optimized public invoice tokens directly with your clients.',
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
      {HIGHLIGHTS.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/80 bg-white/70 shadow-xs hover:border-slate-300 transition-colors space-y-1.5"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.title}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
