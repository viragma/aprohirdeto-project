document.addEventListener('DOMContentLoaded', () => {

    // === BEÁLLÍTÁSOK ===
    // Az AWS API Load Balancered címe (ahogy az 'old/app.js'-ben is volt)
    const API_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com/api/ads';
    
    // Az S3 bucketod címe, ahol a képek vannak (a 'lambda_function.py' alapján)
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

            // Ez a rész kezeli a "villanást" (eltűnést)
            if (!ads || ads.length === 0) {
                adsList.innerHTML = '<p class="empty-text">🌾 Még senki sem árul semmit!</p>';
                return;
            }

            // Lista kiürítése és feltöltése
            adsList.innerHTML = '';
            ads.forEach(ad => {
                adsList.appendChild(createAdCard(ad));
            });

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
        // Az API 'thumbnail_url'-t vagy 'image_url'-t küld
        const imageKey = ad.thumbnail_url || ad.image_url;

        if (imageKey) {
            const fullImageUrl = S3_BUCKET_URL + imageKey;
            imageHtml = `<img src="${fullImageUrl}" alt="${ad.ad_title}" class="ad-image">`;
        }

        card.innerHTML = `
            ${imageHtml}
            <div class="ad-content">
                <h3>${escapeHtml(ad.ad_title)}</h3>
                <p class="ad-price">${escapeHtml(ad.price || 'Ár megegyezés szerint')}</p>
                <p class="ad-seller">Eladó: ${escapeHtml(ad.seller_name)}</p>
            </div>
        `;
        return card;
    }

    // --- 3. Űrlap elküldése ---
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Alapértelmezett küldés megakadályozása
        
        showMessage(null); // Korábbi üzenetek törlése
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

            // Sikeres küldés
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

    // --- Segédfüggvények ---
    function showMessage(message, type) {
        messageArea.innerHTML = '';
        if (!message) {
            messageArea.style.display = 'none';
            return;
        }
        
        messageArea.textContent = message;
        messageArea.className = `message ${type}`; // 'message success' vagy 'message error'
        messageArea.style.display = 'block';
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- Indítás ---
    loadAds();
});