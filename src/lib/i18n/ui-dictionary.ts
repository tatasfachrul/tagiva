/**
 * Tagiva - Application UI Bilingual Dictionary
 *
 * Implements English ('en', default per D-47) and Bahasa Indonesia ('id') strings
 * for all app views, modals, notifications, and error codes.
 */

import type { ApiErrorCode } from '../api/action-result';

export type UiLanguage = 'en' | 'id';

export interface UiDictionary {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    confirm: string;
    back: string;
    edit: string;
    downloadPdf: string;
    copyLink: string;
    linkCopied: string;
    sendEmail: string;
    shareLink: string;
    upgradeToPro: string;
    freePlan: string;
    proPlan: string;
    lapsedPlan: string;
    pastDue: string;
    status: string;
    actions: string;
    optional: string;
  };
  navigation: {
    invoices: string;
    customers: string;
    settings: string;
    billing: string;
    signOut: string;
    signInWithGoogle: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    createNewInvoice: string;
    slotCounter: (used: number, max: number) => string;
    slotCounterFull: string;
    slotCounterUnlimited: string;
    filterAll: string;
    filterDraft: string;
    filterSent: string;
    filterPaid: string;
    filterOverdue: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    tableInvoiceNo: string;
    tableClient: string;
    tableDate: string;
    tableDueDate: string;
    tableAmount: string;
    tableStatus: string;
  };
  builder: {
    newTitle: string;
    editTitle: string;
    draftBadge: string;
    saveDraft: string;
    issueInvoice: string;
    issueConfirmTitle: string;
    issueConfirmDesc: string;
    sectionSender: string;
    sectionClient: string;
    sectionDetails: string;
    sectionItems: string;
    sectionPayment: string;
    sectionNotes: string;
    businessName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    senderTaxId: string;
    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientAddress: string;
    saveClientToDirectory: string;
    invoiceLanguage: string;
    currency: string;
    issueDate: string;
    dueDate: string;
    itemDescription: string;
    itemQty: string;
    itemUnitPrice: string;
    itemAmount: string;
    addItem: string;
    removeItem: string;
    discount: string;
    discountTypePercent: string;
    discountTypeFixed: string;
    tax: string;
    taxRate: string;
    ppnQuickChip: string;
    subtotal: string;
    totalAmount: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    paymentNotes: string;
  };
  settings: {
    title: string;
    businessProfile: string;
    businessProfileDesc: string;
    logo: string;
    logoDesc: string;
    logoProOnlyNotice: string;
    uploadLogo: string;
    removeLogo: string;
    invoicePrefix: string;
    invoicePrefixHint: string;
    defaultCurrency: string;
    defaultLanguage: string;
    bankDetails: string;
    savedSuccessfully: string;
  };
  billing: {
    title: string;
    currentPlan: string;
    planStatus: string;
    renewsOn: string;
    expiresOn: string;
    manageSubscription: string;
    cancelAutoRenew: string;
    cancelConfirm: string;
    choosePlan: string;
    billingModeManual: string;
    billingModeAuto: string;
    tier1m: string;
    tier3m: string;
    tier6m: string;
    tier12m: string;
    proFeatureLogo: string;
    proFeatureLink: string;
    proFeatureEmail: string;
    proFeatureUnlimited: string;
    proFeatureNoWatermark: string;
  };
  modals: {
    deleteInvoiceTitle: string;
    deleteDraftNotice: string;
    deleteProNotice: string;
    deleteDisabledFreeTooltip: string;
    shareLinkTitle: string;
    shareLinkDesc: string;
    enableLink: string;
    publicUrlLabel: string;
    sendEmailTitle: string;
    sendEmailDesc: string;
    emailRecipient: string;
    emailSubject: string;
    emailMessage: string;
    emailRateLimitNotice: string;
  };
  errors: Record<ApiErrorCode, string>;
}

