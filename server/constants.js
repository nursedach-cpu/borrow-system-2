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
  // Department codes / affiliations used throughout the system. Items, users,
  // and admins can be tagged with one of these. `null` = general/no affiliation.
  // Two kinds: internal work divisions + PEA service branches (กฟส.*).
  DEPARTMENTS: [
    { code: 'ผบร', name: 'แผนกบำรุงรักษาระบบไฟฟ้า' },
    { code: 'ผฮล', name: 'แผนกฮอทไลน์' },
    { code: 'ผบส', name: 'แผนกบำรุงรักษาระบบสายส่ง' },
    { code: 'ผบอ', name: 'แผนกบำรุงรักษาอุปกรณ์ไฟฟ้า' },
    { code: 'ผมล', name: 'แผนกหม้อแปลงระบบจำหน่าย' },
    { code: 'กบษ.ก3', name: 'กบษ.(ก3)' },
    { code: 'กฟก.3', name: 'กฟก.3' },
    ...[
      'กฟส.นครปฐม', 'กฟส.ดอนตูม', 'กฟส.สุพรรณบุรี', 'กฟส.บางปลาม้า', 'กฟส.มะขามล้ม',
      'กฟส.ดอนเจดีย์', 'กฟส.ศรีประจันต์', 'กฟส.สามชุก', 'กฟส.กาญจนบุรี', 'กฟส.ท่าม่วง',
      'กฟส.ตลาดสำรอง', 'กฟส.พนมทวน', 'กฟส.ห้วยกระเจา', 'กฟส.ไทรโยค', 'กฟส.ทองผาภูมิ',
      'กฟส.สังขละบุรี', 'กฟส.ด่านมะขามเตี้ย', 'กฟส.ลาดหญ้า', 'กฟส.ศรีสวัสดิ์', 'กฟส.ท่ากระดาน',
      'กฟส.สมุทรสาคร', 'กฟส.บางน้ำจืด', 'กฟส.โคกขาม', 'กฟส.สามพราน', 'กฟส.อู่ทอง',
      'กฟส.สวนแตง', 'กฟส.สองพี่น้อง', 'กฟส.ทุ่งคอก', 'กฟส.กระทุ่มแบน', 'กฟส.อ้อมน้อย',
      'กฟส.กำแพงแสน', 'กฟส.นครชัยศรี', 'กฟส.พุทธมณฑล', 'กฟส.บ่อพลอย', 'กฟส.หนองปรือ',
      'กฟส.เลาขวัญ', 'กฟส.เดิมบางนางบวช', 'กฟส.ด่านช้าง', 'กฟส.หนองหญ้าไซ', 'กฟส.บางเลน',
      'กฟส.บางหลวง', 'กฟส.ท่ามะกา', 'กฟส.ท่าเรือ', 'กฟส.สมุทรสาคร 2 (บ้านแพ้ว)', 'กฟส.คลองตัน',
      'กฟส.กาหลง',
    ].map((n) => ({ code: n, name: n })),
  ],
};
