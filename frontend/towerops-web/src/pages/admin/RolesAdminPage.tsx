import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
import { getErrorMessage } from "../../shared/errors/errorMessage";
import { PageIntro } from "../../components/PageIntro/PageIntro";
import { EmptyState, InlineNotice, LoadingState } from "../../components/Feedback/States";
import {
  rolesApi,
  type CreateRoleRequest,
  type RoleDto,
  type UpdateRoleRequest,
} from "../../features/admin/rolesApi";

type RoleFormState = {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  permissionsCsv: string;
};

const EMPTY_ROLE_FORM: RoleFormState = {
  name: "",
  displayName: "",
  description: "",
  isActive: true,
  permissionsCsv: "",
};

function parsePermissionsCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapRoleToForm(role: RoleDto): RoleFormState {
  return {
    name: role.name,
    displayName: role.displayName,
    description: role.description ?? "",
    isActive: role.isActive,
    permissionsCsv: role.permissions.join(", "),
  };
}

export function RolesAdminPage() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<string[]>([]);
  const [pagination, setPagination] = useState(defaultPagination());
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRoleName, setDeletingRoleName] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<RoleFormState>(EMPTY_ROLE_FORM);
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoleFormState>(EMPTY_ROLE_FORM);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await rolesApi.list({
        page,
        pageSize: 10,
        sortBy: "name",
        sortDir: "asc",
      });
      setRoles(response.items);
      setPagination(response.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load roles."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    let mounted = true;

    const loadPermissions = async (): Promise<void> => {
      try {
        const items = await rolesApi.listPermissions();
        if (mounted) {
          setPermissionsCatalog(items);
        }
      } catch (loadError) {
        if (mounted) {
          setError(getErrorMessage(loadError, "Failed to load permissions catalog."));
        }
      }
    };

    void loadPermissions();
    return () => {
      mounted = false;
    };
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const parsedPermissions = parsePermissionsCsv(createForm.permissionsCsv);
    if (!createForm.name.trim()) {
      setError("Role name is required.");
      return;
    }

    if (!createForm.displayName.trim()) {
      setError("Role display name is required.");
      return;
    }

    if (parsedPermissions.length === 0) {
      setError("At least one permission is required.");
      return;
    }

    const request: CreateRoleRequest = {
      name: createForm.name.trim(),
      displayName: createForm.displayName.trim(),
      description: createForm.description.trim() || undefined,
      isActive: createForm.isActive,
      permissions: parsedPermissions,
    };

    setIsCreating(true);
    try {
      await rolesApi.create(request);
      setCreateForm(EMPTY_ROLE_FORM);
      setMessage("Role created.");
      await loadRoles();
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create role."));
    } finally {
      setIsCreating(false);
    }
  };

  const selectRole = async (roleName: string): Promise<void> => {
    setError(null);
    try {
      const role = await rolesApi.getById(roleName);
      setSelectedRoleName(roleName);
      setEditForm(mapRoleToForm(role));
    } catch (selectError) {
      setError(getErrorMessage(selectError, "Failed to load role details."));
    }
  };

  const onSaveRole = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedRoleName) {
      return;
    }

    setError(null);
    const parsedPermissions = parsePermissionsCsv(editForm.permissionsCsv);
    if (!editForm.displayName.trim()) {
      setError("Role display name is required.");
      return;
    }

    if (parsedPermissions.length === 0) {
      setError("At least one permission is required.");
      return;
    }

    const request: UpdateRoleRequest = {
      displayName: editForm.displayName.trim(),
      description: editForm.description.trim() || undefined,
      isActive: editForm.isActive,
      permissions: parsedPermissions,
    };

    setIsSaving(true);
    try {
      await rolesApi.update(selectedRoleName, request);
      setMessage("Role updated.");
      await selectRole(selectedRoleName);
      await loadRoles();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to update role."));
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteRole = async (roleName: string): Promise<void> => {
    const confirmed = window.confirm(`Delete role "${roleName}"?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingRoleName(roleName);
    try {
      await rolesApi.remove(roleName);
      setMessage("Role deleted.");
      if (selectedRoleName === roleName) {
        setSelectedRoleName(null);
        setEditForm(EMPTY_ROLE_FORM);
      }
      await loadRoles();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete role."));
    } finally {
      setDeletingRoleName(null);
    }
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Phase 2"
        title="Role Management"
        description="Define platform roles, activation state, and permission bundles used by the frontend route and action guards."
      />

      <article className="panel">
        <h3>Roles</h3>
        {isLoading ? <LoadingState title="Loading roles..." /> : null}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Display</th>
                <th>System</th>
                <th>Status</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((roleItem) => (
                <tr key={roleItem.name}>
                  <td>{roleItem.name}</td>
                  <td>{roleItem.displayName}</td>
                  <td>{roleItem.isSystem ? "Yes" : "No"}</td>
                  <td>
                    <StatusBadge value={roleItem.isActive} />
                  </td>
                  <td>{roleItem.permissions.length}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => void selectRole(roleItem.name)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-outline danger"
                      disabled={roleItem.isSystem || deletingRoleName !== null}
                      onClick={() => void onDeleteRole(roleItem.name)}
                    >
                      {deletingRoleName === roleItem.name ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {!roles.length && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="No roles found.">
                      Create a role or adjust the current page filters.
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
        <h3>Create Role</h3>
        <form className="admin-form-grid" onSubmit={onCreate}>
          <input
            className="field-input"
            placeholder="Role name (id)"
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Display name"
            value={createForm.displayName}
            onChange={(event) => setCreateForm((current) => ({ ...current, displayName: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Description"
            value={createForm.description}
            onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
          />
          <label className="inline-check">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(event) => setCreateForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active
          </label>
          <textarea
            className="field-input wide"
            rows={3}
            placeholder="permissions.view, permissions.edit"
            value={createForm.permissionsCsv}
            onChange={(event) => setCreateForm((current) => ({ ...current, permissionsCsv: event.target.value }))}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={isCreating || isSaving || deletingRoleName !== null}
          >
            {isCreating ? "Creating..." : "Create Role"}
          </button>
        </form>
      </article>

      {selectedRoleName ? (
        <article className="panel">
          <h3>Edit Role: {selectedRoleName}</h3>
          <form className="admin-form-grid" onSubmit={onSaveRole}>
            <input
              className="field-input"
              placeholder="Display name"
              value={editForm.displayName}
              onChange={(event) => setEditForm((current) => ({ ...current, displayName: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Description"
              value={editForm.description}
              onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
            />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(event) => setEditForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Active
            </label>
            <textarea
              className="field-input wide"
              rows={4}
              value={editForm.permissionsCsv}
              onChange={(event) => setEditForm((current) => ({ ...current, permissionsCsv: event.target.value }))}
            />
            <button type="submit" className="btn-primary" disabled={isCreating || isSaving || deletingRoleName !== null}>
              {isSaving ? "Saving..." : "Save Role"}
            </button>
          </form>
          <div className="empty-state empty-state--neutral">
            <strong>Permission catalog</strong>
            <p>
              {permissionsCatalog.length} entries loaded: {permissionsCatalog.slice(0, 20).join(", ")}
              {permissionsCatalog.length > 20 ? " ..." : ""}
            </p>
          </div>
        </article>
      ) : null}

      {error ? <InlineNotice title="Role action failed" tone="error">{error}</InlineNotice> : null}
      {message ? <InlineNotice title="Role update" tone="success">{message}</InlineNotice> : null}
    </div>
  );
}
