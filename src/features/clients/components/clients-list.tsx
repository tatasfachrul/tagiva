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

  async function handleDelete(client: CustomerRow) {
    if (!window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      return;
    }

    try {
      setDeletingId(client.id);
      setErrorMessage(null);
      const result = await deleteClientAction(client.id);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setDeletingId(null);
        return;
      }

      setDeletingId(null);
      router.refresh();
    } catch {
      setErrorMessage('Failed to delete client.');
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Action Bar: Search & Add Client */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or email..."
            className="pl-9 h-9 text-xs sm:text-sm bg-white"
          />
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 h-9 shrink-0 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Clients Table / Cards */}
      {filteredClients.length === 0 ? (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="h-6 w-6" />
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
                <Plus className="h-3.5 w-3.5" />
                <span>Add Your First Client</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 hidden md:table-cell">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{client.company}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {client.email ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{client.email}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell max-w-xs truncate text-slate-500">
                      {client.address ? (
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
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
                          title="Edit client"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client)}
                          disabled={deletingId === client.id}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete client"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}
