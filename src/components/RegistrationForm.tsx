import React, { forwardRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
    Button, Checkbox, Divider, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { NameSuggestionsResponse } from '@/types/NameSuggestion';
import RegForm from '@/types/RegistrationForm';
import Gender from '@/types/Gender';
import Doctor from '@/types/Doctor';
import ClientGroup from '@/types/ClientGroup';
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import moment from 'moment';
import useDebounce from '@/helpers/debounce';


interface Props {
    genders: Gender[];
    clientGroups: ClientGroup[];
    doctors: Doctor[];
    onRegister: () => void;
}

const DEFAULT_FORM: RegForm = {
    fullName: "",
    birthDate: null,
    phoneNumber: "",
    genderId: "",
    clientGroupId: "",
    doctorId: "",
    sendSMS: true,
}

const today = moment();
const minDate = moment().subtract(150, 'years');
const DADATA_API_KEY = import.meta.env.VITE_DADATA_TOKEN;
const DEBOUNCE_TIMER = 500;

export const RegistrationForm: React.FC<Props> = forwardRef((props, ref: any) => {
    const { genders, onRegister } = props;
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

    const {
        control,
        formState: { errors },
        setValue,
        handleSubmit: useFormSubmit
    } = useForm<RegForm>({ defaultValues: DEFAULT_FORM });

    useEffect(() => {
        console.log("this", props.genders)
        setValue('genderId', props.genders[0]?.id);
    }, [genders]);

    const fetchNameSuggestions = (query: string): Promise<string[]> => {
        return new Promise((resolve) => {
            fetch("http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + DADATA_API_KEY
                },
                body: JSON.stringify({ query: query }),
            })
                .then(res => res.json())
                .then((res: NameSuggestionsResponse) => {
                    let suggestions = res.suggestions.reduce((acc: string[], curr) => {
                        if (!acc.includes(curr.value)) {
                            acc = [...acc, curr.value];
                        }
                        return acc;
                    }, []);
                    resolve(suggestions);
                })
                .catch(() => {
                    resolve([]);
                });
        })
    };

    const updateNameSuggestions = async (query: string) => {
        let suggestions = await fetchNameSuggestions(query);
        setNameSuggestions(suggestions);
    }

    const {
        debounced: updateNameSuggestionsDebounced,
        clearTimer: clearUpdateNameSuggestions
    } = useDebounce(updateNameSuggestions, DEBOUNCE_TIMER);

    const handleNameChange = (
        onChange: Function, fromSuggestions: boolean
    ) => async (
        e: React.SyntheticEvent, value: string | null = ""
    ) => {
            let newValue = value || "";
            if (fromSuggestions) {
                // Не обновлять данные при выборе из списка
                // в целях экономии запросов
                clearUpdateNameSuggestions();
            }
            else {
                // Очищаем устаревшие подсказки и запрашиваем новые
                setNameSuggestions([]);
                updateNameSuggestionsDebounced(newValue)
            };
            onChange(newValue);
        }

    const hanldePhoneChange = (onChange: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // Можно было бы вместо этого использовать
        // стороннюю бибилеотеку, например react-imask
        let value = e.target.value;
        let cleared = value.replace(/(^\+7)|(^8)|\D/g, '');
        let formatted = "";

        if (cleared.length > 0 || value.length === 1) formatted += "+7 ";

        if (cleared.length <= 3) formatted += cleared
        else {
            formatted += `(${cleared.substring(0, 3)}) ${cleared.substring(3, 6)}`;
            if (cleared.length > 6) formatted += `-${cleared.substring(6, 8)}`;
            if (cleared.length > 8) formatted += `-${cleared.substring(8, 10)}`;
        }

        // output: +7 (000) 000-00-00
        onChange(formatted);
    }

    const handleSubmit: SubmitHandler<RegForm> = data => {
        console.log(data);
        onRegister();
    }

    const handleSubmitError: SubmitErrorHandler<RegForm> = data => {
        console.log(errors);
    }

    return (
        <Box width="100%" ref={ref}>
            <Paper
                sx={{
                    paddingX: 3,
                    paddingY: 2,
                    margin: 1
                }}
            >
                <div className="registration__form__header">
                    <LocalHospitalIcon
                        color="primary"
                        sx={{ fontSize: "64px", marginRight: 1, marginLeft: -1 }}
                    />
                    <Typography fontWeight="600" variant="h5">
                        Поликлиника №24
                    </Typography>
                </div>

                <form
                    name="registration"
                    onSubmit={useFormSubmit(handleSubmit, handleSubmitError)}
                >
                    <Stack spacing={3}>
                        <Controller
                            name="fullName"
                            control={control}
                            rules={{
                                required: "Поле обязательно для заполнения"
                            }}
                            render={({ field: { value, onChange, ...rest } }) => (
                                <Autocomplete
                                    freeSolo
                                    autoComplete
                                    openOnFocus
                                    value={value}
                                    options={nameSuggestions}
                                    filterOptions={options => options}
                                    onInputChange={handleNameChange(onChange, false)}
                                    onChange={handleNameChange(onChange, true)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            {...rest}
                                            label="ФИО *"
                                            variant="outlined"
                                            error={!!errors.fullName}
                                            helperText={errors.fullName?.message}
                                        />
                                    )}
                                />
                            )}
                        ></Controller>

                        <Controller
                            name="birthDate"
                            control={control}
                            rules={{
                                required: "Поле обязательно для заполнения",
                                validate: {
                                    dateIsValid: d => (
                                        moment(d).isValid()
                                        || "Неправильный формат даты"
                                    ),
                                    dateInRange: d => (
                                        moment(d).isBetween(minDate, today)
                                        || "Неправильный формат даты"
                                    )
                                }
                            }}
                            render={({ field: { ref, ...rest } }) => (
                                <DatePicker
                                    {...rest}
                                    label="Дата рождения *"
                                    format="DD-MM-YYYY"
                                    minDate={minDate}
                                    disableFuture
                                    slotProps={{
                                        textField: {
                                            variant: "outlined",
                                            error: !!errors.birthDate,
                                            helperText: errors.birthDate?.message
                                        }
                                    }}
                                />
                            )}
                        ></Controller>

                        <Controller
                            name="phoneNumber"
                            control={control}
                            rules={{
                                required: "Поле обязательно для заполнения",
                                validate: {
                                    minLength: v => {
                                        if (v.replace(/\D/g, '').length < 11) {
                                            return "Непрвильный формат номера телефона"
                                        }
                                        return true;
                                    }
                                }
                            }}
                            render={({ field: { onChange, ...rest } }) => (
                                <TextField
                                    {...rest}
                                    autoComplete='tel'
                                    placeholder="+7"
                                    label="Номер телефона *"
                                    variant="outlined"
                                    onChange={hanldePhoneChange(onChange)}
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber?.message}
                                />
                            )}
                        ></Controller>

                        <Controller
                            control={control}
                            name="genderId"
                            render={({ field }) => (
                                <FormControl variant="outlined" >
                                    <InputLabel id="gender-label">Пол</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="gender-label"
                                        label="Пол"
                                        variant="outlined"
                                    >
                                        {props.genders.map(g => (
                                            <MenuItem key={g.id} value={g.id}>{g.value}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        ></Controller>

                        <Controller
                            control={control}
                            name="clientGroupId"
                            rules={{
                                required: "Поле обязательно для заполнения"
                            }}
                            render={({ field }) => (
                                <FormControl variant="outlined" error={!!errors.clientGroupId}>
                                    <InputLabel id="clients-label">Группа клиентов *</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="clients-label"
                                        label="Группа клиентов *"
                                        variant="outlined"
                                    >
                                        {props.clientGroups.map(g => (
                                            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.clientGroupId?.message}</FormHelperText>
                                </FormControl>
                            )}
                        ></Controller>

                        <Controller
                            control={control}
                            name="doctorId"
                            render={({ field }) => (
                                <FormControl variant="outlined" error={!!errors.doctorId}>
                                    <InputLabel id="doctor-label">Лечащий врач</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="doctor-label"
                                        label="Лечащий врач"
                                        variant="outlined"
                                    >
                                        {props.doctors.map(g => (
                                            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.doctorId?.message}</FormHelperText>
                                </FormControl>
                            )}
                        ></Controller>
                    </Stack>
                    <Box my={2}><Divider /></Box>

                    <Button fullWidth variant="contained" type="submit">
                        Зарегистрироваться
                    </Button>
                    <Controller
                        control={control}
                        name="sendSMS"
                        render={({ field: { value, ...rest } }) => (
                            <FormControlLabel
                                label="Отправить SMS"
                                control={
                                    <Checkbox
                                        {...rest}
                                        checked={value}
                                    />
                                }
                            />
                        )}
                    ></Controller>
                </form>

            </Paper>
        </Box>
    )
})

export default RegistrationForm;