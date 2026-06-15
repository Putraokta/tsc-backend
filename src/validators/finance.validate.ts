import * as yup from "yup";
import { FINANCE_TYPE } from "../utils/contants";

export const financeValidate = yup.object().shape({
    type: yup.string().required("Type is required").oneOf([FINANCE_TYPE.EXPENSE, FINANCE_TYPE.INCOME], "Type must be either 'income' or 'expense'"),
    description: yup.string().trim(),
    balance: yup.number().required("Balance is required").min(0, "Balance cannot be negative"),
    date: yup.date().optional(),
});