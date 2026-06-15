import * as yup from "yup";

export const coachValidate = yup.object().shape({
    name: yup.string().required("Name is required").trim(),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    schoolIds: yup.array().of(yup.string().required()).min(1, "At least one School ID is required"),
    birthdate: yup.date().required("Birthdate is required").max(new Date(), "Birthdate cannot be in the future"),
});

export const coachLoginValidate = yup.object().shape({
    name: yup.string().required("Name is required").trim(),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export type TCoach = yup.InferType<typeof coachValidate>;
export type TCoachLogin = yup.InferType<typeof coachLoginValidate>;