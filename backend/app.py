import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
db_url = os.getenv("URL_DB")

def get_db_connection():
    if not db_url:
        raise ValueError("Database URL is not set in the environment variables.")
    return psycopg2.connect(db_url)

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

        query_invoice = """
            INSERT INTO invoices (
                invoice_date, customer_name, customer_address,
                subtotal, discount_value, dp_value, grand_total
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        val_invoice = (
            data.get("invoice_date"),
            data.get("customer_name"),
            data.get("customer_address"),
            data.get("subtotal"),
            data.get("discount_value"),
            data.get("dp_value"),
            data.get("grand_total")
        )

        cursor.execute(query_invoice, val_invoice)
        invoice_id = cursor.fetchone()[0]
        items = data.get("items", [])

        query_item = """
            INSERT INTO invoice_items (
                invoice_id, item_name, qty, unit, unit_price, total_price
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """

        val_items = [
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

        if val_items:
            cursor.executemany(query_item, val_items)
        
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
