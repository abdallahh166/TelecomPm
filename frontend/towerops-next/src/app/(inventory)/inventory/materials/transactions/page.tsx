'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/use-auth';
import { useMaterials } from '@/hooks/use-materials';
import { formatLabel } from '@/lib/format';

export default function MaterialTransactionsPage() {
  const auth = useAuth();
  const officeId = auth.user?.officeId;
  const materialsQuery = useMaterials(officeId, 1, { pageSize: 25 }, Boolean(officeId));

  if (!officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  if (materialsQuery.isLoading) {
    return <LoadingState label="Loading materials..." />;
  }

  if (materialsQuery.isError || !materialsQuery.data) {
    return <ErrorState message="Failed to load materials." onRetry={() => materialsQuery.refetch()} />;
  }

  const rows = materialsQuery.data.data.map((material) => [
    material.code,
    material.name,
    formatLabel(material.category),
    `${material.currentStock} ${material.unit}`,
    <Link className="text-brand-blue underline" href={`/inventory/materials/${material.id}`} key={material.id}>
      Open Material Ledger
    </Link>,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Material Transactions</h1>
        <p className="text-sm text-slate-400">
          Select a material to view its full transaction and reservation ledger.
        </p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/inventory/materials">
          Back to materials list
        </Link>
      </section>

      <DataTable
        headers={['Code', 'Name', 'Category', 'Current Stock', 'Ledger']}
        rows={rows}
      />
    </main>
  );
}
