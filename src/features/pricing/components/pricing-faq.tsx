import React from 'react';

const PRICING_FAQS = [
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Tagiva terintegrasi dengan Payment Gateway berizin di Indonesia yang mendukung pembayaran instan via QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja, BCA Mobile), Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Kredit.',
  },
  {
    q: 'Apakah paket Free Starter benar-benar gratis?',
    a: 'Ya, 100% gratis selamanya. Anda dapat membuat dan menyimpan hingga 3 invoice aktif. Jika Anda menghapus invoice berstatus Draft, slot kuota invoice Anda akan kembali.',
  },
  {
    q: 'Apa yang terjadi jika langganan Pro saya berakhir (Lapsed)?',
    a: 'Semua invoice dan data Anda tetap aman dan tidak akan dihapus. Invoice yang telah terbit tetap dapat diakses via link publik atau diunduh sebagai PDF. Jika ada invoice berstatus Terkirim atau Lewat Jatuh Tempo yang baru dibayar oleh klien, Anda tetap dapat menandainya sebagai Lunas. Anda tidak dapat membuat invoice baru jika sudah melampaui batas 3 invoice, kecuali Anda memperpanjang Pro kembali.',
  },
  {
    q: 'Apakah Tagiva mendukung perpanjangan otomatis (auto-renewal)?',
    a: 'Ya, saat checkout Anda dapat memilih opsi Perpanjangan Otomatis atau Bayar Manual Sekali Bayar. Jika opsi perpanjangan otomatis gagal saat ditagih, kami memberikan masa tenggang (grace period) selama 3 hari agar layanan Anda tidak langsung terhenti.',
  },
  {
    q: 'Bisakah saya mengunduh bukti pembayaran langganan Tagiva?',
    a: 'Tentu saja. Setiap pembayaran langganan yang berhasil tercatat di menu Pengaturan Billing dengan riwayat transaksi dan invoice resmi langganan Anda.',
  },
];

export function PricingFaq() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pertanyaan Umum Seputar Biaya & Langganan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Semua yang perlu Anda ketahui tentang paket langganan dan garansi keamanan Tagiva.
        </p>
      </div>

      <div className="space-y-6">
        {PRICING_FAQS.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-border/80"
          >
            <h3 className="text-base font-semibold text-foreground mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
