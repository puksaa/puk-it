import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const typography = document.createElement('link');
typography.rel = 'stylesheet';
typography.href = 'assets/typography.css';
document.head.append(typography);

const defaults = {
  services: [
    ['ดูแลระบบ IT', 'ดูแลคอมพิวเตอร์ อุปกรณ์สำนักงาน แก้ปัญหาโปรแกรม และให้คำแนะนำแบบรายครั้งหรือรายเดือน'],
    ['เดินสาย LAN & Network', 'ออกแบบและติดตั้งระบบเครือข่าย เดินสาย LAN ติดตั้งตู้ Rack และจัดระเบียบอุปกรณ์'],
    ['ติดตั้ง Wi-Fi', 'สำรวจพื้นที่ วางจุดกระจายสัญญาณ และติดตั้ง Wi-Fi ที่ครอบคลุมและปลอดภัย'],
    ['Server & Backup', 'ติดตั้ง ดูแล และตรวจสอบเซิร์ฟเวอร์ พร้อมวางระบบสำรองข้อมูล']
  ],
  projects: [
    ['สำนักงาน 40 จุดใช้งาน', 'เดินสาย LAN · ติดตั้งตู้ Rack'], ['ร้านกาแฟและพื้นที่ลูกค้า', 'Site survey · Wi-Fi setup'], ['ระบบ Server และ Backup', 'Monitoring · Data backup']
  ]
};
const serviceList = document.querySelector('#service-list');
const projectList = document.querySelector('#project-list');
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const safeImageUrl = (value) => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const renderServices = (items) => serviceList.innerHTML = items.map((item, i) => `<article class="card"><p class="eyebrow">0${i + 1}</p><h3>${escapeHtml(item.title || item[0])}</h3><p>${escapeHtml(item.description || item[1])}</p></article>`).join('');
const renderProjects = (items) => projectList.innerHTML = items.map((item) => { const image = safeImageUrl(item.image_url); const title = escapeHtml(item.title || item[0]); return `<article class="project"><div class="project-art"${image ? ` style="background-image:url('${image}');background-size:cover"` : ''}>${title}</div><h3>${title}</h3><p>${escapeHtml(item.category || item[1])}</p></article>`; }).join('');
renderServices(defaults.services); renderProjects(defaults.projects);

const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
if (supabase) {
  const [{ data: services }, { data: projects }, { data: settings }] = await Promise.all([
    supabase.from('services').select('*').eq('is_published', true).order('sort_order'),
    supabase.from('projects').select('*').eq('is_published', true).order('sort_order'),
    supabase.from('site_settings').select('*')
  ]);
  if (services?.length) renderServices(services);
  if (projects?.length) renderProjects(projects);
  const hero = settings?.find((s) => s.key === 'hero_text');
  if (hero?.value?.text) document.querySelector('#hero-text').textContent = hero.value.text;
}

document.querySelector('#lead-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const status = document.querySelector('#form-status');
  if (!supabase) { status.textContent = 'ระบบรับข้อมูลกำลังตั้งค่า กรุณาติดต่อ LINE: petsut123 หรือโทรศัพท์โดยตรง'; return; }
  const form = new FormData(event.currentTarget); status.textContent = 'กำลังส่งข้อมูล...';
  const { error } = await supabase.from('leads').insert({ name: form.get('name'), contact: form.get('contact'), service: form.get('service'), message: form.get('message') });
  if (error) { status.textContent = 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อ LINE: petsut123'; return; }
  event.currentTarget.reset(); status.textContent = 'รับข้อมูลเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด';
});
