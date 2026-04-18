// import { BlackholedSignatureError, ExpiredSignatureError } from "signed";
// import { config } from "winston";

// config({ quite: true })

// const BASE_URL = process.env.BASE_URL

// export const VarifySignature = (req, res, next) => {
//     try {
//         const { userId, signature } = req.query;
//         const fullUrl = `${BASE_URL}/reset-password?userId=${userId}&signature=${signature}`;
//         signature.verify(fullUrl)
//         next();
//     } catch (error) {
//         if (error instanceof BlackholedSignatureError) {
//             return res.redirect("forgot-password?error=Signature expired. Please request a new one.");
//         } else if (error instanceof ExpiredSignatureError) {
//             return res.redirect("forgot-password?error=Signature expired. Please request a new one.");
//         }
//         next(error);
//     }
// }