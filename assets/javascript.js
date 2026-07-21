// Set tanggal hari ini secara otomatis saat halaman dibukadocument.getElementById('tanggal-nota').valueAsDate = new Date();
 
// 1. Munculkan nomor '1. ' otomatis saat textarea pertama kali diklik/fokus
function initNumbering(el) {
    if (el.value.trim() === '') {
        el.value = '1. ';
    } 
}

// 2. Buat penomoran otomatis saat menekan tombol Enter
function autoNumbering(e, el) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Cegah enter biasa

        // Hitung ada berapa baris saat ini untuk menentukan nomor berikutnya
        const lines = el.value.split('\n');
        const nextNumber = lines.length + 1;

        // Tambahkan baris baru + nomor berikutnya
        el.value += '\n' + nextNumber + '. ';

        // Trigger event input agar tinggi textarea menyesuaikan otomatis
        el.dispatchEvent(new Event('input'));
    }
}

function cetakPDF() {
    // 1. Hilangkan fokus dari tombol/input agar hover state hilang
    if (document.activeElement) {
        document.activeElement.blur();
    }

    // 2. Ambil wadah/tombol cetak dan sembunyikan sementara secara paksa
    const printBtnContainer = document.querySelector('.no-print');
    if (printBtnContainer) {
        printBtnContainer.style.display = 'none';
    }

    // 3. Pindahkan kursor/fokus ke paling atas dokumen
    window.scrollTo(0, 0);

    // 4. Beri jeda 150ms agar browser sempat merestart tampilan tanpa hover/kursor
    setTimeout(() => {
        window.print();

        // 5. Munculkan kembali tombolnya setelah dialog print ditutup
        if (printBtnContainer) {
            printBtnContainer.style.display = 'flex';
        }
    }, 150);
}

// Fungsi Tambah Baris
function addRowInvoice() {
    const tbody = document.getElementById('item-rows');
    const newRow = document.createElement('tr');
    newRow.className = "border-b border-gray-200 item-row";
    newRow.innerHTML = `
        <td class="p-2 text-center">
            <input type="number" value="1" min="1" oninput="calculateTotal()" class="qty w-full text-center bg-transparent focus:bg-gray-50 border border-transparent focus:border-gray-300 rounded p-1 text-sm">
        </td>
        <td class="p-2 text-center">
            <select class="w-full bg-transparent focus:bg-gray-50 border border-transparent focus:border-gray-300 rounded p-1 text-sm text-center focus:outline-none appearance-none">
                <option value="pcs">Pcs</option>
                <option value="m&sup2">m&sup2;</option>
                <option value="meter">Mtr</option>
                <option value="roll">Roll</option>
                <option value="Box">Box</option>
                <option value="set">Set</option>
            </select>
        </td>
        <td class="p-2">
            <input type="text" placeholder="Nama barang..." class="w-full bg-transparent focus:bg-gray-50 border border-transparent focus:border-gray-300 rounded p-1 text-sm">
        </td>
        <td class="p-2">
            <input type="text" value="0" oninput="formatInputRupiah(this); calculateTotal();" class="price w-full text-right bg-transparent focus:bg-gray-50 border border-transparent focus:border-gray-300 rounded p-1 text-sm">
        </td>
        <td class="p-2 text-right font-medium text-sm pr-4 row-total">Rp 0</td>
        <td>
            <button onclick="removeRow(this)" class="btn-remove-row text-red-500 hover:text-red-700 font-bold px-2 no-print">✕</button>
        </td>
    `;
    tbody.appendChild(newRow);
    calculateTotal();
}

