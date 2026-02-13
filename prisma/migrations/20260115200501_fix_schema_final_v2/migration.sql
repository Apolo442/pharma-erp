/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Made the column `vendedorId` on table `Venda` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "total" REAL NOT NULL,
    "formaPagamento" TEXT,
    "clienteNome" TEXT,
    "vendedorId" TEXT NOT NULL,
    "caixaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Venda" ("clienteNome", "createdAt", "formaPagamento", "id", "total", "vendedorId") SELECT "clienteNome", "createdAt", "formaPagamento", "id", "total", "vendedorId" FROM "Venda";
DROP TABLE "Venda";
ALTER TABLE "new_Venda" RENAME TO "Venda";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
