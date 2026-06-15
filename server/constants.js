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
  WEIGHT: {
    DEFAULT_LIMIT: 10, // kg per user
  },
};
