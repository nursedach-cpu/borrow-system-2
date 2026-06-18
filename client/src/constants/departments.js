// Single source of truth for departments. Must stay in sync with
// server/constants.js → DEPARTMENTS. (The server also exposes this via
// GET /api/items/_meta/departments — use that endpoint to verify if needed.)
export const DEPARTMENTS = [
  { code: 'ผบร', name: 'แผนกบำรุงรักษาระบบไฟฟ้า' },
  { code: 'ผฮล', name: 'แผนกฮอทไลน์' },
  { code: 'ผบส', name: 'แผนกบำรุงรักษาระบบสายส่ง' },
  { code: 'ผบอ', name: 'แผนกบำรุงรักษาอุปกรณ์ไฟฟ้า' },
  { code: 'ผมล', name: 'แผนกหม้อแปลงระบบจำหน่าย' },
  { code: 'กบษ.ก3', name: 'กบษ.(ก3)' },
];

export function departmentName(code) {
  if (!code) return null;
  const d = DEPARTMENTS.find((x) => x.code === code);
  return d ? d.name : code;
}
