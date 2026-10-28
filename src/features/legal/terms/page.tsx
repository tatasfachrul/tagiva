import React from 'react';

export function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Syarat dan Ketentuan Layanan (Terms of Service)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terakhir diperbarui: 28 Oktober 2026 • Berlaku efektif untuk seluruh pengguna Tagiva
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-foreground space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">1. Penerimaan Ketentuan</h2>
          <p className="text-muted-foreground">
            Dengan mendaftar, mengakses, atau menggunakan layanan Tagiva (disediakan melalui situs web tagiva.com),
            Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
            Jika Anda tidak menyetujui ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">2. Deskripsi Layanan</h2>
          <p className="text-muted-foreground">
            Tagiva adalah perangkat lunak berbasis cloud (SaaS) yang membantu pekerja lepas (freelancer), profesional mandiri,
            dan studio di Indonesia membuat, mengunduh, mengirim, serta melacak invoice digital profesional.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">3. Akun Pengguna & Keamanan</h2>
          <p className="text-muted-foreground">
            Untuk menggunakan Tagiva, Anda diwajibkan masuk menggunakan akun Google resmi Anda (Google OAuth).
            Anda bertanggung jawab penuh atas keamanan kredensial akun Anda serta segala aktivitas yang terjadi di bawah akun Anda.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">4. Paket Layanan, Kuota, dan Pembayaran</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
            <li>
              <strong>Paket Free Starter:</strong> Memberikan hak penyimpanan hingga 3 invoice aktif.
              Menghapus draft invoice mengembalikan kuota. Invoice berstatus Terkirim atau Lunas tidak dapat dihapus oleh akun Free.
            </li>
            <li>
              <strong>Paket Pro:</strong> Memberikan akses tanpa batas ke pembuatan invoice, penghapusan watermark,
              pengunggahan logo bisnis, dan pengiriman email langsung.
            </li>
            <li>
              <strong>Pembayaran:</strong> Diproses melalui gerbang pembayaran (payment gateway) resmi berizin di Indonesia.
              Biaya langganan bersifat non-refundable (tidak dapat dikembalikan) kecuali diwajibkan oleh undang-undang yang berlaku.
            </li>
            <li>
              <strong>Status Berakhir (Lapsed):</strong> Apabila langganan Pro berakhir, akun beralih menjadi Lapsed di mana
              data lama tetap aman dan dapat diunduh, namun pembuatan invoice baru dibatasi sesuai kuota Free.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">5. Kepemilikan Data & Konten</h2>
          <p className="text-muted-foreground">
            Anda memiliki hak cipta dan kepemilikan penuh atas seluruh data bisnis, informasi klien, dan rincian transaksi
            yang Anda masukkan ke dalam Tagiva. Tagiva tidak akan menjual, menyewakan, atau menyalahgunakan data komersial Anda kepada pihak ketiga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">6. Batasan Tanggung Jawab</h2>
          <p className="text-muted-foreground">
            Tagiva menyediakan layanan &quot;sebagaimana adanya&quot; (as is). Tagiva bukan merupakan lembaga keuangan,
            penyedia jasa perpajakan, atau akuntan publik terdaftar. Anda bertanggung jawab penuh atas kepatuhan pajak
            dan keabsahan transaksi komersial yang Anda lakukan dengan klien Anda.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">7. Hubungi Kami</h2>
          <p className="text-muted-foreground">
            Untuk pertanyaan atau klarifikasi terkait syarat layanan ini, hubungi tim kami melalui email resmi di{' '}
            <a href="mailto:support@tagiva.com" className="text-primary font-medium underline">
              support@tagiva.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
