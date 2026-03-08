import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
import { getErrorMessage } from "../../shared/errors/errorMessage";
import { PageIntro } from "../../components/PageIntro/PageIntro";
import { EmptyState, InlineNotice, LoadingState } from "../../components/Feedback/States";
import {
  officesApi,
  type CreateOfficeRequest,
  type OfficeDetailDto,
  type OfficeDto,
  type UpdateOfficeContactRequest,
  type UpdateOfficeRequest,
} from "../../features/admin/officesApi";

type OfficeFormState = {
  code: string;
  name: string;
  region: string;
  city: string;
  street: string;
  details: string;
  latitude: string;
  longitude: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
};

const EMPTY_OFFICE_FORM: OfficeFormState = {
  code: "",
  name: "",
  region: "",
  city: "",
  street: "",
  details: "",
  latitude: "",
  longitude: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
};

function toOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isValidLatitude(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= -90 && parsed <= 90;
}

function isValidLongitude(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= -180 && parsed <= 180;
}

function validateOfficeForm(form: OfficeFormState, requireCode: boolean): string | null {
  if (requireCode && !form.code.trim()) {
    return "Office code is required.";
  }

  if (!form.name.trim()) {
    return "Office name is required.";
  }

  if (!form.region.trim()) {
    return "Region is required.";
  }

  if (!form.city.trim()) {
    return "City is required.";
  }

  if (!isValidEmail(form.contactEmail)) {
    return "Contact email format is invalid.";
  }

  if (!isValidLatitude(form.latitude)) {
    return "Latitude must be a valid number between -90 and 90.";
  }

  if (!isValidLongitude(form.longitude)) {
    return "Longitude must be a valid number between -180 and 180.";
  }

  return null;
}

function mapDetailToForm(detail: OfficeDetailDto): OfficeFormState {
  return {
    code: detail.code,
    name: detail.name,
    region: detail.region,
    city: detail.city,
    street: detail.street ?? "",
    details: "",
    latitude: detail.latitude?.toString() ?? "",
    longitude: detail.longitude?.toString() ?? "",
    contactPerson: detail.contactPerson ?? "",
    contactPhone: detail.contactPhone ?? "",
    contactEmail: detail.contactEmail ?? "",
  };
}

