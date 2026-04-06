export const AVAILABLE_PERMISSIONS = [
    // Dashboard
    { category: 'Dashboard', permissions: ['dashboard:view'] },

    // User Management
    { category: 'User Management', permissions: ['user:create', 'user:read', 'user:update', 'user:delete', 'user:list'] },

    // Role Management
    { category: 'Role Management', permissions: ['role:create', 'role:read', 'role:update', 'role:delete', 'role:list'] },

    // Employee Management
    { category: 'Employee Management', permissions: ['employee:create', 'employee:read', 'employee:update', 'employee:delete', 'employee:list'] },

    // Inventory Management
    { category: 'Inventory Management', permissions: ['inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete', 'inventory:list'] },

    // reminder Management
    { category: 'Enquiry Management', permissions: ['enquiry:create', 'enquiry:read', 'enquiry:update', 'enquiry:delete', 'enquiry:list', 'enquiry:assign', 'enquiry:change-status'] },

     // Enquiry Management
     { category: 'Reminder Management', permissions: ['reminder:create', 'reminder:read', 'reminder:update', 'reminder:delete', 'reminder:list', 'reminder:assign', 'reminder:change-status'] },

    // Product Return Management
    { category: 'Product Return', permissions: ['product-return:create', 'product-return:read', 'product-return:update', 'product-return:delete', 'product-return:list', 'product-return:change-status'] },

    // Party Management
    { category: 'Party Management', permissions: ['party:create', 'party:read', 'party:update', 'party:delete', 'party:list'] },

    // Vendor Management
    { category: 'Vendor Management', permissions: ['vendor:create', 'vendor:read', 'vendor:update', 'vendor:delete', 'vendor:list'] },

    // Reports
    { category: 'Reports', permissions: ['report:view', 'report:export', 'report:print'] },

    // Settings 
    { category: 'Settings', permissions: ['settings:view', 'settings:update'] },

    // Ledger
    { category: 'Ledger', permissions: ['ledger:create', 'ledger:read', 'ledger:print', 'ledger:update'] },

    // Price list
    { category: 'Price List', permissions: ['price-list:create', 'price-list:upload', 'price-list:list', 'price-list:read', 'price-list:update', 'price-list:move', 'price-list:delete'] },

    // Attendance
    { category: 'Attendance', permissions: ['attendance:create', 'attendance:read', 'attendance:check', 'attendance:update'] },

    // GST Configuration
    { category: 'Gst Configuration', permissions: ['gst-configuration:change'] },

    // Profile
    { category: 'Profile', permissions: ['profile:read', 'profile:update'] },

    // Price Code
    { category: 'Price Code', permissions: ['price-code:read', 'price-code:update'] },

    // Brands
    { category: 'Brands', permissions: ['brand:create','brand:read', 'brand:update', 'brand:delete', 'brand:list'] },

    // Categories
    { category: 'Categories', permissions: ['category:create', 'category:read', 'category:update', 'category:delete', 'category:list'] },

    // Cars
    { category: 'Cars', permissions: ['car:create', 'car:read', 'car:update', 'car:delete', 'car:list'] },

    // Sales Invoice
    { category: 'Sales Invoice', permissions: ['sales-invoice:create', 'sales-invoice:read', 'sales-invoice:update', 'sales-invoice:delete', 'sales-invoice:list', 'sales-invoice:print', 'sales-invoice:history'] },

    // Quotation
    { category: 'Quotation', permissions: ['quotation:create', 'quotation:read', 'quotation:update', 'quotation:delete', 'quotation:list', 'quotation:print', 'quotation:convert'] },

    // Payment In
    { category: 'Payment In', permissions: ['payment-in:create', 'payment-in:read', 'payment-in:update', 'payment-in:delete', 'payment-in:list', 'payment-in:print'] },

    // Sales Return
    { category: 'Sales Return', permissions: ['sales-return:create', 'sales-return:read', 'sales-return:update', 'sales-return:delete', 'sales-return:list', 'sales-return:print'] },

    // Credit Note
    { category: 'Credit Note', permissions: ['credit-note:create', 'credit-note:read', 'credit-note:update', 'credit-note:delete', 'credit-note:list', 'credit-note:print'] },

    // Purchase Invoice
    { category: 'Purchase Invoice', permissions: ['purchase-invoice:create', 'purchase-invoice:read', 'purchase-invoice:update', 'purchase-invoice:delete', 'purchase-invoice:list', 'purchase-invoice:print', 'purchase-invoice:history'] },

    // Payment Out
    { category: 'Payment Out', permissions: ['payment-out:create', 'payment-out:read', 'payment-out:update', 'payment-out:delete', 'payment-out:list', 'payment-out:print'] },

    // Purchase Return
    { category: 'Purchase Return', permissions: ['purchase-return:create', 'purchase-return:read', 'purchase-return:update', 'purchase-return:delete', 'purchase-return:list', 'purchase-return:print'] },

    // Debit Note
    { category: 'Debit Note', permissions: ['debit-note:create', 'debit-note:read', 'debit-note:update', 'debit-note:delete', 'debit-note:list', 'debit-note:print'] },

    // Accounts
    { category: 'Account', permissions: ['account:list'] },

    // Sales
    { category: 'Sales', permissions: ['sales:list'] },

    // Purchase
    { category: 'Purchase', permissions: ['purchase:list'] },

     // Configuration
     { category: 'Configuration', permissions: ['configuration:list'] },

     // Control Manager
     { category: 'Control Panel', permissions: ['control-panel:list'] },
];