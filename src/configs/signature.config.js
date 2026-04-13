import { config } from "dotenv";
import signedModule from "signed";

config({ quiet: true })

export const signature = signedModule.default({
    secret: process.env.SIGNATURE_KEY,
})