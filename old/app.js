// API konfiguráció
const API_BASE_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com';

// DOM elemek referenciái
const adForm = document.getElementById('ad-form');
const gallery = document.getElementById('gallery');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Hibaüzenet megjelenítése parasztos stílusban
function showError(message) {
    errorMessage.textContent = `🐷 Hoppá! ${message}`;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Automatikus elrejtés 5 másodperc után
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Sikeres üzenet megjelenítése parasztos stílusban
function showSuccess(message) {
    successMessage.textContent = `🌾 Szuper! ${message}`;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Automatikus elrejtés 3 másodperc után
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Hirdetések betöltése a szerverről
async function loadAds() {
    try {
        console.log('Hirdetések betöltése...');
        
        const response = await fetch(`${API_BASE_URL}/api/ads`);
        
        if (!response.ok) {
            throw new Error(`HTTP hiba: ${response.status} - ${response.statusText}`);
        }
        
        const ads = await response.json();
        console.log('Betöltött hirdetések:', ads);
        
        renderAds(ads);
        
    } catch (error) {
        console.error('Hiba a hirdetések betöltésekor:', error);
        gallery.innerHTML = `
            <div class="no-ads">
                🐄 Ajjaj! Nem tudtuk betölteni a hirdetéseket: ${error.message}
            </div>
        `;
    }
}

// Hirdetések megjelenítése a galéria területen
function renderAds(ads) {
    console.log('renderAds called with:', ads);
    console.log('ads length:', ads ? ads.length : 'undefined');
    
    if (!ads || ads.length === 0) {
        console.log('No ads to render');
        gallery.innerHTML = `
            <div class="no-ads">
                🌾 Még senki sem árul semmit! Légy te az első gazda!
            </div>
        `;
        return;
    }
    
    console.log('Rendering', ads.length, 'ads');
    
    const adsHtml = ads.map(ad => {
        // Kép URL kezelése (thumbnail_url vagy image_url)
        let imageHtml = '';
        const imageUrl = ad.thumbnail_url || ad.image_url;
        
        if (imageUrl) {
            // Ha van kép URL (thumbnail vagy eredeti)
            const fullImageUrl = imageUrl.startsWith('http') 
                ? imageUrl 
                : `https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/${imageUrl}`;
                
            imageHtml = `
                <img src="${fullImageUrl}" alt="${ad.ad_title}" class="ad-image" 
                     onError="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="ad-image-placeholder" style="display:none; align-items:center; justify-content:center; background-color:#f5f5f5; color:#888; border: 2px dashed #ddd;">
                    � Kép nem jött be
                </div>`;
        } else {
            // Ha nincs kép, szép placeholder megjelenítése
            imageHtml = `
                <div class="ad-image-placeholder" style="display:flex; align-items:center; justify-content:center; background-color:#f8f9fa; color:#6c757d; border: 2px dashed #dee2e6; font-size: 1.2em;">
                    🌾 Nincs kép erről
                </div>
            `;
        }
        
        return `
            <div class="ad-card" style="background: white; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); min-height: 300px; display: flex; flex-direction: column; margin-bottom: 20px; border: 2px solid red;">
                ${imageHtml}
                <div class="ad-content" style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="ad-title" style="font-size: 1.3rem; font-weight: 600; color: #333; margin-bottom: 0.5rem;">${escapeHtml(ad.ad_title || 'Névtelen hirdetés')}</div>
                    ${ad.price ? `<div class="ad-price" style="font-size: 1.5rem; font-weight: 700; color: #667eea; margin-bottom: 0.5rem;">${escapeHtml(ad.price)}</div>` : ''}
                    <div class="ad-seller" style="color: #666; margin-bottom: 1rem;">🤠 ${escapeHtml(ad.seller_name || 'Ismeretlen gazda')}</div>
                    <div class="ad-actions" style="display: flex; gap: 0.5rem; margin-top: auto;">
                        <button class="btn-small btn-edit" onclick="editAd(${ad.id})" style="padding: 8px 16px; font-size: 0.9rem; border: none; border-radius: 5px; cursor: pointer; background-color: #ffd43b; color: #333;">
                            ✏️ Átírás
                        </button>
                        <button class="btn-small btn-delete" onclick="deleteAd(${ad.id}, '${escapeHtml(ad.ad_title)}')" style="padding: 8px 16px; font-size: 0.9rem; border: none; border-radius: 5px; cursor: pointer; background-color: #ff6b6b; color: white;">
                            🗑️ Kidobás
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Generated HTML length:', adsHtml.length);
    console.log('Gallery element before update:', gallery.innerHTML);
    
    // Explicit clear and set
    gallery.innerHTML = '';
    gallery.style.display = 'block';
    gallery.style.width = '100%';
    gallery.style.minHeight = '200px';
    gallery.style.backgroundColor = '#f0f0f0';
    gallery.style.padding = '20px';
    gallery.style.border = '3px solid blue';
    gallery.innerHTML = adsHtml;
    
    console.log('Gallery element after update:', gallery.innerHTML);
    console.log('Gallery updated successfully');
    
    // Fallback timeout esetére
    setTimeout(() => {
        if (gallery.innerHTML !== adsHtml) {
            console.warn('Gallery content changed after update, restoring...');
            gallery.innerHTML = adsHtml;
        }
    }, 100);
}

// HTML escape segédfüggvény (XSS védelem)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Űrlap submit eseménykezelő
adForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Gomb letiltása és betöltő állapot
        submitBtn.disabled = true;
        submitBtn.textContent = '🐄 Feltöltöm...';
        
        // Hibaüzenetek elrejtése
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // FormData objektum létrehozása
        const formData = new FormData(adForm);
        
        // Kötelező mezők ellenőrzése
        const adTitle = formData.get('ad_title');
        const sellerName = formData.get('seller_name');
        
        if (!adTitle || !adTitle.trim()) {
            throw new Error('Írd már be, mit akarsz eladni!');
        }
        
        if (!sellerName || !sellerName.trim()) {
            throw new Error('Írd be a nevedet, hogy tudjuk, ki vagy!');
        }
        
        console.log('Hirdetés küldése...');
        
        // Kérés küldése a szerverre
        const response = await fetch(`${API_BASE_URL}/api/ads`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP hiba: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Sikeres válasz:', result);
        
        // Sikeres üzenet megjelenítése
        showSuccess('A portékádat felvettük! Most már láthatják mások is!');
        
        // Űrlap kiürítése
        adForm.reset();
        
        // Hirdetések újratöltése
        await loadAds();
        
    } catch (error) {
        console.error('Hiba a hirdetés feladásakor:', error);
        showError(error.message);
    } finally {
        // Gomb visszaállítása
        submitBtn.disabled = false;
        submitBtn.textContent = '� Fel a portékával!';
    }
});

// Fájl kiválasztás eseménykezelő (előnézet és validáció)
const imageInput = document.getElementById('image');
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        // Fájlméret ellenőrzése (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showError('Ez a kép túl nagy! Maximum 10MB lehet.');
            imageInput.value = '';
            return;
        }
        
        // Fájltípus ellenőrzése
        if (!file.type.startsWith('image/')) {
            showError('Csak képet lehet feltölteni!');
            imageInput.value = '';
            return;
        }
        
        console.log('Kiválasztott kép:', file.name, 'Méret:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
});

// Alkalmazás inicializálása
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌾 Falusi Apróhirdető alkalmazás inicializálása...');
    
    // Hirdetések betöltése az oldal betöltésekor
    await loadAds();
    
    console.log('🐷 Alkalmazás kész, lehet árulni!');
});

// === CRUD FUNKCIÓK ===

// Hirdetés szerkesztése
async function editAd(adId) {
    try {
        console.log('Hirdetés betöltése szerkesztéshez:', adId);
        
        // Hirdetés adatainak lekérése
        const response = await fetch(`${API_BASE_URL}/api/ads/${adId}`);
        
        if (!response.ok) {
            throw new Error(`Nem sikerült betölteni a hirdetést: ${response.status}`);
        }
        
        const ad = await response.json();
        console.log('Betöltött hirdetés:', ad);
        
        // Modal megnyitása és mezők kitöltése
        openEditModal(ad);
        
    } catch (error) {
        console.error('Hiba a hirdetés betöltésekor:', error);
        showError(`Nem tudtuk betölteni a hirdetést: ${error.message}`);
    }
}

// Szerkesztő modal megnyitása
function openEditModal(ad) {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-form');
    
    // Mezők kitöltése
    document.getElementById('edit-ad-id').value = ad.id;
    document.getElementById('edit-ad_title').value = ad.ad_title || '';
    document.getElementById('edit-seller_name').value = ad.seller_name || '';
    document.getElementById('edit-price').value = ad.price || '';
    document.getElementById('edit-email').value = ad.email || '';
    document.getElementById('edit-phone').value = ad.phone || '';
    document.getElementById('edit-ad_text').value = ad.ad_text || '';
    
    // Hibaüzenetek elrejtése
    document.getElementById('edit-error-message').style.display = 'none';
    document.getElementById('edit-success-message').style.display = 'none';
    
    // Modal megjelenítése
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Háttér scroll letiltása
}

// Szerkesztő modal bezárása
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Háttér scroll visszaállítása
    
    // Form resetelése
    document.getElementById('edit-form').reset();
}

// Hirdetés törlése
async function deleteAd(adId, adTitle) {
    // Megerősítő dialógus parasztos stílusban
    const confirmed = confirm(`Biztos, hogy ki akarod dobni ezt a hirdetést?\n\n"${adTitle}"\n\nUtána nem tudod visszahozni!`);
    
    if (!confirmed) {
        return; // Meggondolta magát
    }
    
    try {
        console.log('Hirdetés törlése:', adId);
        
        const response = await fetch(`${API_BASE_URL}/api/ads/${adId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP hiba: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Törlés sikeres:', result);
        
        // Sikeres üzenet megjelenítése
        showSuccess('Kidobtuk a hirdetésed!');
        
        // Hirdetések újratöltése
        await loadAds();
        
    } catch (error) {
        console.error('Hiba a hirdetés törlésekor:', error);
        showError(`Nem tudtuk kidobni: ${error.message}`);
    }
}

// === MODAL FORM ESEMÉNYKEZELŐK ===

// Szerkesztő form submit eseménykezelő  
document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const submitBtn = document.getElementById('edit-submit-btn');
        const errorDiv = document.getElementById('edit-error-message');
        const successDiv = document.getElementById('edit-success-message');
        
        // Gomb letiltása és betöltő állapot
        submitBtn.disabled = true;
        submitBtn.textContent = '🐄 Elmentem...';
        
        // Hibaüzenetek elrejtése
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        // FormData objektum létrehozása
        const formData = new FormData(e.target);
        const adId = formData.get('ad_id');
        
        // Kötelező mezők ellenőrzése
        const adTitle = formData.get('ad_title');
        const sellerName = formData.get('seller_name');
        
        if (!adTitle || !adTitle.trim()) {
            throw new Error('A hirdetés címe kötelező!');
        }
        
        if (!sellerName || !sellerName.trim()) {
            throw new Error('Az eladó neve kötelező!');
        }
        
        console.log('Hirdetés frissítése:', adId);
        
        // Kérés küldése a szerverre
        const response = await fetch(`${API_BASE_URL}/api/ads/${adId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP hiba: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Frissítés sikeres:', result);
        
        // Sikeres üzenet megjelenítése
        successDiv.textContent = '✅ Hirdetés sikeresen frissítve!';
        successDiv.style.display = 'block';
        
        // Modal bezárása kis késleltetéssel
        setTimeout(() => {
            closeEditModal();
            showSuccess('✅ Hirdetés sikeresen frissítve!');
        }, 1500);
        
        // Hirdetések újratöltése
        await loadAds();
        
    } catch (error) {
        console.error('Hiba a hirdetés frissítésekor:', error);
        
        const errorDiv = document.getElementById('edit-error-message');
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        // Gomb visszaállítása
        const submitBtn = document.getElementById('edit-submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Mentés';
    }
});

// Modal bezárása ESC billentyűvel
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

// Modal bezárása háttérre kattintással
document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeEditModal();
    }
});

// Service Worker regisztrálása (opcionális, offline funkciókhoz)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Szolgáltatás munkás regisztrálása később implementálható
        console.log('Service Worker támogatás érhető el');
    });
}