function addRowPenawaran() {
    const itemList = document.getElementById('item-list');
    const rowCount = itemList.querySelectorAll('.item-row').length + 1;

    const newRow = document.createElement('div');
    newRow.className = 'item-row flex items-center gap-2 group';
    newRow.innerHTML = `
        <span class="row-num w-6 text-right">${rowCount}.</span>
        <input type="text" class="item-name flex-1 border-b border-gray-200 focus:outline-none focus:border-blue-900 p-1" placeholder="Nama barang...">
        <span class="text-gray-500">:</span>
        <input type="number" oninput="calculateTotalPenawaran()" class="qty w-16 text-center border-b border-gray-200 focus:outline-none focus:border-blue-900 p-1" value="1">
        <select class="w-full bg-transparent focus:bg-gray-50 border border-transparent focus:border-gray-300 rounded p-1 text-sm text-center focus:outline-none">
            <option value="pcs">Pcs</option>
            <option value="m&sup2">m&sup2;</option>
            <option value="meter">Mtr</option>
            <option value="roll">Roll</option>
            <option value="Box">Box</option>
            <option value="set">Set</option>
        </select>
        <span class="text-gray-500">x</span>
        <span class="text-gray-600 font-medium">Rp</span>
        <input type="text" oninput="formatInputPrice(this); calculateTotalPenawaran()" class="price w-28 text-right border-b border-gray-200 focus:outline-none focus:border-blue-900 p-1" placeholder="0">
        <span class="text-gray-500">=</span>
        
        <!-- HAPUS 'Rp' MANUALL DI SINI, BIARKAN JS YANG ISI SERTA 'Rp'-NYA -->
        <span class="row-total font-bold text-right p-1" style="width: 120px !important; flex-shrink: 0 !important; white-space: nowrap !important; display: inline-block !important;">
            Rp 0
        </span>
        <button onclick="removeRow(this)" class="btn-remove-row text-red-500 hover:text-red-700 font-bold px-2 no-print">✕</button>
    `;

    itemList.appendChild(newRow);
    calculateTotal();
}

// Helper mengubah angka jadi format tampilan "Rp 800.000"
function formatRupiah(angka) {
    return 'Rp ' + Math.round(angka).toLocaleString('id-ID');
}

// Format angka Rupiah standar (contoh: 2030000 -> 2.030.000)
        // function formatRupiah(number) {
        //     return new Intl.NumberFormat('id-ID').format(number);
        // }

// Helper untuk format otomatis saat ketik di input DP
function formatInputRupiah(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value) {
        input.value = parseInt(value, 10).toLocaleString('id-ID');
    } else {
        input.value = '0';
    }
}

// Fungsi Hapus Baris
function deleteLastRow() {
    const tbody = document.getElementById('item-rows');
    if (tbody.rows.length > 1) {
        tbody.deleteRow(-1);
        calculateTotal();
    } else {
        alert("Minimal harus ada 1 barang di dalam nota!");
    }
}

// Hapus baris barang
function removeRow(btn) {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length > 1) {
        btn.closest('.item-row').remove();
        calculateTotal();
    } else {
        alert('Minimal harus ada 1 baris penawaran barang!');
    }
}

// Hitung total per baris dan grand total
// Hitung total per baris dan grand total
function calculateTotalPenawaran() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('.item-row');

    rows.forEach((row, index) => {
        // Update nomor urut otomatis
        row.querySelector('.row-num').innerText = `${index + 1}.`;

        // Ambil nilai Qty
        const qtyInput = row.querySelector('.qty').value;
        const qty = parseFloat(qtyInput) || 0;

        // Ambil nilai Harga (hapus titik)
        const priceRaw = row.querySelector('.price').value.replace(/[^0-9]/g, '') || "0";
        const price = parseFloat(priceRaw) || 0;

        // Hitung Total Baris Ini
        const rowTotal = qty * price;
        grandTotal += rowTotal;

        // Tampilkan Total Baris
        row.querySelector('.row-total').innerText = formatRupiah(rowTotal);
    });

    // Tampilkan Grand Total
    document.getElementById('grand-total').innerText = formatRupiah(grandTotal);
}

// Format input harga saat diketik agar punya titik ribuan
function formatInputPrice(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (val) {
        input.value = parseInt(val, 10).toLocaleString('id-ID');
    } else {
        input.value = '';
    }
}

