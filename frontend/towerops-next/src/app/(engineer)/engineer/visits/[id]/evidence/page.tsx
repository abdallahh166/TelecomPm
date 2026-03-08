'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useAddChecklistItem,
  useAddVisitIssue,
  useAddVisitPhoto,
  useAddVisitReading,
  useCaptureVisitSignature,
  useImportAlarmEvidence,
  useImportPanoramaEvidence,
  useImportUnusedAssets,
  useRemoveVisitPhoto,
  useResolveVisitIssue,
  useUpdateChecklistItem,
  useUpdateVisitReading,
  useVisit,
  useVisitEvidenceStatus,
  useVisitSignature,
} from '@/hooks/use-visits';
import { toApiError } from '@/lib/error-adapter';
import { formatDateTime, formatPercent, formatLabel } from '@/lib/format';
import {
  ChecklistStatus,
  IssueCategory,
  IssueSeverity,
  PhotoCategory,
  PhotoType,
} from '@/types/visits';

const CHECK_STATUSES: readonly ChecklistStatus[] = ['OK', 'NOK', 'NA'];
const ISSUE_CATEGORIES: readonly IssueCategory[] = [
  'Electrical',
  'Power',
  'Cooling',
  'Radio',
  'Transmission',
  'Generator',
  'Fire',
  'Structure',
  'Other',
];
const ISSUE_SEVERITIES: readonly IssueSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
const PHOTO_TYPES: readonly PhotoType[] = ['Before', 'After', 'During', 'Material', 'Issue'];
const PHOTO_CATEGORIES: readonly PhotoCategory[] = [
  'ShelterInside',
  'ShelterOutside',
  'Tower',
  'Fence',
  'GEDP',
  'Rectifier',
  'Batteries',
  'PowerMeter',
  'SurgeArrestor',
  'AirConditioner',
  'FirePanel',
  'FireExtinguisher',
  'BTS',
  'NodeB',
  'MW',
  'DDF',
  'EarthBar',
  'EarthRod',
  'CableTray',
  'Roxtec',
  'Generator',
  'PMLogbook',
  'Other',
];