export const UI_DICTIONARY: Record<UiLanguage, UiDictionary> = {
  en: {
    common: {
      appName: 'Tagiva',
      tagline: 'Simple, fast, and compliant invoicing for Indonesian businesses and freelancers.',
      loading: 'Loading...',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
      back: 'Back',
      edit: 'Edit',
      downloadPdf: 'Download PDF',
      copyLink: 'Copy Link',
      linkCopied: 'Link copied to clipboard!',
      sendEmail: 'Send Email',
      shareLink: 'Share Link',
      upgradeToPro: 'Upgrade to Pro',
      freePlan: 'Free Plan',
      proPlan: 'Pro Plan',
      lapsedPlan: 'Lapsed Plan',
      pastDue: 'Past Due',
      status: 'Status',
      actions: 'Actions',
      optional: 'Optional',
    },
    navigation: {
      invoices: 'Invoices',
      customers: 'Customers',
      settings: 'Settings',
      billing: 'Subscription',
      signOut: 'Sign Out',
      signInWithGoogle: 'Sign in with Google',
    },
    dashboard: {
      title: 'Invoices',
      subtitle: 'Create, manage, and track your invoices.',
      createNewInvoice: 'New Invoice',
      slotCounter: (used, max) => `${used} / ${max} invoices saved`,
      slotCounterFull: '3 of 3 invoices used. Upgrade to Pro for unlimited invoices.',
      slotCounterUnlimited: 'Pro Plan: Unlimited invoices',
      filterAll: 'All',
      filterDraft: 'Draft',
      filterSent: 'Sent',
      filterPaid: 'Paid',
      filterOverdue: 'Overdue',
      searchPlaceholder: 'Search by client or invoice number...',
      emptyTitle: 'No invoices yet',
      emptySubtitle: 'Create your first invoice to get paid faster.',
      tableInvoiceNo: 'Invoice #',
      tableClient: 'Client',
      tableDate: 'Date',
      tableDueDate: 'Due Date',
      tableAmount: 'Total',
      tableStatus: 'Status',
    },
    builder: {
      newTitle: 'New Invoice',
      editTitle: 'Edit Invoice',
      draftBadge: 'Draft',
      saveDraft: 'Save Draft',
      issueInvoice: 'Issue Invoice',
      issueConfirmTitle: 'Issue Invoice?',
      issueConfirmDesc: 'Issuing assigns a permanent sequence number and locks the invoice number. Continue?',
      sectionSender: 'Your Business Details (From)',
      sectionClient: 'Billed To',
      sectionDetails: 'Invoice Metadata',
      sectionItems: 'Line Items',
      sectionPayment: 'Payment Instructions',
      sectionNotes: 'Notes & Terms',
      businessName: 'Business Name',
      senderEmail: 'Email',
      senderPhone: 'Phone',
      senderAddress: 'Address',
      senderTaxId: 'NPWP / Tax ID',
      clientName: 'Contact Name',
      clientCompany: 'Company / Organization',
      clientEmail: 'Email',
      clientAddress: 'Billing Address',
      saveClientToDirectory: 'Save this client for future invoices',
      invoiceLanguage: 'Document Language',
      currency: 'Currency',
      issueDate: 'Issue Date',
      dueDate: 'Due Date',
      itemDescription: 'Description',
      itemQty: 'Quantity',
      itemUnitPrice: 'Unit Price',
      itemAmount: 'Amount',
      addItem: 'Add Item',
      removeItem: 'Remove Item',
      discount: 'Discount',
      discountTypePercent: 'Percentage (%)',
      discountTypeFixed: 'Fixed Amount',
      tax: 'Tax',
      taxRate: 'Tax Rate (%)',
      ppnQuickChip: 'PPN 11%',
      subtotal: 'Subtotal',
      totalAmount: 'Total Due',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      accountHolder: 'Account Holder Name',
      paymentNotes: 'Additional notes or payment terms...',
    },
    settings: {
      title: 'Settings',
      businessProfile: 'Business Profile',
      businessProfileDesc: 'This information appears as the sender on all your invoices.',
      logo: 'Business Logo',
      logoDesc: 'Upload your company logo to appear on your invoices (Pro feature).',
      logoProOnlyNotice: 'Logo upload is exclusive to Tagiva Pro subscribers.',
      uploadLogo: 'Upload Logo',
      removeLogo: 'Remove Logo',
      invoicePrefix: 'Invoice Prefix',
      invoicePrefixHint: '2 to 6 uppercase letters or numbers (e.g., INV, ACME). Changing prefix does not reset sequence.',
      defaultCurrency: 'Default Currency',
      defaultLanguage: 'Default Language',
      bankDetails: 'Default Bank Details',
      savedSuccessfully: 'Settings saved successfully.',
    },
    billing: {
      title: 'Subscription & Billing',
      currentPlan: 'Current Plan',
      planStatus: 'Status',
      renewsOn: 'Next renewal date',
      expiresOn: 'Plan expires on',
      manageSubscription: 'Manage Plan',
      cancelAutoRenew: 'Cancel Auto-Renew',
      cancelConfirm: 'Are you sure you want to cancel auto-renewal? You will keep Pro access until your current billing period ends.',
      choosePlan: 'Upgrade to Tagiva Pro',
      billingModeManual: 'One-Time Payment',
      billingModeAuto: 'Auto-Renew Subscription',
      tier1m: '1 Month — Rp 29.000',
      tier3m: '3 Months — Rp 79.000',
      tier6m: '6 Months — Rp 150.000',
      tier12m: '12 Months — Rp 250.000 (Best Value)',
      proFeatureLogo: 'Upload custom business logo',
      proFeatureLink: 'Live public invoice links for clients',
      proFeatureEmail: 'Send invoices directly via email with PDF',
      proFeatureUnlimited: 'Unlimited invoices (no 3-invoice cap)',
      proFeatureNoWatermark: 'No "Made with Tagiva" watermark on PDFs',
    },
    modals: {
      deleteInvoiceTitle: 'Delete Invoice',
      deleteDraftNotice: 'Deleting this draft will restore 1 invoice slot to your Free account.',
      deleteProNotice: 'Are you sure you want to permanently delete this invoice? This action cannot be undone.',
      deleteDisabledFreeTooltip: 'Sent, Overdue, and Paid invoices cannot be deleted on the Free plan.',
      shareLinkTitle: 'Public Invoice Link',
      shareLinkDesc: 'Allow your client to view this invoice and download their PDF via a secure direct link.',
      enableLink: 'Enable public link',
      publicUrlLabel: 'Public Link URL',
      sendEmailTitle: 'Send Invoice via Email',
      sendEmailDesc: 'Deliver this invoice directly to your client with the official A4 PDF attached.',
      emailRecipient: 'Recipient Email',
      emailSubject: 'Subject',
      emailMessage: 'Message',
      emailRateLimitNotice: 'Limit: 50 emails/day per account, 5 emails/day per invoice.',
    },
    errors: {
      UNAUTHENTICATED: 'Please sign in with Google to continue.',
      NOT_FOUND: 'The requested invoice or record could not be found.',
      VALIDATION_ERROR: 'Please check your inputs and try again.',
      PLAN_LIMIT_REACHED: 'You have reached the 3-invoice limit for the Free plan. Upgrade to Pro for unlimited invoices.',
      PRO_REQUIRED: 'This feature is available exclusively to Tagiva Pro subscribers.',
      LAPSED_READ_ONLY: 'Your Pro subscription has lapsed. Invoices are read-only except marking paid.',
      DELETE_NOT_ALLOWED_ON_FREE: 'Free users can only delete Draft invoices. Sent, Overdue, and Paid invoices cannot be deleted.',
      INVALID_STATUS_TRANSITION: 'This invoice status change is not permitted.',
      RATE_LIMIT_EXCEEDED: 'Email sending limit reached. Please try again tomorrow.',
      INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
    },
  },
  id: {
    common: {
      appName: 'Tagiva',
      tagline: 'Pembuat faktur cepat, mudah, dan sesuai standar untuk bisnis & freelancer Indonesia.',
      loading: 'Memuat...',
      save: 'Simpan',
      saving: 'Menyimpan...',
      cancel: 'Batal',
      delete: 'Hapus',
      confirm: 'Konfirmasi',
      back: 'Kembali',
      edit: 'Ubah',
      downloadPdf: 'Unduh PDF',
      copyLink: 'Salin Tautan',
      linkCopied: 'Tautan berhasil disalin!',
      sendEmail: 'Kirim Email',
      shareLink: 'Bagikan Tautan',
      upgradeToPro: 'Tingkatkan ke Pro',
      freePlan: 'Paket Gratis',
      proPlan: 'Paket Pro',
      lapsedPlan: 'Paket Berakhir (Lapsed)',
      pastDue: 'Menunggak Pembayaran',
      status: 'Status',
      actions: 'Aksi',
      optional: 'Opsional',
    },
    navigation: {
      invoices: 'Faktur',
      customers: 'Klien',
      settings: 'Pengaturan',
      billing: 'Langganan',
      signOut: 'Keluar',
      signInWithGoogle: 'Masuk dengan Google',
    },
    dashboard: {
      title: 'Daftar Faktur',
      subtitle: 'Buat, kelola, dan pantau seluruh faktur tagihan Anda.',
      createNewInvoice: 'Buat Faktur',
      slotCounter: (used, max) => `${used} dari ${max} faktur tersimpan`,
      slotCounterFull: '3 dari 3 faktur telah digunakan. Tingkatkan ke Pro untuk faktur tanpa batas.',
      slotCounterUnlimited: 'Paket Pro: Faktur tanpa batas',
      filterAll: 'Semua',
      filterDraft: 'Draf',
      filterSent: 'Terkirim',
      filterPaid: 'Lunas',
      filterOverdue: 'Jatuh Tempo',
      searchPlaceholder: 'Cari berdasarkan nama klien atau no. faktur...',
      emptyTitle: 'Belum ada faktur',
      emptySubtitle: 'Buat faktur pertama Anda untuk menerima pembayaran lebih cepat.',
      tableInvoiceNo: 'No. Faktur',
      tableClient: 'Klien',
      tableDate: 'Tanggal',
      tableDueDate: 'Jatuh Tempo',
      tableAmount: 'Total',
      tableStatus: 'Status',
    },
    builder: {
      newTitle: 'Faktur Baru',
      editTitle: 'Ubah Faktur',
      draftBadge: 'Draf',
      saveDraft: 'Simpan Draf',
      issueInvoice: 'Terbitkan Faktur',
      issueConfirmTitle: 'Terbitkan Faktur?',
      issueConfirmDesc: 'Penerbitan faktur akan memberikan nomor urut permanen dan mengunci nomor faktur. Lanjutkan?',
      sectionSender: 'Identitas Bisnis Anda (Dari)',
      sectionClient: 'Ditagihkan Kepada',
      sectionDetails: 'Informasi Faktur',
      sectionItems: 'Daftar Item',
      sectionPayment: 'Instruksi Pembayaran',
      sectionNotes: 'Catatan & Ketentuan',
      businessName: 'Nama Bisnis / Usaha',
      senderEmail: 'Email',
      senderPhone: 'No. Telepon / WhatsApp',
      senderAddress: 'Alamat',
      senderTaxId: 'NPWP',
      clientName: 'Nama Kontak',
      clientCompany: 'Perusahaan / Lembaga',
      clientEmail: 'Email',
      clientAddress: 'Alamat Tagihan',
      saveClientToDirectory: 'Simpan klien ini untuk faktur berikutnya',
      invoiceLanguage: 'Bahasa Dokumen',
      currency: 'Mata Uang',
      issueDate: 'Tanggal Terbit',
      dueDate: 'Jatuh Tempo',
      itemDescription: 'Deskripsi Item',
      itemQty: 'Jumlah',
      itemUnitPrice: 'Harga Satuan',
      itemAmount: 'Total',
      addItem: 'Tambah Item',
      removeItem: 'Hapus Item',
      discount: 'Diskon',
      discountTypePercent: 'Persentase (%)',
      discountTypeFixed: 'Nominal Tetap',
      tax: 'Pajak',
      taxRate: 'Tarif Pajak (%)',
      ppnQuickChip: 'PPN 11%',
      subtotal: 'Subtotal',
      totalAmount: 'Total Tagihan',
      bankName: 'Nama Bank',
      accountNumber: 'Nomor Rekening',
      accountHolder: 'Nama Pemilik Rekening',
      paymentNotes: 'Catatan tambahan atau syarat pembayaran...',
    },
    settings: {
      title: 'Pengaturan',
      businessProfile: 'Profil Bisnis',
      businessProfileDesc: 'Informasi ini akan dicantumkan sebagai pengirim pada seluruh faktur Anda.',
      logo: 'Logo Usaha',
      logoDesc: 'Unggah logo bisnis Anda agar tampil di faktur resmi (Fitur Pro).',
      logoProOnlyNotice: 'Unggah logo hanya tersedia untuk pelanggan Tagiva Pro.',
      uploadLogo: 'Unggah Logo',
      removeLogo: 'Hapus Logo',
      invoicePrefix: 'Awalan Nomor Faktur (Prefix)',
      invoicePrefixHint: '2 hingga 6 karakter huruf kapital atau angka (contoh: INV, TGV). Mengubah prefix tidak mereset nomor urut.',
      defaultCurrency: 'Mata Uang Utama',
      defaultLanguage: 'Bahasa Utama',
      bankDetails: 'Rekening Pembayaran Utama',
      savedSuccessfully: 'Pengaturan berhasil disimpan.',
    },
    billing: {
      title: 'Langganan & Pembayaran',
      currentPlan: 'Paket Saat Ini',
      planStatus: 'Status',
      renewsOn: 'Perpanjangan berikutnya',
      expiresOn: 'Berakhir pada',
      manageSubscription: 'Kelola Paket',
      cancelAutoRenew: 'Batalkan Perpanjangan Otomatis',
      cancelConfirm: 'Yakin ingin membatalkan perpanjangan otomatis? Akses Pro Anda tetap aktif hingga akhir periode pembayaran berjalan.',
      choosePlan: 'Tingkatkan ke Tagiva Pro',
      billingModeManual: 'Bayar Sekali (Manual)',
      billingModeAuto: 'Perpanjangan Otomatis',
      tier1m: '1 Bulan — Rp 29.000',
      tier3m: '3 Bulan — Rp 79.000',
      tier6m: '6 Bulan — Rp 150.000',
      tier12m: '12 Bulan — Rp 250.000 (Paling Hemat)',
      proFeatureLogo: 'Unggah logo bisnis sendiri',
      proFeatureLink: 'Tautan faktur online langsung untuk klien',
      proFeatureEmail: 'Kirim faktur langsung via email beserta lampiran PDF',
      proFeatureUnlimited: 'Faktur tanpa batas (tanpa batasan 3 faktur)',
      proFeatureNoWatermark: 'Tanpa watermark "Dibuat dengan Tagiva" pada PDF',
    },
    modals: {
      deleteInvoiceTitle: 'Hapus Faktur',
      deleteDraftNotice: 'Menghapus draf ini akan mengembalikan 1 kuota faktur gratis Anda.',
      deleteProNotice: 'Apakah Anda yakin ingin menghapus faktur ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
      deleteDisabledFreeTooltip: 'Faktur Terkirim, Jatuh Tempo, dan Lunas tidak dapat dihapus pada paket Gratis.',
      shareLinkTitle: 'Tautan Faktur Online',
      shareLinkDesc: 'Klien Anda dapat melihat faktur dan mengunduh PDF secara langsung melalui tautan aman ini.',
      enableLink: 'Aktifkan tautan publik',
      publicUrlLabel: 'Alamat Tautan Faktur',
      sendEmailTitle: 'Kirim Faktur via Email',
      sendEmailDesc: 'Kirimkan faktur resmi ini langsung ke email klien Anda beserta lampiran PDF A4.',
      emailRecipient: 'Email Penerima',
      emailSubject: 'Subjek Email',
      emailMessage: 'Pesan',
      emailRateLimitNotice: 'Batas: 50 email/hari per akun, 5 email/hari per faktur.',
    },
    errors: {
      UNAUTHENTICATED: 'Silakan masuk dengan akun Google terlebih dahulu.',
      NOT_FOUND: 'Faktur atau data yang diminta tidak ditemukan.',
      VALIDATION_ERROR: 'Mohon periksa data yang Anda masukkan dan coba lagi.',
      PLAN_LIMIT_REACHED: 'Anda telah mencapai batas 3 faktur untuk paket Gratis. Tingkatkan ke Pro untuk faktur tanpa batas.',
      PRO_REQUIRED: 'Fitur ini hanya tersedia untuk pelanggan Tagiva Pro.',
      LAPSED_READ_ONLY: 'Masa aktif Pro Anda telah berakhir. Faktur bersifat hanya-baca kecuali menandai lunas.',
      DELETE_NOT_ALLOWED_ON_FREE: 'Pengguna Gratis hanya dapat menghapus faktur Draf. Faktur Terkirim, Jatuh Tempo, dan Lunas tidak dapat dihapus.',
      INVALID_STATUS_TRANSITION: 'Perubahan status faktur ini tidak diperbolehkan.',
      RATE_LIMIT_EXCEEDED: 'Batas pengiriman email harian telah tercapai. Silakan coba lagi besok.',
      INTERNAL_ERROR: 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.',
    },
  },
};

/**
 * Returns UI dictionary for the given language (defaults to 'en' per D-47).
 */
export function getUiDictionary(language: UiLanguage = 'en'): UiDictionary {
  return UI_DICTIONARY[language] ?? UI_DICTIONARY.en;
}
