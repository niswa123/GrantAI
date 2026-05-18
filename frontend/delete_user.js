const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'egoroleg'
      }
    }
  });

  if (users.length === 0) {
    console.log("Пользователь не найден.");
    return;
  }

  for (const user of users) {
    console.log(`Удаление пользователя: ${user.email} (ID: ${user.id})`);
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log("Успешно удалено.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
