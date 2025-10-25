document.addEventListener('DOMContentLoaded', () => {

    // === BEÁLLÍTÁSOK ===
    const API_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com/api/ads';
    const S3_BUCKET_URL = 'https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/';
    // === BEÁLLÍTÁSOK VÉGE ===

    const adForm = document.getElementById('ad-form');
    // FIGYELEM: Biztosítsd, hogy az index.html-ben az ID 'ads-list' legyen!
    const adsList = document.getElementById('ads-list');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');

    // Ellenőrizzük, hogy az elemek megvannak-e
    if (!adForm || !adsList || !messageArea || !submitButton) {
        console.error("!!! HIBA: Egy vagy több HTML elem (ID) hiányzik az oldalról!");
        return;
    }

    // --- 1. Hirdetések betöltése ---
    async function loadAds() {
        adsList.innerHTML = '<p class="loading-text">🐄 Betöltés...</p>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Hálózati hiba: ${response.status}`);
            }
            
            const ads = await response.json();

            if (Array.isArray(ads) && ads.length > 0) {
                adsList.innerHTML = ''; // "Betöltés" eltávolítása
                
                ads.forEach(ad => {
                    if (ad && typeof ad.id !== 'undefined') {
                        const card = createAdCard(ad);
                        adsList.appendChild(card);
                    }
                });

            } else {
                adsList.innerHTML = '<p class="empty-text">🌾 Még senki sem árul semmit!</p>';
            }

        } catch (error) {
            console.error('Hiba a hirdetések betöltésekor:', error);
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