const express = require('express');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware engedélyezése
app.use(cors());

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AWS S3 beállítása (v2)
const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'eu-central-1'
});

// Multer S3 konfigurálás
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'beadando-kepek-w4pp9o',
        key: function (req, file, cb) {
            // Egyedi fájlnév generálás timestamp + eredeti fájlnév
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.originalname}`;
            cb(null, `uploads/${fileName}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Csak képfájlok engedélyezése
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Csak képfájlok engedélyezettek!'), false);
        }
    }
});

// MySQL kapcsolat pool létrehozása
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aprohirdeto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Adatbázis kapcsolat tesztelése
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL adatbázis kapcsolat sikeres!');
        connection.release();
    } catch (error) {
        console.error('MySQL kapcsolódási hiba:', error.message);
    }
}

// 1. Végpont: Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'API működik',
        timestamp: new Date().toISOString()
    });
});

// 2. Végpont: Hirdetések lekérdezése
app.get('/api/ads', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, ad_title, price, seller_name, thumbnail_url FROM advertisements ORDER BY created_at DESC'
        );
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hirdetések lekérdezési hiba:', error);
        res.status(500).json({ 
            error: 'Adatbázis hiba a hirdetések lekérdezésekor',
            message: error.message 
        });
    }
});

// 3. Végpont: Új hirdetés feladása
app.post('/api/ads', upload.single('image'), async (req, res) => {
    try {
        const {
            seller_name,
            email,
            phone,
            ad_title,
            ad_text,
            price
        } = req.body;

        // Kötelező mezők ellenőrzése
        if (!seller_name || !ad_title) {
            return res.status(400).json({ 
                error: 'Hiányzó kötelező mezők',
                message: 'Az eladó neve és a hirdetés címe kötelező!' 
            });
        }

        // Kép URL meghatározása (ha van feltöltött kép)
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.key; // S3 kulcs (pl. uploads/auto.jpg)
        }

        // Adatok mentése az adatbázisba
        const [result] = await pool.execute(
            `INSERT INTO advertisements 
             (seller_name, email, phone, ad_title, ad_text, price, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [seller_name, email, phone, ad_title, ad_text, price, imageUrl]
        );

        res.status(201).json({
            message: 'Hirdetés sikeresen feladva!',
            id: result.insertId,
            image_url: imageUrl
        });

    } catch (error) {
        console.error('Hirdetés feladási hiba:', error);
        res.status(500).json({ 
            error: 'Hiba a hirdetés feladásakor',
            message: error.message 
        });
    }
});

// 4. Végpont: Hirdetés részletes lekérdezése ID alapján
app.get('/api/ads/:id', async (req, res) => {
    try {
        const adId = parseInt(req.params.id);
        
        if (isNaN(adId)) {
            return res.status(400).json({ 
                error: 'Hibás paraméter',
                message: 'A hirdetés ID-nak számnak kell lennie!' 
            });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM advertisements WHERE id = ?',
            [adId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                error: 'Nem található',
                message: 'A kért hirdetés nem található!' 
            });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Hirdetés lekérdezési hiba:', error);
        res.status(500).json({ 
            error: 'Adatbázis hiba a hirdetés lekérdezésekor',
            message: error.message 
        });
    }
});

// 5. Végpont: Hirdetés frissítése
app.put('/api/ads/:id', upload.single('image'), async (req, res) => {
    try {
        const adId = parseInt(req.params.id);
        
        if (isNaN(adId)) {
            return res.status(400).json({ 
                error: 'Hibás paraméter',
                message: 'A hirdetés ID-nak számnak kell lennie!' 
            });
        }

        // Ellenőrizzük, hogy létezik-e a hirdetés
        const [existingAd] = await pool.execute(
            'SELECT * FROM advertisements WHERE id = ?',
            [adId]
        );
        
        if (existingAd.length === 0) {
            return res.status(404).json({ 
                error: 'Nem található',
                message: 'A frissítendő hirdetés nem található!' 
            });
        }

        const {
            seller_name,
            email,
            phone,
            ad_title,
            ad_text,
            price
        } = req.body;

        // Kötelező mezők ellenőrzése
        if (!seller_name || !ad_title) {
            return res.status(400).json({ 
                error: 'Hiányzó kötelező mezők',
                message: 'Az eladó neve és a hirdetés címe kötelező!' 
            });
        }

        // Kép URL kezelése
        let imageUrl = existingAd[0].image_url; // Megtartjuk a régi képet alapértelmezésben
        
        if (req.file) {
            // Ha új kép lett feltöltve, frissítjük
            imageUrl = req.file.key;
            
            // Régi kép törlése S3-ból (opcionális)
            if (existingAd[0].image_url) {
                try {
                    await s3.deleteObject({
                        Bucket: 'beadando-kepek-w4pp9o',
                        Key: existingAd[0].image_url
                    }).promise();
                    console.log('Régi kép törölve:', existingAd[0].image_url);
                } catch (deleteError) {
                    console.warn('Régi kép törlési hiba:', deleteError.message);
                }
            }
        }

        // Hirdetés frissítése az adatbázisban
        await pool.execute(
            `UPDATE advertisements 
             SET seller_name = ?, email = ?, phone = ?, ad_title = ?, ad_text = ?, price = ?, image_url = ?
             WHERE id = ?`,
            [seller_name, email, phone, ad_title, ad_text, price, imageUrl, adId]
        );

        res.status(200).json({
            message: 'Hirdetés sikeresen frissítve!',
            id: adId,
            image_url: imageUrl
        });

    } catch (error) {
        console.error('Hirdetés frissítési hiba:', error);
        res.status(500).json({ 
            error: 'Hiba a hirdetés frissítésekor',
            message: error.message 
        });
    }
});

// 6. Végpont: Hirdetés törlése
app.delete('/api/ads/:id', async (req, res) => {
    try {
        const adId = parseInt(req.params.id);
        
        if (isNaN(adId)) {
            return res.status(400).json({ 
                error: 'Hibás paraméter',
                message: 'A hirdetés ID-nak számnak kell lennie!' 
            });
        }

        // Ellenőrizzük, hogy létezik-e a hirdetés és lekérjük a kép URL-ét
        const [existingAd] = await pool.execute(
            'SELECT image_url, thumbnail_url FROM advertisements WHERE id = ?',
            [adId]
        );
        
        if (existingAd.length === 0) {
            return res.status(404).json({ 
                error: 'Nem található',
                message: 'A törlendő hirdetés nem található!' 
            });
        }

        // Hirdetés törlése az adatbázisból
        const [result] = await pool.execute(
            'DELETE FROM advertisements WHERE id = ?',
            [adId]
        );

        // Kapcsolódó képek törlése S3-ból
        const deletePromises = [];
        
        if (existingAd[0].image_url) {
            deletePromises.push(
                s3.deleteObject({
                    Bucket: 'beadando-kepek-w4pp9o',
                    Key: existingAd[0].image_url
                }).promise()
            );
        }
        
        if (existingAd[0].thumbnail_url) {
            deletePromises.push(
                s3.deleteObject({
                    Bucket: 'beadando-kepek-w4pp9o',
                    Key: existingAd[0].thumbnail_url
                }).promise()
            );
        }

        // S3 törlések végrehajtása (nem blokkoljuk a választ, ha sikertelen)
        if (deletePromises.length > 0) {
            try {
                await Promise.all(deletePromises);
                console.log('S3 képek sikeresen törölve a hirdetéshez:', adId);
            } catch (s3Error) {
                console.warn('S3 képek törlési hiba:', s3Error.message);
            }
        }

        res.status(200).json({
            message: 'Hirdetés sikeresen törölve!',
            id: adId,
            deletedRows: result.affectedRows
        });

    } catch (error) {
        console.error('Hirdetés törlési hiba:', error);
        res.status(500).json({ 
            error: 'Hiba a hirdetés törlésekor',
            message: error.message 
        });
    }
});

// Hibakezelő middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'A fájl túl nagy',
                message: 'Maximum 10MB méretű fájl tölthető fel!' 
            });
        }
    }
    
    console.error('Általános hiba:', error);
    res.status(500).json({ 
        error: 'Szerver hiba',
        message: error.message 
    });
});

// 404 kezelése
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Nem található',
        message: `A kért útvonal (${req.originalUrl}) nem található.` 
    });
});

// Szerver indítása
app.listen(PORT, async () => {
    console.log(`🚀 Apróhirdető API fut a ${PORT} porton`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    
    // Adatbázis kapcsolat tesztelése
    await testDatabaseConnection();
});

module.exports = app;
