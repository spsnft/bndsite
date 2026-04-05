import { getProducts } from "@/lib/product"
import LandingClient from "@/components/LandingClient"

// Кешируем данные на 60 секунд, чтобы база не тормозила
export const revalidate = 60;

export default async function Page() {
  // Запрос выполняется на сервере ПЕРЕД загрузкой страницы
  const data = await getProducts();
  
  return (
    <main>
      <LandingClient initialProducts={data.products || []} />
    </main>
  );
}
