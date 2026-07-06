// 修正 OTH-001 的产品名：源数据 name_en="customized" 是子分类名（错），
// 真产品名来自用户表格【产品名称标题】= title_en。
// en 用用户给定的确切值；zh/ar 为暂用翻译，待用户从表格确认。
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const slug = 'solutions/custom-industrial-vending-machine.html';

const name = {
  en: 'Custom Industrial Vending Machine and Smart Cabinet Solutions',
  zh: '定制化工业自动售货机与智能柜解决方案',
  ar: 'حلول الخزائن الذكية وماكينات البيع الصناعية المخصصة',
};

const p = await prisma.product.findFirst({ where: { slug } });
if (!p) {
  console.error('NOT FOUND slug=', slug);
  process.exit(1);
}
console.log('BEFORE name =', JSON.stringify(p.name, null, 2));
await prisma.product.update({ where: { id: p.id }, data: { name } });
console.log('AFTER  name =', JSON.stringify(name, null, 2));
await prisma.$disconnect();
console.log('DONE');
