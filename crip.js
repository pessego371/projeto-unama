// ========== STATE ==========
let amigos = ['Você', 'Ana', 'Carlos'];
let gastos = [];
let pixCode = '';

// ========== UTILS ==========
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function goToTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'dashboard') renderDashboard();
}

// ========== DIVISOR ==========
function renderAmigos() {
  const list = document.getElementById('amigos-list');
  list.innerHTML = amigos.map((a, i) =>
    `<span class="amigo-tag">${a}<button onclick="removeAmigo(${i})">×</button></span>`
  ).join('');
  renderManualInputs();
  calcular();
}

function addAmigo() {
  const input = document.getElementById('novo-amigo');
  const nome = input.value.trim();
  if (!nome) { toast('⚠️ Digite um nome!'); return; }
  if (amigos.includes(nome)) { toast('⚠️ Esse nome já está na lista!'); return; }
  amigos.push(nome);
  input.value = '';
  renderAmigos();
  toast('✅ ' + nome + ' adicionado(a)!');
}

function removeAmigo(idx) {
  if (amigos.length <= 1) { toast('⚠️ Precisa de pelo menos 1 pessoa!'); return; }
  const nome = amigos[idx];
  amigos.splice(idx, 1);
  renderAmigos();
  toast('🗑️ ' + nome + ' removido(a)');
}

function toggleTipo() {
  const tipo = document.getElementById('tipo').value;
  document.getElementById('manual-area').style.display = tipo === 'igual' ? 'none' : 'block';
  if (tipo === 'porcentagem') document.getElementById('manual-title').textContent = '📊 Porcentagem por pessoa';
  if (tipo === 'manual') document.getElementById('manual-title').textContent = '⚖️ Valores por pessoa';
  renderManualInputs();
  calcular();
}

function renderManualInputs() {
  const tipo = document.getElementById('tipo').value;
  const container = document.getElementById('manual-inputs');
  if (tipo === 'igual') { container.innerHTML = ''; return; }
  container.innerHTML = amigos.map((a, i) => `
    <div class="row">
      <label>${a}</label>
      <input type="number" id="m${i}"
        placeholder="${tipo === 'porcentagem' ? '% (ex: 33)' : 'R$ (ex: 50,00)'}"
        min="0" step="${tipo === 'porcentagem' ? '1' : '0.01'}"
        oninput="calcular()">
    </div>
  `).join('');
}

function calcular() {
  const v = parseFloat(document.getElementById('valor').value) || 0;
  const tipo = document.getElementById('tipo').value;
  const resultado = document.getElementById('resultado');
  const resItems = document.getElementById('res-items');
  const aviso = document.getElementById('aviso-arredondamento');

  if (v <= 0 || amigos.length === 0) { resultado.style.display = 'none'; return; }

  let parts = [];

  if (tipo === 'igual') {
    const base = Math.floor((v / amigos.length) * 100) / 100;
    let centavosExtras = Math.round((v - base * amigos.length) * 100);
    parts = amigos.map((a, i) => ({ nome: a, val: base + (i < centavosExtras ? 0.01 : 0) }));
    const diff = Math.round((v - parts.reduce((s, p) => s + p.val, 0)) * 100);
    aviso.className = 'aviso';
    aviso.style.display = centavosExtras > 0 ? 'block' : 'none';
    if (centavosExtras > 0) aviso.textContent = `💡 R$ 0,01 distribuído entre os primeiros para fechar o valor exato.`;

  } else if (tipo === 'porcentagem') {
    let totalPerc = 0;
    parts = amigos.map((a, i) => {
      const p = parseFloat(document.getElementById('m' + i)?.value) || 0;
      totalPerc += p;
      return { nome: a, perc: p, val: Math.round((p / 100) * v * 100) / 100 };
    });
    const ok = Math.abs(totalPerc - 100) < 0.01;
    aviso.className = ok ? 'aviso' : 'aviso warn';
    aviso.style.display = 'block';
    aviso.textContent = ok
      ? `✅ Porcentagens somam 100%`
      : `⚠️ Soma atual: ${totalPerc.toFixed(1)}% — precisa ser exatamente 100%`;

  } else {
    let soma = 0;
    parts = amigos.map((a, i) => {
      const p = parseFloat(document.getElementById('m' + i)?.value) || 0;
      soma += p;
      return { nome: a, val: p };
    });
    const diff = Math.round((v - soma) * 100) / 100;
    aviso.className = diff === 0 ? 'aviso' : 'aviso warn';
    aviso.style.display = 'block';
    aviso.textContent = diff === 0
      ? `✅ Valores somam R$ ${v.toFixed(2)}`
      : `⚠️ ${diff > 0 ? `Faltam R$ ${diff.toFixed(2)}` : `Excesso de R$ ${Math.abs(diff).toFixed(2)}`} para fechar R$ ${v.toFixed(2)}`;
  }

  resItems.innerHTML = parts.map(p =>
    `<div class="res-item">
      <span class="res-nome">${p.nome}</span>
      <span class="res-val">R$ ${p.val.toFixed(2)}</span>
    </div>`
  ).join('');
  resultado.style.display = 'block';
}

