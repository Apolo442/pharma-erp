import { prisma } from "@/lib/prisma";

type LogAction = "CREATE" | "UPDATE" | "DELETE" | "SALE" | "ERROR";
type LogEntity = "USER" | "MEDICAMENTO" | "VENDA" | "SISTEMA";

export async function registrarLog(
  action: LogAction,
  entity: LogEntity,
  details: string,
  entityId?: string
) {
  try {
    // Console log para debug rápido no terminal
    console.log(`[LOG] ${action} em ${entity}: ${details}`);

    // Gravação no banco (fire and forget - não bloqueia o retorno pro usuario)
    await prisma.log.create({
      data: {
        action,
        entity,
        details,
        entityId,
      },
    });
  } catch (error) {
    console.error("Falha ao salvar log:", error);
  }
}
