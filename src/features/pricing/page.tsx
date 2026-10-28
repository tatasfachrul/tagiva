import React from 'react';
import { PricingTable } from './components/pricing-table';
import { PricingFaq } from './components/pricing-faq';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export function PricingPage() {
  return (
    <div className="flex flex-col w-full py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto px-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Harga Sederhana, Transparan & Terjangkau
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          Pilih paket yang sesuai dengan kebutuhan bisnis atau proyek lepas Anda.
          Mulai gratis, upgrade kapan saja saat bisnis Anda berkembang.
        </p>
      </div>

      {/* Pricing Cards */}
      <PricingTable />

      {/* FAQ */}
      <PricingFaq />

      {/* Trust & Guarantee Banner */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center flex flex-col items-center">
          <ShieldCheck className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-lg font-bold text-foreground">Keamanan Data & Privasi Terjamin</h3>
          <p className="text-sm text-muted-foreground max-w-lg mt-1 mb-6">
            Data invoice dan pelanggan Anda disimpan dengan enkripsi standar industri dan mematuhi
            Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022).
          </p>
          <Button asChild size="lg" className="font-semibold">
            <Link href="/login?next=/invoices/new">Mulai Buat Invoice Gratis</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
