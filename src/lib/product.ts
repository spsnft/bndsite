// src/lib/product.ts

export async function getProducts() {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec';

    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store' // Получаем свежие данные при каждой загрузке
    });
    
    if (!response.ok) throw new Error("Ошибка при запросе к таблице");

    const data = await response.json();

    // Возвращаем массив товаров. Если данные в объекте, вытаскиваем их из поля data или products
    return Array.isArray(data) ? data : (data.data || data.products || []); 
  } catch (error) {
    console.error("❌ Ошибка загрузки из Google Sheets:", error);
    return [];
  }
}
