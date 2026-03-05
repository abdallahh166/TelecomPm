import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { PaginationBar, StatusBadge } from "../../features/admin/AdminUi";
import { officesApi, type OfficeDto } from "../../features/admin/officesApi";
import {
  MATERIAL_CATEGORY_OPTIONS,
  MATERIAL_UNIT_OPTIONS,
} from "../../features/operations/enumOptions";
import { defaultPagination } from "../../features/operations/common";
import {
  materialsApi,
  type CreateMaterialRequest,
  type MaterialDetailDto,
  type MaterialDto,
} from "../../features/operations/materialsApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

type CreateMaterialFormState = {
  code: string;
  name: string;
  description: string;
  category: string;
  initialStock: string;
  unit: string;
  minimumStock: string;
  unitCost: string;
  supplier: string;
};

type StockActionFormState = {
  quantity: string;
  unit: string;
  supplier: string;
  visitId: string;
};

const EMPTY_CREATE_FORM: CreateMaterialFormState = {
  code: "",
  name: "",
  description: "",
  category: MATERIAL_CATEGORY_OPTIONS[0]?.value ?? "Power",
  initialStock: "",
  unit: MATERIAL_UNIT_OPTIONS[0]?.value ?? "Pieces",
  minimumStock: "",
  unitCost: "",
  supplier: "",
};

const EMPTY_STOCK_ACTION_FORM: StockActionFormState = {
  quantity: "",
  unit: MATERIAL_UNIT_OPTIONS[0]?.value ?? "Pieces",
  supplier: "",
  visitId: "",
};

