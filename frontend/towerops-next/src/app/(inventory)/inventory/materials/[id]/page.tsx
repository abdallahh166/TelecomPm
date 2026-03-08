'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useAddMaterialStock,
  useConsumeMaterialStock,
  useMaterial,
  useReserveMaterialStock,
} from '@/hooks/use-materials';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatLabel } from '@/lib/format';
import { MaterialUnit } from '@/types/materials';

const MATERIAL_UNITS: MaterialUnit[] = ['Pieces', 'Meters', 'Kilograms', 'Liters', 'Set', 'Box'];

function isMaterialUnit(value: string): value is MaterialUnit {
  return MATERIAL_UNITS.includes(value as MaterialUnit);
}

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const materialQuery = useMaterial(id);
  const addStockMutation = useAddMaterialStock(id);
  const reserveStockMutation = useReserveMaterialStock(id);
  const consumeStockMutation = useConsumeMaterialStock(id);
  const [addQuantity, setAddQuantity] = useState('1');
  const [addUnit, setAddUnit] = useState<MaterialUnit>('Pieces');
  const [addSupplier, setAddSupplier] = useState('');
  const [reserveVisitId, setReserveVisitId] = useState('');
  const [reserveQuantity, setReserveQuantity] = useState('1');
  const [reserveUnit, setReserveUnit] = useState<MaterialUnit>('Pieces');
  const [consumeVisitId, setConsumeVisitId] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const materialId = materialQuery.data?.id;
  const materialUnit = materialQuery.data?.unit;

  useEffect(() => {
    if (!materialUnit) {
      return;
    }

    if (isMaterialUnit(materialUnit)) {
      setAddUnit(materialUnit);
      setReserveUnit(materialUnit);
    }
  }, [materialId, materialUnit]);

  if (materialQuery.isLoading) {
    return <LoadingState label="Loading material..." />;
  }

  if (materialQuery.isError || !materialQuery.data) {
    return <ErrorState message="Failed to load material." onRetry={() => materialQuery.refetch()} />;
  }

  const material = materialQuery.data;
  const isBusy = addStockMutation.isPending || reserveStockMutation.isPending || consumeStockMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed successfully.` });
      await materialQuery.refetch();
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  const transactionRows = material.recentTransactions.map((item) => [
    formatDateTime(item.transactionDate),
    formatLabel(item.type),
    `${item.quantity} ${item.unit}`,
    `${item.stockBefore} -> ${item.stockAfter}`,
    item.visitId ?? 'Not linked',
    item.performedBy,
  ]);

  const reservationRows = material.activeReservations.map((item) => [
    item.visitId,
    `${item.quantity} ${item.unit}`,
    formatDateTime(item.reservedAt),
    <StatusBadge key={item.id} status={item.isConsumed ? 'Consumed' : 'Reserved'} />,
  ]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Material {material.code} - {material.name}
          </h1>
          <p className="text-sm text-slate-400">Inventory detail with stock movement actions for office operations.</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={material.isLowStock ? 'LowStock' : 'InStock'} />
          <StatusBadge status={material.isActive ? 'Active' : 'Inactive'} />
        </div>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/inventory/materials">
          Back to materials list
        </Link>
      </section>

      {feedback ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Category" value={formatLabel(material.category)} />
        <StatCard label="Current Stock" value={`${material.currentStock} ${material.unit}`} />
        <StatCard label="Minimum Stock" value={`${material.minimumStock} ${material.unit}`} />
        <StatCard label="Unit Cost" value={`${material.unitCost.toFixed(2)} ${material.currency}`} />
        <StatCard label="Supplier" value={material.supplier ?? 'Not specified'} />
        <StatCard label="Last Restock" value={formatDateTime(material.lastRestockDate)} />
        <StatCard
          label="Reorder Quantity"
          value={material.reorderQuantity != null ? `${material.reorderQuantity} ${material.unit}` : 'Not set'}
        />
        <StatCard label="Description" value={material.description || 'No description'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Add Stock</h2>
          <Input
            min={0.01}
            onChange={(event) => setAddQuantity(event.target.value)}
            step="0.01"
            type="number"
            value={addQuantity}
          />
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setAddUnit(event.target.value as MaterialUnit)}
            value={addUnit}
          >
            {MATERIAL_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <Input
            onChange={(event) => setAddSupplier(event.target.value)}
            placeholder="Supplier (optional)"
            value={addSupplier}
          />
          <Button
            disabled={isBusy || Number(addQuantity) <= 0}
            onClick={() =>
              runAction('Add stock', () =>
                addStockMutation.mutateAsync({
                  quantity: Number(addQuantity),
                  unit: addUnit,
                  supplier: addSupplier.trim() || undefined,
                }),
              )
            }
            type="button"
          >
            Add Stock
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Reserve Stock</h2>
          <Input
            onChange={(event) => setReserveVisitId(event.target.value)}
            placeholder="Visit ID"
            value={reserveVisitId}
          />
          <Input
            min={0.01}
            onChange={(event) => setReserveQuantity(event.target.value)}
            step="0.01"
            type="number"
            value={reserveQuantity}
          />
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setReserveUnit(event.target.value as MaterialUnit)}
            value={reserveUnit}
          >
            {MATERIAL_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <Button
            disabled={isBusy || !reserveVisitId.trim() || Number(reserveQuantity) <= 0}
            onClick={() =>
              runAction('Reserve stock', () =>
                reserveStockMutation.mutateAsync({
                  visitId: reserveVisitId.trim(),
                  quantity: Number(reserveQuantity),
                  unit: reserveUnit,
                }),
              )
            }
            type="button"
            variant="secondary"
          >
            Reserve Stock
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Consume Reserved Stock</h2>
          <Input
            onChange={(event) => setConsumeVisitId(event.target.value)}
            placeholder="Visit ID"
            value={consumeVisitId}
          />
          <p className="text-xs text-slate-400">Consumes the reserved quantity linked to the visit.</p>
          <Button
            disabled={isBusy || !consumeVisitId.trim()}
            onClick={() =>
              runAction('Consume stock', () =>
                consumeStockMutation.mutateAsync({
                  visitId: consumeVisitId.trim(),
                }),
              )
            }
            type="button"
            variant="danger"
          >
            Consume Stock
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        {transactionRows.length === 0 ? (
          <p className="text-sm text-slate-400">No recent transactions.</p>
        ) : (
          <DataTable
            headers={['Date', 'Type', 'Quantity', 'Stock Change', 'Visit', 'By']}
            rows={transactionRows}
          />
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Active Reservations</h2>
        {reservationRows.length === 0 ? (
          <p className="text-sm text-slate-400">No active reservations.</p>
        ) : (
          <DataTable headers={['Visit', 'Quantity', 'Reserved At', 'Status']} rows={reservationRows} />
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
