// API konfiguráció
const API_BASE_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com';

console.log('🐖 FALUSI PORTÉKA PIAC - JavaScript betöltve!');

// DOM elemek
const adForm = document.getElementById('ad-form');
const gallery = document.getElementById('gallery');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Debug információk
console.log('DOM elemek:', {
    adForm: !!adForm,
    gallery: !!gallery,
    submitBtn: !!submitBtn,
    errorMessage: !!errorMessage,
    successMessage: !!successMessage
});

// Hibaüzenet megjelenítése
function showError(message) {
    console.error('HIBA:', message);
    if (errorMessage) {
        errorMessage.textContent = `🐖 Jaj de bosszantó! ${message}`;
        errorMessage.style.display = 'block';
        if (successMessage) successMessage.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 6000);
    }
}

// Sikeres üzenet megjelenítése
function showSuccess(message) {
    console.log('SIKER:', message);
    if (successMessage) {
        successMessage.textContent = `🌾 Hát ez aztán remek, öregem! ${message}`;
        successMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000);
    }
}

// Hirdetések betöltése - egyszerű és működő verzió
async function loadAds() {
    console.log('🐄 Hirdetések betöltése kezdődik...');
    
    if (!gallery) {
        console.error('Gallery elem nem található!');
        return;
    }
    
    try {
        // Betöltő üzenet
        gallery.innerHTML = '<div class="loading">🐄 Várj csak, öregem, összeszedjük a holmikat...</div>';
        
        console.log('API hívás indítása:', `${API_BASE_URL}/api/ads`);
        
        const response = await fetch(`${API_BASE_URL}/api/ads`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            mode: 'cors'
        });
        
        console.log('API válasz státusz:', response.status);
        console.log('API válasz headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP szar hiba: ${response.status} - ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('Nyers API válasz:', responseText.substring(0, 500) + '...');
        
        let ads;
        try {
            ads = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse hiba:', parseError);
            throw new Error('A szerver szar választ küldött (nem JSON)');
        }
        
        console.log('Parsed ads:', ads);
        console.log('Ads típusa:', typeof ads);
        console.log('Ads array?', Array.isArray(ads));
        console.log('Ads hossza:', ads ? ads.length : 'undefined');
        
        renderAds(ads);
        
    } catch (error) {
        console.error('SZÖRNYŰ HIBA a hirdetések betöltésekor:', error);
        
        if (gallery) {
            gallery.innerHTML = `
                <div class="no-ads">
                    🐄 Ejnye-bejnye! Nem tudjuk betölteni a portékákat!<br>
                    Hiba: ${error.message}<br>
                    <small>Próbáld újra, komám!</small>
                </div>
            `;
        }
        
        showError(`Nem tudtuk összeszedni a holmikat: ${error.message}`);
    }
}

// Hirdetések megjelenítése - robusztus verzió
function renderAds(ads) {
    console.log('🏪 Hirdetések renderelése kezdődik...');
    console.log('Render ads param:', ads);
    
    if (!gallery) {
        console.error('Gallery elem hiányzik a rendereléshez!');
        return;
    }
    
    if (!ads) {
        console.warn('Ads param null vagy undefined');
        gallery.innerHTML = `
            <div class="no-ads">
                🌾 Nincs adat a szerverről, komám!
            </div>
        `;
        return;
    }
    
    if (!Array.isArray(ads)) {
        console.warn('Ads nem array:', typeof ads);
        gallery.innerHTML = `
            <div class="no-ads">
                🐖 A szerver furcsa adatot küldött (nem lista)!
            </div>
        `;
        return;
    }
    
    if (ads.length === 0) {
        console.log('Üres ads array');
        gallery.innerHTML = `
            <div class="no-ads">
                🌾 Még senki sem kínál portékát! Te lehetsz az első tanyasi!
            </div>
        `;
        return;
    }
    
    console.log(`Renderelés: ${ads.length} hirdetés`);
    
    try {
        const adsHtml = ads.map((ad, index) => {
            console.log(`Hirdetés ${index}:`, ad);
            
            let imageHtml = '';
            
            // Kép kezelése
            if (ad.image_url) {
                try {
                    const imageUrl = ad.image_url.startsWith('http') 
                        ? ad.image_url 
                        : `https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/${ad.image_url}`;
                    
                    imageHtml = `
                        <img src="${imageUrl}" 
                             alt="${escapeHtml(ad.ad_title || 'Szar kép')}" 
                             onerror="this.style.display='none'; console.log('Kép betöltési hiba: ${imageUrl}');"
                             onload="console.log('Kép sikeresen betöltve: ${imageUrl}');">
                    `;
                } catch (imgError) {
                    console.warn('Kép URL hiba:', imgError);
                }
            }
            
            return `
                <div class="ad-card">
                    ${imageHtml}
                    <h3>🌾 ${escapeHtml(ad.ad_title || 'Névtelen portéka')}</h3>
                    ${ad.price ? `<p class="price">💰 ${escapeHtml(ad.price)}</p>` : ''}
                    <p><strong>🤠 Tanyasi neve:</strong> ${escapeHtml(ad.seller_name || 'Ismeretlen gazda')}</p>
                    ${ad.ad_text ? `<p><strong>📝 Micsoda ez:</strong> ${escapeHtml(ad.ad_text)}</p>` : ''}
                    ${ad.email ? `<p><strong>📧 Elektronikus levél:</strong> ${escapeHtml(ad.email)}</p>` : ''}
                    ${ad.phone ? `<p><strong>📞 Telefonos elérés:</strong> ${escapeHtml(ad.phone)}</p>` : ''}
                    <p><small>🕐 Feltéve: ${ad.created_at ? new Date(ad.created_at).toLocaleString('hu-HU') : 'Ismeretlen időben'}</small></p>
                </div>
            `;
        }).join('');
        
        console.log('HTML generálva, hossza:', adsHtml.length);
        
        gallery.innerHTML = adsHtml;
        
        console.log('✅ Hirdetések sikeresen megjelenítve!');
        
        // Ellenőrzés
        const renderedCards = gallery.querySelectorAll('.ad-card');
        console.log(`Renderelt kártyák száma: ${renderedCards.length}`);
        
    } catch (renderError) {
        console.error('Renderelési hiba:', renderError);
        gallery.innerHTML = `
            <div class="no-ads">
                🐖 Szörnyű hiba a megjelenítéskor!<br>
                ${renderError.message}
            </div>
        `;
    }
}

