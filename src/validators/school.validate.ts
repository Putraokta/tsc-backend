import * as yup from "yup";

export const schoolValidate = yup.object().shape({
    name: yup.string().required("Name is required").trim(),
    address: yup.string().required("Address is required").trim(),
});

export type TSchool = yup.InferType<typeof schoolValidate>;