export function OfficesAdminPage() {
  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [pagination, setPagination] = useState(defaultPagination());
  const [page, setPage] = useState(1);
  const [onlyActive, setOnlyActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingOffice, setIsSavingOffice] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [deletingOfficeId, setDeletingOfficeId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<OfficeFormState>(EMPTY_OFFICE_FORM);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<OfficeDetailDto | null>(null);
  const [editForm, setEditForm] = useState<OfficeFormState>(EMPTY_OFFICE_FORM);

  const loadOffices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await officesApi.list({
        page,
        pageSize: 10,
        sortBy: "code",
        sortDir: "asc",
        onlyActive,
      });
      setOffices(response.items);
      setPagination(response.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load offices."));
    } finally {
      setIsLoading(false);
    }
  }, [onlyActive, page]);

  useEffect(() => {
    void loadOffices();
  }, [loadOffices]);

  const loadOfficeDetail = useCallback(async (officeId: string) => {
    setError(null);
    try {
      const detail = await officesApi.getById(officeId);
      setSelectedOffice(detail);
      setEditForm(mapDetailToForm(detail));
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load office details."));
    }
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const validationError = validateOfficeForm(createForm, true);
    if (validationError) {
      setError(validationError);
      return;
    }

    const request: CreateOfficeRequest = {
      code: createForm.code.trim(),
      name: createForm.name.trim(),
      region: createForm.region.trim(),
      address: {
        city: createForm.city.trim(),
        region: createForm.region.trim(),
        street: createForm.street.trim() || undefined,
        details: createForm.details.trim() || undefined,
      },
      latitude: toOptionalNumber(createForm.latitude),
      longitude: toOptionalNumber(createForm.longitude),
      contactPerson: createForm.contactPerson.trim() || undefined,
      contactPhone: createForm.contactPhone.trim() || undefined,
      contactEmail: createForm.contactEmail.trim() || undefined,
    };

    setIsCreating(true);
    try {
      await officesApi.create(request);
      setCreateForm(EMPTY_OFFICE_FORM);
      setMessage("Office created.");
      await loadOffices();
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create office."));
    } finally {
      setIsCreating(false);
    }
  };

  const onUpdateOffice = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedOfficeId) {
      return;
    }

    setError(null);
    const validationError = validateOfficeForm(editForm, false);
    if (validationError) {
      setError(validationError);
      return;
    }

    const request: UpdateOfficeRequest = {
      name: editForm.name.trim(),
      region: editForm.region.trim(),
      address: {
        city: editForm.city.trim(),
        region: editForm.region.trim(),
        street: editForm.street.trim() || undefined,
        details: editForm.details.trim() || undefined,
      },
      latitude: toOptionalNumber(editForm.latitude),
      longitude: toOptionalNumber(editForm.longitude),
    };

    setIsSavingOffice(true);
    try {
      await officesApi.update(selectedOfficeId, request);
      setMessage("Office updated.");
      await loadOffices();
      await loadOfficeDetail(selectedOfficeId);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update office."));
    } finally {
      setIsSavingOffice(false);
    }
  };

  const onUpdateContact = async (): Promise<void> => {
    if (!selectedOfficeId) {
      return;
    }

    setError(null);
    if (!isValidEmail(editForm.contactEmail)) {
      setError("Contact email format is invalid.");
      return;
    }

    const request: UpdateOfficeContactRequest = {
      contactPerson: editForm.contactPerson.trim() || undefined,
      contactPhone: editForm.contactPhone.trim() || undefined,
      contactEmail: editForm.contactEmail.trim() || undefined,
    };

    setIsSavingContact(true);
    try {
      await officesApi.updateContact(selectedOfficeId, request);
      setMessage("Office contact updated.");
      await loadOfficeDetail(selectedOfficeId);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update office contact."));
    } finally {
      setIsSavingContact(false);
    }
  };

  const onDelete = async (officeId: string): Promise<void> => {
    const confirmed = window.confirm("Delete this office?");
    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingOfficeId(officeId);
    try {
      await officesApi.remove(officeId);
      setMessage("Office deleted.");
      if (selectedOfficeId === officeId) {
        setSelectedOfficeId(null);
        setSelectedOffice(null);
        setEditForm(EMPTY_OFFICE_FORM);
      }
      await loadOffices();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete office."));
    } finally {
      setDeletingOfficeId(null);
    }
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Phase 2"
        title="Office Workspace"
        description="Manage office records, active visibility, regional coverage, and contact details used across the operations platform."
      />

      <article className="panel">
        <div className="admin-toolbar">
          <h3>Offices</h3>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(event) => {
                setOnlyActive(event.target.checked);
                setPage(1);
              }}
            />
            Only active
          </label>
        </div>
        {isLoading ? <LoadingState title="Loading offices..." /> : null}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Region</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr key={office.id}>
                  <td>{office.code}</td>
                  <td>{office.name}</td>
                  <td>{office.region}</td>
                  <td>{office.city}</td>
                  <td>
                    <StatusBadge value={office.isActive} />
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={deletingOfficeId !== null || isSavingOffice || isSavingContact}
                      onClick={() => {
                        setSelectedOfficeId(office.id);
                        void loadOfficeDetail(office.id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-outline danger"
                      disabled={deletingOfficeId !== null || isSavingOffice || isSavingContact}
                      onClick={() => void onDelete(office.id)}
                    >
                      {deletingOfficeId === office.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {!offices.length && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="No offices found.">
                      Try changing the active filter or create a new office.
                    </EmptyState>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      </article>

      <article className="panel">
        <h3>Create Office</h3>
        <form className="admin-form-grid" onSubmit={onCreate}>
          <input
            className="field-input"
            placeholder="Code"
            value={createForm.code}
            onChange={(event) => setCreateForm((current) => ({ ...current, code: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Name"
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Region"
            value={createForm.region}
            onChange={(event) => setCreateForm((current) => ({ ...current, region: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="City"
            value={createForm.city}
            onChange={(event) => setCreateForm((current) => ({ ...current, city: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Street"
            value={createForm.street}
            onChange={(event) => setCreateForm((current) => ({ ...current, street: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Address details"
            value={createForm.details}
            onChange={(event) => setCreateForm((current) => ({ ...current, details: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Latitude"
            value={createForm.latitude}
            onChange={(event) => setCreateForm((current) => ({ ...current, latitude: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Longitude"
            value={createForm.longitude}
            onChange={(event) => setCreateForm((current) => ({ ...current, longitude: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Contact person"
            value={createForm.contactPerson}
            onChange={(event) => setCreateForm((current) => ({ ...current, contactPerson: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Contact phone"
            value={createForm.contactPhone}
            onChange={(event) => setCreateForm((current) => ({ ...current, contactPhone: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Contact email"
            value={createForm.contactEmail}
            onChange={(event) => setCreateForm((current) => ({ ...current, contactEmail: event.target.value }))}
          />
          <button type="submit" className="btn-primary" disabled={isCreating || isSavingOffice || isSavingContact}>
            {isCreating ? "Creating..." : "Create Office"}
          </button>
        </form>
      </article>

      {selectedOffice ? (
        <article className="panel">
          <h3>Edit Office: {selectedOffice.code}</h3>
          <form className="admin-form-grid" onSubmit={onUpdateOffice}>
            <input
              className="field-input"
              value={editForm.name}
              onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className="field-input"
              value={editForm.region}
              onChange={(event) => setEditForm((current) => ({ ...current, region: event.target.value }))}
              required
            />
            <input
              className="field-input"
              value={editForm.city}
              onChange={(event) => setEditForm((current) => ({ ...current, city: event.target.value }))}
              required
            />
            <input
              className="field-input"
              value={editForm.street}
              onChange={(event) => setEditForm((current) => ({ ...current, street: event.target.value }))}
            />
            <input
              className="field-input"
              value={editForm.details}
              onChange={(event) => setEditForm((current) => ({ ...current, details: event.target.value }))}
              placeholder="Address details"
            />
            <input
              className="field-input"
              value={editForm.latitude}
              onChange={(event) => setEditForm((current) => ({ ...current, latitude: event.target.value }))}
              placeholder="Latitude"
            />
            <input
              className="field-input"
              value={editForm.longitude}
              onChange={(event) => setEditForm((current) => ({ ...current, longitude: event.target.value }))}
              placeholder="Longitude"
            />
            <button type="submit" className="btn-primary" disabled={isSavingOffice || isSavingContact || deletingOfficeId !== null}>
              {isSavingOffice ? "Saving..." : "Save Office"}
            </button>
          </form>
          <div className="admin-form-grid">
            <input
              className="field-input"
              value={editForm.contactPerson}
              onChange={(event) => setEditForm((current) => ({ ...current, contactPerson: event.target.value }))}
              placeholder="Contact person"
            />
            <input
              className="field-input"
              value={editForm.contactPhone}
              onChange={(event) => setEditForm((current) => ({ ...current, contactPhone: event.target.value }))}
              placeholder="Contact phone"
            />
            <input
              className="field-input"
              value={editForm.contactEmail}
              onChange={(event) => setEditForm((current) => ({ ...current, contactEmail: event.target.value }))}
              placeholder="Contact email"
            />
            <button
              type="button"
              className="btn-outline"
              disabled={isSavingOffice || isSavingContact || deletingOfficeId !== null}
              onClick={() => void onUpdateContact()}
            >
              {isSavingContact ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </article>
      ) : null}

      {error ? <InlineNotice title="Office action failed" tone="error">{error}</InlineNotice> : null}
      {message ? <InlineNotice title="Office update" tone="success">{message}</InlineNotice> : null}
    </div>
  );
}
