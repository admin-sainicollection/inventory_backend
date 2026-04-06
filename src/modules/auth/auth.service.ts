import * as Repo from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { createRandomToken, saveToken, findTokenDoc, deleteUserTokensByType } from "../../utils/token";
import mongoose, { Types } from "mongoose";
import { sendMail } from "../../utils/email";
import Audit from "../audit/audit.model";
import { BASE_URL_SERVER, FRONTEND_URL } from "../../utils";
import { IRole } from "./role.model";
import Role from "./role.model";
import { IUser } from "../users/user.model";
import { ServiceResponse } from "../employee/employee.service";
import User from "../users/user.model";

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
    roleId: string;
}) => {
    const { name, userName, email, password, phoneNumber, address, roleId } = payload;

    const existing = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existing) throw new Error("Email or username already in use");

    const role = await Role.findById(roleId);
    if (!role) throw new Error("Role not found");

    const hashed = await hashPassword(password);
    const user = await User.create({
        name,
        userName,
        email,
        password: hashed,
        phoneNumber,
        address,
        role: role._id,
        status: "pending",
        isEmailVerified: false
    });

    // Send verification token
    const token = createRandomToken();
    await saveToken(user._id as Types.ObjectId, token, "emailVerify", 24 * 60 * 60); // 24 hours
    const verifyUrl = `${BASE_URL_SERVER}/api/v1/inventory/auth/verify-email?token=${token}&id=${user._id}`;

    await sendMail(user.email, "Verify your account", `
        <h2>Welcome to JD-SI!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
    `);

    await Audit.create({ actorId: user._id, action: "user:registered", targetId: user._id });

    return user;
};

export const sendCredentialsEmail = async (user: any) => {
    try {
        // Generate password reset token for setting up password
        const resetToken = createRandomToken();
        await saveToken(user._id, resetToken, "passwordReset", 24 * 60 * 60); // 24 hours

        // const resetUrl = `${BASE_URL_SERVER}/api/v1/inventory/auth/reset-password?token=${resetToken}&id=${user._id}`;
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;


        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Welcome to JD-SI - Your Account Credentials</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .credentials-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to JD-SI!</h1>
                        <p>Your account has been successfully verified</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.name}!</h2>
                        <p>Your account has been successfully created and verified. Here are your login credentials:</p>
                        
                        <div class="credentials-box">
                            <strong>Username:</strong> ${user.userName}<br>
                            <strong>Email:</strong> ${user.email}<br>
                            <strong>Role:</strong> ${user.role?.name || 'User'}
                        </div>
                        
                        <p>For security reasons, we do not display your password. Please click the button below to set up your password:</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Set Your Password</a>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Note:</strong>
                            <ul style="margin: 10px 0 0 20px;">
                                <li>This link will expire in 24 hours</li>
                                <li>For security, please set your password immediately</li>
                                <li>Never share your password with anyone</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} JD-SI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendMail(user.email, "Welcome to JD-SI - Your Account Credentials", emailHtml);

        await Audit.create({
            actorId: user._id,
            action: "user:credentials_sent",
            targetId: user._id,
            metadata: { email: user.email }
        });

    } catch (error: any) {
        console.error("Error sending credentials email:", error);
        // Don't throw error - email sending failure shouldn't break the flow
    }
};

export const verifyEmail = async (userId: string, token: string) => {
    const doc = await findTokenDoc(token, "emailVerify");
    if (!doc || doc.userId.toString() !== userId) throw new Error("Invalid or expired token");

    const user = await User.findByIdAndUpdate(
        userId,
        { isEmailVerified: true, status: "active" },
        { new: true }
    ).populate('role', 'name');

    if (!user) throw new Error("User not found");

    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "emailVerify");
    await Audit.create({ actorId: doc.userId, action: "user:email_verified", targetId: doc.userId });

    // After successful verification, send credentials email
    await sendCredentialsEmail(user);

    return true;
};

export const login = async (emailOrUserName: string, password: string) => {
    // allow login by email or username
    let user = await Repo.findUserByEmail(emailOrUserName).populate('role','name permissions');
    if (!user) user = await Repo.findUserByUserName(emailOrUserName).populate('role','name permissions');
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
        message: "User Logined in Successfully!",
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
    const user = await User.findOne({ email });
    if (!user) return; // don't reveal if user exists

    // Delete any existing password reset tokens for this user
    await deleteUserTokensByType(user._id as Types.ObjectId, "passwordReset");

    const token = createRandomToken();
    await saveToken(user._id as Types.ObjectId, token, "passwordReset", RESET_TTL);

    // const resetUrl = `${BASE_URL_SERVER}/api/v1/inventory/auth/reset-password?token=${token}&id=${user._id}`;
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

    await sendMail(user.email, "Password Reset Request", `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in ${RESET_TTL / 3600} hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `);

    await Audit.create({ actorId: user._id, action: "user:forgot_password", targetId: user._id });
};

