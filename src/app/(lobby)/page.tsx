import { getProducts } from "@/lib/product"
import LandingClient from "@/components/LandingClient"

// Ставим 0, чтобы данные обновлялись мгновенно при каждой загрузке (без кеша)
// Если захочешь вернуть кеш позже — поставь 60 или более.
export const revalidate = 60;

export default async function Page() {
  // Запрос выполняется на сервере
  // getProducts() возвращает весь объект из скрипта (products, stories, descriptions)
  const data = await getProducts();
  
  return (
    <main>
      <LandingClient 
        initialProducts={data.products || []} 
        initialDescriptions={data.descriptions || []} 
      />
    </main>
  );
}
