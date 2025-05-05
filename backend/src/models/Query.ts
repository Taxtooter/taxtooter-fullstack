import mongoose from "mongoose";

export interface IQuery extends mongoose.Document {
    title: string;
    description: string;
    status: "open" | "assigned" | "resolved";
    customer: mongoose.Types.ObjectId;
    consultant?: mongoose.Types.ObjectId;
    responses?: Array<{
        user: {
            _id: mongoose.Types.ObjectId;
            name: string;
            role: string;
        };
        message: string;
        createdAt: Date;
        file?: {
            filename: string;
            path: string;
            key: string;
        } | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const querySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "assigned", "resolved"],
            default: "open",
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        consultant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        responses: [
            {
                user: {
                    _id: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                    },
                    name: {
                        type: String,
                        required: true,
                    },
                    role: {
                        type: String,
                        required: true,
                    },
                },
                message: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                file: {
                    filename: { type: String },
                    path: { type: String },
                    key: { type: String },
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<IQuery>("Query", querySchema);
