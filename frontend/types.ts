export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface Query {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'open';
    customer?: User;
    consultant?: User;
    responses?: {
        message: string;
        user?: User;
        createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Consultant {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, role: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updateUser: (user: User) => void;
}

export interface LayoutProps {
    children: React.ReactNode;
} 