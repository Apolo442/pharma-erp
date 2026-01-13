"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Definindo o tipo do estado de retorno
export type UserState = {
  message: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
};

// O primeiro argumento agora é o estado anterior (prevState)
export async function createUser(
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  // Validação básica
  if (!name || !email || !password) {
    return { message: "Preencha todos os campos obrigatórios." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  } catch (error) {
    console.error("Erro BD:", error);
    // Verifica erro de unicidade do Prisma (P2002)
    return {
      message: "Erro ao criar usuário. Este e-mail já pode estar em uso.",
    };
  }

  revalidatePath("/users");
  redirect("/dashboard");
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) return;

  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/users");
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
}

export async function updateUser(
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!id || !name || !email) {
    return { message: "Nome e Email são obrigatórios." };
  }

  const dataToUpdate: Prisma.UserUpdateInput = {
    name,
    email,
    role,
  };

  if (password && password.trim() !== "") {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return { message: "Erro ao atualizar. Email já em uso?" };
  }

  revalidatePath("/users");
  redirect("/users");
}
