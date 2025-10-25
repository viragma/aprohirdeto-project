import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email'; // Email ikon
import PhoneIcon from '@mui/icons-material/Phone'; // Telefon ikon
import NotesIcon from '@mui/icons-material/Notes'; // Leírás ikon
import { S3_BUCKET_URL } from '../apiConfig'; // Importáljuk az S3 URL-t

function AdCard({ ad, onEdit, onDelete }) {
  // === MÓDOSÍTÁS: Csak az eredeti képet (image_url) használjuk ===
  // Figyelmen kívül hagyjuk a thumbnail_url-t, mert a Lambda nem generálja le.
  const imageKey = ad.image_url;
  const fullImageUrl = imageKey ? `${S3_BUCKET_URL}${imageKey}` : null; // Összefűzzük az S3 URL-lel
  // === MÓDOSÍTÁS VÉGE ===

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Kép Megjelenítése (az eredeti képpel) */}
      {fullImageUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={fullImageUrl}
          alt={ad.ad_title || 'Hirdetés képe'}
          // Hibakezelés, ha a kép URL rossz vagy a kép nem elérhető (pl. S3 jogosultság)
          onError={(e) => {
            console.error(`Kép betöltési hiba: ${fullImageUrl}`, e);
            e.target.style.display='none'; // Elrejtjük a hibás kép helyét
            // Opcionálisan ide tehetsz egy placeholder képet vagy szöveget
          }}
        />
      ) : (
        // Placeholder, ha nincs kép URL az adatbázisban
        <Box height="200" display="flex" alignItems="center" justifyContent="center" bgcolor="#eee">
          <Typography color="textSecondary">Nincs kép</Typography>
        </Box>
      )}

      {/* Tartalom Rész (Minden adattal) */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Cím */}
        <Typography gutterBottom variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {ad.ad_title || 'Nincs cím'}
        </Typography>

        {/* Ár */}
        <Typography variant="h6" color="secondary.main" gutterBottom>
          {ad.price ? `${ad.price} Ft` : 'Ár megegyezés szerint'}
        </Typography>

        {/* Eladó neve */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Eladó: <strong>{ad.seller_name || 'Ismeretlen'}</strong>
        </Typography>

        {/* Leírás (ha van) */}
        {ad.ad_text && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <NotesIcon fontSize="inherit" sx={{ mt: '3px', flexShrink: 0 }} /> {ad.ad_text}
          </Typography>
        )}

        {/* Email (ha van) */}
        {ad.email && (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmailIcon fontSize="inherit" /> {ad.email}
          </Typography>
        )}

        {/* Telefon (ha van) */}
        {ad.phone && (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon fontSize="inherit" /> {ad.phone}
          </Typography>
        )}
      </CardContent>

      {/* Művelet Gombok */}
      <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #eee', pt: 1 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Szerkesztés
        </Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          Törlés
        </Button>
      </CardActions>
    </Card>
  );
}

export default AdCard;