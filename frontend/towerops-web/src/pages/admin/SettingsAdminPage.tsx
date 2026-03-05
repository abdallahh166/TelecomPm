import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
import {
  settingsApi,
  type SystemSettingDto,
  type UpsertSystemSettingRequest,
} from "../../features/admin/settingsApi";

type SettingEditState = {
  key: string;
  value: string;
  group: string;
  dataType: string;
  description: string;
  isEncrypted: boolean;
};

const EMPTY_EDIT: SettingEditState = {
  key: "",
  value: "",
  group: "",
  dataType: "string",
  description: "",
  isEncrypted: false,
};

function toEditState(setting: SystemSettingDto): SettingEditState {
  return {
    key: setting.key,
    value: setting.value,
    group: setting.group,
    dataType: setting.dataType,
    description: setting.description ?? "",
    isEncrypted: setting.isEncrypted,
  };
}

export function SettingsAdminPage() {
  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [pagination, setPagination] = useState(defaultPagination());
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("group");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [groupQuery, setGroupQuery] = useState("");
  const [groupResult, setGroupResult] = useState<SystemSettingDto[] | null>(null);
  const [editState, setEditState] = useState<SettingEditState>(EMPTY_EDIT);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.list({
        page,
        pageSize: 10,
        sortBy,
        sortDir,
      });

      setSettings(response.items);
      setPagination(response.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortDir]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const selectSetting = (setting: SystemSettingDto): void => {
    setEditState(toEditState(setting));
  };

  const saveSetting = async (): Promise<void> => {
    const request: UpsertSystemSettingRequest = {
      key: editState.key.trim(),
      value: editState.value,
      group: editState.group.trim(),
      dataType: editState.dataType.trim() || "string",
      description: editState.description.trim() || undefined,
      isEncrypted: editState.isEncrypted,
    };

    await settingsApi.upsert([request]);
    setMessage("Setting saved.");
    await loadSettings();
  };

  const loadByGroup = async (): Promise<void> => {
    const trimmedGroup = groupQuery.trim();
    if (!trimmedGroup) {
      setGroupResult(null);
      return;
    }

    const result = await settingsApi.byGroup(trimmedGroup);
    setGroupResult(result);
  };

  const testConnection = async (service: "twilio" | "email" | "firebase"): Promise<void> => {
    const response = await settingsApi.testConnection(service);
    setMessage(response);
  };

  return (
    <div className="page">
      <article className="panel">
        <div className="admin-toolbar">
          <h3>System Settings</h3>
          <div className="toolbar-group">
            <select
              className="field-input compact"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
            >
              <option value="group">group</option>
              <option value="key">key</option>
              <option value="dataType">dataType</option>
              <option value="updatedAtUtc">updatedAtUtc</option>
            </select>
            <select
              className="field-input compact"
              value={sortDir}
              onChange={(event) => {
                setSortDir(event.target.value as "asc" | "desc");
                setPage(1);
              }}
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </div>
        </div>
        {isLoading ? <p className="text-muted">Loading settings...</p> : null}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Key</th>
                <th>Type</th>
                <th>Encrypted</th>
                <th>Updated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={`${setting.group}-${setting.key}`}>
                  <td>{setting.group}</td>
                  <td>{setting.key}</td>
                  <td>{setting.dataType}</td>
                  <td>{setting.isEncrypted ? "Yes" : "No"}</td>
                  <td>{setting.updatedBy}</td>
                  <td className="table-actions">
                    <button type="button" className="btn-outline" onClick={() => selectSetting(setting)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!settings.length && !isLoading ? (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No settings found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      </article>

      <article className="panel">
        <h3>Edit Setting</h3>
        <div className="admin-form-grid">
          <input
            className="field-input"
            placeholder="Group"
            value={editState.group}
            onChange={(event) => setEditState((current) => ({ ...current, group: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Key"
            value={editState.key}
            onChange={(event) => setEditState((current) => ({ ...current, key: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Data type"
            value={editState.dataType}
            onChange={(event) => setEditState((current) => ({ ...current, dataType: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Value"
            value={editState.value}
            onChange={(event) => setEditState((current) => ({ ...current, value: event.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Description"
            value={editState.description}
            onChange={(event) => setEditState((current) => ({ ...current, description: event.target.value }))}
          />
          <label className="inline-check">
            <input
              type="checkbox"
              checked={editState.isEncrypted}
              onChange={(event) => setEditState((current) => ({ ...current, isEncrypted: event.target.checked }))}
            />
            Encrypted
          </label>
          <button type="button" className="btn-primary" onClick={() => void saveSetting()}>
            Save Setting
          </button>
        </div>
      </article>

      <article className="panel">
        <h3>Get Settings by Group</h3>
        <div className="admin-toolbar">
          <input
            className="field-input compact"
            placeholder="Group name"
            value={groupQuery}
            onChange={(event) => setGroupQuery(event.target.value)}
          />
          <button type="button" className="btn-outline" onClick={() => void loadByGroup()}>
            Load Group
          </button>
        </div>
        {groupResult ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Type</th>
                  <th>Encrypted</th>
                </tr>
              </thead>
              <tbody>
                {groupResult.map((setting) => (
                  <tr key={`${setting.group}-${setting.key}`}>
                    <td>{setting.key}</td>
                    <td>{setting.value}</td>
                    <td>{setting.dataType}</td>
                    <td>{setting.isEncrypted ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">Run group query to inspect settings.</p>
        )}
      </article>

      <article className="panel">
        <h3>Test External Services</h3>
        <div className="toolbar-group">
          <button type="button" className="btn-outline" onClick={() => void testConnection("twilio")}>
            Test Twilio
          </button>
          <button type="button" className="btn-outline" onClick={() => void testConnection("email")}>
            Test Email
          </button>
          <button type="button" className="btn-outline" onClick={() => void testConnection("firebase")}>
            Test Firebase
          </button>
        </div>
      </article>

      {message ? <p className="text-muted">{message}</p> : null}
    </div>
  );
}
