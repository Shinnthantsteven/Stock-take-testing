const API_URL = "https://script.google.com/macros/s/AKfycbxVPCD4hMgTboWCP2C2xsL9zBkOpYTqPu4Wp073VdnoVAcrUFG0oqG_ZSYJaJWoDYPX/exec";

function render(data) {
    const list = document.getElementById('list');
    list.innerHTML = data.slice(0, 300).map(r => {
        const isOutOfStock = r.qty <= 0;
        return `
        <tr class="${isOutOfStock ? 'out-of-stock' : ''}">
            <td style="color:#64748b; font-size:11px; font-weight:700;">${highlight(r.id)}</td>
            <td>
                <div class="desc-cell">${highlight(r.desc)}</div>
                <div style="font-size:10px; color:var(--brand); font-weight:800; margin-top:2px;">${highlight(r.cat)}</div>
            </td>
            <td onclick="event.stopPropagation()">
                <input type="text" 
                    class="phys-input" 
                    placeholder="0"
                    value="${r.physical || ''}" 
                    onfocus="if(this.value) this.value += '+'"
                    onblur="syncToSheet(this, '${r.id}')"
                    onkeydown="if(event.key === 'Enter') this.blur()">
            </td>
            <td style="color:#38bdf8; font-weight:800; font-size:16px;">${r.qty}</td>
            <td style="color:var(--brand); font-weight:800; font-size:18px;">${r.cost}</td>
            <td style="font-weight:700;">${highlight(r.um)}</td>
            <td><div style="color:#818cf8; font-weight:700;">${highlight(r.pack)}</div></td>
            <td style="color:#a78bfa; font-size:13px; font-weight:700;">${highlight(r.sup)}</td>
            <td>
                <span class="brand-pill">${highlight(r.brand)}</span>
            </td>
        </tr>`;
    }).join('');
}

async function syncToSheet(input, itemId) {
    let raw = input.value.trim();
    if (!raw) return;

    try {
        // Step 1: Excel Math (3+4 -> 7)
        let formula = raw.replace(/\++$/, '');
        let total = Function('"use strict";return (' + formula + ')')();
        
        // Step 2: Visual Feedback
        input.classList.add('syncing');

        // Step 3: Talk to Google Sheet
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Critical for Google Apps Script
            body: JSON.stringify({ 
                itemCode: itemId,   // Column A
                stockValue: total   // Column F
            })
        });

        // Step 4: Success State
        input.classList.remove('syncing');
        input.classList.add('sync-success');
        input.value = total;
        
        showToast(`SYNCED: ${itemId} = ${total}`);
        setTimeout(() => input.classList.remove('sync-success'), 2000);

    } catch(e) {
        input.classList.remove('syncing');
        input.style.borderColor = "var(--danger)";
        console.error("Math error in entry");
    }
}
