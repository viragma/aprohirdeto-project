import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '90%', 
  maxHeight: '90vh', 
  overflowY: 'auto', 
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
    email: '', 
    phone: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ad) {

      setFormData({
        ad_title: ad.ad_title || '',
        seller_name: ad.seller_name || '',
        price: ad.price || '',
        ad_text: ad.ad_text || '',
        email: ad.email || '', 
        phone: ad.phone || '', 
      });

      setImageFile(null);
    } else {

      setFormData({
        ad_title: '',
        seller_name: '',
        price: '',
        ad_text: '',
        email: '', 
        phone: '', 
      });

      setImageFile(null);
    }
  }, [ad, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('ad_title', formData.ad_title);
    data.append('seller_name', formData.seller_name);
    // Csak akkor küldjük el az opcionális mezőket, ha van értékük
    if (formData.price) data.append('price', formData.price);
    if (formData.ad_text) data.append('ad_text', formData.ad_text);
    if (formData.email) data.append('email', formData.email);
    if (formData.phone) data.append('phone', formData.phone);

    if (imageFile) {
      data.append('image', imageFile);
    }

    await onSave(data);
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {ad ? 'Portéka szerkesztése' : 'Új portéka feladása'}
        </Typography>

        <TextField margin="normal" required fullWidth label="Mitől szabadulna meg?" name="ad_title" value={formData.ad_title} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Aztat téged hogy hínak?" name="seller_name" value={formData.seller_name} onChange={handleChange} />
        <TextField margin="normal" fullWidth label="Mennyiért?!" name="price" value={formData.price} onChange={handleChange} />


        <TextField margin="normal" fullWidth type="email" label="Elektronyos címed?" name="email" value={formData.email} onChange={handleChange} />
        <TextField margin="normal" fullWidth type="tel" label="Beszélődrót?" name="phone" value={formData.phone} onChange={handleChange} />
        <TextField margin="normal" fullWidth multiline rows={3} label="Mondjon mán valamit róla..." name="ad_text" value={formData.ad_text} onChange={handleChange} />


        <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }} > Kép feltöltése (opcionális)
          <input type="file" name="image" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {imageFile && <Typography sx={{mt: 1, fontSize: '0.8rem'}}>{imageFile.name}</Typography>}

        <Box sx={{ mt: 3, position: 'relative' }}>
          <Button type="submit" fullWidth variant="contained" color="secondary" disabled={loading} > {ad ? 'Mentés' : 'Feladás'} </Button>
          {loading && ( <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', }} /> )}
        </Box>
      </Box>
    </Modal>
  );
}

export default AdFormModal;