export const resetPassword = async (userId: string, token: string, newPassword: string) => {
    // Validate password strength
    if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const doc = await findTokenDoc(token, "passwordReset");
    if (!doc || doc.userId.toString() !== userId) {
        throw new Error("Invalid or expired token");
    }

    const hashed = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, {
        password: hashed,
        passwordChangedAt: new Date()
    });

    // Delete all password reset tokens for this user
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "passwordReset");

    // Also delete refresh tokens to force logout from all devices
    await deleteUserTokensByType(doc.userId as unknown as Types.ObjectId, "refresh");

    await Audit.create({
        actorId: doc.userId,
        action: "user:password_reset",
        targetId: doc.userId
    });

    return true;
};

export const changePasswordService = async (
    userId: string,
    payload: {
        currentPassword: string;
        newPassword: string;
    }
): Promise<{ success: boolean; message: string }> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { currentPassword, newPassword } = payload;

        // Validate user exists
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found");
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        // Check if new password is same as current
        const isSamePassword = await comparePassword(newPassword, user.password);
        if (isSamePassword) {
            throw new Error("New password cannot be the same as current password");
        }

        // Validate new password strength
        if (newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user password
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    password: hashedPassword,
                    passwordChangedAt: new Date(),
                },
            },
            { new: true, session }
        );

        if (!updatedUser) {
            throw new Error("Failed to update password");
        }

        await session.commitTransaction();

        return {
            success: true,
            message: "Password changed successfully",
        };
    } catch (error: any) {
        await session.abortTransaction();
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
};

export const adminResetUserPassword = async (
    adminId: string,
    userId: string
)=> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if admin exists and has permission
        const admin = await User.findById(adminId).populate('role');
        if (!admin) {
            throw new Error("Admin not found");
        }

        // Verify admin has permission (role name is 'admin')
        const roleName = (admin.role as any)?.name?.toLowerCase();
        if (roleName !== 'admin') {
            throw new Error("Only administrators can reset user passwords");
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Generate a secure temporary password
        const temporaryPassword = generateRandomPassword();

        // Hash the temporary password
        const hashedPassword = await hashPassword(temporaryPassword);

        // Update user password
        await User.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                passwordChangedAt: new Date(),
                status: "active" // Ensure user is active
            },
            { session }
        );

        // Delete all existing tokens for this user (force logout)
        await deleteUserTokensByType(user._id as Types.ObjectId, "refresh");
        await deleteUserTokensByType(user._id as Types.ObjectId, "passwordReset");

        // Generate password reset token for email link
        const resetToken = createRandomToken();
        await saveToken(user._id as Types.ObjectId, resetToken, "passwordReset", 24 * 60 * 60);

        // Send email with new password
        await sendPasswordResetEmail(user, temporaryPassword, resetToken, true);

        // Log the action
        await Audit.create({
            actorId: adminId,
            action: "user:password_reset_by_admin",
            targetId: userId,
            metadata: {
                adminName: admin.name,
                adminEmail: admin.email,
                userName: user.name,
                userEmail: user.email
            }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: `Password reset successfully. A new temporary password has been sent to ${user.email}`,
            temporaryPassword: temporaryPassword
        };
    } catch (error: any) {
        await session.abortTransaction();
        throw new Error(`Failed to reset password: ${error.message}`);
    } finally {
        session.endSession();
    }
};

const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const sendPasswordResetEmail = async (user: any, temporaryPassword: string, resetToken: string, isAdminReset: boolean = false) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset - JD-SI</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .password-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.name}!</h2>
                    <p>Your password has been reset by an administrator.</p>
                    
                    ${temporaryPassword ? `
                        <p>Your temporary password is:</p>
                        <div class="password-box">
                            <strong>${temporaryPassword}</strong>
                        </div>
                        <p>Please use this password to log in. You will be prompted to change it on first login.</p>
                    ` : ''}
                    
                    <p>You can also click the button below to set a new password:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Set New Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Note:</strong>
                        <ul style="margin: 10px 0 0 20px;">
                            <li>This link will expire in 24 hours</li>
                            <li>If you didn't request this, please contact your system administrator immediately</li>
                            <li>Never share your password with anyone</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} JD-SI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendMail(user.email, "Password Reset - JD-SI", emailHtml);
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

