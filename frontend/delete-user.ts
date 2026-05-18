import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const email = "egorolegovich2007555@gmail.com";
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User ${email} not found.`);
      return;
    }
    await prisma.user.delete({ where: { email } });
    console.log(`Successfully deleted user: ${email}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