function parsePositiveDecimal(value: string): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function MaterialsOperationsPage() {
  const { session, hasPermission } = useAuth();
  const canManageMaterials = hasPermission(OperationsPermissionKeys.materialsManage);

  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [officeId, setOfficeId] = useState<string>(session?.officeId ?? "");
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<MaterialDto[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDetailDto | null>(null);
  const [pagination, setPagination] = useState(defaultPagination());
  const [page, setPage] = useState(1);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMaterialFormState>(EMPTY_CREATE_FORM);
  const [stockForm, setStockForm] = useState<StockActionFormState>(EMPTY_STOCK_ACTION_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOffices = useCallback(async () => {
    if (!canManageMaterials) {
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
  }, [canManageMaterials, officeId]);

  const loadMaterials = useCallback(async () => {
    if (!officeId) {
      setMaterials([]);
      setPagination(defaultPagination());
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await materialsApi.list({
        officeId,
        onlyInStock: onlyInStock || undefined,
        page,
        pageSize: 10,
      });
      setMaterials(response.items);
      setPagination(response.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load materials."));
    } finally {
      setIsLoading(false);
    }
  }, [officeId, onlyInStock, page]);

  useEffect(() => {
    void loadOffices();
  }, [loadOffices]);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const onLoadLowStock = async (): Promise<void> => {
    if (!officeId) {
      return;
    }

    setError(null);
    try {
      const result = await materialsApi.lowStock(officeId);
      setLowStockMaterials(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load low-stock materials."));
    }
  };

  const onSelectMaterial = async (materialId: string): Promise<void> => {
    setError(null);
    try {
      const material = await materialsApi.getById(materialId);
      setSelectedMaterial(material);
      setStockForm((current) => ({
        ...current,
        unit: material.unit || current.unit,
      }));
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load material detail."));
    }
  };

  const onCreateMaterial = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canManageMaterials || !officeId) {
      return;
    }

    setMessage(null);
    setError(null);

    if (!/^[A-Z0-9-]+$/.test(createForm.code.trim())) {
      setError("Material code must use uppercase letters, numbers, and hyphens only.");
      return;
    }

    const initialStock = parsePositiveDecimal(createForm.initialStock);
    const minimumStock = parsePositiveDecimal(createForm.minimumStock);
    const unitCost = parsePositiveDecimal(createForm.unitCost);

    if (!createForm.name.trim()) {
      setError("Material name is required.");
      return;
    }

    if (initialStock === null || minimumStock === null || unitCost === null) {
      setError("Initial stock, minimum stock, and unit cost must be greater than zero.");
      return;
    }

    const request: CreateMaterialRequest = {
      code: createForm.code.trim(),
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      category: createForm.category,
      officeId,
      initialStock,
      unit: createForm.unit,
      minimumStock,
      unitCost,
      supplier: createForm.supplier.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await materialsApi.create(request);
      setCreateForm(EMPTY_CREATE_FORM);
      setMessage("Material created.");
      await loadMaterials();
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to create material."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const runStockAction = async (
    action: () => Promise<void>,
    successMessage: string,
  ): Promise<void> => {
    if (!selectedMaterial) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await action();
      setMessage(successMessage);
      await onSelectMaterial(selectedMaterial.id);
      await loadMaterials();
      await onLoadLowStock();
    } catch (actionError) {
      setError(getErrorMessage(actionError, "Stock action failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddStock = async (): Promise<void> => {
    if (!canManageMaterials || !selectedMaterial) {
      return;
    }

    const quantity = parsePositiveDecimal(stockForm.quantity);
    if (quantity === null) {
      setError("Quantity must be greater than zero.");
      return;
    }

    await runStockAction(
      () => materialsApi.addStock(selectedMaterial.id, {
        quantity,
        unit: stockForm.unit,
        supplier: stockForm.supplier.trim() || undefined,
      }),
      "Stock added successfully.",
    );
  };

  const onReserveStock = async (): Promise<void> => {
    if (!canManageMaterials || !selectedMaterial) {
      return;
    }

    const quantity = parsePositiveDecimal(stockForm.quantity);
    if (quantity === null) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!stockForm.visitId.trim()) {
      setError("Visit ID is required for reserve operation.");
      return;
    }

    await runStockAction(
      () => materialsApi.reserveStock(selectedMaterial.id, {
        visitId: stockForm.visitId.trim(),
        quantity,
        unit: stockForm.unit,
      }),
      "Stock reserved successfully.",
    );
  };

  const onConsumeStock = async (): Promise<void> => {
    if (!canManageMaterials || !selectedMaterial) {
      return;
    }

    if (!stockForm.visitId.trim()) {
      setError("Visit ID is required for consume operation.");
      return;
    }

    await runStockAction(
      () => materialsApi.consumeStock(selectedMaterial.id, {
        visitId: stockForm.visitId.trim(),
      }),
      "Stock consumed successfully.",
    );
  };

  const onDeleteMaterial = async (): Promise<void> => {
    if (!canManageMaterials || !selectedMaterial) {
      return;
    }

    const confirmed = window.confirm(`Delete material ${selectedMaterial.code}?`);
    if (!confirmed) {
      return;
    }

    await runStockAction(
      async () => {
        await materialsApi.remove(selectedMaterial.id);
        setSelectedMaterial(null);
      },
      "Material deleted.",
    );
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
      <article className="panel">
        <div className="admin-toolbar">
          <h3>Materials</h3>
          <div className="toolbar-group">
            <select
              className="field-input compact"
              value={officeId}
              onChange={(event) => {
                setOfficeId(event.target.value);
                setPage(1);
                setSelectedMaterial(null);
              }}
            >
              {officeOptions.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.code} - {office.name}
                </option>
              ))}
            </select>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(event) => {
                  setOnlyInStock(event.target.checked);
                  setPage(1);
                }}
              />
              Only in stock
            </label>
            <button type="button" className="btn-outline" onClick={() => void onLoadLowStock()}>
              Load Low-Stock List
            </button>
          </div>
        </div>
        {isLoading ? <p className="text-muted">Loading materials...</p> : null}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Minimum</th>
                <th>Unit Cost</th>
                <th>Low Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.code}</td>
                  <td>{material.name}</td>
                  <td>{material.category}</td>
                  <td>
                    {material.currentStock} {material.unit}
                  </td>
                  <td>
                    {material.minimumStock} {material.unit}
                  </td>
                  <td>{formatMoney(material.unitCost, material.currency)}</td>
                  <td>
                    <StatusBadge value={material.isLowStock} trueLabel="Low" falseLabel="OK" />
                  </td>
                  <td className="table-actions">
                    <button type="button" className="btn-outline" onClick={() => void onSelectMaterial(material.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {!materials.length && !isLoading ? (
                <tr>
                  <td colSpan={8} className="text-muted">
                    No materials found for selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      </article>

      {canManageMaterials ? (
        <article className="panel">
          <h3>Create Material</h3>
          <form className="admin-form-grid" onSubmit={onCreateMaterial}>
            <input
              className="field-input"
              placeholder="Code (e.g. BAT-100AH)"
              value={createForm.code}
              onChange={(event) => setCreateForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              required
            />
            <input
              className="field-input"
              placeholder="Name"
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <select
              className="field-input"
              value={createForm.category}
              onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
            >
              {MATERIAL_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="field-input"
              value={createForm.unit}
              onChange={(event) => setCreateForm((current) => ({ ...current, unit: event.target.value }))}
            >
              {MATERIAL_UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="field-input"
              placeholder="Initial stock"
              value={createForm.initialStock}
              onChange={(event) => setCreateForm((current) => ({ ...current, initialStock: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Minimum stock"
              value={createForm.minimumStock}
              onChange={(event) => setCreateForm((current) => ({ ...current, minimumStock: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Unit cost"
              value={createForm.unitCost}
              onChange={(event) => setCreateForm((current) => ({ ...current, unitCost: event.target.value }))}
              required
            />
            <input
              className="field-input"
              placeholder="Supplier"
              value={createForm.supplier}
              onChange={(event) => setCreateForm((current) => ({ ...current, supplier: event.target.value }))}
            />
            <input
              className="field-input wide"
              placeholder="Description"
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Material"}
            </button>
          </form>
        </article>
      ) : null}

      {selectedMaterial ? (
        <article className="panel">
          <h3>
            Material Detail: {selectedMaterial.code} - {selectedMaterial.name}
          </h3>
          <p className="text-muted">
            Stock: {selectedMaterial.currentStock} {selectedMaterial.unit} | Minimum: {selectedMaterial.minimumStock} {selectedMaterial.unit}
          </p>
          {canManageMaterials ? (
            <div className="admin-form-grid">
              <input
                className="field-input"
                placeholder="Quantity"
                value={stockForm.quantity}
                onChange={(event) => setStockForm((current) => ({ ...current, quantity: event.target.value }))}
              />
              <select
                className="field-input"
                value={stockForm.unit}
                onChange={(event) => setStockForm((current) => ({ ...current, unit: event.target.value }))}
              >
                {MATERIAL_UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="field-input"
                placeholder="Supplier (add stock)"
                value={stockForm.supplier}
                onChange={(event) => setStockForm((current) => ({ ...current, supplier: event.target.value }))}
              />
              <input
                className="field-input"
                placeholder="Visit ID (reserve/consume)"
                value={stockForm.visitId}
                onChange={(event) => setStockForm((current) => ({ ...current, visitId: event.target.value }))}
              />
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onAddStock()}>
                Add Stock
              </button>
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onReserveStock()}>
                Reserve Stock
              </button>
              <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void onConsumeStock()}>
                Consume Stock
              </button>
              <button type="button" className="btn-outline danger" disabled={isSubmitting} onClick={() => void onDeleteMaterial()}>
                Delete Material
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      <article className="panel">
        <h3>Low-Stock Materials</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Current Stock</th>
                <th>Minimum</th>
              </tr>
            </thead>
            <tbody>
              {lowStockMaterials.map((material) => (
                <tr key={material.id}>
                  <td>{material.code}</td>
                  <td>{material.name}</td>
                  <td>
                    {material.currentStock} {material.unit}
                  </td>
                  <td>
                    {material.minimumStock} {material.unit}
                  </td>
                </tr>
              ))}
              {!lowStockMaterials.length ? (
                <tr>
                  <td colSpan={4} className="text-muted">
                    No low-stock records loaded.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      {error ? <p className="text-danger">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
    </div>
  );
}
