import React from 'react';
import { notFound } from 'next/navigation';
import { InvoiceBuilder } from '../components/invoice-builder';
import { getInvoiceById, getSavedClients } from '../queries/invoice-queries';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const detailData = await getInvoiceById(id);
  if (!detailData) {
    notFound();
  }

  const savedClients = await getSavedClients();

  return (
    <InvoiceBuilder
      initialInvoice={detailData.invoice}
      profile={detailData.profile}
      planState={detailData.planState}
      savedClients={savedClients}
      isReadOnly={detailData.isReadOnly}
    />
  );
}
