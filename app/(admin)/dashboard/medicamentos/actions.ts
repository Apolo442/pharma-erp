"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createMedicamento(formData: FormData) {
  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  // Convertendo string para number. Em produção, validar se é NaN.
  const preco = parseFloat(
    formData.get("preco")?.toString().replace(",", ".") || "0"
  );
  const estoque = parseInt(formData.get("estoque")?.toString() || "0");

  await prisma.medicamento.create({
    data: {
      nome,
      descricao,
      preco,
      estoque,
    },
  });

  revalidatePath("/dashboard/medicamentos");
  redirect("/dashboard/medicamentos");
}

export async function deleteMedicamento(id: string) {
  await prisma.medicamento.delete({
    where: { id },
  });

  revalidatePath("/dashboard/medicamentos");
}

export async function updateMedicamento(id: string, formData: FormData) {
  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  const preco = parseFloat(
    formData.get("preco")?.toString().replace(",", ".") || "0"
  );
  const estoque = parseInt(formData.get("estoque")?.toString() || "0");

  await prisma.medicamento.update({
    where: { id },
    data: {
      nome,
      descricao,
      preco,
      estoque,
    },
  });

  revalidatePath("/dashboard/medicamentos");
  redirect("/dashboard/medicamentos");
}
