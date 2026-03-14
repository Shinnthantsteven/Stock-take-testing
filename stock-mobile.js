// ================================================
// stock-mobile.js - FULL WORKING VERSION v3.5
// ================================================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9op7Pj91-YsnQm0Bj5F9KYF7uqWSLr9g4v-JSzfmUSRGAKE_oVtGwMNKHzX90JAfi/exec";

const firebaseConfig = { databaseURL: "https://chef2chef-stock-default-rtdb.firebaseio.com" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("stock");

let items = [], currentUid = null, currentCell = null, numpadValue = "", isDragging = false, offsetX = 0, offsetY = 0;

async function loadData() {
  const res = await fetch(SCRIPT_URL + "?action=getAll");
  const data = await res.json();
  items = data.items || [];
  renderTable();
  // Realtime Firebase listener (secret sauce)
  db.on("child_changed", snap => updateSingleRow(snap.key, snap.val()));
}

function renderTable(filtered = items) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  filtered.slice(0, 30).forEach(item => {
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

function openNumpad(cell, uid) {
  currentCell = cell; currentUid = uid; numpadValue = "";
  const numpad = document.getElementById("numpad");
  numpad.style.display = "block";
  numpad.style.bottom = "20px"; numpad.style.right = "20px";
}

function numpadPress(key) {
  if (key === "back") {
    numpadValue = numpadValue.slice(0, -1) || "0";
  } else if (key === "=") {
    if (numpadValue && numpadValue !== "0") sendToServer(numpadValue);
  } else {
    numpadValue = (numpadValue === "0" && !"+-×÷".includes(key)) ? key : numpadValue + key;
  }
}

async function sendToServer(value) {
  const res = await fetch(`${SCRIPT_URL}?uid=${encodeURIComponent(currentUid)}&add=${encodeURIComponent(value)}&source=mobile`);
  const data = await res.json();
  if (data.ok) {
    currentCell.textContent = `[ ${data.newVal} ]`;
    document.getElementById("numpad").style.display = "none";
  }
}

function updateSingleRow(safeKey, val) {
  const item = items.find(i => i.id.replace(/[.#$[\]]/g, '_') === safeKey);
  if (!item) return;
  item.stock = parseFloat(val.qty) || 0;
  renderTable();
}

// DRAG NUMPAD
const numpadEl = document.getElementById("numpad");
document.querySelector(".drag-handle").addEventListener("mousedown", startDrag);
document.querySelector(".drag-handle").addEventListener("touchstart", startDrag, {passive: true});

function startDrag(e) {
  isDragging = true;
  const rect = numpadEl.getBoundingClientRect();
  offsetX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
}

document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove, {passive: true});
document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);

function dragMove(e) {
  if (!isDragging) return;
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - offsetX;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - offsetY;
  numpadEl.style.left = Math.max(0, Math.min(window.innerWidth - numpadEl.offsetWidth, x)) + "px";
  numpadEl.style.top = Math.max(0, Math.min(window.innerHeight - numpadEl.offsetHeight, y)) + "px";
  numpadEl.style.bottom = "auto";
}

function stopDrag() { isDragging = false; }

// Dark mode toggle
function toggleDark() {
  document.documentElement.style.setProperty('--tw-bg-opacity', document.body.style.background === '#111827' ? '1' : '0');
  document.body.style.background = document.body.style.background === '#111827' ? '#f8fafc' : '#111827';
}

// History modal (simple)
function showHistory() {
  alert("📋 Full history coming in next update (real-time from Google Sheet)");
}

// Auto load
loadData();
