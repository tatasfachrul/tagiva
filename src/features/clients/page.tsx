import { getClients } from './queries/client-queries';
import { ClientsList } from './components/clients-list';

export async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Clients Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage and store your client contact details to quickly autofill them when creating invoices.
        </p>
      </div>

      <ClientsList initialClients={clients} />
    </div>
  );
}
