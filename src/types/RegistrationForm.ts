interface RegistrationForm {
    fullName: string;
    birthDate: string | null;
    phoneNumber: string;
    genderId: number | "";
    clientGroupId: number | "";
    doctorId: number | "";
    sendEmail: boolean;
}

export default RegistrationForm;