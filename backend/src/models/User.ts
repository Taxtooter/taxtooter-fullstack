import { supabase } from '../config/supabase';
import crypto from 'crypto';

export interface IUser {
    id: string;
    email: string;
    password: string;
    name: string;
    role: "admin" | "consultant" | "customer";
    created_at?: string;
    updated_at?: string;
}

export class User {
    static async findById(id: string, select?: string): Promise<IUser | null> {
        const query = supabase
            .from('users')
            .select(select || '*')
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error || !data) return null;
        return data as unknown as IUser;
    }

    static async findOne(query: { email: string }, select?: string): Promise<IUser | null> {
        const dbQuery = supabase
            .from('users')
            .select(select || '*')
            .eq('email', query.email)
            .single();

        const { data, error } = await dbQuery;
        if (error || !data) return null;
        return data as unknown as IUser;
    }

    static async find(query: Partial<IUser> = {}, select?: string): Promise<IUser[]> {
        let dbQuery = supabase
            .from('users')
            .select(select || '*');

        // Apply filters
        Object.entries(query).forEach(([key, value]) => {
            dbQuery = dbQuery.eq(key, value);
        });

        const { data, error } = await dbQuery;
        if (error || !data) return [];
        return data as unknown as IUser[];
    }

    static async create(userData: Omit<IUser, 'id'>): Promise<IUser> {
        const hashedPassword = crypto
            .createHash('sha256')
            .update(userData.password)
            .digest('hex');

        const { data, error } = await supabase
            .from('users')
            .insert([{ ...userData, password: hashedPassword }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Failed to create user: ${error.message}`);
        }
        if (!data) throw new Error('Failed to create user: No data returned');
        return data as unknown as IUser;
    }

    static async update(id: string, updates: Partial<Omit<IUser, 'id'>>): Promise<IUser | null> {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return null;
        return data as unknown as IUser;
    }

    static async delete(id: string): Promise<IUser | null> {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return null;
        return data as unknown as IUser;
    }

    static async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
        const hashedCandidate = crypto
            .createHash('sha256')
            .update(candidatePassword)
            .digest('hex');
        return hashedCandidate === user.password;
    }
}

export default User;
