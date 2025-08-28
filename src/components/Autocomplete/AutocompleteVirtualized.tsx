import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';

const MOCKPRODUCTS = [
  {
    gtinCode: "TUMBLEDRYERS09",
    organizationId: "72c2c5f8-1c71-4614-a4b3-95e3aee71c3d",
    registrationDate: "2025-08-28T16:34:00.82",
    status: "UPLOADED",
    model: "WQG235D1ES",
    productGroup: "tumbledryers20232534",
    category: "Asciugatrice",
    brand: "Bosch",
    eprelCode: "2223869",
    productCode: "TD09",
    countryOfProduction: "IT",
    energyClass: "C",
    linkEprel: "https://eprel.ec.europa.eu/screen/product/tumbledryers20232534/2223869",
    batchName: "Asciugatrici_68b068d674ccb798039fd4eb.csv",
    productName: "Asciugatrice Bosch WQG235D1ES 8 kg",
    capacity: "8 kg",
    organizationName: "Produttore SvenVath"
  },
  {
    gtinCode: "TUMBLEDRYERS08",
    organizationId: "72c2c5f8-1c71-4614-a4b3-95e3aee71c3d",
    registrationDate: "2025-08-28T16:34:00.757",
    status: "UPLOADED",
    model: "WQG243D8IT",
    productGroup: "tumbledryers20232534",
    category: "Asciugatrice",
    brand: "Bosch",
    eprelCode: "2274375",
    productCode: "TD08",
    countryOfProduction: "IT",
    energyClass: "C",
    linkEprel: "https://eprel.ec.europa.eu/screen/product/tumbledryers20232534/2274375",
    batchName: "Asciugatrici_68b068d674ccb798039fd4eb.csv",
    productName: "Asciugatrice Bosch WQG243D8IT 9 kg",
    capacity: "9 kg",
    organizationName: "Produttore SvenVath"
  },
  {
    gtinCode: "TUMBLEDRYERS07",
    organizationId: "72c2c5f8-1c71-4614-a4b3-95e3aee71c3d",
    registrationDate: "2025-08-28T16:34:00.757",
    status: "UPLOADED",
    model: "WQG243D8IT",
    productGroup: "tumbledryers20232534",
    category: "Asciugatrice",
    brand: "Bosch",
    eprelCode: "2274375",
    productCode: "TD08",
    countryOfProduction: "IT",
    energyClass: "C",
    linkEprel: "https://eprel.ec.europa.eu/screen/product/tumbledryers20232534/2274375",
    batchName: "Asciugatrici_68b068d674ccb798039fd4eb.csv",
    productName: "Lavatrice Bosch WQG243D8IT 12 kg",
    capacity: "12 kg",
    organizationName: "Produttore SvenVath"
  },
  {
    gtinCode: "TUMBLEDRYERS06",
    organizationId: "72c2c5f8-1c71-4614-a4b3-95e3aee71c3d",
    registrationDate: "2025-08-28T16:34:00.757",
    status: "UPLOADED",
    model: "WQG243D8IT",
    productGroup: "tumbledryers20232534",
    category: "Asciugatrice",
    brand: "Bosch",
    eprelCode: "2274375",
    productCode: "TD08",
    countryOfProduction: "IT",
    energyClass: "C",
    linkEprel: "https://eprel.ec.europa.eu/screen/product/tumbledryers20232534/2274375",
    batchName: "Asciugatrici_68b068d674ccb798039fd4eb.csv",
    productName: "Lavatrice Bosch WQG243D8IT 6 kg",
    capacity: "6 kg",
    organizationName: "Produttore SvenVath"
  },
]

const LISTBOX_PADDING = 8;

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  if (dataSet.hasOwnProperty('group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  const { key, ...optionProps } = dataSet[0];
  const productObj = dataSet[1];

  return (
    <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
      {productObj.productName}
    </Typography>
  );
}


const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactElement<unknown>[] = [];
  (children as React.ReactElement<unknown>[]).forEach(
    (
      item: React.ReactElement<unknown> & {
        children?: React.ReactElement<unknown>[];
      },
    ) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    },
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactElement<unknown>) => {
    if (child.hasOwnProperty('group')) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
  boxSizing: 'border-box',
  '& ul': {
    padding: 0,
    margin: 0,
  },
},
 
'& .MuiAutocomplete-option': {
  padding: '12px 16px',
  transition: 'background-color 0.2s ease',

  // Hover normale (grigio chiaro)
  '&:hover': {
    backgroundColor: '#0073E614 !important',
    color: "#0073E6",
    fontWeight: "600",
  },
  
},
});

function AutocompleteVirtualized() {


  return (
    <Autocomplete
      sx={{ width: 360 }}
      popupIcon={null}
      disableListWrap
      options={MOCKPRODUCTS}
      getOptionLabel={(option) => option.productName}
      renderInput={(params) => <TextField {...params} label="Cerca" size='small' />}
      renderOption={(props, option, state) =>
        [props, option, state.index] as React.ReactNode
      }
      slots={{
        popper: StyledPopper,
      }}
      slotProps={{
        listbox: {
          component: ListboxComponent,
        },
      }}
    />
  );
}

export default AutocompleteVirtualized;

// Esempio di utilizzo nel tuo componente:
/*
// Nel tuo componente, sostituisci il TextField esistente con:

<VirtualizedProductAutocomplete
  value={selectedProduct} // Stato per il prodotto selezionato
  onChange={(newValue) => handleFieldChange('product', newValue)}
  error={!!fieldErrors.product}
  helperText={fieldErrors.product ? REQUIRED_FIELD_ERROR : ""}
  t={t} // Se stai usando i18n
/>

// Assicurati di avere questi stati:
const [selectedProduct, setSelectedProduct] = useState(null);

// E modifica handleFieldChange per gestire l'oggetto prodotto:
const handleFieldChange = (field, value) => {
  setSelectedProduct(value);
  // Logica di validazione esistente
};
*/


// renderInput={(params) => (
//   <TextField
//     {...params}
//     variant="outlined"
//     label={label || (t && t('pages.acceptDiscount.search')) || 'Cerca prodotto'}
//     size="small"
//     error={error}
//     helperText={helperText}
//     sx={{
//       mt: 2,
//       '& .MuiFormLabel-root.Mui-error': {
//         color: '#5C6E82 !important',
//       },
//       '& .MuiOutlinedInput-root': {
//         '& fieldset': {
//           borderColor: '#e0e0e0',
//         },
//         '&:hover fieldset': {
//           borderColor: '#1976d2',
//         },
//         '&.Mui-focused fieldset': {
//           borderColor: '#1976d2',
//         },
//       },
//     }}
//     placeholder="Cerca per nome, marca, modello o codice..."
//   />
// )}