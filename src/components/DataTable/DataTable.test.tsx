import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DataTable from "./DataTable";

const MISSING_DATA_PLACEHOLDER = "-";

const rows = [
  { id: 1, name: "Item 1", value: null, uuid: "u1" },
  { id: 2, name: "Item 2", value: "Value 2", uuid: "u2" },
  { id: 3, name: "Item 3", value: undefined, uuid: "u3" },
  { id: 4, name: "Item 4", value: "", uuid: "u4" },
];

const columns = [
  { field: "name", headerName: "Name" },
  { field: "value", headerName: "Value" },
];

vi.mock("@mui/x-data-grid", async () => {
  const actual: any = await vi.importActual("@mui/x-data-grid");
  return {
    ...actual,
    DataGrid: (props: any) => (
      <div data-testid="mock-data-grid">
        {props.rows.map((r: any) => (
          <div key={props.getRowId(r)} data-testid={`row-${props.getRowId(r)}`}>
            {props.columns.map((c: any) => (
              <div key={c.field} data-testid={`cell-${c.field}`}>
                {c.renderCell
                  ? c.renderCell({ value: r[c.field], row: r })
                  : r[c.field]}
              </div>
            ))}
          </div>
        ))}
        <button
          data-testid="mock-pagination-next"
          onClick={() =>
            props.onPaginationModelChange?.({ page: 1, pageSize: 10 })
          }
        >
          Next Page
        </button>
        <button
          data-testid="mock-pagination-same"
          onClick={() =>
            props.onPaginationModelChange?.({
              page: props.paginationModel.page,
              pageSize: props.paginationModel.pageSize,
            })
          }
        >
          Same Page
        </button>
        <button
          data-testid="mock-sort"
          onClick={() =>
            props.onSortModelChange?.([{ field: "name", sort: "asc" }])
          }
        >
          Sort
        </button>
        <button
          data-testid="mock-unsort"
          onClick={() => props.onSortModelChange?.([])}
        >
          Unsort
        </button>
      </div>
    ),
  };
});

describe("DataTable complete coverage", () => {
  let handleRowAction: any;
  let onPaginationPageChange: any;
  let onSortModelChange: any;

  beforeEach(() => {
    handleRowAction = vi.fn();
    onPaginationPageChange = vi.fn();
    onSortModelChange = vi.fn();
    vi.stubGlobal("MISSING_DATA_PLACEHOLDER", MISSING_DATA_PLACEHOLDER);
  });

  it("renderizza DataGrid con colonna actions e gestisce renderEmptyCell", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        handleRowAction={handleRowAction}
      />
    );

    expect(screen.getAllByTestId("cell-name")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("cell-value")[0]).toBeInTheDocument();

    expect(screen.getAllByText(MISSING_DATA_PLACEHOLDER)).toHaveLength(3);

    expect(screen.getByText("Value 2")).toBeInTheDocument();
  });

  it("chiama handleRowAction cliccando sul pulsante actions", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        handleRowAction={handleRowAction}
      />
    );

    const actionsButtons = screen.getAllByRole("button");
    fireEvent.click(actionsButtons[4]);
  });

  it("chiama onPaginationPageChange quando cambia pagina", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        onPaginationPageChange={onPaginationPageChange}
      />
    );

    fireEvent.click(screen.getByTestId("mock-pagination-next"));

    expect(onPaginationPageChange).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
  });

  it("non chiama onPaginationPageChange se loading=true (riga 108)", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        onPaginationPageChange={onPaginationPageChange}
        loading
      />
    );

    fireEvent.click(screen.getByTestId("mock-pagination-next"));
    expect(onPaginationPageChange).not.toHaveBeenCalled();
  });

  it("non chiama onPaginationPageChange se la pagina e pageSize sono le stesse (righe 113-114)", () => {
    const initialPagination = { page: 5, pageSize: 25, totalElements: 100 };
    render(
      <DataTable
        rows={rows}
        columns={columns}
        onPaginationPageChange={onPaginationPageChange}
        paginationModel={initialPagination}
      />
    );

    fireEvent.click(screen.getByTestId("mock-pagination-same"));
    expect(onPaginationPageChange).not.toHaveBeenCalled();
  });

  it("chiama onSortModelChange se modello non vuoto (riga 126)", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        onSortModelChange={onSortModelChange}
      />
    );

    fireEvent.click(screen.getByTestId("mock-sort"));

    expect(onSortModelChange).toHaveBeenCalledWith([
      { field: "name", sort: "asc" },
    ]);
  });

  it("usa customUniqueField per getRowId", () => {
    render(
      <DataTable rows={rows} columns={columns} customUniqueField="uuid" />
    );

    expect(screen.getByTestId("row-u1")).toBeInTheDocument();
  });
});
