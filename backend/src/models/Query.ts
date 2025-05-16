import { supabase } from '../config/supabase';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface Response {
    id?: string;
    query_id: string;
    user_id: string;
    user_name: string;
    user_role: string;
    message: string;
    created_at: string;
    file_key?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    file_signed_url?: string | null;
}

export interface IQuery {
    id: string;
    title: string;
    description: string;
    status: "open" | "assigned" | "resolved";
    customer_id: string;
    consultant_id?: string;
    responses?: Response[];
    created_at?: string;
    updated_at?: string;
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function getSignedUrlForKey(key: string): Promise<string | null> {
    if (!key) return null;
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes
    } catch (err) {
        console.error("Error generating signed URL:", err);
        return null;
    }
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

        // Fetch responses for this query
        const { data: responses, error: respError } = await supabase
            .from('responses')
            .select('*')
            .eq('query_id', id)
            .order('created_at', { ascending: true });

        if (respError) {
            console.error('Supabase error fetching responses:', respError);
        }

        // Attach signed URLs to responses
        if (responses) {
            for (const resp of responses) {
                if (resp.file_key) {
                    resp.file_signed_url = await getSignedUrlForKey(resp.file_key);
                }
            }
        }

        return {
            ...data,
            responses: responses || [],
        } as unknown as IQuery;
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
        // Fetch responses for each query
        const queries: IQuery[] = await Promise.all(
            data.map(async (q: any) => {
                const { data: responses } = await supabase
                    .from('responses')
                    .select('*')
                    .eq('query_id', q.id)
                    .order('created_at', { ascending: true });
                // Attach signed URLs to responses
                if (responses) {
                    for (const resp of responses) {
                        if (resp.file_key) {
                            resp.file_signed_url = await getSignedUrlForKey(resp.file_key);
                        }
                    }
                }
                return {
                    ...q,
                    responses: responses || [],
                };
            })
        );
        return queries;
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

    static async addResponse(queryId: string, response: Response): Promise<IQuery | null> {
        // Insert the response into the responses table
        const { error } = await supabase
            .from('responses')
            .insert([{
                query_id: queryId,
                user_id: response.user_id,
                user_name: response.user_name,
                user_role: response.user_role,
                message: response.message,
                created_at: response.created_at,
                file_key: response.file_key || null,
                file_path: response.file_path || null,
                file_name: response.file_name || null,
            }]);

        if (error) {
            console.error('Supabase error in addResponse:', error);
            return null;
        }

        // Return the updated query with responses
        return await this.findById(queryId);
    }
}

export default Query;
