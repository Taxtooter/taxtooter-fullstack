export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Query {
    id: string;
    title: string;
    description: string;
    status: "open" | "assigned" | "resolved";
    customer?: User;
    consultant?: User;
    responses?: {
        message: string;
        user?: User;
        createdAt: string;
        file?: {
            filename?: string;
            path?: string;
            key?: string;
        } | null;
    }[];
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Consultant {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
        email: string,
        password: string,
        name: string,
        role: string,
    ) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updateUser: (user: User) => void;
}

export interface LayoutProps {
    children: React.ReactNode;
}
