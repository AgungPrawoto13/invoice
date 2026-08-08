import os
import psycopg2
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

load_dotenv()
date_now = datetime.now()

app = Flask(__name__)
CORS(app)
db_url = os.getenv("URL_DB")

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL tidak ditemukan di file .env!")
    
    parsed_url = urlparse(db_url)
    query_params = parse_qs(parsed_url.query)
    
    # 1. Hapus channel_binding yang bikin crash sebelumnya
    if 'channel_binding' in query_params:
        del query_params['channel_binding']
        
    # 2. Ambil Endpoint ID dari hostname (misal: ep-cool-flower-123456.neon.tech)
    hostname_parts = parsed_url.hostname.split('.')
    endpoint_id = hostname_parts[0]  # Ambil bagian depan (ep-xxx)
    
    # 3. Suntikkan parameter options=endpoint=ep-xxx jika belum ada
    if endpoint_id.startswith('ep-') and 'options' not in query_params:
        query_params['options'] = f'endpoint={endpoint_id}'
        
    # Build ulang URL bersih
    new_query = urlencode(query_params, doseq=True)
    clean_url = urlunparse((
        parsed_url.scheme,
        parsed_url.netloc,
        parsed_url.path,
        parsed_url.params,
        new_query,
        parsed_url.fragment
    ))
    
    return psycopg2.connect(clean_url)

@app.route('/api/save-invoice', methods=['POST'])
def save_invoice():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Simpan Data Invoice Utama
        query_invoice = """
            INSERT INTO invoices (
                invoice_date, customer_name, customer_address,
                discount_value, dp_value, grand_total, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        val_invoice = (
            data.get("invoice_date"),
            data.get("customer_name"),
            data.get("customer_address"),
            data.get("discount"),
            data.get("dp"),
            data.get("total_amount"),
            date_now  # Menyimpan waktu saat ini sebagai created_at
        )

        cursor.execute(query_invoice, val_invoice)
        invoice_id = cursor.fetchone()[0]
        
        # Ambil array items dari JSON
        items = data.get("items", [])

        # 2. Simpan ke Tabel invoices_items
        query_invoices_items = """
            INSERT INTO invoices_items (
                invoice_id, item_name, qty, unit, unit_price, total_price
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """

        val_invoices_items = [
            (
                invoice_id,
                item.get('item_name'),
                item.get('qty'),
                item.get('unit'),
                item.get('unit_price'),
                item.get('total_price')
            )
            for item in items
        ]

        if val_invoices_items:
            cursor.executemany(query_invoices_items, val_invoices_items)

        # 3. Simpan ke Tabel items (List per-item dari array items)
        query_items = """ 
            INSERT INTO items (
                qty, item_name, unit, unit_price, total_price, invoice_id 
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """ 

        val_items = [
            (
                item.get('qty'),
                item.get('item_name'),
                item.get('unit'),
                item.get('unit_price'),
                item.get('total_price'),
                invoice_id  
            )
            for item in items
        ]

        if val_items:    
            cursor.executemany(query_items, val_items)

        conn.commit()

        return jsonify({
            'status': 'success',
            'message': 'Invoice saved successfully',
            'invoice_id': invoice_id
        }), 200
    
    except Exception as err:
        if conn:
            conn.rollback()

        print("\n" + "="*50)
        print("DETIL ERROR DATABASE / PYTHON:")
        import traceback
        traceback.print_exc()
        print("="*50 + "\n")
        
        return jsonify({'status': 'error', 'message': str(err)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
