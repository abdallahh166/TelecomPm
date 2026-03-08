'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCreateMaterial } from '@/hooks/use-materials';
import { toApiError } from '@/lib/error-adapter';
import { MaterialCategory, MaterialUnit } from '@/types/materials';

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Cable',
  'Electrical',
  'Cooling',
  'Power',
  'Transmission',
  'Safety',
  'Cleaning',
  'Tools',
  'Other',
];

const MATERIAL_UNITS: MaterialUnit[] = ['Pieces', 'Meters', 'Kilograms', 'Liters', 'Set', 'Box'];

export default function NewMaterialPage() {
  const auth = useAuth();
  const officeId = auth.user?.officeId;
  const router = useRouter();
  const createMutation = useCreateMaterial();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Cable');
  const [unit, setUnit] = useState<MaterialUnit>('Pieces');
  const [initialStock, setInitialStock] = useState('1');
  const [minimumStock, setMinimumStock] = useState('1');
  const [unitCost, setUnitCost] = useState('1');
  const [supplier, setSupplier] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  if (!officeId) {
    return <ErrorState message="Your account is missing office assignment." />;
  }

  const canSubmit =
    code.trim().length > 0 &&
    name.trim().length > 0 &&
    Number(initialStock) > 0 &&
    Number(minimumStock) > 0 &&
    Number(unitCost) > 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Material</h1>
        <p className="text-sm text-slate-400">Create a new inventory material entry for your office.</p>
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

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Code</span>
          <Input
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="MAT-CABLE-001"
            value={code}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <Input onChange={(event) => setName(event.target.value)} placeholder="Battery Fuse" value={name} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Description</span>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Material description"
            value={description}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Category</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setCategory(event.target.value as MaterialCategory)}
            value={category}
          >
            {MATERIAL_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Unit</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setUnit(event.target.value as MaterialUnit)}
            value={unit}
          >
            {MATERIAL_UNITS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Initial Stock</span>
          <Input
            min={0.01}
            onChange={(event) => setInitialStock(event.target.value)}
            step="0.01"
            type="number"
            value={initialStock}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Minimum Stock</span>
          <Input
            min={0.01}
            onChange={(event) => setMinimumStock(event.target.value)}
            step="0.01"
            type="number"
            value={minimumStock}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Unit Cost</span>
          <Input
            min={0.01}
            onChange={(event) => setUnitCost(event.target.value)}
            step="0.01"
            type="number"
            value={unitCost}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Supplier (optional)</span>
          <Input onChange={(event) => setSupplier(event.target.value)} value={supplier} />
        </label>
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const created = await createMutation.mutateAsync({
              code: code.trim(),
              name: name.trim(),
              description: description.trim() || undefined,
              category,
              officeId,
              initialStock: Number(initialStock),
              unit,
              minimumStock: Number(minimumStock),
              unitCost: Number(unitCost),
              supplier: supplier.trim() || undefined,
            });
            setFeedback({ tone: 'success', message: 'Material created successfully. Redirecting to detail page...' });
            router.push(`/inventory/materials/${created.id}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Material
      </Button>
    </main>
  );
}
