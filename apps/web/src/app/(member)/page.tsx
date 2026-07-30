import { HomePage } from "@/features/home/home-page";
import { loadMemberProducts } from "@/server/catalog/load-member-products";

export default async function Page() {
  const { products, simulated } = await loadMemberProducts();
  return <HomePage products={products} simulated={simulated} />;
}
