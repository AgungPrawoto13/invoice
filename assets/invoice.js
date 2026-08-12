async function saveInvoice(){
    const invoiceData = {
        invoice_date: document.getElementById('date-invoice')?.value || '',
        customer_name: document.getElementById('kepada-yth')?.value || '',
        customer_address: document.getElementById('address')?.value || '',
        total_amount: parseInt( 
            (document.getElementById('total-jumlah')?.innerText || '0').replace(/[^0-9]/g, ''), 10
        ) || 0,
        discount: document.getElementById('discount')?.value || 0,
        dp: parseInt(
            (document.getElementById('input-dp')?.value || 0).replace(/[^0-9]/g, ''), 10
        ) || 0,
        items: []
    };

    const rows = document.querySelectorAll('#item-rows .item-row');
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const unit = row.querySelector('select')?.value;
        const itemName = row.querySelector('textarea').value;
        const priceStr = row.querySelector('.price').value.replace(/[^0-9]/g, '');
        const unitPrice = parseInt(priceStr, 10) || 0;
        const amount = row.querySelector('amount')?.value || 0;
        const totalPrice = qty * unitPrice;

        if (itemName.trim() !== '') {
            invoiceData.items.push({
                qty: qty,
                unit: unit,
                item_name: itemName,
                unit_price: unitPrice,
                total_price: totalPrice 
            });
        }
    })

    //send this information to python
    try{
        const response = await fetch(`${window.API_BASE_URL}/api/save-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Invoice saved successfully:', result);
        } else {
            console.log('Error saving invoice: ' + result.message);
        }
    } catch (error) {
        console.error('catch Error saving invoice:', error);
        console.log('catch Error saving invoice: ' + error.message);
    }
}