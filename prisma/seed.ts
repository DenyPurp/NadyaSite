import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

type SeedUser = {
  login: string;
  password: string;
  displayName: string;
  role: Role;
};

/** Plain passwords are for local/dev seeding only — see README. */
const SEED_USERS: SeedUser[] = [
  {
    login: "teacher",
    password: "teacher123",
    displayName: "Надя (учитель)",
    role: Role.TEACHER,
  },
  {
    login: "student1",
    password: "student123",
    displayName: "Анна Ученица",
    role: Role.STUDENT,
  },
  {
    login: "student2",
    password: "student123",
    displayName: "Иван Ученик",
    role: Role.STUDENT,
  },
];

async function main() {
  for (const user of SEED_USERS) {
    const passwordHash = await hash(user.password, BCRYPT_ROUNDS);

    await prisma.user.upsert({
      where: { login: user.login },
      create: {
        login: user.login,
        passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
      update: {
        passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
    });

    console.log(`Seeded ${user.role}: ${user.login}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
