export type NameSuggestion = {
    value: string;
    unrestricted_value: string;
    data: {
        surname?: string;
        name: string;
        patronymic?: string;
        gender: "MALE"|"FEMALE";
        source: null;
        qc: "0"|"1";
    }
}

export type NameSuggestionsResponse = {
    suggestions: NameSuggestion[];
}

export default NameSuggestion;