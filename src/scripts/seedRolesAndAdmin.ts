import connectDB from "../config/mongodb/database";
import Role from "../modules/auth/role.model";
import User from "../modules/users/user.model";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_USER } from "../utils";
import { hashPassword } from "../utils/password";

export const seedRolesAndAdmin = async () => {
  await connectDB();

  const roles = [
    { name: "admin", permissions: ["user:create","user:delete","user:update","inventory:manage","sales:view","roles:manage"] },
    { name: "manager", permissions: ["user:create","inventory:manage","sales:view"] },
    { name: "shopkeeper", permissions: ["sales:create","sales:view","inventory:read"] },
  ];

  for (const r of roles) {
    const existing = await Role.findOne({ name: r.name });
    if (!existing) await Role.create(r);
  }

  // create single admin user if none exists
  const adminRole = await Role.findOne({ name: "admin" });
  const existingAdmin = await User.findOne({ role: adminRole?._id });
  if (!existingAdmin) {
    const hashed = await hashPassword(ADMIN_PASSWORD || "password");
    await User.create({
      name: ADMIN_NAME || "Super Admin",
      userName: ADMIN_USER || "admin",
      email: ADMIN_EMAIL || "mukesh.scroffice@gmail.com",
      password: hashed,
      role: adminRole?._id,
      status: "active",
      isEmailVerified: true,
    });
    console.log("Admin seeded");
  }
  console.log("Roles seeded");
};

seedRolesAndAdmin().catch(err => { console.error(err); process.exit(1); });
