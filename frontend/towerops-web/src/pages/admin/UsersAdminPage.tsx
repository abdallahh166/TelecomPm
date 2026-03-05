import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
import { officesApi, type OfficeDto } from "../../features/admin/officesApi";
import {
  USER_ROLES,
  usersApi,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserDetailDto,
  type UserDto,
  type UserRole,
} from "../../features/admin/usersApi";

type UserFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  officeId: string;
  maxAssignedSites: string;
  specializations: string;
};

type UserEditFormState = {
  name: string;
  phoneNumber: string;
  maxAssignedSites: string;
  specializations: string;
  newRole: UserRole;
};

const EMPTY_CREATE_FORM: UserFormState = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "Technician",
  officeId: "",
  maxAssignedSites: "",
  specializations: "",
};

const EMPTY_EDIT_FORM: UserEditFormState = {
  name: "",
  phoneNumber: "",
  maxAssignedSites: "",
  specializations: "",
  newRole: "Technician",
};

function parsePositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseSpecializations(value: string): string[] | undefined {
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length ? parsed : undefined;
}

function mapUserToEditForm(user: UserDetailDto): UserEditFormState {
  return {
    name: user.name,
    phoneNumber: user.phoneNumber,
    maxAssignedSites: user.maxAssignedSites?.toString() ?? "",
    specializations: user.specializations.join(", "),
    newRole: user.role,
  };
}

