import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { S3_BUCKET_URL } from '../apiConfig';

function AdCard({ ad, onEdit, onDelete }) {
  // A kép URL-jének összeállítása
  const imageUrl = ad.thumbnail_url || ad.image_url;
  const fullImageUrl = imageUrl ? `${S3_BUCKET_URL}${imageUrl}` : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {fullImageUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={fullImageUrl}
          alt={ad.ad_title}
        />
      ) : (
        <Box height="200" display="flex" alignItems="center" justifyContent="center" bgcolor="#eee">
          <Typography color="textSecondary">Nincs kép</Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {ad.ad_title || 'Nincs cím'}
        </Typography>
        <Typography variant="h6" color="secondary.main" gutterBottom>
          {ad.price ? `${ad.price} Ft` : 'Ár megegyezés szerint'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Eladó: {ad.seller_name || 'Ismeretlen'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {ad.ad_text}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
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