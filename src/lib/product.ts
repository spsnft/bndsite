export async function getProducts() {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec';

    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Убираем no-store и ставим кэширование
      next: { revalidate: 60 } 
    });

    if (!response.ok) throw new Error("Ошибка сети");

    const data = await response.json();
    
    // ВАЖНО: Достаем все три массива из ответа API
    const items = data.products || [];
    const stories = data.stories || [];
    const descriptions = data.descriptions || [];

    const formattedProducts = items.map((item: any) => ({
      ...item,
      id: String(item.id || Math.random()),
      name: String(item.name || "Unnamed"),
      category: String(item.category || "").toLowerCase().trim(),
      subcategory: String(item.subcategory || "").toLowerCase().trim(),
      
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
      products: formattedProducts, 
      stories: stories, 
      descriptions: descriptions 
    };
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    return { products: [], stories: [], descriptions: [] };
  }
}
