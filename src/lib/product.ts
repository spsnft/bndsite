// src/lib/product.ts

export async function getProducts() {
  try {
    // Твой актуальный URL скрипта
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydASYY66CcKhk7m6JuBHBA4W3AaXQMIFDiqLyoXchpbYnuwOqofhdv7CXlhcXsvzLF/exec';

    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Ошибка сети");

    const data = await response.json();
    
    // Новая логика: скрипт теперь присылает { products: [], stories: [] }
    const rawProducts = Array.isArray(data) ? data : (data.products || []);
    const rawStories = data.stories || [];

    const products = rawProducts.map((item: any) => ({
      ...item,
      id: String(item.id || Math.random()),
      name: String(item.name || "Unnamed"),
      category: String(item.category || "").toLowerCase().trim(),
      subcategory: String(item.subcategory || "").toLowerCase().trim(),
      
      // Если в таблице в поле photo ссылка — берем её
      image: (item.photo && item.photo.startsWith('http')) 
        ? item.photo 
        : '/images/placeholder.webp',

      description: String(item.description || ""),
      farm: String(item.farm || "Organic Thai Farm"),
      taste: String(item.taste || "Sweet, Earthy"),
      terpenes: String(item.terpenes || "Myrcene, Limonene"),

      prices: {
        1: Number(item.price_1g) || 0,
        5: Number(item.price_5g) || 0,
        10: Number(item.price_10g) || 0,
        20: Number(item.price_20g) || 0
      },
      price: Number(item.price_1g) || Number(item.price) || 0
    }));

    return {
      products,
      stories: rawStories
    };
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    return { products: [], stories: [] };
  }
}
