-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medicamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "estoque" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'MEDICAMENTO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Medicamento" ("createdAt", "descricao", "estoque", "id", "nome", "preco", "updatedAt") SELECT "createdAt", "descricao", "estoque", "id", "nome", "preco", "updatedAt" FROM "Medicamento";
DROP TABLE "Medicamento";
ALTER TABLE "new_Medicamento" RENAME TO "Medicamento";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
