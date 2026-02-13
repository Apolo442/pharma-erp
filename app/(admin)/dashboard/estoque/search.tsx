"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Aguarda 300ms após parar de digitar para atualizar a URL
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", "1");

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
      <Search
        size={18}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
        }}
      />
      <input
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Buscar nome ou categoria..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
        style={{
          width: "100%",
          paddingLeft: "40px",
          height: "40px",
          borderRadius: "6px",
          border: "1px solid var(--theme-border)",
        }}
      />
    </div>
  );
}
