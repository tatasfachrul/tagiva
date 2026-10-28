import React from 'react';
import Link from 'next/link';

export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Kebijakan Privasi & Perlindungan Data Pribadi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terakhir diperbarui: 28 Oktober 2026 • Kepatuhan terhadap UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022)
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-foreground space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">1. Komitmen Kepatuhan UU PDP No. 27/2022</h2>
          <p className="text-muted-foreground">
            Tagiva berkomitmen penuh untuk melindungi privasi dan integritas data pengguna sesuai ketentuan
            Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
            Kebijakan ini menjelaskan bagaimana kami mengumpulkan, memproses, menyimpan, dan melindungi data pribadi Anda
            saat menggunakan situs web dan layanan tagiva.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">2. Data Pribadi yang Kami Kumpulkan</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
            <li>
              <strong>Informasi Akun (Google OAuth):</strong> Nama lengkap, alamat email resmi, foto profil, dan pengenal unik Google ID saat Anda masuk.
            </li>
            <li>
              <strong>Informasi Profil Bisnis:</strong> Nama bisnis, alamat usaha, nomor telepon/WhatsApp, dan rincian rekening bank/pembayaran yang Anda masukkan secara sukarela.
            </li>
            <li>
              <strong>Data Klien & Transaksi:</strong> Nama klien, alamat klien, email klien, rincian baris item transaksi, jumlah uang, serta catatan pembayaran.
            </li>
            <li>
              <strong>Aset Media:</strong> Logo bisnis yang Anda unggah untuk dicantumkan pada invoice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">3. Dasar & Tujuan Pemrosesan Data</h2>
          <p className="text-muted-foreground">
            Kami hanya memproses data Anda untuk:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
            <li>Menyediakan layanan pembuatan, kalkulasi otomatis, dan unduh PDF invoice.</li>
            <li>Menghasilkan tautan publik aman untuk dibagikan kepada klien Anda.</li>
            <li>Mengirimkan notifikasi tagihan serta pengingat jatuh tempo atas permintaan Anda.</li>
            <li>Memproses pembayaran langganan melalui payment gateway berizin.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">4. Keamanan dan Penyimpanan Data</h2>
          <p className="text-muted-foreground">
            Data Anda disimpan di infrastruktur cloud dengan enkripsi saat transit (TLS 1.3) dan saat diam (AES-256).
            Akses ke basis data dilindungi dengan Row Level Security (RLS) PostgreSQL bertingkat, memastikan data invoice
            hanya dapat dibaca dan dimodifikasi oleh pemilik akun yang bersangkutan.
          </p>
        </section>

        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-3 text-foreground">
            5. Hak Subjek Data & Prosedur Penghapusan Akun Permanen (UU PDP)
          </h2>
          <p className="text-muted-foreground mb-4">
            Sebagai subjek data, Anda berhak untuk mengakses, memperbaiki, membatasi pemrosesan, dan menuntut
            penghapusan permanen (right to erasure) atas seluruh data pribadi Anda.
          </p>
          <div className="bg-background rounded-lg p-5 border border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Cara Mengajukan Permintaan Penghapusan Akun & Data:</h3>
            <p className="text-sm text-muted-foreground">
              Kirimkan email permohonan ke{' '}
              <a href="mailto:support@tagiva.com" className="text-primary font-bold underline">
                support@tagiva.com
              </a>{' '}
              dari <strong>alamat email Google yang terdaftar pada akun Tagiva Anda</strong> dengan subjek:{' '}
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono font-semibold">
                Permohonan Penghapusan Data Pribadi - [Email Anda]
              </code>.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Jaminan Waktu Penyelesaian (SLA 72 Jam):</strong> Tim Tagiva akan memverifikasi permohonan
              dan menghapus seluruh data akun, profil bisnis, catatan pelanggan, invoice, serta file logo Anda
              secara permanen dari server aktif kami dalam waktu <strong>maksimal 3 × 24 jam (72 jam)</strong> kerja
              serta mengirimkan konfirmasi tertulis ke email Anda.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">6. Cookie dan Pelacakan</h2>
          <p className="text-muted-foreground">
            Tagiva hanya menggunakan cookie esensial yang diperlukan secara teknis untuk sesi autentikasi dan keamanan akun.
            Kami tidak menggunakan cookie pelacak iklan pihak ketiga yang menjual profil penjelajahan Anda.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground">7. Kontak Petugas Pelindungan Data</h2>
          <p className="text-muted-foreground">
            Jika Anda memiliki pertanyaan seputar kebijakan privasi ini atau pengelolaan data pribadi Anda,
            silakan hubungi kami di:
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <p><strong>Tagiva Data Protection Support</strong></p>
            <p>Email:{' '}
              <a href="mailto:support@tagiva.com" className="text-primary underline">
                support@tagiva.com
              </a>
            </p>
            <p>Website:{' '}
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
