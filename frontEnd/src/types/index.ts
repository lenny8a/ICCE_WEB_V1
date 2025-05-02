export type User = {
    name: string;
    email: string;
    password: string;
}

export type registerForm = Pick<User, 'name' | 'email' > & {
    password: string;
}

export type Embal = {
    embal: string;
}

export type viewEmbalForm = Pick<Embal, 'embal' > & {
    embal: string;
    zubic?: string;
}