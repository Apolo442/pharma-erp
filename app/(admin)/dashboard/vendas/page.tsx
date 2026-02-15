import PDV from "./pvd";

export default function VendasPage() {
  // Não precisa mais buscar vendedores no banco aqui!
  // A validação é feita via Server Action sob demanda.
  return (
    <div className="h-full">
      <PDV />
    </div>
  );
}
