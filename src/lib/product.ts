const SPREADSHEET_ID = "1cHn0Jh6Buf5seFFOq5nv1WSJwUGD9kOhrEy1HevUeFk"; 

export async function getProducts() {
  // Добавили параметр gid=0 на случай, если buds — это первый лист
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=buds`;
  
  try {
    const res = await fetch(url, { 
      next: { revalidate: 0 },
      cache: 'no-store' 
    });
    const text = await res.text();
    
    // ЛОГ ДЛЯ ПРОВЕРКИ (увидишь в Vercel Logs)
    console.log("Raw CSV data length:", text.length);

    if (!text || text.includes("html")) {
      console.error("Google returned HTML instead of CSV. Check sharing settings!");
      return [];
    }

    const rows = text.split(/\r?\n/).slice(1).filter(row => row.trim() !== "");

    return rows.map(row => {
      const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      
      return {
        id: cols[0] || Math.random().toString(),
        category: String(cols[1] || "").toLowerCase().trim(), // Принудительно в нижний регистр
        subcategory: String(cols[2] || "").toLowerCase().trim(),
        name: cols[3] || "Unnamed",
        type: cols[4] || "",
        farm: cols[5] || "",
        taste: cols[6] || "",
        terpenes: cols[7] || "",
        badge: cols[8] || "",
        image: cols[9] || "",
        prices: {
          1: Number(cols[10]) || 0,
          5: Number(cols[11]) || 0,
          10: Number(cols[12]) || 0,
          20: Number(cols[13]) || 0
        },
        microns: cols[14] || ""
      };
    });
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export async function getMedia() {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=media`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    const rows = text.split(/\r?\n/).slice(1).filter(row => row.trim() !== "");
    
    return rows.reduce((acc: any, row: string) => {
      const parts = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      const id = parts[0];
      const link = parts[1];
      if (id && link) acc[id] = link;
      return acc;
    }, {});
  } catch (e) {
    return {};
  }
}
