async function saveInvoice(){
    const invoiceData = {
        customer_name: document.getElementById('kepada-yth')?.value || '',
        customer_address: document.getElementById('address')?.value || '',
        qty: document.getElementById('qty')?.value || 1,
        unit: document.getElementById('unit')?.value || '',
        goods_name: document.getElementById('goods')?.value || '',
        unit_price: document.getElementById('unit-price')?.value || 0,
        amount: document.getElementById('amount')?.textContent || 0,
        total_amount: document.getElementById('total-jumlah')?.value || 0,
        discount: document.getElementById('discount')?.value || 0,
        dp: document.getElementById('input-dp')?.value || 0,
    };

    const rows = document.querySelectorAll('#item-rows .item-row');
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const unit = row.querySelector('select')?.value;
        const itemName = row.querySelector('textarea').value;
        const priceStr = row.querySelector('.price').value.replace(/[^0-9.]/g, '');
        const unitPrice = parseFloat(priceStr) || 0;
        const totalPrice = qty * unitPrice;

        if (itemName.trim() !== '') {
            invoiceData.items.push({
                item_name: itemName,
                qty: qty,
                unit: unit,
                unit_price: unitPrice,
                total_price: totalPrice 
            });
        }
    })

    // //send this information to python
    // try{
    //     const response = await fetch('http://127.0.0.1:5000/api/save-invoice', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(invoiceData)
    //     });

    //     const result = await response.json();
    //     if (response.ok) {
    //         console.log('Invoice saved successfully:', result);
    //     } else {
    //         console.log('Error saving invoice: ' + result.message);
    //     }
    // } catch (error) {
    //     console.error('Error saving invoice:', error);
    //     console.log('Error saving invoice: ' + error.message);
    // }
}