import * as yup from "yup";

export const athleteValidate = yup.object().shape({
  name: yup.string().required("Name is required").trim(),
  schools: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one School ID is required"),
  birthdate: yup
    .date()
    .required("Birthdate is required")
    .max(new Date(), "Birthdate cannot be in the future"),
  belt: yup
    .string()
    .required("Belt is required")
    .oneOf(
      ["putih", "kuning", "hijau", "biru", "coklat", "hitam"],
      "Invalid belt color"
    ),
  imageUrl: yup.string().optional(),
});

export const athleteUpdateValidate = yup.object().shape({
    name: yup.string().trim(),
    schoolIds: yup.array().of(yup.string().required()).min(1, "At least one School ID is required"),
    birthdate: yup.date().max(new Date(), "Birthdate cannot be in the future"),
    belt: yup.string().oneOf(["putih", "kuning", "hijau", "biru", "coklat", "hitam"], "Invalid belt color"),
    imageUrl: yup.string()
});

export type TAthleteCreate = yup.InferType<typeof athleteValidate>;
export type TAthleteUpdate = yup.InferType<typeof athleteUpdateValidate>;
