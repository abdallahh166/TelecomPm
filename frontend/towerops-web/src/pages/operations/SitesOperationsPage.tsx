import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { PageIntro } from "../../components/PageIntro/PageIntro";
import { EmptyState, InlineNotice, LoadingState } from "../../components/Feedback/States";
import type { OfficeDto } from "../../features/admin/officesApi";
import { officesApi } from "../../features/admin/officesApi";
import { usersApi, type UserDto } from "../../features/admin/usersApi";
import {
  SITE_COMPLEXITY_OPTIONS,
  SITE_STATUS_OPTIONS,
  SITE_TYPE_OPTIONS,
  TOWER_OWNERSHIP_OPTIONS,
} from "../../features/operations/enumOptions";
import {
  sitesApi,
  type CreateSiteRequest,
  type ImportSiteDataResult,
  type SiteDetailDto,
  type SiteDto,
  type SiteImportType,
  type UpdateSiteOwnershipRequest,
} from "../../features/operations/sitesApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { defaultPagination } from "../../features/operations/common";
import { getErrorMessage } from "../../shared/errors/errorMessage";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const IMPORT_TYPE_OPTIONS: Array<{ value: SiteImportType; label: string }> = [
  { value: "default", label: "Default Site Import" },
  { value: "siteAssets", label: "Site Assets" },
  { value: "powerData", label: "Power Data" },
  { value: "radioData", label: "Radio Data" },
  { value: "txData", label: "TX Data" },
  { value: "sharingData", label: "Sharing Data" },
  { value: "rfStatus", label: "RF Status" },
  { value: "batteryDischargeTests", label: "Battery Discharge Tests" },
  { value: "deltaSites", label: "Delta Sites" },
];

type SiteCreateFormState = {
  siteCode: string;
  name: string;
  omcName: string;
  region: string;
  subRegion: string;
  latitude: string;
  longitude: string;
  addressCity: string;
  addressRegion: string;
  addressStreet: string;
  addressDetails: string;
  siteType: string;
  bscName: string;
  bscCode: string;
};

type OwnershipFormState = {
  towerOwnershipType: string;
  towerOwnerName: string;
  sharingAgreementRef: string;
  hostContactName: string;
  hostContactPhone: string;
};

const EMPTY_CREATE_FORM: SiteCreateFormState = {
  siteCode: "",
  name: "",
  omcName: "",
  region: "",
  subRegion: "",
  latitude: "",
  longitude: "",
  addressCity: "",
  addressRegion: "",
  addressStreet: "",
  addressDetails: "",
  siteType: SITE_TYPE_OPTIONS[0]?.value ?? "Macro",
  bscName: "",
  bscCode: "",
};

const EMPTY_OWNERSHIP_FORM: OwnershipFormState = {
  towerOwnershipType: TOWER_OWNERSHIP_OPTIONS[0]?.value ?? "Host",
  towerOwnerName: "",
  sharingAgreementRef: "",
  hostContactName: "",
  hostContactPhone: "",
};

function parseRequiredNumber(value: string): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function isValidSiteCode(value: string): boolean {
  return /^[A-Z]{3}\d+$/.test(value.trim());
}

function validateCreateForm(form: SiteCreateFormState): string | null {
  if (!isValidSiteCode(form.siteCode)) {
    return "Site code must follow format XXX123.";
  }

  if (!form.name.trim()) {
    return "Site name is required.";
  }

  if (!form.omcName.trim()) {
    return "OMC name is required.";
  }

  if (!form.region.trim() || !form.subRegion.trim()) {
    return "Region and sub-region are required.";
  }

  if (!form.addressCity.trim() || !form.addressRegion.trim()) {
    return "Address city and address region are required.";
  }

  const latitude = parseRequiredNumber(form.latitude);
  const longitude = parseRequiredNumber(form.longitude);
  if (latitude === null || latitude < -90 || latitude > 90) {
    return "Latitude must be between -90 and 90.";
  }

  if (longitude === null || longitude < -180 || longitude > 180) {
    return "Longitude must be between -180 and 180.";
  }

  return null;
}

