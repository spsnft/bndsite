// src/lib/product.ts

export async function getProducts() {
  try {
    // Вставь сюда URL своей Google Таблицы (опубликованной как CSV) или API
    const response = await fetch('ТВОЙ_URL_ТАБЛИЦЫ_ИЛИ_API', {
      next: { revalidate: 60 } // Обновлять данные раз в минуту
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    return [];
  }
}
