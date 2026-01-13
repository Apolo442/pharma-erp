import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./edit-form";
import styles from "../../create/create-user.module.css"; // Reusando container styles

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Em Next.js 15, params é uma Promise
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Usuário</h1>
      <EditUserForm user={user} />
    </div>
  );
}
