// Single source of truth for departments / affiliations. Must stay in sync with
// server/constants.js → DEPARTMENTS.
//
// Two kinds:
//   - 'dept'   : internal work divisions (code is an abbreviation, name is full)
//   - 'office' : PEA service branches (กฟส.*) where code === name

const INTERNAL = [
  { code: 'ผบร', name: 'แผนกบำรุงรักษาระบบไฟฟ้า' },
  { code: 'ผฮล', name: 'แผนกฮอทไลน์' },
  { code: 'ผบส', name: 'แผนกบำรุงรักษาระบบสายส่ง' },
  { code: 'ผบอ', name: 'แผนกบำรุงรักษาอุปกรณ์ไฟฟ้า' },
  { code: 'ผมล', name: 'แผนกหม้อแปลงระบบจำหน่าย' },
  { code: 'กบษ.ก3', name: 'กบษ.(ก3)' },
  { code: 'กฟก.3', name: 'กฟก.3' },
].map((d) => ({ ...d, kind: 'dept' }));

const OFFICE_NAMES = [
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
];
const OFFICES = OFFICE_NAMES.map((n) => ({ code: n, name: n, kind: 'office' }));

export const DEPARTMENTS = [...INTERNAL, ...OFFICES];

// Display label for a department option. Avoids "x — x" for offices.
export function deptLabel(d) {
  return d.code === d.name ? d.code : `${d.code} — ${d.name}`;
}

export function departmentName(code) {
  if (!code) return null;
  const d = DEPARTMENTS.find((x) => x.code === code);
  return d ? d.name : code;
}
