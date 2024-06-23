import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

const allergies = [
    {title: "Lactose"},
    {title: "Gluten"},
    {title: "Peanuts"},
    {title: "Tree Nuts"},
    {title: "Shellfish"},
    {title: "Fish"},
    {title: "Soy"},
    {title: "Eggs"},
    {title: "Wheat"},
    {title: "Sesame"},
    {title: "Corn"},
    {title: "Mustard"},
    {title: "Celery"},
    {title: "Sulphites"},
    {title: "Lupin"},
    {title: "Mollusks"},
    {title: "Legumes"},
    {title: "Fruit"},
    {title: "Vegetables"},
    {title: "Garlic"},
    {title: "Onion"},
    {title: "Gelatin"},
    {title: "Meat"},
    {title: "Spices"},
    {title: "Chocolate"},
    {title: "Yeast"}
];

export default function AllergiesCheckbox({onAllergiesChange, value}) {
    const [selectedAllergies, setSelectedAllergies] = React.useState(value || []);

    React.useEffect(() => {
        if (value) {
            setSelectedAllergies(value);
        }
    }, [value]);

    const handleAutocompleteChange = (_, values) => {
        setSelectedAllergies(values);
        onAllergiesChange(values);
    };

    return (
        <Autocomplete
            multiple
            options={allergies}
            disableCloseOnSelect
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) => option.title === value.title}
            onChange={handleAutocompleteChange}
            renderOption={(props, option, {selected}) => (
                <li key={option.title} {...props}>
                    <Checkbox checked={selected}/>
                    {option.title}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Allergies"
                    placeholder="Select allergies"
                />
            )}
            value={selectedAllergies}
        />
    );
}
