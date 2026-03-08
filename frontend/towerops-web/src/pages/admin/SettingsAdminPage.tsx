import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "../../features/admin/AdminUi";
import { defaultPagination } from "../../features/admin/common";
import { getErrorMessage } from "../../shared/errors/errorMessage";
import { PageIntro } from "../../components/PageIntro/PageIntro";
import { EmptyState, InlineNotice, LoadingState } from "../../components/Feedback/States";
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
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [testingService, setTestingService] = useState<"twilio" | "email" | "firebase" | null>(null);

  const [groupQuery, setGroupQuery] = useState("");
  const [groupResult, setGroupResult] = useState<SystemSettingDto[] | null>(null);
  const [editState, setEditState] = useState<SettingEditState>(EMPTY_EDIT);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await settingsApi.list({
        page,
        pageSize: 10,
        sortBy,
        sortDir,
      });

      setSettings(response.items);
      setPagination(response.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load settings."));
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
    setError(null);
    if (!editState.group.trim()) {
      setError("Group is required.");
      return;
    }

    if (!editState.key.trim()) {
      setError("Key is required.");
      return;
    }

    const request: UpsertSystemSettingRequest = {
      key: editState.key.trim(),
      value: editState.value,
      group: editState.group.trim(),
      dataType: editState.dataType.trim() || "string",
      description: editState.description.trim() || undefined,
      isEncrypted: editState.isEncrypted,
    };

    setIsSaving(true);
    try {
      await settingsApi.upsert([request]);
      setMessage("Setting saved.");
      await loadSettings();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to save setting."));
    } finally {
      setIsSaving(false);
    }
  };

  const loadByGroup = async (): Promise<void> => {
    const trimmedGroup = groupQuery.trim();
    if (!trimmedGroup) {
      setGroupResult(null);
      return;
    }

    setError(null);
    setIsLoadingGroup(true);
    try {
      const result = await settingsApi.byGroup(trimmedGroup);
      setGroupResult(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load settings for this group."));
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const testConnection = async (service: "twilio" | "email" | "firebase"): Promise<void> => {
    setError(null);
    setTestingService(service);
    try {
      const response = await settingsApi.testConnection(service);
      setMessage(response);
    } catch (testError) {
      setError(getErrorMessage(testError, "Service test failed."));
    } finally {
      setTestingService(null);
    }
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Phase 2"
        title="System Settings"
        description="Review grouped configuration, edit runtime values, and run connection checks for external services without leaving the admin workspace."
      />

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
        {isLoading ? <LoadingState title="Loading settings..." /> : null}
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
                  <td colSpan={6}>
                    <EmptyState title="No settings found.">
                      Try changing the sort order or populate settings from the backend seed data.
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
          <button
            type="button"
            className="btn-primary"
            disabled={isSaving || testingService !== null}
            onClick={() => void saveSetting()}
          >
            {isSaving ? "Saving..." : "Save Setting"}
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
          <button type="button" className="btn-outline" disabled={isLoadingGroup || isSaving} onClick={() => void loadByGroup()}>
            {isLoadingGroup ? "Loading..." : "Load Group"}
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
          <EmptyState title="No group loaded yet.">
            Run a group query to inspect related settings together.
          </EmptyState>
        )}
      </article>

      <article className="panel">
        <h3>Test External Services</h3>
        <div className="toolbar-group">
          <button
            type="button"
            className="btn-outline"
            disabled={testingService !== null || isSaving}
            onClick={() => void testConnection("twilio")}
          >
            {testingService === "twilio" ? "Testing..." : "Test Twilio"}
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={testingService !== null || isSaving}
            onClick={() => void testConnection("email")}
          >
            {testingService === "email" ? "Testing..." : "Test Email"}
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={testingService !== null || isSaving}
            onClick={() => void testConnection("firebase")}
          >
            {testingService === "firebase" ? "Testing..." : "Test Firebase"}
          </button>
        </div>
      </article>

      {error ? <InlineNotice title="Settings action failed" tone="error">{error}</InlineNotice> : null}
      {message ? <InlineNotice title="Settings update" tone="success">{message}</InlineNotice> : null}
    </div>
  );
}
