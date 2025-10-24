import json
import boto3
import os
import logging
from io import BytesIO
from PIL import Image
import pymysql

# Logging konfiguráció
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS kliens inicializálása
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    AWS Lambda handler function for automatic thumbnail generation.
    
    Triggered by S3 PUT events in the uploads/ prefix.
    Creates thumbnails and updates the database with thumbnail URLs.
    """
    
    try:
        logger.info(f"Lambda function started. Event: {json.dumps(event)}")
        
        # S3 esemény feldolgozása
        for record in event['Records']:
            # S3 esemény adatok kinyerése
            bucket_name = record['s3']['bucket']['name']
            object_key = record['s3']['object']['key']
            
            logger.info(f"Processing S3 object: s3://{bucket_name}/{object_key}")
            
            # Biztonsági ellenőrzés: Ha már thumbnails/ mappában van, skip
            if object_key.startswith('thumbnails/'):
                logger.info(f"Skipping thumbnail file to avoid infinite loop: {object_key}")
                continue
            
            # Csak uploads/ mappából származó fájlokat dolgozzuk fel
            if not object_key.startswith('uploads/'):
                logger.info(f"Skipping non-uploads file: {object_key}")
                continue
            
            # Csak képfájlokat dolgozzunk fel
            if not is_image_file(object_key):
                logger.info(f"Skipping non-image file: {object_key}")
                continue
            
            # Thumbnail készítése és feltöltése
            thumbnail_key = create_and_upload_thumbnail(bucket_name, object_key)
            
            if thumbnail_key:
                # Adatbázis frissítése
                update_database_thumbnail(object_key, thumbnail_key)
                logger.info(f"Successfully processed: {object_key} -> {thumbnail_key}")
            else:
                logger.error(f"Failed to create thumbnail for: {object_key}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Thumbnails processed successfully',
                'processed_files': len(event['Records'])
            })
        }
        
    except Exception as e:
        logger.error(f"Lambda function error: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

def is_image_file(object_key):
    """
    Ellenőrzi, hogy a fájl képfájl-e a kiterjesztés alapján.
    """
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    file_extension = os.path.splitext(object_key.lower())[1]
    return file_extension in image_extensions

def create_and_upload_thumbnail(bucket_name, object_key):
    """
    Letölti a képet S3-ból, létrehoz egy thumbnails-t és feltölti.
    
    Args:
        bucket_name (str): S3 bucket neve
        object_key (str): Eredeti kép kulcsa (pl. uploads/kep.jpg)
    
    Returns:
        str: Thumbnail kulcs (pl. thumbnails/kep.jpg) vagy None ha hiba történt
    """
    try:
        logger.info(f"Creating thumbnail for: s3://{bucket_name}/{object_key}")
        
        # Eredeti kép letöltése S3-ból
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        image_data = response['Body'].read()
        
        logger.info(f"Downloaded image data: {len(image_data)} bytes")
        
        # Kép betöltése Pillow-val
        image = Image.open(BytesIO(image_data))
        
        # Eredeti formátum megőrzése
        original_format = image.format or 'JPEG'
        
        # RGBA képek konvertálása RGB-re (JPEG kompatibilitás)
        if image.mode in ('RGBA', 'LA', 'P'):
            # RGBA -> RGB konverzió fehér háttérrel
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = rgb_image
        
        logger.info(f"Original image: {image.size}, mode: {image.mode}, format: {original_format}")
        
        # Thumbnail készítése (200x200 max, aspect ratio megtartásával)
        image.thumbnail((200, 200), Image.Resampling.LANCZOS)
        
        logger.info(f"Thumbnail size: {image.size}")
        
        # Thumbnail kulcs generálása (uploads/kep.jpg -> thumbnails/kep.jpg)
        thumbnail_key = object_key.replace('uploads/', 'thumbnails/', 1)
        
        # Kép mentése memóriába
        thumbnail_buffer = BytesIO()
        
        # JPEG formátumban mentés (jobb kompatibilitás)
        save_format = 'JPEG'
        if original_format.upper() == 'PNG':
            save_format = 'PNG'
        
        image.save(thumbnail_buffer, format=save_format, quality=85, optimize=True)
        thumbnail_buffer.seek(0)
        
        # Content-Type meghatározása
        content_type = 'image/jpeg'
        if save_format == 'PNG':
            content_type = 'image/png'
        
        # Thumbnail feltöltése S3-ba
        s3_client.put_object(
            Bucket=bucket_name,
            Key=thumbnail_key,
            Body=thumbnail_buffer.getvalue(),
            ContentType=content_type,
            CacheControl='max-age=31536000',  # 1 év cache
            Metadata={
                'original-key': object_key,
                'thumbnail-size': f"{image.size[0]}x{image.size[1]}",
                'generated-by': 'aprohirdeto-lambda'
            }
        )
        
        logger.info(f"Thumbnail uploaded successfully: s3://{bucket_name}/{thumbnail_key}")
        
        return thumbnail_key
        
    except Exception as e:
        logger.error(f"Error creating thumbnail for {object_key}: {str(e)}", exc_info=True)
        return None

def update_database_thumbnail(image_url, thumbnail_url):
    """
    Frissíti az adatbázisban a thumbnail_url mezőt.
    
    Args:
        image_url (str): Eredeti kép URL-je (pl. uploads/kep.jpg)
        thumbnail_url (str): Thumbnail URL-je (pl. thumbnails/kep.jpg)
    """
    connection = None
    try:
        logger.info(f"Updating database: {image_url} -> {thumbnail_url}")
        
        # Adatbázis kapcsolódási adatok környezeti változókból
        db_config = {
            'host': os.environ.get('DB_HOST'),
            'user': os.environ.get('DB_USER'),
            'password': os.environ.get('DB_PASSWORD'),
            'database': os.environ.get('DB_NAME', 'aprohirdeto'),
            'charset': 'utf8mb4',
            'autocommit': True
        }
        
        # Kötelező környezeti változók ellenőrzése
        required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD']
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        logger.info(f"Connecting to database: {db_config['host']}")
        
        # MySQL kapcsolat létrehozása
        connection = pymysql.connect(**db_config)
        
        with connection.cursor() as cursor:
            # SQL parancs végrehajtása
            sql = "UPDATE advertisements SET thumbnail_url = %s WHERE image_url = %s"
            
            affected_rows = cursor.execute(sql, (thumbnail_url, image_url))
            
            logger.info(f"Database update completed. Affected rows: {affected_rows}")
            
            if affected_rows == 0:
                logger.warning(f"No rows updated for image_url: {image_url}")
            else:
                logger.info(f"Successfully updated {affected_rows} row(s)")
        
    except Exception as e:
        logger.error(f"Database update error for {image_url}: {str(e)}", exc_info=True)
        raise e
    
    finally:
        if connection:
            connection.close()
            logger.info("Database connection closed")

def get_environment_info():
    """
    Debug funkció a környezeti változók ellenőrzéséhez.
    """
    env_vars = {
        'AWS_REGION': os.environ.get('AWS_REGION', 'Not set'),
        'DB_HOST': os.environ.get('DB_HOST', 'Not set'),
        'DB_USER': os.environ.get('DB_USER', 'Not set'),
        'DB_NAME': os.environ.get('DB_NAME', 'aprohirdeto'),
        'DB_PASSWORD': '***' if os.environ.get('DB_PASSWORD') else 'Not set'
    }
    
    logger.info(f"Environment variables: {env_vars}")
    return env_vars

# Test handler helyi teszteléshez
if __name__ == "__main__":
    # Példa S3 esemény teszteléshez
    test_event = {
        "Records": [
            {
                "s3": {
                    "bucket": {
                        "name": "beadando-kepek-w4pp9o"
                    },
                    "object": {
                        "key": "uploads/test-image.jpg"
                    }
                }
            }
        ]
    }
    
    # Környezeti változók beállítása teszteléshez
    # os.environ['DB_HOST'] = 'your-rds-endpoint'
    # os.environ['DB_USER'] = 'admin'
    # os.environ['DB_PASSWORD'] = 'your-password'
    # os.environ['DB_NAME'] = 'aprohirdeto'
    
    print("Test run started...")
    result = lambda_handler(test_event, None)
    print(f"Test result: {result}")
