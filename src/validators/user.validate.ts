import * as yup from 'yup';

export const userValidate = yup.object().shape({
    username: yup.string().required('Username is required').trim().lowercase().min(3, 'Username must be at least 3 characters'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role: yup.string().oneOf(['pengurus', 'pelatih'], 'Role must be either pengurus or pelatih').required('Role is required'),
});

export const userUpdateValidate = yup.object().shape({
    username: yup.string().trim().lowercase().min(3, 'Username must be at least 3 characters'),
    email: yup.string().email('Invalid email format'),
    password: yup.string().min(6, 'Password must be at least 6 characters'),
    role: yup.string().oneOf(['pengurus', 'pelatih'], 'Role must be either pengurus or pelatih'),
});

export type UserType = yup.InferType<typeof userValidate>;
export type UserUpdateType = yup.InferType<typeof userUpdateValidate>;
