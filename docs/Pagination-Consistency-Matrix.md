# Pagination Consistency Matrix

## Purpose
This document clarifies which list endpoints return full pagination metadata and which return plain arrays.

Sources:
- `src/TowerOps.Api/Contracts/Common/PagedResponse.cs`
- `src/TowerOps.Api/Mappings/PaginationContractMapper.cs`
- `src/TowerOps.Api/Controllers/*`

## Standard Paginated Response
Paginated endpoints should return:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Contract type:
- `PagedResponse<T>`
- `PaginationMetadata`

## Endpoints Using Standard Pagination
| Endpoint | Query Params | Clamp / Defaults | Sort Allowlist |
|---|---|---|---|
| `GET /api/offices` | `page`, `pageSize`, `onlyActive`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `code,name,region,isActive,createdAt` |
| `GET /api/roles` | `page`, `pageSize`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `name,displayName,isActive,isSystem,updatedAt` |
| `GET /api/settings` | `page`, `pageSize`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `group,key,dataType,updatedAtUtc` |
| `GET /api/sites/office/{officeId}` | `pageNumber`, `pageSize`, filters | page >= 1; pageSize 1..100 (default 20) | query-handler ordering |
| `GET /api/visits/engineers/{engineerId}` | `pageNumber`, `pageSize`, filters | page >= 1; pageSize 1..100 (default 10) | query-handler ordering |
| `GET /api/portal/sites` | `page`, `pageSize`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `siteCode,name,status,region` |
| `GET /api/portal/workorders` | `page`, `pageSize`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `createdAt,status,priority,siteCode,slaDeadline` |
| `GET /api/portal/visits/{siteCode}` | `page`, `pageSize`, `sortBy`, `sortDir` | page >= 1; pageSize 1..100 (default 25) | `scheduledDate,status,type,visitNumber` |

## Endpoints Returning Arrays (No Pagination Metadata)
| Endpoint | Notes |
|---|---|
| `GET /api/materials` | Office-scoped list, no `PagedResponse` |
| `GET /api/users/office/{officeId}` | Plain list |
| `GET /api/users/role/{role}` | Plain list |
| `GET /api/sites/maintenance` | Filtered list, no paging |
| `GET /api/visits/pending-reviews` | Plain list |
| `GET /api/visits/scheduled` | Plain list |
| `GET /api/portal/sla-report` | Aggregated DTO, not list paging |

## Frontend Handling Policy
- If response has `data + pagination`: use server-driven paging controls.
- If response is plain array: treat as slice/list without total-count UI.
- Do not assume every endpoint with filters supports paging metadata.
- Keep endpoint-specific adapters in frontend API layer.

## Remediation Target
For long-term consistency, prioritize migrating high-volume array endpoints to `PagedResponse<T>`:
1. `GET /api/materials`
2. `GET /api/users/office/{officeId}`
3. `GET /api/users/role/{role}`
4. `GET /api/visits/pending-reviews`
5. `GET /api/visits/scheduled`

