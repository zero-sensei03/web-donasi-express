import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma"


const siteSettings = [
  {key: "app.logo", value: "Ini Logo"},
  {key: "app.name", value: "Dukung ATAC"},
  {key: "app.address", value: "Jl. Jendral Sudirman No. 123, Jakarta Selatan, Indonesia"},
  {key: "app.phone", value: "+62 812-3456-7890"},
  {key: "app.email", value: "kontak@ayoberdonasi.com"},
  {key: "app.facebook", value: '#'},
  {key: "app.instagram", value: '#'},
  {key: "app.twitter", value: ''},
  {key: "app.youtube", value: ''},
  {key: "app.tiktok", value: '#'},
];

async function main () {
    const email = "meifadigitalstudio@gmail.com";
    const password = await bcrypt.hash("MeiFaDev@123", 10);

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!existingUser) {
        const user = await prisma.user.create({
            data: {
                email,
                password,
                role: "SUPERADMIN"
            }
        })
    
        console.log("SUPERADMIN berhasil dibuat");
        console.log(`Email      : ${user.email}`);
        console.log(`Password   : ${password}`)
    }

    console.log("🌱 Seeding site settings...");

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: {
        key: setting.key,
      },
      update: {
        value: setting.value,
      },
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log(
    `✅ Successfully seeded ${siteSettings.length} site settings.`,
  );

}

main()
    .catch((error) => {
        console.error("Seed gagal: ", error)
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect;
    })