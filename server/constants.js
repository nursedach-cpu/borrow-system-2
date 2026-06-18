// Centralized constants — no magic strings sprinkled across routes
module.exports = {
  ROLES: {
    ADMIN: 'admin',
    BORROWER: 'borrower',
  },
  ITEM_STATUS: {
    AVAILABLE: 'available',
    BORROWED: 'borrowed',
    MAINTENANCE: 'maintenance',
  },
  BORROW_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    RETURNED: 'returned',
  },
  RESERVATION_TYPE: {
    QUEUE: 'queue',
    EXTENSION: 'extension',
    SCHEDULE: 'schedule',
  },
  RESERVATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    FULFILLED: 'fulfilled',
    EXPIRED: 'expired',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  BUG_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    WONT_FIX: 'wont_fix',
  },
  BUG_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
  BUG_CATEGORY: {
    UI: 'ui',
    FUNCTIONALITY: 'functionality',
    PERFORMANCE: 'performance',
    DATA: 'data',
    SUGGESTION: 'suggestion',
    OTHER: 'other',
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
    ALLOWED_MIME: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  // Department codes used throughout the system. Items, users, and admins
  // can be tagged with one of these. `null` department = general/no affiliation.
  DEPARTMENTS: [
    { code: 'ผบร', name: 'แผนกบำรุงรักษาระบบไฟฟ้า' },
    { code: 'ผฮล', name: 'แผนกฮอทไลน์' },
    { code: 'ผบส', name: 'แผนกบำรุงรักษาระบบสายส่ง' },
    { code: 'ผบอ', name: 'แผนกบำรุงรักษาอุปกรณ์ไฟฟ้า' },
    { code: 'ผมล', name: 'แผนกหม้อแปลงระบบจำหน่าย' },
    { code: 'กบษ.ก3', name: 'กบษ.(ก3)' },
  ],
};
