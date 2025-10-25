document.addEventListener('DOMContentLoaded', () => {

    console.log("=== DIAGNOSZTIKAI MÓD INDÍTVA ===");
    console.log("Ha ezt látod, az 'app.js' sikeresen betöltődött.");

    // === BEÁLLÍTÁSOK ===
    const API_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com/api/ads';
    const S3_BUCKET_URL = 'https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/';
    // === BEÁLLÍTÁSOK VÉGE ===

    const adForm = document.getElementById('ad-form');
    const adsList = document.getElementById('ads-list');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');

    // --- 1. Hirdetések betöltése ---
    async function loadAds() {
        console.log("[DIAG] 1. 'loadAds' függvény elindult.");
        adsList.innerHTML = '<p class="loading-text">🐄 Betöltés...</p>';
        
        try {
            const response = await fetch(API_URL);
            console.log(`[DIAG] 2. 'fetch' válasz megérkezett. Státusz: ${response.status}`);
            
            if (!response.ok) {
                console.error("!!! HIBA: A hálózati kérés nem volt sikeres!");
                throw new Error(`Hálózati hiba: ${response.status}`);
            }
            
            // Extra lépés: Nyers szöveg kiolvasása
            const rawText = await response.text();
            console.log("[DIAG] 3. Nyers válasz a szerverről:", rawText);

            // Kézi JSON feldolgozás, hogy itt kapjuk el a hibát
            let ads;
            try {
                ads = JSON.parse(rawText);
                console.log("[DIAG] 4. JSON feldolgozás sikeres. Adat:", ads);
            } catch (jsonError) {
                console.error("!!! SÚLYOS HIBA: A szerver válasza nem érvényes JSON!", jsonError);
                adsList.innerHTML = `<p class="empty-text" style="color:red;">❌ Hiba: A szerver válasza hibás formátumú volt.</p>`;
                return; // Leállunk
            }

            // Ellenőrizzük, hogy tömb-e és van-e benne adat
            if (Array.isArray(ads) && ads.length > 0) {
                console.log(`[DIAG] 5. Érvényes adatot találtam (${ads.length} db). Kirajzolás kezdődik.`);
                
                // EZ A PONT, AMIKOR "ELTŰNIK" A TARTALOM
                console.log("[DIAG] 6. 'Betöltés...' szöveg eltávolítása.");
                adsList.innerHTML = ''; 
                
                try {
                    console.log("[DIAG] 7. 'forEach' ciklus indítása a hirdetések kirajzolásához...");
                    ads.forEach((ad, index) => {
                        console.log(`[DIAG] 7a. Ciklus (${index+1}/${ads.length}): Adat feldolgozása:`, ad);
                        
                        if (!ad || typeof ad.id === 'undefined') {
                            console.warn(`[DIAG] 7b. HIBA: A(z) ${index}. elem hibás, 'id' hiányzik. Kihagyom.`);
                            return; // Kihagyja a hibás elemet
                        }

                        const card = createAdCard(ad);
                        console.log(`[DIAG] 7c. HTML kártya elkészült a(z) ${ad.id} ID-hez.`);
                        adsList.appendChild(card);
                    });
                    console.log("[DIAG] 8. 'forEach' ciklus sikeresen lefutott. A hirdetéseknek látszaniuk kell.");
                    
                } catch (renderError) {
                    // Ez a 'catch' kapja el, ha a 'createAdCard' vagy az 'appendChild' elszáll
                    console.error("!!! SÚLYOS HIBA a kirajzolási ciklusban (forEach):", renderError);
                    adsList.innerHTML = `<p class="empty-text" style="color:red;">❌ Hiba a hirdetések feldolgozása közben: ${renderError.message}</p>`;
                }

            } else {
                // Ez fut le, ha az 'ads' üres tömb: []
                console.log("[DIAG] 5. A szerver üres listát küldött. Nincs hirdetés.");
                adsList.innerHTML = '<p class="empty-text">🌾 Még senki sem árul semmit!</p>';
            }

        } catch (error) {
            // Ez a 'catch' kapja el, ha a 'fetch' hívás elszáll (pl. hálózati hiba)
            console.error('!!! SÚLYOS HIBA a hirdetések betöltésekor:', error);
            adsList.innerHTML = `<p class="empty-text" style="color:red;">❌ Hiba: ${error.message}</p>`;
        }
    }

    // --- 2. Hirdetés kártya létrehozása ---
    function createAdCard(ad) {
        const card = document.createElement('div');
        card.className = 'ad-card';

        let imageHtml = '';
        const imageKey = ad.thumbnail_url || ad.image_url;
        const title = ad.ad_title || 'Nincs cím';
        const price = ad.price || 'Ár megegyezés szerint';
        const seller = ad.seller_name || 'Ismeretlen eladó';

        if (imageKey) {
            const fullImageUrl = S3_BUCKET_URL + imageKey;
            imageHtml = `<img src="${fullImageUrl}" alt="${title}" class="ad-image">`;
        }

        card.innerHTML = `
            ${imageHtml}
            <div class="ad-content">
                <h3>${title}</h3>
                <p class="ad-price">${price}</p>
                <p class="ad-seller">Eladó: ${seller}</p>
            </div>
        `;
        return card;
    }

    // --- 3. Űrlap elküldése (VÁLTOZATLAN) ---
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage(null);
        submitButton.disabled = true;
        submitButton.textContent = '⏳ Feltöltés...';
        const formData = new FormData(adForm);
        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Ismeretlen hiba' }));
                throw new Error(errorData.message || `Hiba: ${response.status}`);
            }
            showMessage('✅ Sikeresen feladva!', 'success');
            adForm.reset();
            loadAds();
        } catch (error) {
            console.error('Hiba a hirdetés feladásakor:', error);
            showMessage(`❌ Hiba: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '🐖 Fel a portékával!';
        }
    });

    // --- Segédfüggvény: Üzenet megjelenítése (VÁLTOZATLAN) ---
    function showMessage(message, type) {
        messageArea.innerHTML = '';
        if (!message) { messageArea.style.display = 'none'; return; }
        messageArea.textContent = message;
        messageArea.className = `message ${type}`;
        messageArea.style.display = 'block';
    }

    // --- Indítás ---
    console.log("[DIAG] 'DOMContentLoaded' esemény lefutott, 'loadAds' indítása...");
    loadAds();
});