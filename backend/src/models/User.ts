import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    email: string;
    password: string;
    name: string;
    role: "admin" | "consultant" | "customer";
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "consultant", "customer"],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Simple password hashing method
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();

    // Simple hash - in production, use a proper hashing library
    const password = this.password;
    this.password = password.split("").reverse().join("") + password.length;
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    const hashedCandidate =
        candidatePassword.split("").reverse().join("") +
        candidatePassword.length;
    return this.password === hashedCandidate;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
