import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

// A Modal stílusa
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function AdFormModal({ open, onClose, onSave, ad }) {
  const [formData, setFormData] = useState({
    ad_title: '',
    seller_name: '',
    price: '',
    ad_text: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ha 'ad' változik (szerkesztés), töltsük be az adatokat
  useEffect(() => {
    if (ad) {
      setFormData({
        ad_title: ad.ad_title || '',
        seller_name: ad.seller_name || '',
        price: ad.price || '',
        ad_text: ad.ad_text || '',
      });
      setImageFile(null); // Kép resetelése
    } else {
      // Új hirdetés esetén űrlap törlése
      setFormData({ ad_title: '', seller_name: '', price: '', ad_text: '' });
      setImageFile(null);
    }
  }, [ad, open]);

  // Változások kezelése az input mezőkön
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Képfájl kiválasztásának kezelése
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Mentés gomb
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FormData objektumot kell küldenünk az API-nak
    const data = new FormData();
    data.append('ad_title', formData.ad_title);
    data.append('seller_name', formData.seller_name);
    data.append('price', formData.price);
    data.append('ad_text', formData.ad_text);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    await onSave(data); // Átadjuk az 'App.jsx'-nek mentésre
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {ad ? 'Portéka szerkesztése' : 'Új portéka feladása'}
        </Typography>
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Mit akarsz eladni?"
          name="ad_title"
          value={formData.ad_title}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="A te neved?"
          name="seller_name"
          value={formData.seller_name}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Mennyiért?"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          multiline
          rows={3}
          label="Mesélj róla..."
          name="ad_text"
          value={formData.ad_text}
          onChange={handleChange}
        />
        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ mt: 2 }}
        >
          Kép feltöltése
          <input
            type="file"
            name="image"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {imageFile && <Typography sx={{mt: 1, fontSize: '0.8rem'}}>{imageFile.name}</Typography>}
        
        <Box sx={{ mt: 3, position: 'relative' }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={loading}
          >
            {ad ? 'Mentés' : 'Feladás'}
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default AdFormModal;