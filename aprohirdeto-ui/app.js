document.addEventListener('DOMContentLoaded', () => {

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
        adsList.innerHTML = '<p class="loading-text">🐄 Betöltés...</p>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Hálózati hiba: ${response.status}`);
            }
            const ads = await response.json();

            // Ellenőrizzük, hogy tömb-e és van-e benne adat
            if (Array.isArray(ads) && ads.length > 0) {
                adsList.innerHTML = ''; // "Betöltés" eltávolítása ("semmi" rész)
                
                // Hiba keresése: A forEach-en belül van a hiba?
                try {
                    ads.forEach(ad => {
                        const card = createAdCard(ad);
                        adsList.appendChild(card);
                    });
                } catch (renderError) {
                    console.error('Hiba a kártya kirajzolásakor:', renderError);
                    adsList.innerHTML = `<p class="empty-text" style="color:red;">❌ Hiba a hirdetések feldolgozása közben: ${renderError.message}</p>`;
                }

            } else {
                // Ez fut le, ha az 'ads' üres tömb: []
                adsList.innerHTML = '<p class="empty-text">🌾 Még senki sem árul semmit!</p>';
            }

        } catch (error) {
            console.error('Hiba a hirdetések betöltésekor:', error);
            adsList.innerHTML = `<p class="empty-text" style="color:red;">❌ Hiba: ${error.message}</p>`;
        }
    }

    // --- 2. Hirdetés kártya létrehozása (EGYSZERŰSÍTVE) ---
    function createAdCard(ad) {
        const card = document.createElement('div');
        card.className = 'ad-card';

        let imageHtml = '';
        
        // Biztonságos adatkezelés (ha 'null' az érték)
        const imageKey = ad.thumbnail_url || ad.image_url;
        const title = ad.ad_title || 'Nincs cím';
        const price = ad.price || 'Ár megegyezés szerint';
        const seller = ad.seller_name || 'Ismeretlen eladó';

        if (imageKey) {
            // A te adatodból látom, hogy az 'image_url'-ben benne van az 'uploads/' prefix
            // Ez így helyes.
            const fullImageUrl = S3_BUCKET_URL + imageKey;
            imageHtml = `<img src="${fullImageUrl}" alt="${title}" class="ad-image">`;
        }

        // Kivettük az 'escapeHtml' függvényt, hogy kizárjuk a hibát
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

    // --- 3. Űrlap elküldése ---
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        showMessage(null);
        submitButton.disabled = true;
        submitButton.textContent = '⏳ Feltöltés...';

        const formData = new FormData(adForm);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Ismeretlen hiba' }));
                throw new Error(errorData.message || `Hiba: ${response.status}`);
            }

            showMessage('✅ Sikeresen feladva!', 'success');
            adForm.reset();
            loadAds(); // Lista frissítése

        } catch (error) {
            console.error('Hiba a hirdetés feladásakor:', error);
            showMessage(`❌ Hiba: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '🐖 Fel a portékával!';
        }
    });

    // --- Segédfüggvény: Üzenet megjelenítése ---
    function showMessage(message, type) {
        messageArea.innerHTML = '';
        if (!message) {
            messageArea.style.display = 'none';
            return;
        }
        
        messageArea.textContent = message;
        messageArea.className = `message ${type}`;
        messageArea.style.display = 'block';
    }

    // --- Indítás ---
    loadAds();
});