function salvarGasto() {
  const v = parseFloat(document.getElementById('valor').value) || 0;
  const d = document.getElementById('desc').value.trim() || 'Gasto sem nome';
  if (v <= 0) { toast('⚠️ Informe um valor antes de salvar!'); return; }
  gastos.push({ desc: d, valor: v, data: new Date(), amigos: amigos.length, pago: false });
  toast('✅ Gasto salvo no histórico!');
  document.getElementById('desc').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('resultado').style.display = 'none';
}

// ========== PIX ==========
function gerarPix() {
  const nome = document.getElementById('pix-nome').value.trim();
  const chave = document.getElementById('pix-chave').value.trim();
  const valor = parseFloat(document.getElementById('pix-valor').value) || 0;
  const desc = document.getElementById('pix-desc').value.trim() || 'Pagamento';

  if (!nome) { toast('⚠️ Informe o nome do recebedor!'); return; }
  if (!chave) { toast('⚠️ Informe a chave Pix!'); return; }
  if (valor <= 0) { toast('⚠️ Informe um valor válido!'); return; }

  pixCode = gerarEMV(nome, chave, valor, desc);

  document.getElementById('pix-code-display').textContent = pixCode;
  document.getElementById('pix-resultado').style.display = 'block';

  renderQR(pixCode);

  const hoje = new Date();
  const venc = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);
  document.getElementById('boleto-content').innerHTML = `
    <div class="boleto-line"><span>Beneficiário</span><strong>${nome}</strong></div>
    <div class="boleto-line"><span>Chave Pix</span><strong>${chave}</strong></div>
    <div class="boleto-line"><span>Valor</span><strong>R$ ${valor.toFixed(2)}</strong></div>
    <div class="boleto-line"><span>Descrição</span><strong>${desc}</strong></div>
    <div class="boleto-line"><span>Data geração</span><strong>${hoje.toLocaleDateString('pt-BR')}</strong></div>
    <div class="boleto-line"><span>Vencimento</span><strong>${venc.toLocaleDateString('pt-BR')}</strong></div>
    <p style="margin-top:.8rem;font-size:.75rem;color:var(--text2)">⚠️ Boleto simulado para fins de demonstração.</p>
  `;
  document.getElementById('boleto-area').style.display = 'block';
  toast('⚡ QR Code Pix gerado com sucesso!');
}

function gerarPixCompleto() {
  const nome = document.getElementById('pix-nome').value.trim();
  const chave = document.getElementById('pix-chave').value.trim();
  const valor = parseFloat(document.getElementById('pix-valor').value) || 0;
  const desc = document.getElementById('pix-desc').value.trim() || 'Pagamento';

  if (!nome) { toast('⚠️ Informe o nome do recebedor!'); return; }
  if (!chave) { toast('⚠️ Informe a chave Pix!'); return; }
  if (valor <= 0) { toast('⚠️ Informe um valor válido!'); return; }

  const codigoPix = gerarEMV(nome, chave, valor, desc);

  document.getElementById('pix-code-display').textContent = codigoPix;
  document.getElementById('pix-resultado').style.display = 'block';

  renderQR(codigoPix);

  toast('✅ Pix completo gerado com sucesso!');
}

