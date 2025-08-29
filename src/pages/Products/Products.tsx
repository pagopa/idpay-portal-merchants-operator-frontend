
import { Grid } from '@mui/material'
// import ProductFilters from '../../components/Datagrid/ProductFilters'
import ProductGrid from '../../components/Datagrid/ProductGrid'

export default function Products() {
  return (

    <Grid container spacing={1}>
      <Grid  size={{ xs: 12 }} >
      {/* <Grid item xs={12}>
        <ProductFilters />
      </Grid> */}
      
        <ProductGrid />
      </Grid>
    </Grid>



  )
}