// HTML escape - biztonság
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
}

// Űrlap submit eseménykezelő
if (adForm) {
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🐖 Űrlap elküldése...');
        
        try {
        // Gomb letiltása
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '🐄 Felrakjuk a portékádat...';
        }            // Üzenetek elrejtése
            if (errorMessage) errorMessage.style.display = 'none';
            if (successMessage) successMessage.style.display = 'none';
            
            const formData = new FormData(adForm);
            
            // Debug: FormData tartalom
            console.log('FormData tartalom:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            // Kötelező mezők ellenőrzése
            const adTitle = formData.get('ad_title');
            const sellerName = formData.get('seller_name');
            
            if (!adTitle || !adTitle.trim()) {
                throw new Error('Írd már be, mifajta portékát akarsz kínálni, öregem!');
            }
            
            if (!sellerName || !sellerName.trim()) {
                throw new Error('Add meg a nevedet, komám!');
            }
            
            console.log('API POST kérés indítása...');
            
            const response = await fetch(`${API_BASE_URL}/api/ads`, {
                method: 'POST',
                body: formData,
                mode: 'cors'
            });
            
            console.log('POST válasz státusz:', response.status);
            
            if (!response.ok) {
                let errorMsg = `HTTP hiba: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    console.warn('Nem JSON error response');
                }
                throw new Error(errorMsg);
            }
            
            const result = await response.json();
            console.log('Sikeres hirdetés feladás:', result);
            
            showSuccess('A portékádat sikeresen felraktuk! Most már láthatják a többi tanyasiak is!');
            
            // Űrlap kiürítése
            adForm.reset();
            
            // Hirdetések újratöltése
            setTimeout(() => {
                loadAds();
            }, 1000);
            
        } catch (error) {
            console.error('Hirdetés feladási hiba:', error);
            showError(error.message);
        } finally {
            // Gomb visszaállítása
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '🐖 Fel a portékával!';
            }
        }
    });
} else {
    console.error('adForm elem nem található!');
}

// Fájl validáció
const imageInput = document.getElementById('image');
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            console.log('Fájl kiválasztva:', file.name, file.size, file.type);
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showError('Ez a fénykép túl nagy! Maximum 5MB lehet, öregem!');
                imageInput.value = '';
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showError('Csak fényképet tölts fel, komám!');
                imageInput.value = '';
                return;
            }
            
            console.log('✅ Fájl rendben');
        }
    });
} else {
    console.warn('Image input nem található');
}

// Alkalmazás inicializálása
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🐖 FALUSI PORTÉKA PIAC inicializálása...');
    console.log('DOM betöltve, API URL:', API_BASE_URL);
    
    // Kis várakozás a DOM elemek biztosítása érdekében
    setTimeout(async () => {
        await loadAds();
        console.log('🌾 Kész, most már lehet kínálni a portékákat!');
    }, 100);
});

// Error handling a window szinten
window.addEventListener('error', (e) => {
    console.error('Globális JavaScript hiba:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise rejection:', e.reason);
});

console.log('🌾 JavaScript fájl végére értünk!');
