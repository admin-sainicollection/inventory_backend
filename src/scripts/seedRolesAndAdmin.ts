
import connectDB from "../config/mongodb/database";
import Role from "../modules/auth/role.model";
import User from "../modules/users/user.model";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_USER } from "../utils";
import { AVAILABLE_PERMISSIONS } from "../utils/availablePermissions";
import { hashPassword } from "../utils/password";

// Extract all permissions for admin role
const getAllPermissions = () => {
  const allPermissions: string[] = [];
  AVAILABLE_PERMISSIONS.forEach(category => {
    allPermissions.push(...category.permissions);
  });
  return allPermissions;
};

export const seedRolesAndAdmin = async () => {
  await connectDB();

  const roles = [
    {
      name: "admin",
      permissions: getAllPermissions()
    },
    {
      name: "manager",
      permissions: [
        'dashboard:view',
        'user:list', 'user:read',
        'employee:list', 'employee:read', 'employee:create', 'employee:update',
        'inventory:list', 'inventory:read',
        'enquiry:list', 'enquiry:read', 'enquiry:create', 'enquiry:update', 'enquiry:assign', 'enquiry:change-status',
        'reminder:list', 'reminder:read', 'reminder:create', 'reminder:update', 'reminder:change-status',
        'product-return:list', 'product-return:read', 'product-return:create', 'product-return:update',
        'party:list', 'party:read', 'party:create', 'party:update',
        'vendor:list', 'vendor:read',
        'report:view', 'report:export',
        'settings:view',
        'ledger:read', 'ledger:print',
        'price-list:list', 'price-list:read',
        'attendance:read', 'attendance:check',
        'profile:read', 'profile:update',
        'price-code:read',
        'brand:list', 'brand:read',
        'category:list', 'category:read',
        'car:list', 'car:read',
        'sales-invoice:list', 'sales-invoice:read', 'sales-invoice:create', 'sales-invoice:update', 'sales-invoice:print',
        'quotation:list', 'quotation:read', 'quotation:create', 'quotation:update', 'quotation:print', 'quotation:convert',
        'payment-in:list', 'payment-in:read', 'payment-in:create',
        'sales-return:list', 'sales-return:read', 'sales-return:create',
        'credit-note:list', 'credit-note:read',
        'purchase-invoice:list', 'purchase-invoice:read',
        'payment-out:list', 'payment-out:read',
        'purchase-return:list', 'purchase-return:read',
        'debit-note:list', 'debit-note:read',
        'account:list',
        'sales:list',
        'purchase:list',
        'configuration:list'
      ]
    },
    {
      name: "shopkeeper",
      permissions: [
        'dashboard:view',
        'inventory:list', 'inventory:read',
        'enquiry:list', 'enquiry:read', 'enquiry:create',
        'reminder:list', 'reminder:read', 'reminder:create',
        'product-return:list', 'product-return:read', 'product-return:create',
        'party:list', 'party:read', 'party:create',
        'vendor:list', 'vendor:read',
        'sales-invoice:create', 'sales-invoice:list', 'sales-invoice:read', 'sales-invoice:print',
        'quotation:create', 'quotation:list', 'quotation:read', 'quotation:print',
        'payment-in:create', 'payment-in:list',
        'sales-return:create', 'sales-return:list',
        'purchase-invoice:list', 'purchase-invoice:read',
        'profile:read', 'profile:update',
        'brand:list', 'brand:read',
        'category:list', 'category:read',
        'car:list', 'car:read',
        'attendance:check'
      ]
    }
  ];

  // Seed roles
  for (const roleConfig of roles) {
    const existingRole = await Role.findOne({ name: roleConfig.name });

    if (!existingRole) {
      await Role.create(roleConfig);
    } else {
      // Update existing role with latest permissions
      await Role.updateOne(
        { name: roleConfig.name },
        { $set: { permissions: roleConfig.permissions } }
      );
    }
  }

  // Create admin user if none exists
  const adminRole = await Role.findOne({ name: "admin" });
  if (!adminRole) {
    console.error("❌ Admin role not found!");
    return;
  }

  const existingAdmin = await User.findOne({
    $or: [
      { role: adminRole._id },
      { userName: ADMIN_USER || "admin" },
      { email: ADMIN_EMAIL || "mukesh.scroffice@gmail.com" }
    ]
  });

  if (!existingAdmin) {
    const hashed = await hashPassword(ADMIN_PASSWORD || "Admin@123");
    await User.create({
      name: ADMIN_NAME || "Super Admin",
      userName: ADMIN_USER || "admin",
      email: ADMIN_EMAIL || "mukesh.scroffice@gmail.com",
      password: hashed,
      role: adminRole._id,
      status: "active",
      isEmailVerified: true,
    });
  } else {
    console.log("ℹ️ Admin user already exists");
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedRolesAndAdmin().catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}

export default seedRolesAndAdmin;