export default function EngineerVisitEvidencePage() {
  const params = useParams<{ id: string }>();
  const visitId = params.id;
  const visitQuery = useVisit(visitId);
  const evidenceQuery = useVisitEvidenceStatus(visitId);
  const signatureQuery = useVisitSignature(visitId);
  const addChecklistMutation = useAddChecklistItem(visitId);
  const updateChecklistMutation = useUpdateChecklistItem(visitId);
  const addIssueMutation = useAddVisitIssue(visitId);
  const resolveIssueMutation = useResolveVisitIssue(visitId);
  const addReadingMutation = useAddVisitReading(visitId);
  const updateReadingMutation = useUpdateVisitReading(visitId);
  const addPhotoMutation = useAddVisitPhoto(visitId);
  const removePhotoMutation = useRemoveVisitPhoto(visitId);
  const captureSignatureMutation = useCaptureVisitSignature(visitId);
  const importPanoramaMutation = useImportPanoramaEvidence(visitId);
  const importAlarmMutation = useImportAlarmEvidence(visitId);
  const importUnusedAssetsMutation = useImportUnusedAssets(visitId);

  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const [checklistCategory, setChecklistCategory] = useState('General');
  const [checklistItemName, setChecklistItemName] = useState('');
  const [checklistDescription, setChecklistDescription] = useState('');
  const [checklistMandatory, setChecklistMandatory] = useState(true);
  const [checklistToUpdateId, setChecklistToUpdateId] = useState('');
  const [checklistStatus, setChecklistStatus] = useState<ChecklistStatus>('OK');
  const [checklistNotes, setChecklistNotes] = useState('');

  const [issueCategory, setIssueCategory] = useState<IssueCategory>('Power');
  const [issueSeverity, setIssueSeverity] = useState<IssueSeverity>('Medium');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePhotoIds, setIssuePhotoIds] = useState('');
  const [issueToResolveId, setIssueToResolveId] = useState('');
  const [issueResolution, setIssueResolution] = useState('');

  const [readingType, setReadingType] = useState('Voltage');
  const [readingCategory, setReadingCategory] = useState('Power');
  const [readingValue, setReadingValue] = useState('');
  const [readingUnit, setReadingUnit] = useState('V');
  const [readingMin, setReadingMin] = useState('');
  const [readingMax, setReadingMax] = useState('');
  const [readingPhase, setReadingPhase] = useState('');
  const [readingEquipment, setReadingEquipment] = useState('');
  const [readingNotes, setReadingNotes] = useState('');
  const [readingToUpdateId, setReadingToUpdateId] = useState('');
  const [readingUpdatedValue, setReadingUpdatedValue] = useState('');

  const [photoType, setPhotoType] = useState<PhotoType>('Before');
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>('Other');
  const [photoItemName, setPhotoItemName] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoLatitude, setPhotoLatitude] = useState('');
  const [photoLongitude, setPhotoLongitude] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoToRemoveId, setPhotoToRemoveId] = useState('');

  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Site Contact');
  const [signatureDataBase64, setSignatureDataBase64] = useState('');
  const [signerPhone, setSignerPhone] = useState('');
  const [signatureLatitude, setSignatureLatitude] = useState('');
  const [signatureLongitude, setSignatureLongitude] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);

  if (visitQuery.isLoading || evidenceQuery.isLoading) {
    return <LoadingState label="Loading evidence workspace..." />;
  }

  if (visitQuery.isError || evidenceQuery.isError || !visitQuery.data || !evidenceQuery.data) {
    return (
      <ErrorState
        message="Failed to load evidence workspace."
        onRetry={() => {
          void visitQuery.refetch();
          void evidenceQuery.refetch();
        }}
      />
    );
  }

  const visit = visitQuery.data;
  const evidence = evidenceQuery.data;
  const signature = signatureQuery.data;
  const selectedChecklistId = checklistToUpdateId || visit.checklists[0]?.id || '';
  const selectedIssueId = issueToResolveId || visit.issuesFound[0]?.id || '';
  const selectedReadingId = readingToUpdateId || visit.readings[0]?.id || '';
  const selectedPhotoId = photoToRemoveId || visit.photos[0]?.id || '';
  const hasChecklistSelection = Boolean(selectedChecklistId);
  const hasIssueSelection = Boolean(selectedIssueId);
  const hasReadingSelection = Boolean(selectedReadingId);
  const hasPhotoSelection = Boolean(selectedPhotoId);

  const isBusy =
    addChecklistMutation.isPending ||
    updateChecklistMutation.isPending ||
    addIssueMutation.isPending ||
    resolveIssueMutation.isPending ||
    addReadingMutation.isPending ||
    updateReadingMutation.isPending ||
    addPhotoMutation.isPending ||
    removePhotoMutation.isPending ||
    captureSignatureMutation.isPending ||
    importPanoramaMutation.isPending ||
    importAlarmMutation.isPending ||
    importUnusedAssetsMutation.isPending;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setFeedback({ tone: 'success', message: `${label} completed.` });
    } catch (error) {
      setFeedback({ tone: 'error', message: toApiError(error).message });
    }
  };

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Evidence Workspace {visit.visitNumber}</h1>
          <p className="text-sm text-slate-400">
            Evidence readiness view for checklist, readings, photos, issues, and review history.
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={visit.status} />
          <StatusBadge status={visit.type} />
        </div>
      </div>

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
        <MetricCard
          label="Photos"
          value={`${evidence.beforePhotos}/${evidence.requiredBeforePhotos} before, ${evidence.afterPhotos}/${evidence.requiredAfterPhotos} after`}
        />
        <MetricCard
          label="Readings"
          value={`${evidence.readingsCount}/${evidence.requiredReadings || evidence.readingsCount}`}
        />
        <MetricCard label="Checklist" value={`${evidence.completedChecklistItems}/${evidence.checklistItems}`} />
        <MetricCard label="Completion Score" value={formatPercent(evidence.completionPercentage)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <EntityList
          title="Photos"
          emptyLabel="No photos captured."
          items={visit.photos.map((photo) => ({
            id: photo.id,
            title: `${formatLabel(photo.type)} / ${formatLabel(photo.category)}`,
            subtitle: `${photo.itemName} | ${formatLabel(photo.fileStatus)} | ${formatDateTime(photo.capturedAt)}`,
          }))}
        />
        <EntityList
          title="Readings"
          emptyLabel="No readings captured."
          items={visit.readings.map((reading) => ({
            id: reading.id,
            title: `${formatLabel(reading.readingType)} | ${reading.value} ${reading.unit}`,
            subtitle: `${reading.isWithinRange ? 'Within range' : 'Out of range'} | ${formatDateTime(reading.measuredAt)}`,
          }))}
        />
        <EntityList
          title="Checklist"
          emptyLabel="No checklist items added."
          items={visit.checklists.map((checklist) => ({
            id: checklist.id,
            title: `${checklist.itemName} | ${formatLabel(checklist.status)}`,
            subtitle: `${formatLabel(checklist.category)}${checklist.notes ? ` | ${checklist.notes}` : ''}`,
          }))}
        />
        <EntityList
          title="Issues"
          emptyLabel="No issues logged."
          items={visit.issuesFound.map((issue) => ({
            id: issue.id,
            title: `${issue.title} | ${formatLabel(issue.severity)}`,
            subtitle: `${formatLabel(issue.status)} | ${formatDateTime(issue.reportedAt)}`,
          }))}
        />
      </section>

      <EntityList
        title="Approval History"
        emptyLabel="No review decisions yet."
          items={visit.approvalHistory.map((approval) => ({
            id: approval.id,
            title: `${approval.reviewerName} | ${formatLabel(approval.action)}`,
            subtitle: `${approval.comments ?? 'No comments'} | ${formatDateTime(approval.reviewedAt)}`,
          }))}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Checklist Capture</h2>
          <h3 className="text-sm font-semibold text-slate-200">Add Item</h3>
          <Input onChange={(event) => setChecklistCategory(event.target.value)} value={checklistCategory} />
          <Input onChange={(event) => setChecklistItemName(event.target.value)} placeholder="Item name" value={checklistItemName} />
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChecklistDescription(event.target.value)}
            placeholder="Checklist description"
            value={checklistDescription}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              checked={checklistMandatory}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-900"
              onChange={(event) => setChecklistMandatory(event.target.checked)}
              type="checkbox"
            />
            Mandatory item
          </label>
          <Button
            disabled={isBusy || !checklistItemName.trim() || !checklistDescription.trim()}
            onClick={() =>
              runAction('Checklist item add', () =>
                addChecklistMutation.mutateAsync({
                  category: checklistCategory.trim() || 'General',
                  itemName: checklistItemName.trim(),
                  description: checklistDescription.trim(),
                  isMandatory: checklistMandatory,
                }),
              )
            }
            type="button"
          >
            Add Checklist Item
          </Button>

          <h3 className="pt-2 text-sm font-semibold text-slate-200">Update Existing Item</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChecklistToUpdateId(event.target.value)}
            value={selectedChecklistId}
          >
            {visit.checklists.map((item) => (
              <option key={item.id} value={item.id}>
                {item.itemName} ({item.id})
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChecklistStatus(event.target.value as ChecklistStatus)}
            value={checklistStatus}
          >
            {CHECK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <textarea
            className="min-h-[70px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setChecklistNotes(event.target.value)}
            placeholder="Checklist notes"
            value={checklistNotes}
          />
          <Button
            disabled={isBusy || !hasChecklistSelection}
            onClick={() =>
              runAction('Checklist update', () =>
                updateChecklistMutation.mutateAsync({
                  checklistItemId: selectedChecklistId,
                  payload: {
                    status: checklistStatus,
                    notes: checklistNotes.trim() || undefined,
                  },
                }),
              )
            }
            type="button"
            variant="secondary"
          >
            Update Checklist Item
          </Button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Issue Capture</h2>
          <h3 className="text-sm font-semibold text-slate-200">Add Issue</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueCategory(event.target.value as IssueCategory)}
            value={issueCategory}
          >
            {ISSUE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueSeverity(event.target.value as IssueSeverity)}
            value={issueSeverity}
          >
            {ISSUE_SEVERITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Input onChange={(event) => setIssueTitle(event.target.value)} placeholder="Issue title" value={issueTitle} />
          <textarea
            className="min-h-[90px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueDescription(event.target.value)}
            placeholder="Issue description"
            value={issueDescription}
          />
          <Input
            onChange={(event) => setIssuePhotoIds(event.target.value)}
            placeholder="Photo IDs (comma separated, optional)"
            value={issuePhotoIds}
          />
          <Button
            disabled={isBusy || !issueTitle.trim() || !issueDescription.trim()}
            onClick={() =>
              runAction('Issue add', () => {
                const parsedPhotoIds = issuePhotoIds
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean);

                return addIssueMutation.mutateAsync({
                  category: issueCategory,
                  severity: issueSeverity,
                  title: issueTitle.trim(),
                  description: issueDescription.trim(),
                  photoIds: parsedPhotoIds.length ? parsedPhotoIds : undefined,
                });
              })
            }
            type="button"
          >
            Add Issue
          </Button>

          <h3 className="pt-2 text-sm font-semibold text-slate-200">Resolve Issue</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueToResolveId(event.target.value)}
            value={selectedIssueId}
          >
            {visit.issuesFound.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title} ({issue.id})
              </option>
            ))}
          </select>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setIssueResolution(event.target.value)}
            placeholder="Resolution details"
            value={issueResolution}
          />
          <Button
            disabled={isBusy || !hasIssueSelection || !issueResolution.trim()}
            onClick={() =>
              runAction('Issue resolve', () =>
                resolveIssueMutation.mutateAsync({
                  issueId: selectedIssueId,
                  payload: { resolution: issueResolution.trim() },
                }),
              )
            }
            type="button"
            variant="secondary"
          >
            Resolve Issue
          </Button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Readings Capture</h2>
          <h3 className="text-sm font-semibold text-slate-200">Add Reading</h3>
          <Input onChange={(event) => setReadingType(event.target.value)} placeholder="Reading type" value={readingType} />
          <Input onChange={(event) => setReadingCategory(event.target.value)} placeholder="Category" value={readingCategory} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input onChange={(event) => setReadingValue(event.target.value)} placeholder="Value" type="number" value={readingValue} />
            <Input onChange={(event) => setReadingUnit(event.target.value)} placeholder="Unit" value={readingUnit} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input onChange={(event) => setReadingMin(event.target.value)} placeholder="Min acceptable (optional)" type="number" value={readingMin} />
            <Input onChange={(event) => setReadingMax(event.target.value)} placeholder="Max acceptable (optional)" type="number" value={readingMax} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input onChange={(event) => setReadingPhase(event.target.value)} placeholder="Phase (optional)" value={readingPhase} />
            <Input onChange={(event) => setReadingEquipment(event.target.value)} placeholder="Equipment (optional)" value={readingEquipment} />
          </div>
          <textarea
            className="min-h-[70px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setReadingNotes(event.target.value)}
            placeholder="Reading notes (optional)"
            value={readingNotes}
          />
          <Button
            disabled={isBusy || !readingType.trim() || !readingCategory.trim() || !readingValue.trim() || !readingUnit.trim()}
            onClick={() =>
              runAction('Reading add', () =>
                addReadingMutation.mutateAsync({
                  readingType: readingType.trim(),
                  category: readingCategory.trim(),
                  value: Number(readingValue),
                  unit: readingUnit.trim(),
                  minAcceptable: readingMin.trim() ? Number(readingMin) : undefined,
                  maxAcceptable: readingMax.trim() ? Number(readingMax) : undefined,
                  phase: readingPhase.trim() || undefined,
                  equipment: readingEquipment.trim() || undefined,
                  notes: readingNotes.trim() || undefined,
                }),
              )
            }
            type="button"
          >
            Add Reading
          </Button>

          <h3 className="pt-2 text-sm font-semibold text-slate-200">Update Reading Value</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setReadingToUpdateId(event.target.value)}
            value={selectedReadingId}
          >
            {visit.readings.map((reading) => (
              <option key={reading.id} value={reading.id}>
                {reading.readingType} ({reading.value} {reading.unit}) - {reading.id}
              </option>
            ))}
          </select>
          <Input
            onChange={(event) => setReadingUpdatedValue(event.target.value)}
            placeholder="Updated value"
            type="number"
            value={readingUpdatedValue}
          />
          <Button
            disabled={isBusy || !hasReadingSelection || !readingUpdatedValue.trim()}
            onClick={() =>
              runAction('Reading update', () =>
                updateReadingMutation.mutateAsync({
                  readingId: selectedReadingId,
                  payload: { value: Number(readingUpdatedValue) },
                }),
              )
            }
            type="button"
            variant="secondary"
          >
            Update Reading
          </Button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Photos Capture</h2>
          <h3 className="text-sm font-semibold text-slate-200">Upload Photo</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setPhotoType(event.target.value as PhotoType)}
            value={photoType}
          >
            {PHOTO_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setPhotoCategory(event.target.value as PhotoCategory)}
            value={photoCategory}
          >
            {PHOTO_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Input onChange={(event) => setPhotoItemName(event.target.value)} placeholder="Item name" value={photoItemName} />
          <Input onChange={(event) => setPhotoDescription(event.target.value)} placeholder="Description (optional)" value={photoDescription} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input onChange={(event) => setPhotoLatitude(event.target.value)} placeholder="Latitude (optional)" type="number" value={photoLatitude} />
            <Input onChange={(event) => setPhotoLongitude(event.target.value)} placeholder="Longitude (optional)" type="number" value={photoLongitude} />
          </div>
          <Input
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            type="file"
            accept="image/*"
          />
          <Button
            disabled={isBusy || !photoItemName.trim() || !photoFile}
            onClick={() =>
              runAction('Photo upload', async () => {
                if (!photoFile) {
                  throw new Error('Photo file is required.');
                }

                await addPhotoMutation.mutateAsync({
                  type: photoType,
                  category: photoCategory,
                  itemName: photoItemName.trim(),
                  file: photoFile,
                  description: photoDescription.trim() || undefined,
                  latitude: photoLatitude.trim() ? Number(photoLatitude) : undefined,
                  longitude: photoLongitude.trim() ? Number(photoLongitude) : undefined,
                });
                setPhotoFile(null);
              })
            }
            type="button"
          >
            Upload Photo
          </Button>

          <h3 className="pt-2 text-sm font-semibold text-slate-200">Remove Photo</h3>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setPhotoToRemoveId(event.target.value)}
            value={selectedPhotoId}
          >
            {visit.photos.map((photo) => (
              <option key={photo.id} value={photo.id}>
                {photo.itemName} ({photo.id})
              </option>
            ))}
          </select>
          <Button
            disabled={isBusy || !hasPhotoSelection}
            onClick={() => runAction('Photo remove', () => removePhotoMutation.mutateAsync(selectedPhotoId))}
            type="button"
            variant="danger"
          >
            Remove Photo
          </Button>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Visit Signature</h2>
          <Input onChange={(event) => setSignerName(event.target.value)} placeholder="Signer name" value={signerName} />
          <Input onChange={(event) => setSignerRole(event.target.value)} placeholder="Signer role" value={signerRole} />
          <Input onChange={(event) => setSignerPhone(event.target.value)} placeholder="Signer phone (optional)" value={signerPhone} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              onChange={(event) => setSignatureLatitude(event.target.value)}
              placeholder="Latitude (optional)"
              type="number"
              value={signatureLatitude}
            />
            <Input
              onChange={(event) => setSignatureLongitude(event.target.value)}
              placeholder="Longitude (optional)"
              type="number"
              value={signatureLongitude}
            />
          </div>
          <textarea
            className="min-h-[110px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            onChange={(event) => setSignatureDataBase64(event.target.value)}
            placeholder="Signature data base64"
            value={signatureDataBase64}
          />
          <Button
            disabled={isBusy || !signerName.trim() || !signerRole.trim() || !signatureDataBase64.trim()}
            onClick={() =>
              runAction('Capture signature', () =>
                captureSignatureMutation.mutateAsync({
                  signerName: signerName.trim(),
                  signerRole: signerRole.trim(),
                  signatureDataBase64: signatureDataBase64.trim(),
                  signerPhone: signerPhone.trim() || undefined,
                  latitude: signatureLatitude.trim() ? Number(signatureLatitude) : undefined,
                  longitude: signatureLongitude.trim() ? Number(signatureLongitude) : undefined,
                }),
              )
            }
            type="button"
          >
            Capture Signature
          </Button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Current Signature</h2>
          {signatureQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading signature...</p>
          ) : signatureQuery.isError || !signature ? (
            <p className="text-sm text-slate-400">No signature captured yet.</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Signer: {signature.signerName}</p>
              <p>Role: {signature.signerRole}</p>
              <p>Signed At: {formatDateTime(signature.signedAtUtc)}</p>
              <p>Phone: {signature.signerPhone ?? 'N/A'}</p>
              <p>
                Location:{' '}
                {signature.latitude !== undefined && signature.longitude !== undefined
                  ? `${signature.latitude}, ${signature.longitude}`
                  : 'N/A'}
              </p>
            </div>
          )}
        </section>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold">Bulk Evidence Imports</h2>
        <p className="text-sm text-slate-400">
          Upload an Excel file and trigger panorama, alarms, or unused-assets import for this visit.
        </p>
        <Input
          accept=".xlsx,.xls"
          onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            disabled={isBusy || !importFile}
            onClick={() =>
              runAction('Panorama import', async () => {
                if (!importFile) {
                  throw new Error('Import file is required.');
                }
                await importPanoramaMutation.mutateAsync({ file: importFile });
              })
            }
            type="button"
            variant="secondary"
          >
            Import Panorama
          </Button>
          <Button
            disabled={isBusy || !importFile}
            onClick={() =>
              runAction('Alarm import', async () => {
                if (!importFile) {
                  throw new Error('Import file is required.');
                }
                await importAlarmMutation.mutateAsync({ file: importFile });
              })
            }
            type="button"
            variant="secondary"
          >
            Import Alarms
          </Button>
          <Button
            disabled={isBusy || !importFile}
            onClick={() =>
              runAction('Unused assets import', async () => {
                if (!importFile) {
                  throw new Error('Import file is required.');
                }
                await importUnusedAssetsMutation.mutateAsync({ file: importFile });
              })
            }
            type="button"
            variant="secondary"
          >
            Import Unused Assets
          </Button>
        </div>
      </section>

      <div className="flex gap-4 text-sm">
        <Link className="text-brand-blue underline" href={`/engineer/visits/${visit.id}/execute`}>
          Back To Execute
        </Link>
        <Link className="text-brand-blue underline" href={`/visits/${visit.id}`}>
          Open Full Visit Detail
        </Link>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}

function EntityList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: { id: string; title: string; subtitle: string }[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3" key={item.id}>
              <p className="text-sm text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
