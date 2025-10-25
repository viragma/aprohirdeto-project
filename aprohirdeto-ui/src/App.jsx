import React, { useState, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Container, Fab, Grid, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AdCard from './components/AdCard';
import AdFormModal from './components/AdFormModal';
import { getAds, createAd, updateAd, deleteAd } from './apiConfig';

function App() {
  const [ads, setAds] = useState([]); // A hirdetések listája
  const [loading, setLoading] = useState(true); // Töltésjelző
  const [error, setError] = useState(null); // Hibaüzenet
  const [modalOpen, setModalOpen] = useState(false); // Modal ablak állapota
  const [currentAd, setCurrentAd] = useState(null); // Melyik hirdetést szerkesztjük

  // === Adatok betöltése ===
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAds();
      setAds(response.data);
    } catch (err) {
      console.error("Hiba a hirdetések letöltésekor:", err);
      setError("Nem sikerült letölteni a hirdetéseket.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effekt: Töltse be a hirdetéseket az oldal indulásakor
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // === Modal kezelése ===
  const handleOpenModal = (ad = null) => {
    setCurrentAd(ad); // Ha van 'ad', akkor szerkesztés, ha 'null', akkor új
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentAd(null);
  };

  // === CRUD Műveletek ===

  // Új vagy módosított hirdetés mentése
  const handleSave = async (formData) => {
    try {
      if (currentAd) {
        // Módosítás
        await updateAd(currentAd.id, formData);
      } else {
        // Létrehozás
        await createAd(formData);
      }
      handleCloseModal();
      fetchAds(); // Frissítjük a listát
    } catch (err) {
      console.error("Hiba mentéskor:", err);
      setError("Nem sikerült elmenteni a hirdetést.");
    }
  };

  // Törlés
  const handleDelete = async (id) => {
    if (window.confirm("Biztos, hogy ki akarod dobni ezt a portékát?")) {
      try {
        await deleteAd(id);
        fetchAds(); // Frissítjük a listát
      } catch (err) {
        console.error("Hiba törléskor:", err);
        setError("Nem sikerült törölni a hirdetést.");
      }
    }
  };

  // === Tartalom megjelenítése ===
  const renderContent = () => {
    if (loading) {
      return <CircularProgress sx={{ display: 'block', margin: '50px auto' }} />;
    }
    if (error) {
      return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
    }
    if (ads.length === 0) {
      return <Typography variant="h6" align="center" sx={{ mt: 3 }}>🌾 Még senki sem árul semmit!</Typography>;
    }
    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {ads.map((ad) => (
          <Grid item xs={12} sm={6} md={4} key={ad.id}>
            <AdCard 
              ad={ad} 
              onEdit={() => handleOpenModal(ad)} 
              onDelete={() => handleDelete(ad.id)} 
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <div style={{ backgroundColor: '#f5f1e8', minHeight: '100vh' }}>
      {/* Fejléc */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🐄 FALUSI PORTÉKA PIAC 🌾
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Tartalom */}
      <Container sx={{ pb: 10 }}>
        {renderContent()}
      </Container>

      {/* Felugró ablak */}
      <AdFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        ad={currentAd}
      />

      {/* Új hirdetés gomb (jobb alsó) */}
      <Fab
        color="secondary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 30, right: 30 }}
        onClick={() => handleOpenModal(null)}
      >
        <AddIcon />
      </Fab>
    </div>
  );
}

export default App;