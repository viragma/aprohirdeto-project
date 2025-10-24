#!/usr/bin/env python3
"""
AWS Lambda Local Testing Script
Mini Apróhirdető - Thumbnail Generator

Ez a script lehetővé teszi a Lambda funkció helyi tesztelését
valódi AWS környezet nélkül.
"""

import json
import os
import sys
from unittest.mock import Mock, patch
import boto3
from lambda_function import lambda_handler

def setup_test_environment():
    """Beállítja a tesztekhez szükséges környezeti változókat."""
    os.environ['DB_HOST'] = 'localhost'  # vagy teszt adatbázis
    os.environ['DB_USER'] = 'test_user'
    os.environ['DB_PASSWORD'] = 'test_password'
    os.environ['DB_NAME'] = 'aprohirdeto_test'
    os.environ['AWS_REGION'] = 'eu-central-1'
    
    print("✅ Test environment variables set")

def create_test_s3_event(bucket_name="beadando-kepek-w4pp9o", object_key="uploads/test-image.jpg"):
    """Létrehoz egy teszt S3 eseményt."""
    return {
        "Records": [
            {
                "eventVersion": "2.1",
                "eventSource": "aws:s3",
                "awsRegion": "eu-central-1",
                "eventTime": "2023-10-24T10:00:00.000Z",
                "eventName": "ObjectCreated:Put",
                "userIdentity": {
                    "principalId": "AWS:AIDACKZ12345678"
                },
                "requestParameters": {
                    "sourceIPAddress": "192.168.1.1"
                },
                "responseElements": {
                    "x-amz-request-id": "C3D13FE58DE4C810",
                    "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
                },
                "s3": {
                    "s3SchemaVersion": "1.0",
                    "configurationId": "testConfigRule",
                    "bucket": {
                        "name": bucket_name,
                        "ownerIdentity": {
                            "principalId": "A3I5XTEXAMAI3E"
                        },
                        "arn": f"arn:aws:s3:::{bucket_name}"
                    },
                    "object": {
                        "key": object_key,
                        "size": 1024,
                        "eTag": "0123456789abcdef",
                        "sequencer": "0A1B2C3D4E5F678901"
                    }
                }
            }
        ]
    }

def mock_s3_operations():
    """Mock-olja az S3 műveleteket teszteléshez."""
    # Fake image data (1x1 pixel PNG)
    fake_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    
    mock_response = {
        'Body': Mock()
    }
    mock_response['Body'].read = Mock(return_value=fake_image_data)
    
    return mock_response

def mock_database_operations():
    """Mock-olja az adatbázis műveleteket."""
    mock_connection = Mock()
    mock_cursor = Mock()
    
    # Mock cursor.execute visszatérési értéke (affected rows)
    mock_cursor.execute = Mock(return_value=1)
    mock_connection.cursor = Mock(return_value=mock_cursor)
    mock_connection.__enter__ = Mock(return_value=mock_connection)
    mock_connection.__exit__ = Mock(return_value=None)
    
    return mock_connection

def test_basic_functionality():
    """Alapvető funkcionalitás tesztelése."""
    print("\n🧪 Basic functionality test...")
    
    # Test event létrehozása
    test_event = create_test_s3_event()
    test_context = Mock()
    
    # Mock-ok beállítása
    with patch('boto3.client') as mock_boto3_client, \
         patch('pymysql.connect') as mock_pymysql_connect:
        
        # S3 client mock
        mock_s3 = Mock()
        mock_s3.get_object = Mock(return_value=mock_s3_operations())
        mock_s3.put_object = Mock(return_value={'ETag': '"12345"'})
        mock_boto3_client.return_value = mock_s3
        
        # Database mock
        mock_pymysql_connect.return_value = mock_database_operations()
        
        try:
            # Lambda handler hívása
            result = lambda_handler(test_event, test_context)
            
            print(f"✅ Lambda execution successful!")
            print(f"📤 Result: {json.dumps(result, indent=2)}")
            
            # Ellenőrizzük, hogy az S3 műveletek meghívódtak
            mock_s3.get_object.assert_called_once()
            mock_s3.put_object.assert_called_once()
            mock_pymysql_connect.assert_called_once()
            
            print("✅ All mocked operations called correctly")
            
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            return False
    
    return True

def test_thumbnail_skipping():
    """Teszteli, hogy a thumbnail fájlok átugrása működik-e."""
    print("\n🧪 Thumbnail skipping test...")
    
    # Thumbnail fájl esemény
    test_event = create_test_s3_event(object_key="thumbnails/existing-thumb.jpg")
    test_context = Mock()
    
    try:
        result = lambda_handler(test_event, test_context)
        print(f"✅ Thumbnail skipping test passed!")
        print(f"📤 Result: {json.dumps(result, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Thumbnail skipping test failed: {str(e)}")
        return False

def test_non_image_file():
    """Teszteli, hogy a nem kép fájlok átugrása működik-e."""
    print("\n🧪 Non-image file test...")
    
    # Non-image fájl esemény
    test_event = create_test_s3_event(object_key="uploads/document.pdf")
    test_context = Mock()
    
    try:
        result = lambda_handler(test_event, test_context)
        print(f"✅ Non-image file test passed!")
        print(f"📤 Result: {json.dumps(result, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Non-image file test failed: {str(e)}")
        return False

def run_all_tests():
    """Futtatja az összes tesztet."""
    print("🚀 Starting Lambda Function Tests...")
    print("=" * 50)
    
    # Environment setup
    setup_test_environment()
    
    tests = [
        ("Basic Functionality", test_basic_functionality),
        ("Thumbnail Skipping", test_thumbnail_skipping),
        ("Non-Image File Handling", test_non_image_file)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        success = test_func()
        results.append((test_name, success))
    
    # Test results summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name:.<30} {status}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print("-" * 50)
    print(f"Total: {len(results)} | Passed: {passed} | Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Lambda function is ready for deployment.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review the code.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
