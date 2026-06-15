import * as yup from 'yup';

export const loginValidate = yup.object().shape({
    username: yup.string().required('Username is required').trim().lowercase(),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerValidate = yup.object().shape({
    username: yup.string().required('Username is required').trim().lowercase().min(3, 'Username must be at least 3 characters'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const updateProfileValidate = yup.object().shape({
    username: yup.string().trim().lowercase().min(3, 'Username must be at least 3 characters'),
    email: yup.string().email('Invalid email format'),
    password: yup.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordValidate = yup.object().shape({
    oldPassword: yup.string().min(6, 'Old password must be at least 6 characters').required('Old password is required'),
    newPassword: yup.string().min(6, 'New password must be at least 6 characters').required('New password is required'),
    confirmPassword: yup.string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const forgotPasswordValidate = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
});

export const resetPasswordValidate = yup.object().shape({
    token: yup.string().required('Token is required'),
    newPassword: yup.string().min(6, 'New password must be at least 6 characters').required('New password is required'),
    confirmPassword: yup.string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type TLogin = yup.InferType<typeof loginValidate>;
export type TChangePassword = yup.InferType<typeof changePasswordValidate>;
export type TForgotPassword = yup.InferType<typeof forgotPasswordValidate>;
export type TResetPassword = yup.InferType<typeof resetPasswordValidate>;
export type TUpdateProfile = yup.InferType<typeof updateProfileValidate>;
export type TRegister = yup.InferType<typeof registerValidate>;