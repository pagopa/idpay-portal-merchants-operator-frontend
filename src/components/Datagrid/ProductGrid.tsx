
import type { GridColDef } from "@mui/x-data-grid";
import { PAGINATION_SIZE } from "../../utils/constants";
import DataTable from "./DataTable";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { content } from "./useMockProduct";
import { ProductDTO } from "./ProductDTO";


// interface ProductDTO {
//   statId: number;
//   teamId: number;
//   season: number;
//   name: string;
//   team: string;
//   wins: number;
//   losses: number;
//   fieldGoalsMade: number;
//   fieldGoalsAttempted: number;
//   fieldGoalsPercentage: number;
//   twoPointersMade: number;
//   twoPointersAttempted: number;
//   twoPointersPercentage: number;
//   threePointersMade: number;
//   threePointersAttempted: number;
//   threePointersPercentage: number;
//   freeThrowsMade: number;
//   freeThrowsAttempted: number;
//   freeThrowsPercentage: number;
//   offensiveRebounds: number;
//   defensiveRebounds: number;
//   rebounds: number;
//   assists: number;
//   steals: number;
//   blockedShots: number;
//   turnovers: number;
//   personalFouls: number;
//   points: number;
//   doubleDoubles: number;
//   tripleDoubles: number;
// }

export default function ProductGrid() {
    const { t } = useTranslation();
    const [rowsGrid, setRowGrid]=useState<ProductDTO>({});

    useEffect(() => {

      const rw= content.map((item, index) =>(
    {
        id: index,
        gtinCode: item.gtinCode,
        model: item.model,
        category: item.category,
        brand: item.brand,
        eprelCode: item.eprelCode,
        linkEprel: item.linkEprel,
        productName: item.productName,
    }
));
setRowGrid(rw);
      console.log("rws", rowsGrid);
    }, []);

  const cols: Array<GridColDef> = [
    {
      field: 'category',
      headerName: t('pages.products.category'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'brand',
      headerName: t('pages.products.brand'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'model',
      headerName: t('pages.products.model'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // renderCell: (params: any) => (
      //   <CurrencyColumn value={params.value} />
      // ),
    },
    {
      field: 'gtinCode',
      headerName: t('pages.products.gtin'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // renderCell: (params: any) => (
      //   <CurrencyColumn value={params.value} />
      // ),
    },
    {
      field: 'eprelCode',
      headerName:  t('pages.products.eprelCode'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false,
      // renderCell: (params: any) => (
      //   <StatusChip status={params.value} />
      // ),
    },
    {
      field: 'linkEprel',
      headerName:  t('pages.products.linkEprel'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false,
      // renderCell: (params: any) => (
      //   <StatusChip status={params.value} />
      // ),
    },
     {
      field: 'productName',
      headerName:  t('pages.products.productName'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false,
      // renderCell: (params: any) => (
      //   <StatusChip status={params.value} />
      // ),
    },
  ];

  //   const columns: Array<GridColDef> = [
  //   {
  //     field: 'franchiseName',
  //     headerName: t('pages.initiativeStores.franchiseName'),
  //     width: 250,
  //     editable: false,
  //     disableColumnMenu: true,
  //   },
  //   {
  //     field: 'type',
  //     headerName: t('pages.initiativeStores.type'),
  //     width: 100,
  //     editable: false,
  //     disableColumnMenu: true,
  //     renderCell: (params: any) => {
  //       if(params.value === 'PHYSICAL') {
  //         return 'Fisico';
  //       } else if(params.value === 'ONLINE') {
  //         return 'Online';
  //       } else {
  //         return '-';
  //       }
  //     },
  //   },
  //   {
  //     field: 'address',
  //     headerName: t('pages.initiativeStores.address'),
  //     width: 200,
  //     editable: false,
  //     disableColumnMenu: true,
  //   },
  //   {
  //     field: 'city',
  //     headerName: t('pages.initiativeStores.city'),
  //     width: 200,
  //     editable: false,
  //     disableColumnMenu: true,
  //   },
  //   {
  //     field: 'referent',
  //     headerName: t('pages.initiativeStores.referent'),
  //     width: 200,
  //     editable: false,
  //     disableColumnMenu: true,
  //     renderCell: (params: any) => `${params.row.contactName ? params.row.contactName : MISSING_DATA_PLACEHOLDER} ${params.row.contactSurname ? params.row.contactSurname : MISSING_DATA_PLACEHOLDER}`,
  //   },
  //   {
  //     field: 'contactEmail',
  //     headerName: t('pages.initiativeStores.email'),
  //     width: 300,
  //     editable: false,
  //     disableColumnMenu: true,
  //   },
  
  // ];
  return (
    <DataTable 
          rows={rowsGrid} 
          columns={cols} 
          pageSize={PAGINATION_SIZE}
          rowsPerPage={PAGINATION_SIZE}
          // handleRowAction={goToStoreDetail} 
          // onSortModelChange={handleSortModelChange}
          // paginationModel={storesPagination}
          // onPaginationPageChange={handlePaginationPageChange}
        />
  )
}
