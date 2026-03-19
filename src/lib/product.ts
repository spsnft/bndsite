// src/lib/product.ts

export async function getProducts() {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydASYY66CcKhk7m6JuBHBA4W3AaXQMIFDiqLyoXchpbYnuwOqofhdv7CXlhcXsvzLF/exec';

    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error("Ошибка сети");

    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.data || []);

    return items.map((item: any) => ({
      ...item,
      id: String(item.id || Math.random()),
      name: String(item.name || "Unnamed"),
      category: String(item.category || "").toLowerCase().trim(),
      subcategory: String(item.subcategory || "").toLowerCase().trim(),
      image: item.photo || '/images/placeholder.webp', 
      
      // Новые поля для детальной карточки
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
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    return [];
  }
}
