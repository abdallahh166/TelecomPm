import { useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ASSET_TYPE_OPTIONS } from "../../features/operations/enumOptions";
import {
  assetsApi,
  type AssetDto,
  type RegisterAssetRequest,
} from "../../features/operations/assetsApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

type RegisterAssetFormState = {
  siteCode: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  installedAtUtc: string;
  warrantyExpiresAtUtc: string;
};

const EMPTY_REGISTER_FORM: RegisterAssetFormState = {
  siteCode: "",
  type: ASSET_TYPE_OPTIONS[0]?.value ?? "Rectifier",
  brand: "",
  model: "",
  serialNumber: "",
  installedAtUtc: new Date().toISOString().slice(0, 10),
  warrantyExpiresAtUtc: "",
};

function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toRegisterRequest(form: RegisterAssetFormState): RegisterAssetRequest | null {
  const installed = toIsoDate(form.installedAtUtc);
  if (!installed) {
    return null;
  }

  const warranty = toIsoDate(form.warrantyExpiresAtUtc);
  return {
    siteCode: form.siteCode.trim(),
    type: form.type,
    brand: form.brand.trim() || undefined,
    model: form.model.trim() || undefined,
    serialNumber: form.serialNumber.trim() || undefined,
    installedAtUtc: installed,
    warrantyExpiresAtUtc: warranty ?? undefined,
  };
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Date(parsed).toLocaleDateString();
}