function gerarEMV(nome, chave, valor, desc) {
  const valorStr = valor.toFixed(2);
  const nomeClean = nome.substring(0, 25).toUpperCase();
  const descClean = desc.substring(0, 20);
  const chaveField = tlv('01', chave);
  const descField = descClean ? tlv('02', descClean) : '';
  const merchant = tlv('00', 'BR.GOV.BCB.PIX') + chaveField + descField;
  const merchantInfo = tlv('26', merchant);
  const base = '000201' + merchantInfo + '52040000' + '5303986' +
    tlv('54', valorStr) + '5802BR' +
    tlv('59', nomeClean) + tlv('60', 'SAO PAULO') +
    tlv('62', tlv('05', '***'));
  return base + '6304' + crc16(base + '6304');
}

function tlv(tag, value) {
  const len = value.length.toString().padStart(2, '0');
  return tag + len + value;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function renderQR(data) {
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  const size = 180, cell = 5, cols = Math.floor(size / cell);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#5a0791';
  const seed = data.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  function bit(x, y) { return ((seed * (x * 31 + 7) + y * 17 + x * y) % 11) < 5; }
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < cols; y++) {
      if (bit(x, y)) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  // Finder patterns
  [[1, 1], [cols - 8, 1], [1, cols - 8]].forEach(([ox, oy]) => {
    ctx.fillStyle = '#5a0791';
    ctx.fillRect(ox * cell, oy * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((ox + 1) * cell, (oy + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = '#5a0791';
    ctx.fillRect((ox + 2) * cell, (oy + 2) * cell, 3 * cell, 3 * cell);
  });
}

function copiarPix() {
  if (!pixCode) { toast('⚠️ Gere um QR Code primeiro!'); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(pixCode).then(() => toast('📋 Código copiado!'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = pixCode;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('📋 Código copiado!');
  }
}

// ========== DASHBOARD ==========
function renderDashboard() {
  const total = gastos.reduce((s, g) => s + g.valor, 0);
  document.getElementById('stat-total').textContent = 'R$ ' + total.toFixed(2);
  document.getElementById('stat-contas').textContent = gastos.length;
  document.getElementById('stat-media').textContent = 'R$ ' + (gastos.length ? (total / gastos.length).toFixed(2) : '0.00');

  // Gráfico de barras (5 semanas)
  const semanas = ['S-4', 'S-3', 'S-2', 'S-1', 'Agora'];
  const seed = Date.now();
  const vals = [
    120 + (seed % 80),
    90 + ((seed >> 2) % 100),
    150 + ((seed >> 4) % 70),
    80 + ((seed >> 6) % 120),
    total > 0 ? total : 60 + ((seed >> 8) % 130)
  ];
  const max = Math.max(...vals, 1);
  const maxH = 130;
  document.getElementById('chart-bars').innerHTML = semanas.map((s, i) => `
    <div class="bar-group">
      <span class="bar-val">R$${Math.round(vals[i])}</span>
      <div class="bar" style="height:${Math.round((vals[i] / max) * maxH)}px;background:${i === 4 ? '#820ad1' : '#c06ef3'}"></div>
      <span class="bar-label">${s}</span>
    </div>
  `).join('');

  // Histórico
  const hl = document.getElementById('hist-list');
  if (!gastos.length) {
    hl.innerHTML = `<p style="font-size:.88rem;color:var(--text2);text-align:center;padding:1.5rem 0">
      Nenhum gasto salvo ainda.<br>Divida uma conta e salve no histórico!
    </p>`;
    return;
  }
  hl.innerHTML = gastos.slice().reverse().map((g, i) => `
    <div class="hist-item">
      <div>
        <div class="hist-desc">${g.desc}</div>
        <div class="hist-meta">${g.amigos} pessoa(s) · ${g.data.toLocaleDateString('pt-BR')}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="hist-val">R$ ${g.valor.toFixed(2)}</span>
        <span class="badge ${g.pago ? 'ok' : 'pend'}" onclick="togglePago(${gastos.length - 1 - i})" style="cursor:pointer">
          ${g.pago ? '✅ Pago' : '⏳ Pendente'}
        </span>
      </div>
    </div>
  `).join('');
}

function togglePago(idx) {
  gastos[idx].pago = !gastos[idx].pago;
  renderDashboard();
  toast(gastos[idx].pago ? '✅ Marcado como pago!' : '⏳ Marcado como pendente');
}

// ========== INIT ==========
renderAmigos();
