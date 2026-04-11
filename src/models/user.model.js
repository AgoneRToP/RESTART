import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.SchemaTypes.String
        },
        age: {
            type: mongoose.SchemaTypes.Number
        },
        email: {
            type: mongoose.SchemaTypes.String
        },
        password: {
            type: mongoose.SchemaTypes.String
        }
    },
    {
        collection: "user",
        timestamps: true,
        versionKey: false,
    }
)

export const User = mongoose.model("User", UserSchema)