// FUNGSI UTAMA HITUNG TOTAL, DISKON & DP
function calculateTotal() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('.item-row');

    // 1. Hitung Subtotal dari semua baris barang
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty')?.value) || 0;
        const priceRaw = row.querySelector('.price')?.value.replace(/[^0-9]/g, '') || "0";
        const price = parseFloat(priceRaw) || 0;
        
        const totalRow = qty * price;
        grandTotal += totalRow;
        
        const rowTotalEl = row.querySelector('.row-total');
        if (rowTotalEl) rowTotalEl.innerText = formatRupiah(totalRow);
    });

    // 2. Ambil Nilai Diskon
    const discountType = document.getElementById('discount-type')?.value || 'percent';
    const discountInputEl = document.getElementById('discount');
    let discountRaw = discountInputEl ? discountInputEl.value.replace(/[^0-9]/g, '') : "0";
    let discountValue = parseFloat(discountRaw) || 0;

    let discountRupiah = 0;
    if (discountType === 'percent') {
        if (discountValue > 100) {
            discountValue = 100;
            if (discountInputEl) discountInputEl.value = '100';
        }
        discountRupiah = grandTotal * (discountValue / 100);
    } else {
        discountRupiah = discountValue;
    }

    // Hitung Total Setelah Diskon
    const totalSetelahDiskon = grandTotal - discountRupiah;

    // 3. Ambil Nilai DP (Bisa Rp atau %)
    const dpType = document.getElementById('dp-type')?.value || 'nominal';
    const dpInputEl = document.getElementById('input-dp');
    let dpRaw = dpInputEl ? dpInputEl.value.replace(/[^0-9]/g, '') : "0";
    let dpValue = parseFloat(dpRaw) || 0;

    let dpRupiah = 0;
    if (dpType === 'percent') {
        if (dpValue > 100) {
            dpValue = 100;
            if (dpInputEl) dpInputEl.value = '100';
        }
        // DP % dihitung dari Total Setelah Diskon
        dpRupiah = totalSetelahDiskon * (dpValue / 100);
    } else {
        dpRupiah = dpValue;
    }

    // 4. Hitung Sisa Akhir
    let sisa = totalSetelahDiskon - dpRupiah;
    if (sisa < 0) sisa = 0;

    // 5. Update Label Print (Persen / Rp) untuk PDF
    const discountLabelPrint = document.getElementById('discount-label-print');
    if (discountLabelPrint) discountLabelPrint.innerText = (discountType === 'percent') ? '(%)' : '(Rp)';

    const dpLabelPrint = document.getElementById('dp-label-print');
    if (dpLabelPrint) dpLabelPrint.innerText = (dpType === 'percent') ? '(%)' : '(Rp)';

    // 6. Update Tampilan HTML Total
    const totalJumlahEl = document.getElementById('total-jumlah');
    const totalSisaEl = document.getElementById('total-sisa');

    if (totalJumlahEl) totalJumlahEl.innerText = formatRupiah(grandTotal);
    if (totalSisaEl) totalSisaEl.innerText = formatRupiah(sisa);
}

// FUNGSI PENDUKUNG: Reset & Format Input DP
function handleDpTypeChange() {
    const dpInputEl = document.getElementById('input-dp');
    if (dpInputEl) {
        dpInputEl.value = '0';
    }
    calculateTotal();
}

function handleDiscountTypeChange() {
    const discountInputEl = document.getElementById('discount');
    if (discountInputEl) {
        discountInputEl.value = '0';
    }
    calculateTotal();
}

function formatInputPrice(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (val) {
        input.value = parseInt(val, 10).toLocaleString('id-ID');
    } else {
        input.value = '';
    }
}

function formatInputDP(input) {
    const dpType = document.getElementById('dp-type')?.value || 'nominal';
    let val = input.value.replace(/[^0-9]/g, '');
    
    if (dpType === 'nominal' && val) {
        input.value = parseInt(val, 10).toLocaleString('id-ID');
    } else {
        input.value = val; // Jika %, biarkan angka murni tanpa titik ribuan
    }
}


// Jalankan kalkulasi pertama kali saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    calculateTotal();
    calculateTotalPenawaran();
});