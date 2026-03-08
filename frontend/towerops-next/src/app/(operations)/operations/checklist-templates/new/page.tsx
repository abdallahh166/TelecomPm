'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCreateChecklistTemplate } from '@/hooks/use-checklist-templates';
import { toApiError } from '@/lib/error-adapter';
import { CreateChecklistTemplateItemPayload } from '@/types/checklist-templates';

const VISIT_TYPES = ['BM', 'CM', 'Emergency', 'Installation', 'Upgrade', 'Inspection', 'Commissioning', 'Audit'];

function nowAsDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

function createEmptyItem(orderIndex: number): CreateChecklistTemplateItemPayload {
  return {
    category: '',
    itemName: '',
    description: '',
    isMandatory: true,
    orderIndex,
    applicableSiteTypes: '',
    applicableVisitTypes: '',
  };
}

export default function NewChecklistTemplatePage() {
  const auth = useAuth();
  const router = useRouter();
  const createMutation = useCreateChecklistTemplate();
  const [visitType, setVisitType] = useState('BM');
  const [version, setVersion] = useState('v1.0');
  const [effectiveFromUtc, setEffectiveFromUtc] = useState(nowAsDateTimeLocal);
  const [changeNotes, setChangeNotes] = useState('');
  const [createdBy, setCreatedBy] = useState(auth.user?.email ?? '');
  const [items, setItems] = useState<CreateChecklistTemplateItemPayload[]>([createEmptyItem(1)]);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canSubmit =
    version.trim().length > 0 &&
    createdBy.trim().length > 0 &&
    Boolean(effectiveFromUtc) &&
    items.length > 0 &&
    items.every((item) => item.category.trim().length > 0 && item.itemName.trim().length > 0);

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Checklist Template</h1>
        <p className="text-sm text-slate-400">Create a template version and checklist items for a specific visit type.</p>
      </div>

      <section className="text-sm">
        <Link className="text-brand-blue underline" href="/operations/checklist-templates">
          Back to checklist templates
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
          <span>Visit Type</span>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setVisitType(event.target.value)}
            value={visitType}
          >
            {VISIT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Version</span>
          <Input onChange={(event) => setVersion(event.target.value)} placeholder="v1.0" value={version} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Effective From</span>
          <Input
            onChange={(event) => setEffectiveFromUtc(event.target.value)}
            type="datetime-local"
            value={effectiveFromUtc}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Created By</span>
          <Input onChange={(event) => setCreatedBy(event.target.value)} value={createdBy} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Change Notes (optional)</span>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChangeNotes(event.target.value)}
            placeholder="Describe the version changes"
            value={changeNotes}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Checklist Items</h2>
          <Button
            onClick={() => {
              setItems((current) => [...current, createEmptyItem(current.length + 1)]);
            }}
            type="button"
            variant="secondary"
          >
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div className="grid gap-3 rounded-md border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2" key={index}>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Category</span>
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, category: value } : currentItem,
                    ),
                  );
                }}
                placeholder="Power"
                value={item.category}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Item Name</span>
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, itemName: value } : currentItem,
                    ),
                  );
                }}
                placeholder="Check breaker status"
                value={item.itemName}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
              <span>Description (optional)</span>
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, description: value } : currentItem,
                    ),
                  );
                }}
                value={item.description ?? ''}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Applicable Site Types (optional)</span>
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, applicableSiteTypes: value } : currentItem,
                    ),
                  );
                }}
                placeholder="Indoor,Outdoor"
                value={item.applicableSiteTypes ?? ''}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Applicable Visit Types (optional)</span>
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, applicableVisitTypes: value } : currentItem,
                    ),
                  );
                }}
                placeholder="BM,Audit"
                value={item.applicableVisitTypes ?? ''}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                checked={item.isMandatory}
                className="h-4 w-4"
                onChange={(event) => {
                  const value = event.target.checked;
                  setItems((current) =>
                    current.map((currentItem, currentIndex) =>
                      currentIndex === index ? { ...currentItem, isMandatory: value } : currentItem,
                    ),
                  );
                }}
                type="checkbox"
              />
              Mandatory
            </label>
            <div className="flex items-end justify-end">
              <Button
                disabled={items.length <= 1}
                onClick={() => {
                  setItems((current) =>
                    current
                      .filter((_, currentIndex) => currentIndex !== index)
                      .map((currentItem, currentIndex) => ({
                        ...currentItem,
                        orderIndex: currentIndex + 1,
                      })),
                  );
                }}
                type="button"
                variant="danger"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </section>

      <Button
        disabled={!canSubmit || createMutation.isPending}
        onClick={async () => {
          try {
            const templateId = await createMutation.mutateAsync({
              visitType,
              version: version.trim(),
              effectiveFromUtc: new Date(effectiveFromUtc).toISOString(),
              changeNotes: changeNotes.trim() || undefined,
              createdBy: createdBy.trim(),
              items: items.map((item, index) => ({
                category: item.category.trim(),
                itemName: item.itemName.trim(),
                description: item.description?.trim() || undefined,
                isMandatory: item.isMandatory,
                orderIndex: index + 1,
                applicableSiteTypes: item.applicableSiteTypes?.trim() || undefined,
                applicableVisitTypes: item.applicableVisitTypes?.trim() || undefined,
              })),
            });

            setFeedback({ tone: 'success', message: 'Checklist template created successfully. Redirecting...' });
            router.push(`/operations/checklist-templates/${templateId}`);
          } catch (error) {
            setFeedback({ tone: 'error', message: toApiError(error).message });
          }
        }}
        type="button"
      >
        Create Template
      </Button>
    </main>
  );
}
