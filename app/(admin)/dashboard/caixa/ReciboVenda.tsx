import styles from "./caixa.module.css";

interface ItemVenda {
  id: string;
  quantidade: number;
  precoUnitario: number;
  medicamento: { nome: string };
}

interface VendaRecibo {
  id: number;
  total: number;
  clienteNome: string | null;
  formaPagamento: string | null;
  createdAt: Date;
  updatedAt: Date;
  vendedor: { name: string | null };
  itens: ItemVenda[];
}

export default function ReciboVenda({ venda }: { venda: VendaRecibo }) {
  return (
    <div className={styles.reciboContainerPrint}>
      <div className={styles.folhaRecibo}>
        <div className={styles.reciboHeader}>
          <div className={styles.reciboLogo}>SMART PHARMA</div>
          <div className={styles.reciboMeta}>
            <span>
              <strong>Recibo #{venda.id}</strong>
            </span>
            <span>
              Data: {new Date(venda.updatedAt).toLocaleString("pt-BR")}
            </span>
            <span>Cliente: {venda.clienteNome || "Consumidor Final"}</span>
            <span>Vendedor: {venda.vendedor.name || "N/A"}</span>
          </div>
        </div>

        <table className={styles.reciboTable}>
          <thead>
            <tr>
              <th>Qtd</th>
              <th>Item</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens.map((item, idx) => (
              <tr key={idx}>
                <td>{item.quantidade}x</td>
                <td>{item.medicamento.nome}</td>
                <td style={{ textAlign: "right" }}>
                  {(item.quantidade * item.precoUnitario).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    },
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.reciboTotalRow}>
          <div>
            <div className={styles.reciboLabel}>Pagamento via</div>
            <div className="text-sm font-mono uppercase">
              {venda.formaPagamento || "N/A"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.reciboLabel}>TOTAL</div>
            <div className={styles.reciboValor}>
              {venda.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        </div>

        <div className={styles.agradecimento}>OBRIGADO PELA PREFERÊNCIA!</div>
      </div>
    </div>
  );
}
