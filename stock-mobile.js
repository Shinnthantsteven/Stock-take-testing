// === YOUR APPS SCRIPT URL ===
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9op7Pj91-YsnQm0Bj5F9KYF7uqWSLr9g4v-JSzfmUSRGAKE_oVtGwMNKHzX90JAfi/exec";

// === FIREBASE (realtime secret sauce) ===
const firebaseConfig = { databaseURL: "https://chef2chef-stock-default-rtdb.firebaseio.com" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("stock");

// === GLOBAL ===
let items = [], currentUid = null, currentCell = null;

async function loadData() {
  const res = await fetch(SCRIPT_URL + "?action=getAll");
  const data = await res.json();
  items = data.items || [];
  renderTable();
  // Realtime listener
  db.on("child_changed", snap => { updateSingleRow(snap.key, snap.val()); });
}

function renderTable(filtered = items) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  filtered.slice(0, 30).forEach(item => {  // max 30 items
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 border-b border-zinc-700">${item.id}</td>
      <td class="p-3 border-b border-zinc-700">
        ${item.desc} (${item.pack})<br>
        <span class="text-xs text-zinc-500">(Brand/Origin: ${item.brand} ${item.origin})</span>
      </td>
      <td class="p-3 border-b border-zinc-700 text-right stock-cell">
        <span onclick="openNumpad(this, '${item.id}')" class="bg-zinc-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-600">[ ${item.stock} ]</span>
      </td>
      <td class="p-3 border-b border-zinc-700">${item.um}</td>
      <td class="p-3 border-b border-zinc-700">${item.sup}</td>
    `;
    tbody.appendChild(row);
  });
}

function filterTable() {
  const term = document.getElementById("search").value.toLowerCase();
  const filtered = items.filter(i => 
    i.id.toLowerCase().includes(term) || 
    i.desc.toLowerCase().includes(term) || 
    i.sup.toLowerCase().includes(term)
  );
  renderTable(filtered);
}

// === FLOATING NUMPAD LOGIC ===
let numpadValue = "";
function openNumpad(cell, uid) {
  currentCell = cell; currentUid = uid; numpadValue = "";
  document.getElementById("numpad").style.display = "block";
}

function numpadPress(key) {
  // full logic for + - × ÷ . ⌫ = ENTER (calls SCRIPT_URL ?uid=...&add= or &set= )
  // (complete 80-line numpad handler in the real file)
}

// Drag support + other functions (history, dark mode) included in full file

// Auto load
loadData();
