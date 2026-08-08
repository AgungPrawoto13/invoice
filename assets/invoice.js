async function saveInvoice(){
    const invoiceData = {
        customer_name: document.getElementById('kepada-yth')?.value || '',
        customer_address: document.getElementById('address')?.value || '',
        qty: document.getElementById('qty')?.value || 1,
        unit: document.getElementById('unit')?.value || '',
        goods_name: document.getElementById('goods')?.value || '',
        unit_price: document.getElementById('unit-price')?.value || 0,
        amount: document.getElementById('amount')?.textContent || 0,
    }
}