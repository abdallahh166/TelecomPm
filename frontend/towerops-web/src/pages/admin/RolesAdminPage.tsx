import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
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

  const [createForm, setCreateForm] = useState<RoleFormState>(EMPTY_ROLE_FORM);
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoleFormState>(EMPTY_ROLE_FORM);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await rolesApi.list({
        page,
        pageSize: 10,
        sortBy: "name",
        sortDir: "asc",
      });
      setRoles(response.items);
      setPagination(response.pagination);
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
      const items = await rolesApi.listPermissions();
      if (mounted) {
        setPermissionsCatalog(items);
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

    const request: CreateRoleRequest = {
      name: createForm.name.trim(),
      displayName: createForm.displayName.trim(),
      description: createForm.description.trim() || undefined,
      isActive: createForm.isActive,
      permissions: parsePermissionsCsv(createForm.permissionsCsv),
    };

    await rolesApi.create(request);
    setCreateForm(EMPTY_ROLE_FORM);
    setMessage("Role created.");
    await loadRoles();
  };

  const selectRole = async (roleName: string): Promise<void> => {
    const role = await rolesApi.getById(roleName);
    setSelectedRoleName(roleName);
    setEditForm(mapRoleToForm(role));
  };

  const onSaveRole = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedRoleName) {
      return;
    }

    const request: UpdateRoleRequest = {
      displayName: editForm.displayName.trim(),
      description: editForm.description.trim() || undefined,
      isActive: editForm.isActive,
      permissions: parsePermissionsCsv(editForm.permissionsCsv),
    };

    await rolesApi.update(selectedRoleName, request);
    setMessage("Role updated.");
    await selectRole(selectedRoleName);
    await loadRoles();
  };

  const onDeleteRole = async (roleName: string): Promise<void> => {
    const confirmed = window.confirm(`Delete role "${roleName}"?`);
    if (!confirmed) {
      return;
    }

    await rolesApi.remove(roleName);
    setMessage("Role deleted.");
    if (selectedRoleName === roleName) {
      setSelectedRoleName(null);
      setEditForm(EMPTY_ROLE_FORM);
    }
    await loadRoles();
  };

  return (
    <div className="page">
      <article className="panel">
        <h3>Roles</h3>
        {isLoading ? <p className="text-muted">Loading roles...</p> : null}
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
                      disabled={roleItem.isSystem}
                      onClick={() => void onDeleteRole(roleItem.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!roles.length && !isLoading ? (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No roles found.
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
          <button type="submit" className="btn-primary">
            Create Role
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
            <button type="submit" className="btn-primary">
              Save Role
            </button>
          </form>
          <p className="text-muted">
            Permission catalog ({permissionsCatalog.length}): {permissionsCatalog.slice(0, 20).join(", ")}
            {permissionsCatalog.length > 20 ? " ..." : ""}
          </p>
        </article>
      ) : null}

      {message ? <p className="text-muted">{message}</p> : null}
    </div>
  );
}