export const getAllUsersService = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status?: string,
    role?: string
) => {
    try {
        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        // Search by name, email, or username
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Execute queries in parallel
        const [users, total] = await Promise.all([
            User.find(query)
                .populate('role', 'name permissions')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        const pages = Math.ceil(total / limit);

        return {
            status: "success",
            message: "Users fetched successfully",
            data: {
                users,
                total,
                page,
                pages,
            },
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
};

export const getUserByIdService = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid user ID format");
        }

        const user = await User.findById(id)
            .populate('role', 'name permissions description')
            .lean();

        if (!user) {
            throw new Error("User not found");
        }

        // Remove sensitive information
        // const {password,  ...userWithoutPassword } = user;

        const { ...userWithoutPassword } = user;

        return {
            status: "success",
            message: "User fetched successfully",
            data: userWithoutPassword ,
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
};

export const updateUserService = async (
    id: string,
    updateData: Partial<IUser>
): Promise<ServiceResponse<IUser>> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid user ID format");
        }

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            throw new Error("User not found");
        }

        // Check for unique fields if they're being updated
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await User.findOne({ email: updateData.email, _id: { $ne: id } });
            if (emailExists) {
                throw new Error("Email already in use by another user");
            }
        }

        if (updateData.userName && updateData.userName !== existingUser.userName) {
            const usernameExists = await User.findOne({ userName: updateData.userName, _id: { $ne: id } });
            if (usernameExists) {
                throw new Error("Username already in use by another user");
            }
        }

        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await hashPassword(updateData.password);
            updateData.passwordChangedAt = new Date();
        }

        // Remove fields that shouldn't be updated directly
        delete updateData._id;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('role', 'name permissions').lean();

        if (!updatedUser) {
            throw new Error("Failed to update user");
        }

        // Remove sensitive information
        const { ...userWithoutPassword } = updatedUser;

        return {
            status: "success",
            message: "User updated successfully",
            data: userWithoutPassword ,
        };
    } catch (error: any) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

export const deleteUserService = async (id: string): Promise<ServiceResponse> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid user ID format");
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }

        return {
            status: "success",
            message: "User permanently deleted successfully",
        };
    } catch (error: any) {
        throw new Error(`Failed to permanently delete user: ${error.message}`);
    }
};

// -------------------------------------------------------------Roles
export const getAllRoles = async () => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 }).lean();
        return roles;
    } catch (error: any) {
        throw new Error(`Error fetching roles: ${error.message}`);
    }
};

export const getRoleById = async (id: string) => {
    try {
        const role = await Role.findById(id).lean();
        return role;
    } catch (error: any) {
        throw new Error(`Error fetching role by ID: ${error.message}`);
    }
};

export const getRoleByName = async (name: string) => {
    try {
        const role = await Role.findOne({ name }).lean();
        return role;
    } catch (error: any) {
        throw new Error(`Error fetching role by name: ${error.message}`);
    }
};

export const createRole = async (roleData: Partial<IRole>): Promise<IRole> => {
    try {
        // Check if role with same name already exists
        const existingRole = await Role.findOne({ name: roleData.name });
        if (existingRole) {
            throw new Error(`Role with name '${roleData.name}' already exists`);
        }

        const role = new Role(roleData);
        await role.save();
        return role.toObject();
    } catch (error: any) {
        throw new Error(`Error creating role: ${error.message}`);
    }
};

export const updateRole = async (
    id: string,
    roleData: Partial<IRole>
) => {
    try {
        // Check if updating name and if it conflicts with existing role
        if (roleData.name) {
            const existingRole = await Role.findOne({
                name: roleData.name,
                _id: { $ne: id },
            });
            if (existingRole) {
                throw new Error(`Role with name '${roleData.name}' already exists`);
            }
        }

        const role = await Role.findByIdAndUpdate(
            id,
            { $set: roleData },
            { new: true, runValidators: true }
        ).lean();

        return role;
    } catch (error: any) {
        throw new Error(`Error updating role: ${error.message}`);
    }
};

export const deleteRole = async (id: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if role exists
        const role = await Role.findById(id).session(session);
        if (!role) {
            throw new Error("Role not found");
        }

        // Check if role is assigned to any user
        const usersWithRole = await User.find({ role: id }).session(session);

        if (usersWithRole.length > 0) {
            // Role is assigned to users, prevent deletion
            const userNames = usersWithRole.map(user => user.userName).join(', ');
            return {
                success: false,
                message: `Cannot delete role "${role.name}" as it is assigned to ${usersWithRole.length} user(s): ${userNames}. Please reassign or remove these users first.`
            };
        }

        // No users assigned, proceed with deletion
        const deletedRole = await Role.findByIdAndDelete(id).session(session);

        if (!deletedRole) {
            throw new Error("Failed to delete role");
        }

        await session.commitTransaction();

        return {
            success: true,
            message: "Role deleted successfully"
        };
    } catch (error: any) {
        await session.abortTransaction();
        throw new Error(`Error deleting role: ${error.message}`);
    } finally {
        session.endSession();
    }
};