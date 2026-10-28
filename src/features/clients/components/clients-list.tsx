'use client';

/**
 * Tagiva - Clients Directory List & Table
 *
 * Implements client search, table display, edit/delete actions (FR-5.11).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Edit,
  Mail,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientFormDialog } from '@/features/clients/components/client-form-dialog';
import { deleteClientAction } from '@/features/clients/actions';
import type { CustomerRow } from '@/types/database';

interface ClientsListProps {
  initialClients: CustomerRow[];
}

export function ClientsList({ initialClients }: ClientsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomerRow | null>(null);
  const [clientPendingDelete, setClientPendingDelete] = useState<CustomerRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredClients = initialClients.filter((client) => {
    const q = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      client.company.toLowerCase().includes(q) ||
      client.email.toLowerCase().includes(q) ||
      client.address.toLowerCase().includes(q)
    );
  });

  function handleOpenCreate() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(client: CustomerRow) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  async function confirmDeleteClient() {
    if (!clientPendingDelete) return;

    try {
      setDeletingId(clientPendingDelete.id);
      setErrorMessage(null);
      const result = await deleteClientAction(clientPendingDelete.id);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setDeletingId(null);
        setClientPendingDelete(null);
        return;
      }

      setDeletingId(null);
      setClientPendingDelete(null);
      router.refresh();
    } catch {
      setErrorMessage('Failed to delete client.');
      setDeletingId(null);
      setClientPendingDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium"
        >
          {errorMessage}
        </div>
      )}

      {/* Action Bar: Search & Add Client */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <search className="relative flex-1 max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or email..."
            aria-label="Search clients by name, company, or email"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="pl-9 h-9 text-xs sm:text-sm bg-white"
          />
        </search>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 h-9 shrink-0 shadow-xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Clients Table / Cards */}
      {filteredClients.length === 0 ? (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {searchQuery ? 'No matching clients found' : 'No clients in your directory yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Save client contact details to quickly autofill them when creating invoices.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleOpenCreate}
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 border-slate-300"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Your First Client</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="clients-table-caption"
            className="overflow-x-auto [container-type:inline-size]"
          >
            <table className="w-full text-left text-xs border-separate border-spacing-0">
              <caption id="clients-table-caption" className="visually-hidden">
                Client directory
              </caption>
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">
                    Contact
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Company
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Email
                  </th>
                  <th scope="col" className="py-3 px-4 hidden md:table-cell">
                    Address
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {client.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {client.company ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Building2
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-slate-400 shrink-0"
                          />
                          <span>{client.company}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {client.email ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Mail
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-slate-400 shrink-0"
                          />
                          <span>{client.email}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell max-w-xs truncate text-slate-500">
                      {client.address ? (
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-slate-400 shrink-0"
                          />
                          <span className="truncate">{client.address}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(client)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          aria-label={`Edit ${client.name}`}
                        >
                          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setClientPendingDelete(client)}
                          disabled={deletingId === client.id}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          aria-label={`Delete ${client.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(clientPendingDelete)}
        onOpenChange={(open) => !open && setClientPendingDelete(null)}
      >
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {clientPendingDelete?.name}
              </span>
              ? Existing invoices for this client will remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClientPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteClient}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
