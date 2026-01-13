"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { registrarLog } from "@/lib/logger";

// Schema de Validação
const MedicamentoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 letras."),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  estoque: z.coerce
    .number()
    .int("O estoque deve ser um número inteiro")
    .min(0, "Estoque não pode ser negativo."),
});

export type MedicamentoState = {
  message: string | null;
  errors?: {
    nome?: string[];
    preco?: string[];
    estoque?: string[];
  };
};

export async function createMedicamento(
  prevState: MedicamentoState,
  formData: FormData
): Promise<MedicamentoState> {
  // Converte FormData para objeto para o Zod validar
  const validatedFields = MedicamentoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    // O input type="number" envia string, o z.coerce converte sozinho
    preco: formData.get("preco"),
    estoque: formData.get("estoque"),
  });

  if (!validatedFields.success) {
    return {
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const novoMedicamento = await prisma.medicamento.create({
      data: validatedFields.data,
    });

    // --- LOG ---
    await registrarLog(
      "CREATE",
      "MEDICAMENTO",
      `Criou o medicamento: ${novoMedicamento.nome} | Estoque: ${novoMedicamento.estoque}`,
      novoMedicamento.id
    );
  } catch (error) {
    console.error(error);
    return { message: "Erro ao criar. Verifique se o banco está conectado." };
  }

  revalidatePath("/dashboard/medicamentos");
  redirect("/dashboard/medicamentos");
}

export async function updateMedicamento(
  id: string,
  prevState: MedicamentoState,
  formData: FormData
): Promise<MedicamentoState> {
  // 1. Validação dos dados novos
  const validatedFields = MedicamentoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    preco: formData.get("preco"),
    estoque: formData.get("estoque"),
  });

  if (!validatedFields.success) {
    return {
      message: "Erro de validação.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const newData = validatedFields.data;

  try {
    // 2. BUSCAR DADOS ANTIGOS (Para comparar)
    const oldData = await prisma.medicamento.findUnique({
      where: { id },
    });

    if (!oldData) return { message: "Medicamento não encontrado." };

    // 3. CALCULAR DIFERENÇAS
    const changes: string[] = [];

    if (oldData.nome !== newData.nome) {
      changes.push(`Nome: '${oldData.nome}' ➝ '${newData.nome}'`);
    }
    if (oldData.preco !== newData.preco) {
      changes.push(`Preço: R$${oldData.preco} ➝ R$${newData.preco}`);
    }
    if (oldData.estoque !== newData.estoque) {
      changes.push(`Estoque: ${oldData.estoque} ➝ ${newData.estoque}`);
    }
    const oldDesc = oldData.descricao || "";
    const newDesc = newData.descricao || "";
    if (oldDesc !== newDesc) {
      changes.push(`Descrição alterada`);
    }

    // Se não teve mudança nenhuma, nem salva no banco pra não gastar recurso
    if (changes.length === 0) {
      return { message: "Nenhuma alteração detectada." };
    }

    // 4. ATUALIZAR NO BANCO
    await prisma.medicamento.update({
      where: { id },
      data: newData,
    });

    // 5. LOG DETALHADO
    await registrarLog(
      "UPDATE",
      "MEDICAMENTO",
      `Alterações: ${changes.join(" | ")}`, // Ex: "Nome: A -> B | Preço: 10 -> 12"
      id
    );
  } catch (error) {
    console.error(error);
    return { message: "Erro ao atualizar medicamento." };
  }

  revalidatePath("/dashboard/medicamentos");
  redirect("/dashboard/medicamentos");
}

export async function deleteMedicamento(id: string) {
  try {
    await prisma.medicamento.delete({ where: { id } });

    // --- LOG ---
    await registrarLog(
      "DELETE",
      "MEDICAMENTO",
      `Removeu o medicamento ID: ${id}`
    );

    revalidatePath("/dashboard/medicamentos");
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
}
