import connectDB from "../config/mongodb/database";
import Role from "../modules/auth/role.model";
import User from "../modules/users/user.model";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_USER } from "../utils";
import { hashPassword } from "../utils/password";

export const seedRolesAndAdmin = async () => {
  await connectDB();

  const roles = [
    {
      name: "admin", permissions: ['user:create', 'user:delete', 'user:update', 'inventory:manage', 'sales:view', 'roles:manage',
        'dashboard:view', 'role:create', 'role:read', 'role:update', 'role:delete', 'role:list', 'employee:create', 'employee:read',
        'employee:update', 'employee:delete', 'employee:list', 'inventory:create', 'inventory:read', 'inventory:update',
        'inventory:delete', 'inventory:list', 'enquiry:create', 'enquiry:read', 'enquiry:update', 'enquiry:delete',
        'enquiry:list', 'enquiry:assign', 'enquiry:change-status', 'product-return:create', 'product-return:read',
        'product-return:update', 'product-return:delete', 'product-return:list', 'product-return:change-status',
        'party:create', 'party:read', 'party:update', 'party:delete', 'party:list', 'vendor:create', 'vendor:read',
        'vendor:update', 'vendor:delete', 'vendor:list', 'report:view', 'report:export', 'report:print', 'settings:view',
        'settings:update', 'ledger:create', 'ledger:read', 'ledger:print', 'price-list:create', 'price-list:upload',
        'price-list:list', 'price-list:read', 'price-list:update', 'price-list:move', 'price-list:delete',
        'attendance:create', 'attendance:read', 'attendance:check', 'gst-configuration:change', 'profile:read',
        'profile:update', 'price-code:read', 'price-code:update', 'brand:create', 'brand:update', 'brand:delete',
        'category:create', 'category:read', 'category:update', 'category:delete', 'category:list', 'car:create',
        'car:read', 'car:update', 'car:delete', 'car:list', 'sales-invoice:create', 'sales-invoice:read',
        'sales-invoice:update', 'sales-invoice:delete', 'sales-invoice:list', 'sales-invoice:print', 'sales-invoice:history',
        'quotation:create', 'quotation:read', 'quotation:update', 'quotation:delete', 'quotation:list', 'quotation:print',
        'quotation:convert', 'payment-in:create', 'payment-in:read', 'payment-in:update', 'payment-in:delete',
        'payment-in:list', 'payment-in:print', 'sales-return:create', 'sales-return:read', 'sales-return:update',
        'sales-return:delete', 'sales-return:list', 'sales-return:print', 'credit-note:create', 'credit-note:read',
        'credit-note:update', 'credit-note:delete', 'credit-note:list', 'credit-note:print', 'purchase-invoice:create',
        'purchase-invoice:read', 'purchase-invoice:update', 'purchase-invoice:delete', 'purchase-invoice:list',
        'purchase-invoice:print', 'purchase-invoice:history', 'payment-out:create', 'payment-out:read', 'payment-out:update',
        'payment-out:delete', 'payment-out:list', 'payment-out:print', 'purchase-return:create', 'purchase-return:read',
        'purchase-return:update', 'purchase-return:delete', 'purchase-return:list', 'purchase-return:print',
        'debit-note:create', 'debit-note:read', 'debit-note:update', 'debit-note:delete', 'debit-note:list',
        'debit-note:print', 'user:list', 'user:read', 'ledger:update', 'attendance:update', 'brand:list', 'account:list',
        'sales:list', 'purchase:list', 'configuration:list', 'control-panel:list', 'brand:read', 'reminder:create',
        'reminder:read', 'reminder:update', 'reminder:delete', 'reminder:list', 'reminder:assign', 'reminder:change-status'
      ]
    },

    { name: "manager", permissions: ["user:create", "inventory:manage", "sales:view"] },
    { name: "shopkeeper", permissions: ["sales:create", "sales:view", "inventory:read"] },
  ];

  for (const r of roles) {
    const existing = await Role.findOne({ name: r.name });
    if (!existing) await Role.create(r);
  }

  // create single admin user if none exists
  const adminRole = await Role.findOne({ name: "admin" });
  // const existingAdmin = await User.findOne({ role: adminRole?._id });
  const existingAdmin = await User.findOne({
    $or: [
      { role: adminRole?._id },
      { userName: ADMIN_USER || "admin" },
      { email: ADMIN_EMAIL || "mukesh.scroffice@gmail.com" }
    ]
  });
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
