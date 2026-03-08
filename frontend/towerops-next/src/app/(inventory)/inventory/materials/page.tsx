'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { useLowStockMaterials, useMaterials } from '@/hooks/use-materials';
import { formatLabel } from '@/lib/format';

export default function MaterialsPage() {
  const auth = useAuth();
  const officeId = auth.user?.officeId;
  const [page, setPage] = useState(1);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const materialsQuery = useMaterials(officeId, page, { onlyInStock, pageSize: 10 }, Boolean(officeId));
  const lowStockQuery = useLowStockMaterials(officeId, Boolean(officeId));

  if (!officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  if (materialsQuery.isLoading) {
    return <LoadingState label="Loading materials..." />;
  }

  if (materialsQuery.isError || !materialsQuery.data) {
    return <ErrorState message="Failed to load materials." onRetry={() => materialsQuery.refetch()} />;
  }

  if (materialsQuery.data.data.length === 0) {
    return (
      <main className="space-y-6 p-6">
        <MaterialsHeader
          onlyInStock={onlyInStock}
          onOnlyInStockChange={setOnlyInStock}
        />
        <EmptyState label="No materials found for this office and filter set." />
      </main>
    );
  }

  const rows = materialsQuery.data.data.map((material) => [
    <Link className="text-brand-blue underline" href={`/inventory/materials/${material.id}`} key={`${material.id}-code`}>
      {material.code}
    </Link>,
    material.name,
    formatLabel(material.category),
    `${material.currentStock} ${material.unit}`,
    `${material.minimumStock} ${material.unit}`,
    `${material.unitCost.toFixed(2)} ${material.currency}`,
    <StatusBadge key={`${material.id}-stock`} status={material.isLowStock ? 'LowStock' : 'InStock'} />,
    <Link className="text-brand-blue underline" href={`/inventory/materials/${material.id}`} key={`${material.id}-open`}>
      Open
    </Link>,
  ]);

  const lowStockCount = lowStockQuery.data?.length ?? 0;

  return (
    <main className="space-y-6 p-6">
      <MaterialsHeader
        onlyInStock={onlyInStock}
        onOnlyInStockChange={setOnlyInStock}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Visible Rows" value={`${materialsQuery.data.data.length}`} />
        <StatCard label="Low Stock Alerts" value={`${lowStockCount}`} />
        <StatCard label="Current Page" value={`${materialsQuery.data.pagination.page}`} />
      </section>

      <DataTable
        headers={['Code', 'Name', 'Category', 'Current Stock', 'Minimum', 'Unit Cost', 'Stock Status', 'Actions']}
        rows={rows}
      />
      <Pagination
        hasNext={materialsQuery.data.pagination.hasNextPage}
        onNext={() => setPage((current) => current + 1)}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={page}
      />
    </main>
  );
}

function MaterialsHeader({
  onlyInStock,
  onOnlyInStockChange,
}: {
  onlyInStock: boolean;
  onOnlyInStockChange: (value: boolean) => void;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Materials Inventory</h1>
        <p className="text-sm text-slate-400">Stock monitoring and transaction controls for storekeeper workflows.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            checked={onlyInStock}
            className="h-4 w-4"
            onChange={(event) => onOnlyInStockChange(event.target.checked)}
            type="checkbox"
          />
          Only In Stock
        </label>
        <Link className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue" href="/inventory/materials/new">
          New Material
        </Link>
        <Link
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-brand-blue"
          href="/inventory/materials/transactions"
        >
          Transactions View
        </Link>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
