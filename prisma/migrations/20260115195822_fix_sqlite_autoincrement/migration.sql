/*
  Warnings:

  - You are about to alter the column `vendaId` on the `VendaItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Venda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data` on the `Venda` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Venda` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `formaPagamento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medicamento" ADD COLUMN "imagemUrl" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendaId" INTEGER NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" REAL NOT NULL,
    CONSTRAINT "VendaItem_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendaItem_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VendaItem" ("id", "medicamentoId", "precoUnitario", "quantidade", "vendaId") SELECT "id", "medicamentoId", "precoUnitario", "quantidade", "vendaId" FROM "VendaItem";
DROP TABLE "VendaItem";
ALTER TABLE "new_VendaItem" RENAME TO "VendaItem";
CREATE INDEX "VendaItem_vendaId_idx" ON "VendaItem"("vendaId");
CREATE INDEX "VendaItem_medicamentoId_idx" ON "VendaItem"("medicamentoId");
CREATE TABLE "new_Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total" REAL NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "clienteNome" TEXT,
    "usuarioId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Venda" ("id", "total") SELECT "id", "total" FROM "Venda";
DROP TABLE "Venda";
ALTER TABLE "new_Venda" RENAME TO "Venda";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