function buildCreateRequest(form: SiteCreateFormState, officeId: string): CreateSiteRequest {
  return {
    siteCode: form.siteCode.trim(),
    name: form.name.trim(),
    omcName: form.omcName.trim(),
    officeId,
    region: form.region.trim(),
    subRegion: form.subRegion.trim(),
    latitude: Number(form.latitude.trim()),
    longitude: Number(form.longitude.trim()),
    address: {
      city: form.addressCity.trim(),
      region: form.addressRegion.trim(),
      street: form.addressStreet.trim() || undefined,
      details: form.addressDetails.trim() || undefined,
    },
    siteType: form.siteType,
    bscName: form.bscName.trim() || undefined,
    bscCode: form.bscCode.trim() || undefined,
  };
}

function toOwnershipRequest(form: OwnershipFormState): UpdateSiteOwnershipRequest {
  return {
    towerOwnershipType: form.towerOwnershipType,
    towerOwnerName: form.towerOwnerName.trim() || undefined,
    sharingAgreementRef: form.sharingAgreementRef.trim() || undefined,
    hostContactName: form.hostContactName.trim() || undefined,
    hostContactPhone: form.hostContactPhone.trim() || undefined,
  };
}

function mapSiteToOwnershipForm(site: SiteDto): OwnershipFormState {
  return {
    towerOwnershipType: site.towerOwnershipType || (TOWER_OWNERSHIP_OPTIONS[0]?.value ?? "Host"),
    towerOwnerName: site.towerOwnerName ?? "",
    sharingAgreementRef: "",
    hostContactName: site.hostContactName ?? "",
    hostContactPhone: site.hostContactPhone ?? "",
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

export function SitesOperationsPage() {
  const { session, hasPermission } = useAuth();
  const canManageSites = hasPermission(OperationsPermissionKeys.sitesManage);

  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [officeId, setOfficeId] = useState<string>(session?.officeId ?? "");
  const [sites, setSites] = useState<SiteDto[]>([]);
  const [pagination, setPagination] = useState(defaultPagination());
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [complexityFilter, setComplexityFilter] = useState("");
  const [maintenanceDays, setMaintenanceDays] = useState("30");
  const [maintenanceSites, setMaintenanceSites] = useState<SiteDto[]>([]);
  const [selectedSite, setSelectedSite] = useState<SiteDetailDto | null>(null);
  const [statusUpdateValue, setStatusUpdateValue] = useState(SITE_STATUS_OPTIONS[0]?.value ?? "OnAir");
  const [engineers, setEngineers] = useState<UserDto[]>([]);
  const [assignEngineerId, setAssignEngineerId] = useState("");
  const [createForm, setCreateForm] = useState<SiteCreateFormState>(EMPTY_CREATE_FORM);
  const [ownershipForm, setOwnershipForm] = useState<OwnershipFormState>(EMPTY_OWNERSHIP_FORM);
  const [importType, setImportType] = useState<SiteImportType>("default");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportSiteDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [isSubmittingOwnership, setIsSubmittingOwnership] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOffices = useCallback(async () => {
    if (!canManageSites) {
      return;
    }

    try {
      const response = await officesApi.list({
        page: 1,
        pageSize: 100,
        sortBy: "code",
        sortDir: "asc",
        onlyActive: true,
      });
      setOffices(response.items);
      if (!officeId && response.items[0]) {
        setOfficeId(response.items[0].id);
      }
    } catch {
      // Office listing can be denied for non-admin roles.
    }
  }, [canManageSites, officeId]);

  const loadSites = useCallback(async () => {
    if (!officeId) {
      setSites([]);
      setPagination(defaultPagination());
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await sitesApi.listForOffice(officeId, {
        pageNumber,
        pageSize: 10,
        status: statusFilter || undefined,
        complexity: complexityFilter || undefined,
      });
      setSites(response.items);
      setPagination(response.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load sites."));
    } finally {
      setIsLoading(false);
    }
  }, [complexityFilter, officeId, pageNumber, statusFilter]);

  const loadMaintenanceSites = useCallback(async () => {
    if (!officeId) {
      setMaintenanceSites([]);
      return;
    }

    const parsedDays = Number.parseInt(maintenanceDays, 10);
    if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      setError("Maintenance threshold must be between 1 and 365 days.");
      return;
    }

    setIsLoadingMaintenance(true);
    setError(null);
    try {
      const response = await sitesApi.listMaintenance({
        officeId,
        daysThreshold: parsedDays,
      });
      setMaintenanceSites(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load maintenance sites."));
    } finally {
      setIsLoadingMaintenance(false);
    }
  }, [maintenanceDays, officeId]);

  const loadEngineers = useCallback(async () => {
    if (!canManageSites || !officeId) {
      setEngineers([]);
      return;
    }

    try {
      const response = await usersApi.listByRole("PMEngineer", {
        officeId,
        page: 1,
        pageSize: 100,
      });
      setEngineers(response.items.filter((user) => user.isActive));
      if (!assignEngineerId && response.items[0]) {
        setAssignEngineerId(response.items[0].id);
      }
    } catch {
      setEngineers([]);
    }
  }, [assignEngineerId, canManageSites, officeId]);

  useEffect(() => {
    void loadOffices();
  }, [loadOffices]);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  useEffect(() => {
    void loadEngineers();
  }, [loadEngineers]);

  const onSelectSite = async (siteId: string): Promise<void> => {
    setError(null);
    try {
      const site = await sitesApi.getById(siteId);
      setSelectedSite(site);
      setStatusUpdateValue(site.status);
      setOwnershipForm(mapSiteToOwnershipForm(site));
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load site details."));
    }
  };

  const onCreateSite = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canManageSites || !officeId) {
      return;
    }

    setMessage(null);
    setError(null);
    const validationError = validateCreateForm(createForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await sitesApi.create(buildCreateRequest(createForm, officeId));
      setCreateForm(EMPTY_CREATE_FORM);
      setMessage("Site created successfully.");
      await loadSites();
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create site."));
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const onUpdateStatus = async (): Promise<void> => {
    if (!canManageSites || !selectedSite) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmittingStatus(true);
    try {
      await sitesApi.updateStatus(selectedSite.id, statusUpdateValue);
      setMessage("Site status updated.");
      await loadSites();
      await onSelectSite(selectedSite.id);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update site status."));
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const onAssignEngineer = async (): Promise<void> => {
    if (!canManageSites || !selectedSite || !assignEngineerId) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmittingAssign(true);
    try {
      await sitesApi.assignEngineer(selectedSite.id, assignEngineerId);
      setMessage("Engineer assigned to site.");
      await onSelectSite(selectedSite.id);
    } catch (assignError) {
      setError(getErrorMessage(assignError, "Failed to assign engineer."));
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const onUnassignEngineer = async (): Promise<void> => {
    if (!canManageSites || !selectedSite) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmittingAssign(true);
    try {
      await sitesApi.unassignEngineer(selectedSite.id);
      setMessage("Engineer unassigned from site.");
      await onSelectSite(selectedSite.id);
    } catch (assignError) {
      setError(getErrorMessage(assignError, "Failed to unassign engineer."));
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const onUpdateOwnership = async (): Promise<void> => {
    if (!canManageSites || !selectedSite) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmittingOwnership(true);
    try {
      await sitesApi.updateOwnership(selectedSite.siteCode, toOwnershipRequest(ownershipForm));
      setMessage("Site ownership updated.");
      await loadSites();
      await onSelectSite(selectedSite.id);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update ownership."));
    } finally {
      setIsSubmittingOwnership(false);
    }
  };

  const onImport = async (): Promise<void> => {
    if (!canManageSites || !importFile) {
      return;
    }

    setError(null);
    setMessage(null);
    const fileName = importFile.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setError("Only .xlsx/.xls files are supported.");
      return;
    }

    if (importFile.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      setError("File exceeds 10 MB limit.");
      return;
    }

    setIsSubmittingImport(true);
    try {
      const result = await sitesApi.importData(importFile, importType);
      setImportResult(result);
      setMessage("Import completed.");
      await loadSites();
    } catch (importError) {
      setError(getErrorMessage(importError, "Import failed."));
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const officeOptions = useMemo(() => {
    if (offices.length > 0) {
      return offices;
    }

    if (!officeId) {
      return [];
    }

    return [
      {
        id: officeId,
        code: "Current",
        name: "Current Office",
        region: "",
        city: "",
        totalSites: 0,
        activeEngineers: 0,
        isActive: true,
      } satisfies OfficeDto,
    ];
  }, [officeId, offices]);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Phase 3"
        title="Sites Operations"
        description="Browse office sites, create new records, inspect maintenance candidates, and manage ownership and assignment details in a cleaner operations view."
      />

      <article className="panel">
        <div className="admin-toolbar">
          <h3>Sites</h3>
          <div className="toolbar-group">
            <select
              className="field-input compact"
              value={officeId}
              onChange={(event) => {
                setOfficeId(event.target.value);
                setPageNumber(1);
                setSelectedSite(null);
              }}
            >
              {officeOptions.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.code} - {office.name}
                </option>
              ))}
            </select>
            <select
              className="field-input compact"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPageNumber(1);
              }}
            >
              <option value="">All statuses</option>
              {SITE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="field-input compact"
              value={complexityFilter}
              onChange={(event) => {
                setComplexityFilter(event.target.value);
                setPageNumber(1);
              }}
            >
              <option value="">All complexities</option>
              {SITE_COMPLEXITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? <LoadingState title="Loading sites..." /> : null}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Site Code</th>
                <th>Name</th>
                <th>Region</th>
                <th>Type</th>
                <th>Status</th>
                <th>Complexity</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td>{site.siteCode}</td>
                  <td>{site.name}</td>
                  <td>
                    {site.region} / {site.subRegion}
                  </td>
                  <td>{site.siteType}</td>
                  <td>
                    <StatusBadge value={site.status === "OnAir"} trueLabel={site.status} falseLabel={site.status} />
                  </td>
                  <td>{site.complexity}</td>
                  <td>{formatDate(site.lastVisitDate)}</td>
                  <td className="table-actions">
                    <button type="button" className="btn-outline" onClick={() => void onSelectSite(site.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {!sites.length && !isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No sites found.">
                      Adjust the office, status, or complexity filters to broaden results.
                    </EmptyState>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} onPageChange={setPageNumber} />
      </article>

      {canManageSites ? (
        <article className="panel">
          <h3>Create Site</h3>
          <form className="admin-form-grid" onSubmit={onCreateSite}>
            <input
              className="field-input"
              placeholder="Site Code (e.g. CAI123)"
              value={createForm.siteCode}
              onChange={(event) => setCreateForm((current) => ({ ...current, siteCode: event.target.value.toUpperCase() }))}
              required
            />
            <input
              className="field-input"
              placeholder="Site Name"
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="OMC Name"
              value={createForm.omcName}
              onChange={(event) => setCreateForm((current) => ({ ...current, omcName: event.target.value }))}
              required
            />
            <select
              className="field-input"
              value={createForm.siteType}
              onChange={(event) => setCreateForm((current) => ({ ...current, siteType: event.target.value }))}
            >
              {SITE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="field-input"
              placeholder="Region"
              value={createForm.region}
              onChange={(event) => setCreateForm((current) => ({ ...current, region: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Sub Region"
              value={createForm.subRegion}
              onChange={(event) => setCreateForm((current) => ({ ...current, subRegion: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Latitude"
              value={createForm.latitude}
              onChange={(event) => setCreateForm((current) => ({ ...current, latitude: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Longitude"
              value={createForm.longitude}
              onChange={(event) => setCreateForm((current) => ({ ...current, longitude: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Address City"
              value={createForm.addressCity}
              onChange={(event) => setCreateForm((current) => ({ ...current, addressCity: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Address Region"
              value={createForm.addressRegion}
              onChange={(event) => setCreateForm((current) => ({ ...current, addressRegion: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Address Street"
              value={createForm.addressStreet}
              onChange={(event) => setCreateForm((current) => ({ ...current, addressStreet: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Address Details"
              value={createForm.addressDetails}
              onChange={(event) => setCreateForm((current) => ({ ...current, addressDetails: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="BSC Name"
              value={createForm.bscName}
              onChange={(event) => setCreateForm((current) => ({ ...current, bscName: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="BSC Code"
              value={createForm.bscCode}
              onChange={(event) => setCreateForm((current) => ({ ...current, bscCode: event.target.value }))}
            />
            <button type="submit" className="btn-primary" disabled={isSubmittingCreate}>
              {isSubmittingCreate ? "Creating..." : "Create Site"}
            </button>
          </form>
        </article>
      ) : null}

      <article className="panel">
        <h3>Maintenance Needed</h3>
        <div className="admin-toolbar">
          <input
            className="field-input compact"
            placeholder="Days threshold"
            value={maintenanceDays}
            onChange={(event) => setMaintenanceDays(event.target.value)}
          />
          <button type="button" className="btn-outline" disabled={isLoadingMaintenance} onClick={() => void loadMaintenanceSites()}>
            {isLoadingMaintenance ? "Loading..." : "Load Maintenance List"}
          </button>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Site Code</th>
                <th>Name</th>
                <th>Status</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceSites.map((site) => (
                <tr key={site.id}>
                  <td>{site.siteCode}</td>
                  <td>{site.name}</td>
                  <td>{site.status}</td>
                  <td>{formatDate(site.lastVisitDate)}</td>
                </tr>
              ))}
              {!maintenanceSites.length ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No maintenance sites loaded.">
                      Run the maintenance query to inspect sites that need attention.
                    </EmptyState>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      {selectedSite ? (
        <article className="panel">
          <h3>
            Site Details: {selectedSite.siteCode} - {selectedSite.name}
          </h3>
          <p className="text-muted">
            Type: {selectedSite.siteType} | Complexity: {selectedSite.complexity} | Status: {selectedSite.status}
          </p>
          {canManageSites ? (
            <div className="admin-form-grid">
              <select
                className="field-input"
                value={statusUpdateValue}
                onChange={(event) => setStatusUpdateValue(event.target.value)}
              >
                {SITE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-outline" disabled={isSubmittingStatus} onClick={() => void onUpdateStatus()}>
                {isSubmittingStatus ? "Saving..." : "Update Status"}
              </button>
              <select
                className="field-input"
                value={assignEngineerId}
                onChange={(event) => setAssignEngineerId(event.target.value)}
              >
                <option value="">Select engineer</option>
                {engineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name} ({engineer.email})
                  </option>
                ))}
              </select>
              <button type="button" className="btn-outline" disabled={!assignEngineerId || isSubmittingAssign} onClick={() => void onAssignEngineer()}>
                {isSubmittingAssign ? "Working..." : "Assign Engineer"}
              </button>
              <button type="button" className="btn-outline" disabled={isSubmittingAssign} onClick={() => void onUnassignEngineer()}>
                {isSubmittingAssign ? "Working..." : "Unassign Engineer"}
              </button>
            </div>
          ) : null}
          {canManageSites ? (
            <div className="admin-form-grid">
              <select
                className="field-input"
                value={ownershipForm.towerOwnershipType}
                onChange={(event) => setOwnershipForm((current) => ({ ...current, towerOwnershipType: event.target.value }))}
              >
                {TOWER_OWNERSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="field-input"
                placeholder="Tower owner name"
                value={ownershipForm.towerOwnerName}
                onChange={(event) => setOwnershipForm((current) => ({ ...current, towerOwnerName: event.target.value }))}
              />
              <input
                className="field-input"
                placeholder="Sharing agreement ref"
                value={ownershipForm.sharingAgreementRef}
                onChange={(event) => setOwnershipForm((current) => ({ ...current, sharingAgreementRef: event.target.value }))}
              />
              <input
                className="field-input"
                placeholder="Host contact name"
                value={ownershipForm.hostContactName}
                onChange={(event) => setOwnershipForm((current) => ({ ...current, hostContactName: event.target.value }))}
              />
              <input
                className="field-input"
                placeholder="Host contact phone"
                value={ownershipForm.hostContactPhone}
                onChange={(event) => setOwnershipForm((current) => ({ ...current, hostContactPhone: event.target.value }))}
              />
              <button
                type="button"
                className="btn-outline"
                disabled={isSubmittingOwnership}
                onClick={() => void onUpdateOwnership()}
              >
                {isSubmittingOwnership ? "Saving..." : "Update Ownership"}
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      {canManageSites ? (
        <article className="panel">
          <h3>Import Site Data</h3>
          <div className="admin-toolbar">
            <select
              className="field-input compact"
              value={importType}
              onChange={(event) => setImportType(event.target.value as SiteImportType)}
            >
              {IMPORT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="field-input compact"
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
            />
            <button type="button" className="btn-primary" disabled={isSubmittingImport || !importFile} onClick={() => void onImport()}>
              {isSubmittingImport ? "Importing..." : "Run Import"}
            </button>
          </div>
          {importResult ? (
            <div>
              <p className="text-muted">
                Imported: {importResult.importedCount} | Skipped: {importResult.skippedCount} | Errors: {importResult.errors.length}
              </p>
              {importResult.errors.length > 0 ? (
                <ul className="text-danger">
                  {importResult.errors.slice(0, 10).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </article>
      ) : null}

      {error ? <InlineNotice title="Site action failed" tone="error">{error}</InlineNotice> : null}
      {message ? <InlineNotice title="Site update" tone="success">{message}</InlineNotice> : null}
    </div>
  );
}

