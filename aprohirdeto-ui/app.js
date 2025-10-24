// DOM elemek referenciái
const adForm = document.getElementById('ad-form');
const gallery = document.getElementById('gallery');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Hibaüzenet megjelenítése
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Automatikus elrejtés 5 másodperc után
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Sikeres üzenet megjelenítése
function showSuccess(message) {
    successMessage.textContent = message;
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
        
        const response = await fetch('/api/ads');
        
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
                ❌ Hiba történt a hirdetések betöltésekor: ${error.message}
            </div>
        `;
    }
}

// Hirdetések megjelenítése a galéria területen
function renderAds(ads) {
    if (!ads || ads.length === 0) {
        gallery.innerHTML = `
            <div class="no-ads">
                📭 Még nincsenek hirdetések. Legyen Ön az első!
            </div>
        `;
        return;
    }
    
    const adsHtml = ads.map(ad => {
        // Kép URL kezelése
        let imageHtml = '';
        if (ad.thumbnail_url) {
            // Ha van thumbnail_url, azt használjuk
            const imageUrl = `https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/${ad.thumbnail_url}`;
            imageHtml = `<img src="${imageUrl}" alt="${ad.ad_title}" class="ad-image" 
                              onError="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="ad-image" style="display:none; align-items:center; justify-content:center; background-color:#f0f0f0; color:#666;">
                            🖼️ Kép nem elérhető
                         </div>`;
        } else {
            // Ha nincs kép, placeholder megjelenítése
            imageHtml = `
                <div class="ad-image" style="display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; color:#666;">
                    📷 Nincs kép
                </div>
            `;
        }
        
        return `
            <div class="ad-card">
                ${imageHtml}
                <div class="ad-content">
                    <div class="ad-title">${escapeHtml(ad.ad_title || 'Névtelen hirdetés')}</div>
                    ${ad.price ? `<div class="ad-price">${escapeHtml(ad.price)}</div>` : ''}
                    <div class="ad-seller">👤 ${escapeHtml(ad.seller_name || 'Névtelen eladó')}</div>
                    <div class="ad-actions">
                        <button class="btn-small btn-edit" onclick="editAd(${ad.id})">
                            ✏️ Szerkesztés
                        </button>
                        <button class="btn-small btn-delete" onclick="deleteAd(${ad.id}, '${escapeHtml(ad.ad_title)}')">
                            🗑️ Törlés
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    gallery.innerHTML = adsHtml;
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
        submitBtn.textContent = '⏳ Feltöltés...';
        
        // Hibaüzenetek elrejtése
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // FormData objektum létrehozása
        const formData = new FormData(adForm);
        
        // Kötelező mezők ellenőrzése
        const adTitle = formData.get('ad_title');
        const sellerName = formData.get('seller_name');
        
        if (!adTitle || !adTitle.trim()) {
            throw new Error('A hirdetés címe kötelező!');
        }
        
        if (!sellerName || !sellerName.trim()) {
            throw new Error('Az eladó neve kötelező!');
        }
        
        console.log('Hirdetés küldése...');
        
        // Kérés küldése a szerverre
        const response = await fetch('/api/ads', {
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
        showSuccess('✅ Hirdetés sikeresen feladva!');
        
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
        submitBtn.textContent = '🚀 Hirdetés feladása';
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
            showError('A kiválasztott fájl túl nagy! Maximum 10MB méretű fájl tölthető fel.');
            imageInput.value = '';
            return;
        }
        
        // Fájltípus ellenőrzése
        if (!file.type.startsWith('image/')) {
            showError('Csak képfájlok tölthetők fel!');
            imageInput.value = '';
            return;
        }
        
        console.log('Kiválasztott kép:', file.name, 'Méret:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
});

// Alkalmazás inicializálása
document.addEventListener('DOMContentLoaded', () => {
    console.log('Mini Apróhirdető alkalmazás inicializálása...');
    
    // Hirdetések betöltése az oldal betöltésekor
    loadAds();
    
    console.log('Alkalmazás sikeresen inicializálva!');
});

// === CRUD FUNKCIÓK ===

// Hirdetés szerkesztése
async function editAd(adId) {
    try {
        console.log('Hirdetés betöltése szerkesztéshez:', adId);
        
        // Hirdetés adatainak lekérése
        const response = await fetch(`/api/ads/${adId}`);
        
        if (!response.ok) {
            throw new Error(`Nem sikerült betölteni a hirdetést: ${response.status}`);
        }
        
        const ad = await response.json();
        console.log('Betöltött hirdetés:', ad);
        
        // Modal megnyitása és mezők kitöltése
        openEditModal(ad);
        
    } catch (error) {
        console.error('Hiba a hirdetés betöltésekor:', error);
        showError(`Hiba történt a hirdetés betöltésekor: ${error.message}`);
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
    // Megerősítő dialógus
    const confirmed = confirm(`Biztosan törölni szeretné a következő hirdetést?\n\n"${adTitle}"\n\nEz a művelet nem vonható vissza!`);
    
    if (!confirmed) {
        return; // Felhasználó lemondta
    }
    
    try {
        console.log('Hirdetés törlése:', adId);
        
        const response = await fetch(`/api/ads/${adId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP hiba: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Törlés sikeres:', result);
        
        // Sikeres üzenet megjelenítése
        showSuccess('✅ Hirdetés sikeresen törölve!');
        
        // Hirdetések újratöltése
        await loadAds();
        
    } catch (error) {
        console.error('Hiba a hirdetés törlésekor:', error);
        showError(`Hiba történt a törlés során: ${error.message}`);
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
        submitBtn.textContent = '⏳ Mentés...';
        
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
        const response = await fetch(`/api/ads/${adId}`, {
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
