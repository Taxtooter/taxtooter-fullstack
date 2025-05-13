import { supabase } from '../config/supabase';

export interface IQuery {
    id: string;
    title: string;
    description: string;
    status: "open" | "assigned" | "resolved";
    customer_id: string;
    consultant_id?: string;
    responses?: Array<{
        user_id: string;
        user_name: string;
        user_role: string;
        message: string;
        created_at: string;
        file?: {
            filename: string;
            path: string;
            key: string;
        } | null;
    }>;
    created_at?: string;
    updated_at?: string;
}

export class Query {
    static async findById(id: string): Promise<IQuery | null> {
        const { data, error } = await supabase
            .from('queries')
            .select(`
                *,
                customer:customer_id (id, name, email),
                consultant:consultant_id (id, name, email)
            `)
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return data as unknown as IQuery;
    }

    static async find(query: { customer_id?: string, consultant_id?: string }): Promise<IQuery[]> {
        let supabaseQuery = supabase
            .from('queries')
            .select(`
                *,
                customer:customer_id (id, name, email),
                consultant:consultant_id (id, name, email)
            `);

        if (query.customer_id) {
            supabaseQuery = supabaseQuery.eq('customer_id', query.customer_id);
        }
        if (query.consultant_id) {
            supabaseQuery = supabaseQuery.eq('consultant_id', query.consultant_id);
        }

        const { data, error } = await supabaseQuery;

        if (error || !data) return [];
        return data as unknown as IQuery[];
    }

    static async create(queryData: Omit<IQuery, 'id'>): Promise<IQuery> {
        const { data, error } = await supabase
            .from('queries')
            .insert([queryData])
            .select()
            .single();

        if (error || !data) throw new Error('Failed to create query');
        return data as unknown as IQuery;
    }

    static async update(id: string, updates: Partial<IQuery>): Promise<IQuery | null> {
        const { data, error } = await supabase
            .from('queries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return null;
        return data as unknown as IQuery;
    }

    static async addResponse(queryId: string, response: NonNullable<IQuery['responses']>[number]): Promise<IQuery | null> {
        const query = await this.findById(queryId);
        if (!query) return null;

        const responses = [...(query.responses || []), response];

        const { data, error } = await supabase
            .from('queries')
            .update({ responses })
            .eq('id', queryId)
            .select()
            .single();

        if (error || !data) return null;
        return data as unknown as IQuery;
    }
}

export default Query;