export function UsersAdminPage() {
  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [queryMode, setQueryMode] = useState<"office" | "role">("office");
  const [officeId, setOfficeId] = useState<string>("");
  const [role, setRole] = useState<UserRole>("Technician");
  const [onlyActive, setOnlyActive] = useState(true);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [pagination, setPagination] = useState(defaultPagination());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<UserFormState>(EMPTY_CREATE_FORM);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetailDto | null>(null);
  const [editForm, setEditForm] = useState<UserEditFormState>(EMPTY_EDIT_FORM);

  const loadOffices = useCallback(async () => {
    try {
      const response = await officesApi.list({
        page: 1,
        pageSize: 100,
        sortBy: "name",
        sortDir: "asc",
        onlyActive: true,
      });
      setOffices(response.items);
      if (!officeId && response.items.length > 0) {
        setOfficeId(response.items[0].id);
        setCreateForm((current) => ({ ...current, officeId: response.items[0].id }));
      }
    } catch {
      // Some users may not have office management permission.
    }
  }, [officeId]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (queryMode === "office" && officeId) {
        const response = await usersApi.listByOffice(officeId, {
          onlyActive,
          page,
          pageSize: 10,
        });
        setUsers(response.items);
        setPagination(response.pagination);
        return;
      }

      const response = await usersApi.listByRole(role, {
        officeId: officeId || undefined,
        page,
        pageSize: 10,
      });
      setUsers(response.items);
      setPagination(response.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [officeId, onlyActive, page, queryMode, role]);

  useEffect(() => {
    void loadOffices();
  }, [loadOffices]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const onCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage(null);

    const request: CreateUserRequest = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      phoneNumber: createForm.phoneNumber.trim(),
      password: createForm.password,
      role: createForm.role,
      officeId: createForm.officeId || officeId,
      maxAssignedSites: parsePositiveInt(createForm.maxAssignedSites),
      specializations: parseSpecializations(createForm.specializations),
    };

    await usersApi.create(request);
    setCreateForm((current) => ({
      ...EMPTY_CREATE_FORM,
      officeId: current.officeId || officeId,
      role: current.role,
    }));
    setMessage("User created.");
    await loadUsers();
  };

  const selectUser = async (userId: string): Promise<void> => {
    const detail = await usersApi.getById(userId);
    setSelectedUserId(userId);
    setSelectedUser(detail);
    setEditForm(mapUserToEditForm(detail));
  };

  const onSaveUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedUserId) {
      return;
    }

    const request: UpdateUserRequest = {
      name: editForm.name.trim(),
      phoneNumber: editForm.phoneNumber.trim(),
      maxAssignedSites: parsePositiveInt(editForm.maxAssignedSites),
      specializations: parseSpecializations(editForm.specializations),
    };

    await usersApi.update(selectedUserId, request);
    setMessage("User updated.");
    await selectUser(selectedUserId);
    await loadUsers();
  };

  const onChangeRole = async (): Promise<void> => {
    if (!selectedUserId) {
      return;
    }

    await usersApi.changeRole(selectedUserId, editForm.newRole);
    setMessage("User role updated.");
    await selectUser(selectedUserId);
    await loadUsers();
  };

  const runAction = async (action: () => Promise<void>, successMessage: string): Promise<void> => {
    await action();
    setMessage(successMessage);
    await loadUsers();
    if (selectedUserId) {
      await selectUser(selectedUserId);
    }
  };

  const onDelete = async (userId: string): Promise<void> => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) {
      return;
    }

    await usersApi.delete(userId);
    setMessage("User deleted.");
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setSelectedUser(null);
      setEditForm(EMPTY_EDIT_FORM);
    }
    await loadUsers();
  };

  return (
    <div className="page">
      <article className="panel">
        <div className="admin-toolbar">
          <h3>Users</h3>
          <div className="toolbar-group">
            <select
              className="field-input compact"
              value={queryMode}
              onChange={(event) => {
                setQueryMode(event.target.value as "office" | "role");
                setPage(1);
              }}
            >
              <option value="office">By office</option>
              <option value="role">By role</option>
            </select>

            <select
              className="field-input compact"
              value={officeId}
              onChange={(event) => {
                setOfficeId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All offices</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.code} - {office.name}
                </option>
              ))}
            </select>

            <select
              className="field-input compact"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole);
                setPage(1);
              }}
            >
              {USER_ROLES.map((roleItem) => (
                <option key={roleItem} value={roleItem}>
                  {roleItem}
                </option>
              ))}
            </select>

            {queryMode === "office" ? (
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
            ) : null}
          </div>
        </div>

        {isLoading ? <p className="text-muted">Loading users...</p> : null}

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Office</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.officeName}</td>
                  <td>
                    <StatusBadge value={user.isActive} />
                  </td>
                  <td className="table-actions">
                    <button type="button" className="btn-outline" onClick={() => void selectUser(user.id)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => void runAction(() => usersApi.unlockAccount(user.id), "User unlocked.")}
                    >
                      Unlock
                    </button>
                    {user.isActive ? (
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => void runAction(() => usersApi.deactivate(user.id), "User deactivated.")}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => void runAction(() => usersApi.activate(user.id), "User activated.")}
                      >
                        Activate
                      </button>
                    )}
                    <button type="button" className="btn-outline danger" onClick={() => void onDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && !isLoading ? (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No users found for current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      </article>

      <article className="panel">
        <h3>Create User</h3>
        <form className="admin-form-grid" onSubmit={onCreate}>
          <input
            className="field-input"
            placeholder="Full name"
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Email"
            type="email"
            value={createForm.email}
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Phone number"
            value={createForm.phoneNumber}
            onChange={(event) => setCreateForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            required
          />
          <input
            className="field-input"
            placeholder="Temporary password"
            type="password"
            value={createForm.password}
            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
          <select
            className="field-input"
            value={createForm.role}
            onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value as UserRole }))}
          >
            {USER_ROLES.map((roleItem) => (
              <option key={roleItem} value={roleItem}>
                {roleItem}
              </option>
            ))}
          </select>
          <select
            className="field-input"
            value={createForm.officeId}
            onChange={(event) => setCreateForm((current) => ({ ...current, officeId: event.target.value }))}
            required
          >
            <option value="">Select office</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.code} - {office.name}
              </option>
            ))}
          </select>
          <input
            className="field-input"
            placeholder="Max assigned sites"
            value={createForm.maxAssignedSites}
            onChange={(event) => setCreateForm((current) => ({ ...current, maxAssignedSites: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Specializations (comma separated)"
            value={createForm.specializations}
            onChange={(event) => setCreateForm((current) => ({ ...current, specializations: event.target.value }))}
          />
          <button type="submit" className="btn-primary">
            Create User
          </button>
        </form>
      </article>

      {selectedUser ? (
        <article className="panel">
          <h3>
            Edit User: {selectedUser.name} ({selectedUser.email})
          </h3>
          <p className="text-muted">
            Office: {selectedUser.officeName} | Last login: {selectedUser.lastLoginAt ?? "N/A"}
          </p>
          <form className="admin-form-grid" onSubmit={onSaveUser}>
            <input
              className="field-input"
              value={editForm.name}
              onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className="field-input"
              value={editForm.phoneNumber}
              onChange={(event) => setEditForm((current) => ({ ...current, phoneNumber: event.target.value }))}
              required
            />
            <input
              className="field-input"
              value={editForm.maxAssignedSites}
              onChange={(event) => setEditForm((current) => ({ ...current, maxAssignedSites: event.target.value }))}
              placeholder="Max assigned sites"
            />
            <input
              className="field-input"
              value={editForm.specializations}
              onChange={(event) => setEditForm((current) => ({ ...current, specializations: event.target.value }))}
              placeholder="Specializations (comma separated)"
            />
            <button type="submit" className="btn-primary">
              Save User
            </button>
          </form>
          <div className="admin-form-grid">
            <select
              className="field-input"
              value={editForm.newRole}
              onChange={(event) => setEditForm((current) => ({ ...current, newRole: event.target.value as UserRole }))}
            >
              {USER_ROLES.map((roleItem) => (
                <option key={roleItem} value={roleItem}>
                  {roleItem}
                </option>
              ))}
            </select>
            <button type="button" className="btn-outline" onClick={() => void onChangeRole()}>
              Change Role
            </button>
          </div>
        </article>
      ) : null}

      {message ? <p className="text-muted">{message}</p> : null}
    </div>
  );
}