export function AssetsOperationsPage() {
  const { hasPermission } = useAuth();
  const canManageSites = hasPermission(OperationsPermissionKeys.sitesManage);

  const [siteCodeQuery, setSiteCodeQuery] = useState("");
  const [assetCodeQuery, setAssetCodeQuery] = useState("");
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
  const [faultyAssets, setFaultyAssets] = useState<AssetDto[]>([]);
  const [expiringAssets, setExpiringAssets] = useState<AssetDto[]>([]);
  const [warrantyDays, setWarrantyDays] = useState("30");
  const [registerForm, setRegisterForm] = useState<RegisterAssetFormState>(EMPTY_REGISTER_FORM);
  const [serviceType, setServiceType] = useState("");
  const [serviceEngineerId, setServiceEngineerId] = useState("");
  const [serviceVisitId, setServiceVisitId] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [faultReason, setFaultReason] = useState("");
  const [faultEngineerId, setFaultEngineerId] = useState("");
  const [replaceAssetId, setReplaceAssetId] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLoadBySite = async (): Promise<void> => {
    const siteCode = siteCodeQuery.trim();
    if (!siteCode) {
      setError("Site code is required.");
      return;
    }

    setError(null);
    setIsLoadingList(true);
    try {
      const result = await assetsApi.listBySite(siteCode);
      setAssets(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load site assets."));
    } finally {
      setIsLoadingList(false);
    }
  };

  const onLookupByCode = async (): Promise<void> => {
    const assetCode = assetCodeQuery.trim();
    if (!assetCode) {
      setError("Asset code is required.");
      return;
    }

    setError(null);
    try {
      const result = await assetsApi.getHistory(assetCode);
      setSelectedAsset(result);
    } catch (lookupError) {
      setError(getErrorMessage(lookupError, "Failed to load asset."));
    }
  };

  const onLoadFaulty = async (): Promise<void> => {
    setError(null);
    try {
      const result = await assetsApi.listFaulty();
      setFaultyAssets(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load faulty assets."));
    }
  };

  const onLoadExpiring = async (): Promise<void> => {
    const parsedDays = Number.parseInt(warrantyDays, 10);
    if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      setError("Warranty days must be between 1 and 365.");
      return;
    }

    setError(null);
    try {
      const result = await assetsApi.listExpiringWarranties(parsedDays);
      setExpiringAssets(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load expiring warranties."));
    }
  };

  const onRegisterAsset = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canManageSites) {
      return;
    }

    if (!registerForm.siteCode.trim()) {
      setError("Site code is required.");
      return;
    }

    const request = toRegisterRequest(registerForm);
    if (!request) {
      setError("Installed date is invalid.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const result = await assetsApi.register(request);
      setSelectedAsset(result);
      setRegisterForm(EMPTY_REGISTER_FORM);
      setMessage("Asset registered.");
      await onLoadBySite();
    } catch (registerError) {
      setError(getErrorMessage(registerError, "Failed to register asset."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRecordService = async (): Promise<void> => {
    if (!canManageSites || !selectedAsset) {
      return;
    }

    if (!serviceType.trim()) {
      setError("Service type is required.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await assetsApi.recordService(selectedAsset.assetCode, {
        serviceType: serviceType.trim(),
        engineerId: serviceEngineerId.trim() || undefined,
        visitId: serviceVisitId.trim() || undefined,
        notes: serviceNotes.trim() || undefined,
      });
      setMessage("Asset service recorded.");
      const refreshed = await assetsApi.getHistory(selectedAsset.assetCode);
      setSelectedAsset(refreshed);
    } catch (serviceError) {
      setError(getErrorMessage(serviceError, "Failed to record asset service."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMarkFault = async (): Promise<void> => {
    if (!canManageSites || !selectedAsset) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await assetsApi.markFault(selectedAsset.assetCode, {
        reason: faultReason.trim() || undefined,
        engineerId: faultEngineerId.trim() || undefined,
      });
      setMessage("Asset marked as faulty.");
      const refreshed = await assetsApi.getHistory(selectedAsset.assetCode);
      setSelectedAsset(refreshed);
      await onLoadFaulty();
    } catch (faultError) {
      setError(getErrorMessage(faultError, "Failed to mark asset faulty."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReplace = async (): Promise<void> => {
    if (!canManageSites || !selectedAsset) {
      return;
    }

    if (!replaceAssetId.trim()) {
      setError("Replacement asset id is required.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await assetsApi.replace(selectedAsset.assetCode, { newAssetId: replaceAssetId.trim() });
      setMessage("Asset replacement saved.");
      const refreshed = await assetsApi.getHistory(selectedAsset.assetCode);
      setSelectedAsset(refreshed);
    } catch (replaceError) {
      setError(getErrorMessage(replaceError, "Failed to replace asset."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <article className="panel">
        <h3>Asset Inventory</h3>
        <div className="admin-toolbar">
          <input
            className="field-input compact"
            placeholder="Site code"
            value={siteCodeQuery}
            onChange={(event) => setSiteCodeQuery(event.target.value)}
          />
          <button type="button" className="btn-outline" disabled={isLoadingList} onClick={() => void onLoadBySite()}>
            {isLoadingList ? "Loading..." : "Load Site Assets"}
          </button>
          <input
            className="field-input compact"
            placeholder="Asset code"
            value={assetCodeQuery}
            onChange={(event) => setAssetCodeQuery(event.target.value)}
          />
          <button type="button" className="btn-outline" onClick={() => void onLookupByCode()}>
            Lookup Asset
          </button>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Site</th>
                <th>Type</th>
                <th>Status</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.assetCode}</td>
                  <td>{asset.siteCode}</td>
                  <td>{asset.type}</td>
                  <td>{asset.status}</td>
                  <td>{formatDate(asset.warrantyExpiresAtUtc)}</td>
                  <td className="table-actions">
                    <button type="button" className="btn-outline" onClick={() => setSelectedAsset(asset)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {!assets.length ? (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No assets loaded.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      {canManageSites ? (
        <article className="panel">
          <h3>Register Asset</h3>
          <form className="admin-form-grid" onSubmit={onRegisterAsset}>
            <input
              className="field-input"
              placeholder="Site code"
              value={registerForm.siteCode}
              onChange={(event) => setRegisterForm((current) => ({ ...current, siteCode: event.target.value }))}
              required
            />
            <select
              className="field-input"
              value={registerForm.type}
              onChange={(event) => setRegisterForm((current) => ({ ...current, type: event.target.value }))}
            >
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="field-input"
              placeholder="Brand"
              value={registerForm.brand}
              onChange={(event) => setRegisterForm((current) => ({ ...current, brand: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Model"
              value={registerForm.model}
              onChange={(event) => setRegisterForm((current) => ({ ...current, model: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Serial number"
              value={registerForm.serialNumber}
              onChange={(event) => setRegisterForm((current) => ({ ...current, serialNumber: event.target.value }))}
            />
            <input
              className="field-input"
              type="date"
              value={registerForm.installedAtUtc}
              onChange={(event) => setRegisterForm((current) => ({ ...current, installedAtUtc: event.target.value }))}
            />
            <input
              className="field-input"
              type="date"
              value={registerForm.warrantyExpiresAtUtc}
              onChange={(event) => setRegisterForm((current) => ({ ...current, warrantyExpiresAtUtc: event.target.value }))}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Register Asset"}
            </button>
          </form>
        </article>
      ) : null}

      {selectedAsset ? (
        <article className="panel">
          <h3>
            Asset Detail: {selectedAsset.assetCode} ({selectedAsset.status})
          </h3>
          <p className="text-muted">
            Type: {selectedAsset.type} | Brand: {selectedAsset.brand ?? "-"} | Model: {selectedAsset.model ?? "-"}
          </p>
          <p className="text-muted">Service history records: {selectedAsset.serviceHistory.length}</p>
          {canManageSites ? (
            <div className="admin-form-grid">
              <input
                className="field-input"
                placeholder="Service type"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
              />
              <input
                className="field-input"
                placeholder="Engineer id (optional)"
                value={serviceEngineerId}
                onChange={(event) => setServiceEngineerId(event.target.value)}
              />
              <input
                className="field-input"
                placeholder="Visit id (optional)"
                value={serviceVisitId}
                onChange={(event) => setServiceVisitId(event.target.value)}
              />
              <input
                className="field-input"
                placeholder="Service notes"
                value={serviceNotes}
                onChange={(event) => setServiceNotes(event.target.value)}
              />
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onRecordService()}>
                {isSubmitting ? "Working..." : "Record Service"}
              </button>
              <input
                className="field-input"
                placeholder="Fault reason"
                value={faultReason}
                onChange={(event) => setFaultReason(event.target.value)}
              />
              <input
                className="field-input"
                placeholder="Fault engineer id"
                value={faultEngineerId}
                onChange={(event) => setFaultEngineerId(event.target.value)}
              />
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onMarkFault()}>
                {isSubmitting ? "Working..." : "Mark Faulty"}
              </button>
              <input
                className="field-input"
                placeholder="Replacement asset id"
                value={replaceAssetId}
                onChange={(event) => setReplaceAssetId(event.target.value)}
              />
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onReplace()}>
                {isSubmitting ? "Working..." : "Replace Asset"}
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      <article className="panel">
        <h3>Faulty & Expiring Assets</h3>
        <div className="admin-toolbar">
          <button type="button" className="btn-outline" onClick={() => void onLoadFaulty()}>
            Load Faulty Assets
          </button>
          <input
            className="field-input compact"
            placeholder="Warranty days"
            value={warrantyDays}
            onChange={(event) => setWarrantyDays(event.target.value)}
          />
          <button type="button" className="btn-outline" onClick={() => void onLoadExpiring()}>
            Load Expiring Warranties
          </button>
        </div>
        <p className="text-muted">
          Faulty assets: {faultyAssets.length} | Expiring warranties: {expiringAssets.length}
        </p>
      </article>

      {error ? <p className="text-danger">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
    </div>
  );
}

