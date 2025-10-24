import * as Repo from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { createRandomToken, saveToken, findTokenDoc, deleteUserTokensByType } from "../../utils/token";
import { Types } from "mongoose";
import { sendMail } from "../../utils/email";
import Audit from "../audit/audit.model";
import { BASE_URL_SERVER } from "../../utils";

/** TTLs (seconds) */
const EMAIL_VERIFY_TTL = 60 * 60 * 24; // 1 day
const RESET_TTL = 60 * 60; // 1 hour
const REFRESH_TTL = 60 * 60 * 24 * 30; // 30 days

export const registerUser = async (payload: {
    name: string;
    userName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: any;
    roleName: string; // role name to lookup
}) => {
    const { name, userName, email, password, phoneNumber, address, roleName } = payload;

    const existing = await Repo.findUserByEmail(email) || await Repo.findUserByUserName(userName);
    if (existing) throw new Error("Email or username already in use");

    const role = await Repo.findRoleByName(roleName);
    if (!role) throw new Error("Role not found");

    const hashed = await hashPassword(password);
    const user = await Repo.createUser({
        name, userName, email, password: hashed, phoneNumber, address, role: role._id, status: "pending", isEmailVerified: false
    });

    // send verification token
    const token = createRandomToken();
    await saveToken(user._id as Types.ObjectId, token, "emailVerify", EMAIL_VERIFY_TTL);
    const verifyUrl = `${BASE_URL_SERVER}/api/auth/verify-email?token=${token}&id=${user._id}`;
    await sendMail(user.email, "Verify your account", `Click to verify: <a href="${verifyUrl}">${verifyUrl}</a>`);

    await Audit.create({ actorId: user._id, action: "user:registered", targetId: user._id });

    return user;
};

export const verifyEmail = async (userId: string, token: string) => {
    const doc = await findTokenDoc(token, "emailVerify");
    if (!doc || doc.userId.toString() !== userId) throw new Error("Invalid or expired token");
    await Repo.updateUser(userId, { isEmailVerified: true, status: "active" });
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "emailVerify");
    await Audit.create({ actorId: doc.userId, action: "user:email_verified", targetId: doc.userId });
    return true;
};

export const login = async (emailOrUserName: string, password: string) => {
    // allow login by email or username
    let user = await Repo.findUserByEmail(emailOrUserName);
    if (!user) user = await Repo.findUserByUserName(emailOrUserName);
    if (!user) throw new Error("Invalid credentials");
    if (user.status !== "active") throw new Error(`User status ${user.status}`);

    const match = await comparePassword(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const access = signAccessToken({ id: user._id.toString(), role: (user.role as any).name || user.role });
    const refresh = signRefreshToken({ id: user._id.toString(), role: (user.role as any).name || user.role });

    // rotate refresh tokens: delete previous refresh tokens for user to avoid reuse (policy choice)
    await deleteUserTokensByType(user._id as Types.ObjectId, "refresh");
    await saveToken(user._id as Types.ObjectId, refresh, "refresh", REFRESH_TTL);

    await Audit.create({ actorId: user._id, action: "user:login", targetId: user._id });

    return {
        status: "success", 
        message:"User Logined in Successfully!",
        access, 
        refresh,
         user: {
            _id: user._id,
            name: user.name,
            userName: user.userName,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified
        }
    };
};

export const refreshToken = async (token: string) => {
    // verify signature
    const payload: any = verifyRefreshToken(token) as any;
    if (!payload || !payload.id) throw new Error("Invalid refresh token");

    // check it exists in DB (hashed)
    const doc = await findTokenDoc(token, "refresh");
    if (!doc) throw new Error("Refresh token revoked or expired");

    // rotate: remove old refresh doc and issue new pair
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "refresh");
    const newAccess = signAccessToken({ id: payload.id, role: payload.role });
    const newRefresh = signRefreshToken({ id: payload.id, role: payload.role });
    await saveToken(doc.userId as unknown as Types.ObjectId, newRefresh, "refresh", REFRESH_TTL);
    await Audit.create({ actorId: doc.userId, action: "token:refreshed", targetId: doc.userId });

    return { access: newAccess, refresh: newRefresh };
};

export const forgotPassword = async (email: string) => {
    const user = await Repo.findUserByEmail(email);
    if (!user) return; // don't reveal
    const token = createRandomToken();
    await saveToken(user._id as Types.ObjectId, token, "passwordReset", RESET_TTL);
    const url = `${BASE_URL_SERVER}/api/auth/reset-password?token=${token}&id=${user._id}`;
    await sendMail(user.email, "Password reset", `Reset here: <a href="${url}">${url}</a>`);
    await Audit.create({ actorId: user._id, action: "user:forgot_password", targetId: user._id });
};

export const resetPassword = async (userId: string, token: string, newPassword: string) => {
    const doc = await findTokenDoc(token, "passwordReset");
    if (!doc || doc.userId.toString() !== userId) throw new Error("Invalid or expired token");
    const hashed = await hashPassword(newPassword);
    await Repo.updateUser(userId, { password: hashed, passwordChangedAt: new Date() });
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "passwordReset");
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "refresh"); // force logout
    await Audit.create({ actorId: doc.userId, action: "user:password_reset", targetId: doc.userId });
    return true;
};

// Admin-only helper to create employees (invite)
export const adminCreateUser = async (actorId: string, payload: {
    name: string; userName: string; email: string; roleName: string; phoneNumber?: string; address?: any;
}) => {
    const role = await Repo.findRoleByName(payload.roleName);
    if (!role) throw new Error("Role not found");
    // generate temp password
    const temp = Math.random().toString(36).slice(-8) + "A1!";
    const hashed = await hashPassword(temp);
    const user = await Repo.createUser({
        name: payload.name,
        userName: payload.userName,
        email: payload.email,
        password: hashed,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        role: role._id,
        status: "pending",
        isEmailVerified: false
    });
    // send invite with temp password and verification link
    const token = createRandomToken();
    await saveToken(user._id as Types.ObjectId, token, "emailVerify", EMAIL_VERIFY_TTL);
    const inviteUrl = `${BASE_URL_SERVER}/api/auth/verify-email?token=${token}&id=${user._id}`;
    await sendMail(user.email, "You are invited", `Temporary password: ${temp}. Verify: <a href="${inviteUrl}">${inviteUrl}</a>`);
    await Audit.create({ actorId: actorId ? new Types.ObjectId(actorId) : undefined, action: "admin:invite_user", targetId: user._id, meta: { tempPasswordProvided: true } });
    return user;
};
