import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = 'Jingle2018!'
  
  // Hash the password securely
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  // Upsert the admin user ensuring they have UNLIMITED access
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: hashedPassword,
      subscription_tier: 'UNLIMITED',
      subscription_status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      display_name: 'GrantAI Admin',
      subscription_tier: 'UNLIMITED',
      subscription_status: 'ACTIVE',
    },
  })
  
  console.log('✅ Admin account seeded successfully:', admin.email)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
