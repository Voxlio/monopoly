const firebaseConfig = {
  apiKey: "AIzaSyCa6NN5z-4h0zeB3VLm2shPRPqqj4WBQ4w",
  authDomain: "naija-monopoly.firebaseapp.com",
  databaseURL: "https://naija-monopoly-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "naija-monopoly",
  storageBucket: "naija-monopoly.firebasestorage.app",
  messagingSenderId: "408039686831",
  appId: "1:408039686831:web:1839b9bbed59e3ce6a4a5a"
};

firebase.initializeApp(firebaseConfig);
const dbFS = firebase.firestore();

(function(){

const TOKEN_COLORS = ['#c1392b','#1c3f7a','#e2b83a','#2f9e58','#8a5a3b','#d9538b'];
const N = 200;
const spaces = [
  {i:0, type:'go', name:'GO', sub:'Collect ₦200k'},
  {i:1, type:'prop', name:'Zamfara', group:'brown', price:60, rent:[2,10,30,90,160,250], houseCost:50},
  {i:2, type:'chest', name:'Owambe Card'},
  {i:3, type:'prop', name:'Kebbi', group:'brown', price:60, rent:[4,20,60,180,320,450], houseCost:50},
  {i:4, type:'tax', name:'Tax Man (LIRS)', amount:200},
  {i:5, type:'rr', name:'Lagos Motor Park', price:200},
  {i:6, type:'prop', name:'Yobe', group:'lightblue', price:100, rent:[6,30,90,270,400,550], houseCost:50},
  {i:7, type:'chance', name:'Wahala Card'},
  {i:8, type:'prop', name:'Borno', group:'lightblue', price:100, rent:[6,30,90,270,400,550], houseCost:50},
  {i:9, type:'prop', name:'Gombe', group:'lightblue', price:120, rent:[8,40,100,300,450,600], houseCost:50},
  {i:10, type:'jail', name:'EFCC Detention', sub:'Just Visiting'},
  {i:11, type:'prop', name:'Kogi', group:'pink', price:140, rent:[10,50,150,450,625,750], houseCost:100},
  {i:12, type:'util', name:'NEPA Power', price:150},
  {i:13, type:'prop', name:'Kwara', group:'pink', price:140, rent:[10,50,150,450,625,750], houseCost:100},
  {i:14, type:'prop', name:'Niger', group:'pink', price:160, rent:[12,60,180,500,700,900], houseCost:100},
  {i:15, type:'rr', name:'Kano Motor Park', price:200},
  {i:16, type:'prop', name:'Bayelsa', group:'orange', price:180, rent:[14,70,200,550,750,950], houseCost:100},
  {i:17, type:'chest', name:'Owambe Card'},
  {i:18, type:'prop', name:'Cross River', group:'orange', price:180, rent:[14,70,200,550,750,950], houseCost:100},
  {i:19, type:'prop', name:'Akwa Ibom', group:'orange', price:200, rent:[16,80,220,600,800,1000], houseCost:100},
  {i:20, type:'parking', name:'Village Square', sub:'Free Parking'},
  {i:21, type:'prop', name:'Delta', group:'red', price:220, rent:[18,90,250,700,875,1050], houseCost:150},
  {i:22, type:'chance', name:'Wahala Card'},
  {i:23, type:'prop', name:'Edo', group:'red', price:220, rent:[18,90,250,700,875,1050], houseCost:150},
  {i:24, type:'prop', name:'Rivers', group:'red', price:240, rent:[20,100,300,750,925,1100], houseCost:150},
  {i:25, type:'rr', name:'PH Motor Park', price:200},
  {i:26, type:'prop', name:'Enugu', group:'yellow', price:260, rent:[22,110,330,800,975,1150], houseCost:150},
  {i:27, type:'prop', name:'Anambra', group:'yellow', price:260, rent:[22,110,330,800,975,1150], houseCost:150},
  {i:28, type:'util', name:'Water Corp', price:150},
  {i:29, type:'prop', name:'Abia', group:'yellow', price:280, rent:[24,120,360,850,1025,1200], houseCost:150},
  {i:30, type:'gotojail', name:'Go To EFCC'},
  {i:31, type:'prop', name:'Ogun', group:'green', price:300, rent:[26,130,390,900,1100,1275], houseCost:200},
  {i:32, type:'prop', name:'Oyo', group:'green', price:300, rent:[26,130,390,900,1100,1275], houseCost:200},
  {i:33, type:'chest', name:'Owambe Card'},
  {i:34, type:'prop', name:'Osun', group:'green', price:320, rent:[28,150,450,1000,1200,1400], houseCost:200},
  {i:35, type:'rr', name:'Onitsha Motor Park', price:200},
  {i:36, type:'chance', name:'Wahala Card'},
  {i:37, type:'prop', name:'Lagos', group:'darkblue', price:350, rent:[35,175,500,1100,1300,1500], houseCost:200},
  {i:38, type:'tax', name:'Customs Duty', amount:100},
  {i:39, type:'prop', name:'FCT Abuja', group:'darkblue', price:400, rent:[50,200,600,1400,1700,2000], houseCost:200},
];

const groupCounts = {};
spaces.forEach(s=>{ if(s.group){ groupCounts[s.group] = (groupCounts[s.group]||0)+1; } });
const groupOrder = ['brown','lightblue','pink','orange','red','yellow','green','darkblue'];

const chanceCards = [
  {text:"Fuel scarcity dey bite hard. Skip your next turn.", effect:p=>p.skipTurn=true},
  {text:"You won Big Brother Naija! Collect ₦200k.", effect:p=>p.cash+=200000},
  {text:"NEPA brought light with no warning — advance to GO and collect ₦200k.", effect:(p,st)=>advanceTo(p,0,true,st)},
  {text:"Okada accident. Pay ₦100k hospital bill.", effect:p=>p.cash-=100000},
  {text:"Your jollof rice won 'Best in West Africa'. Collect ₦100k from every player.", effect:(p,st)=>collectFromAll(p,st,100)},
  {text:"EFCC wants to ask you a few questions. Go directly to jail.", effect:(p,st)=>goToJail(p,st)},
  {text:"Land prices don rise for Lagos — advance directly there.", effect:(p,st)=>advanceTo(p, spaces.findIndex(s=>s.name==='Lagos'), true, st)},
  {text:"You got a promotion at work. Collect ₦150k.", effect:p=>p.cash+=150000},
  {text:"Danfo bus broke down again. Pay ₦75k for repairs.", effect:p=>p.cash-=75000},
  {text:"JAMB result came out fine — collect a ₦100k scholarship.", effect:p=>p.cash+=100000},
  {text:"Go back 3 spaces.", effect:(p,st)=>advanceTo(p, ((p.pos-3)+40)%40, false, st)},
  {text:"Pay each player ₦50k for petrol money.", effect:(p,st)=>payAll(p,st,50)},
];
const chestCards = [
  {text:"Your uncle for village sent money. Collect ₦300k.", effect:p=>p.cash+=300000},
  {text:"Naming ceremony ohh! Spend ₦100k on aso-ebi.", effect:p=>p.cash-=100000},
  {text:"Your small business dey boom. Collect ₦250k.", effect:p=>p.cash+=250000},
  {text:"School fees don land. Pay ₦200k.", effect:p=>p.cash-=200000},
  {text:"Christmas don reach — collect ₦50k from every player.", effect:(p,st)=>collectFromAll(p,st,50)},
  {text:"You hammered in Baba Ijebu! Collect ₦400k.", effect:p=>p.cash+=400000},
  {text:"Generator don spoil again. Pay ₦150k for repair.", effect:p=>p.cash-=150000},
  {text:"Church harvest offering. Donate ₦100k.", effect:p=>p.cash-=100000},
  {text:"Wedding owambe gift money. Collect ₦150k.", effect:p=>p.cash+=150000},
  {text:"Land inheritance from grandpa. Collect ₦500k.", effect:p=>p.cash+=500000},
  {text:"You are the star of the naming list — collect ₦100k.", effect:p=>p.cash+=100000},
  {text:"Get out of jail free — keep this card.", effect:p=>p.getOutOfJail=true},
];

function advanceTo(p, idx, passGo, st){
  if(passGo && idx <= p.pos){ 
    p.cash += N*1000; 
    st.log.push(`${p.name} passed GO and collected ₦${N}k.`);
  }
  p.pos = idx;
  if(st) resolveSpace(st, p, true);
}

function goToJail(p, st){ 
  p.pos = 10; 
  p.inJail = true; 
  p.jailTurns = 0; 
  if(st) st.log.push(`${p.name} has been sent straight to EFCC Detention!`);
}

function payAll(p, st, amountK){ 
  st.players.forEach(o=>{ 
    if(o.id!==p.id && !o.bankrupt){ 
      p.cash -= amountK*1000; 
      o.cash += amountK*1000; 
    } 
  }); 
}

function collectFromAll(p, st, amountK){ 
  st.players.forEach(o=>{ 
    if(o.id!==p.id && !o.bankrupt){ 
      o.cash -= amountK*1000; 
      p.cash += amountK*1000; 
      checkBankruptcy(st, o);
    } 
  }); 
}

function playerOwnsFullGroup(playerId, ownership, group){
  const total = groupCounts[group];
  const owned = spaces.filter(s=>s.group===group && ownership[s.i] && ownership[s.i].owner===playerId && !ownership[s.i].isMortgaged).length;
  return owned === total;
}

function uid(){
  let id = localStorage.getItem('nm_playerId');
  if(!id){ id = 'p_' + Math.random().toString(36).slice(2,10); localStorage.setItem('nm_playerId', id); }
  return id;
}
const myId = uid();

let mode = 'create';
let selectedColor = TOKEN_COLORS[0];
const tokenRow = document.getElementById('tokenRow');
TOKEN_COLORS.forEach(c=>{
  const d = document.createElement('div');
  d.className = 'token-choice' + (c===selectedColor?' selected':'');
  d.style.background = c;
  d.onclick = ()=>{ selectedColor = c; document.querySelectorAll('.token-choice').forEach(el=>el.classList.remove('selected')); d.classList.add('selected'); };
  tokenRow.appendChild(d);
});

document.getElementById('tabCreate').onclick = ()=>{
  mode='create';
  document.getElementById('tabCreate').classList.add('active');
  document.getElementById('tabJoin').classList.remove('active');
  document.getElementById('joinCodeWrap').style.display='none';
  document.getElementById('landingActionBtn').textContent = 'Create Room';
};
document.getElementById('tabJoin').onclick = ()=>{
  mode='join';
  document.getElementById('tabJoin').classList.add('active');
  document.getElementById('tabCreate').classList.remove('active');
  document.getElementById('joinCodeWrap').style.display='block';
  document.getElementById('landingActionBtn').textContent = 'Join Room';
};

function randomCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for(let i=0;i<4;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

let roomCode = null;
let unsubscribe = null;
let latestState = null;
let auctionInterval = null;

document.getElementById('landingActionBtn').onclick = async function(){
  const errEl = document.getElementById('landingErr');
  errEl.textContent = '';
  const name = document.getElementById('nameInput').value.trim();
  if(!name){ errEl.textContent = 'Enter your name first.'; return; }

  if(mode==='create'){
    const code = randomCode();
    const newPlayer = { id: myId, name, color: selectedColor, pos:0, cash:1500000, properties:[], inJail:false, jailTurns:0, skipTurn:false, getOutOfJail:false, bankrupt:false };
    const initialState = {
      status:'lobby', hostId: myId, players:[newPlayer], ownership:{}, currentIdx:0,
      doublesCount:0, log:[`Room created by ${name}.`], winner:null, lastDice:null, turnPhase:'awaiting_roll',
      tradeOffer: null, auction: null
    };
    try{
      await dbFS.collection('rooms').doc(code).set(initialState);
      roomCode = code;
      localStorage.setItem('nm_room', code);
      enterLobby(code);
    }catch(e){ errEl.textContent = 'Could not create room: ' + e.message; }
  } else {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if(!code){ errEl.textContent = 'Enter a room code.'; return; }
    try{
      const ref = dbFS.collection('rooms').doc(code);
      const snap = await ref.get();
      if(!snap.exists){ errEl.textContent = 'No room with that code.'; return; }
      const state = snap.data();
      if(state.status !== 'lobby'){ errEl.textContent = 'That game has already started.'; return; }
      if(state.players.length >= 6){ errEl.textContent = 'Room is full (6 max).'; return; }
      if(!state.players.find(p=>p.id===myId)){
        const newPlayer = { id: myId, name, color: selectedColor, pos:0, cash:1500000, properties:[], inJail:false, jailTurns:0, skipTurn:false, getOutOfJail:false, bankrupt:false };
        state.players.push(newPlayer);
        state.log.push(`${name} joined the room.`);
        await ref.set(state);
      }
      roomCode = code;
      localStorage.setItem('nm_room', code);
      enterLobby(code);
    }catch(e){ errEl.textContent = 'Could not join room: ' + e.message; }
  }
};

function enterLobby(code){
  document.getElementById('landing').style.display = 'none';
  document.getElementById('lobby').style.display = 'block';
  document.getElementById('roomCodeBig').textContent = code;
  document.getElementById('roomCodeBig').onclick = ()=>{
    navigator.clipboard && navigator.clipboard.writeText(code);
  };
  subscribeRoom(code);
}

function subscribeRoom(code){
  if(unsubscribe) unsubscribe();
  unsubscribe = dbFS.collection('rooms').doc(code).onSnapshot(snap=>{
    document.getElementById('connStatus').textContent = 'online ✓ live';
    if(!snap.exists) return;
    latestState = snap.data();
    if(latestState.status === 'lobby'){
      renderLobby(latestState);
    } else {
      if(document.getElementById('gameScreen').style.display !== 'block'){
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        buildBoard();
      }
      renderGame(latestState);
    }
  }, err=>{
    document.getElementById('connStatus').textContent = 'connection error';
  });
}

function renderLobby(state){
  const wrap = document.getElementById('lobbyPlayers');
  wrap.innerHTML = '';
  state.players.forEach(p=>{
    const row = document.createElement('div');
    row.className = 'lobby-player-row';
    row.innerHTML = `<span class="swatch" style="background:${p.color}"></span>${p.name}${p.id===state.hostId?' (host)':''}${p.id===myId?' — you':''}`;
    wrap.appendChild(row);
  });
  const startBtn = document.getElementById('startGameBtn');
  const note = document.getElementById('lobbyNote');
  if(state.hostId === myId){
    startBtn.style.display = 'block';
    startBtn.disabled = state.players.length < 2;
    note.textContent = state.players.length < 2 ? 'Need at least 2 players to start.' : 'Ready when you are!';
  } else {
    startBtn.style.display = 'none';
    note.textContent = 'Waiting for the host to start the game…';
  }
}

document.getElementById('startGameBtn').onclick = async function(){
  if(!latestState || latestState.hostId !== myId) return;
  const state = latestState;
  state.status = 'active';
  state.turnPhase = 'awaiting_roll';
  state.log.push(`Game started with ${state.players.length} players. ${state.players[0].name} goes first.`);
  await dbFS.collection('rooms').doc(roomCode).set(state);
};

const boardEl = document.getElementById('board');
function gridPosFor(i){
  let row, col;
  if(i<=10){ row=11; col = i===0 ? 11 : (11-i); }
  else if(i<=20){ col=1; row = 11-(i-10); }
  else if(i<=30){ row=1; col = 1+(i-20); }
  else { col=11; row = 1+(i-30); }
  return {row,col};
}
const ICONS = { go:'➡️', jail:'🚔', parking:'🌳', gotojail:'👮', tax:'💸', chance:'❓', chest:'🎁', rr:'🚌', util:'💡' };

let boardBuilt = false;
function buildBoard(){
  if(boardBuilt) return;
  boardBuilt = true;
  boardEl.innerHTML = '';
  const center = document.createElement('div');
  center.id = 'center';
  center.innerHTML = `<h2>NAIJA<br>MONOPOLY</h2><div class="sub">36 states + Abuja</div><div class="roomtag">Room ${roomCode}</div>`;
  boardEl.appendChild(center);
  spaces.forEach(s=>{
    const {row,col} = gridPosFor(s.i);
    const cell = document.createElement('div');
    cell.id = `cell-${s.i}`;
    cell.style.gridRow = row; cell.style.gridColumn = col;
    const isCorner = [0,10,20,30].includes(s.i);
    cell.className = 'cell' + (isCorner ? ' corner' : '');
    if(s.type==='prop'){
      cell.innerHTML = `<div class="band ${s.group}"></div>
        <div class="body"><div class="name">${s.name}</div><div class="price">₦${s.price}k</div></div>
        <div class="houses" id="houses-${s.i}"></div>
        <div class="owner-dot" id="dot-${s.i}" style="display:none;"></div>`;
    } else if(isCorner){
      cell.innerHTML = `<div class="icon">${ICONS[s.type]||''}</div><div class="name">${s.name}</div>${s.sub?`<div class="price">${s.sub}</div>`:''}`;
    } else {
      cell.innerHTML = `<div class="body" style="align-items:center; text-align:center; justify-content:center;">
          <div class="icon">${ICONS[s.type]||''}</div><div class="name">${s.name}</div>
          ${s.price?`<div class="price">₦${s.price}k</div>`:''}
          ${s.amount?`<div class="price">Pay ₦${s.amount}k</div>`:''}</div>`;
    }
    const tokLayer = document.createElement('div');
    tokLayer.className = 'tokens-in-cell'; tokLayer.id = `tokens-${s.i}`;
    cell.appendChild(tokLayer);
    boardEl.appendChild(cell);
  });
}

function renderGame(state){
  if(state.status === 'over'){
    showWin(state);
  }
  spaces.forEach(s=>{ const l=document.getElementById(`tokens-${s.i}`); if(l) l.innerHTML=''; });
  state.players.forEach(p=>{
    if(p.bankrupt) return;
    const l = document.getElementById(`tokens-${p.pos}`);
    if(l){ const t=document.createElement('div'); t.className='token'; t.style.background=p.color; l.appendChild(t); }
  });
  spaces.forEach(s=>{
    const cell = document.getElementById(`cell-${s.i}`);
    if(!cell) return;
    const own = state.ownership[s.i];
    if(own && own.isMortgaged){
      cell.classList.add('mortgaged-cell');
    } else {
      cell.classList.remove('mortgaged-cell');
    }

    if(s.type!=='prop') return;
    const dot = document.getElementById(`dot-${s.i}`);
    const houseWrap = document.getElementById(`houses-${s.i}`);
    if(own){
      dot.style.display='block'; dot.style.background = own.ownerColor;
      houseWrap.innerHTML='';
      if(own.houses===5){ houseWrap.innerHTML = `<span class="hotel"></span>`; }
      else { for(let h=0;h<own.houses;h++){ houseWrap.innerHTML += `<span></span>`; } }
    } else { dot.style.display='none'; houseWrap.innerHTML=''; }
  });

  const wrap = document.getElementById('players');
  wrap.innerHTML = '';
  state.players.forEach((p,idx)=>{
    const card = document.createElement('div');
    card.className = 'player-card' + (idx===state.currentIdx?' current':'') + (p.bankrupt?' bankrupt':'') + (p.id===myId?' me':'');
    const ownedNames = p.properties.map(i=>{
      const m = state.ownership[i] && state.ownership[i].isMortgaged ? ' (M)' : '';
      return spaces[i].name + m;
    }).join(', ') || '—';
    card.innerHTML = `<div class="row1"><span class="swatch" style="width:16px;height:16px;background:${p.color}"></span>${p.name}${p.id===myId?' (you)':''}${p.inJail?' 🚔':''}</div>
      <div class="cash">₦${(p.cash/1000).toLocaleString()}k</div>
      <div class="props">${ownedNames}</div>`;
    wrap.appendChild(card);
  });

  const logEl = document.getElementById('log');
  logEl.innerHTML = '';
  (state.log||[]).slice(-30).forEach(msg=>{ const d=document.createElement('div'); d.textContent=msg; logEl.prepend(d); });
  const current = state.players[state.currentIdx];
  const banner = document.getElementById('turnBanner');
  const isMyTurn = current && current.id === myId && !current.bankrupt && state.status==='active';
  banner.textContent = current ? (isMyTurn ? "It's YOUR turn!" : `Waiting for ${current.name}…`) : '';
  const diceArea = document.getElementById('diceArea');
  diceArea.innerHTML = state.lastDice ? `<div class="die">${state.lastDice[0]}</div><div class="die">${state.lastDice[1]}</div>` : '';

  if(state._pendingCard && state._pendingCard.playerId === myId){
    showCardModal(state._pendingCard);
  } else if(state.tradeOffer && state.tradeOffer.toId === myId){
    showTradeOfferModal(state);
  } else if(state.auction && state.auction.active){
    handleAuctionUI(state);
  } else if(!state._pendingCard && (!state.tradeOffer || state.tradeOffer.toId !== myId) && (!state.auction || !state.auction.active)) {
    const modal = document.getElementById('modal');
    if(!modal.dataset.localOpen){
      document.getElementById('modalOverlay').style.display = 'none';
    }
  }

  renderActionButtons(state, isMyTurn);
}

function showCardModal(card){
  const modal = document.getElementById('modal');
  modal.removeAttribute('data-local-open');
  modal.innerHTML = `
    <div class="card-illustration">${card.type === 'Wahala Card' ? '❓' : '🎁'}</div>
    <h3>${card.type}</h3>
    <p>${card.text}</p>
    <div class="modal-btns">
      <button class="primary" id="dismissCardBtn">Acknowledge</button>
    </div>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';
  document.getElementById('dismissCardBtn').onclick = async ()=>{
    delete latestState._pendingCard;
    document.getElementById('modalOverlay').style.display = 'none';
    await saveState(latestState);
  };
}

async function saveState(state){
  await dbFS.collection('rooms').doc(roomCode).set(state);
}

const actionButtons = document.getElementById('actionButtons');

function renderActionButtons(state, isMyTurn){
  actionButtons.innerHTML = '';
  if(state.status !== 'active') return;

  const me = state.players.find(p => p.id === myId);
  if(me && !me.bankrupt){
    const tradeBtn = document.createElement('button');
    tradeBtn.textContent = '🤝 Propose Trade';
    tradeBtn.onclick = () => openTradeModal(state);
    actionButtons.appendChild(tradeBtn);

    const mortBtn = document.createElement('button');
    mortBtn.textContent = '🏦 Mortgage / Unmortgage';
    mortBtn.onclick = () => openMortgageModal(state);
    actionButtons.appendChild(mortBtn);
  }

  if(!isMyTurn) return;
  const p = state.players[state.currentIdx];

  if(!state.turnPhase || state.turnPhase === 'awaiting_roll'){
    const rollBtn = document.createElement('button');
    rollBtn.className='buy';
    rollBtn.textContent = '🎲 Roll Dice';
    rollBtn.onclick = ()=>doRoll(state);
    actionButtons.appendChild(rollBtn);
    return;
  }

  if(state.turnPhase === 'awaiting_end'){
    const s = spaces[p.pos];
    if((s.type==='prop'||s.type==='rr'||s.type==='util') && !state.ownership[s.i]){
      const buyBtn = document.createElement('button');
      buyBtn.className='buy';
      buyBtn.textContent = `Buy ${s.name} — ₦${s.price}k`;
      buyBtn.disabled = p.cash < s.price*1000;
      buyBtn.onclick = ()=>doBuy(state, s);
      actionButtons.appendChild(buyBtn);

      const passBtn = document.createElement('button');
      passBtn.className='danger';
      passBtn.textContent = `Pass to Auction`;
      passBtn.onclick = ()=>startAuction(state, s.i);
      actionButtons.appendChild(passBtn);
    }

    groupOrder.forEach(g=>{
      if(playerOwnsFullGroup(p.id, state.ownership, g)){
        spaces.filter(sp=>sp.group===g).forEach(sp=>{
          const own = state.ownership[sp.i];
          if(own && own.houses<5 && !own.isMortgaged){
            const btn = document.createElement('button');
            btn.className='build';
            const label = own.houses===4 ? 'hotel' : `house #${own.houses+1}`;
            btn.textContent = `Build ${label} on ${sp.name} — ₦${sp.houseCost}k`;
            btn.disabled = p.cash < sp.houseCost*1000;
            btn.onclick = ()=>doBuild(state, sp, own);
            actionButtons.appendChild(btn);
          }
        });
      }
    });

    if(p.inJail){
      if(p.getOutOfJail){
        const b = document.createElement('button');
        b.textContent = 'Use "Get Out of Jail Free" card';
        b.onclick = async ()=>{ 
          p.getOutOfJail=false; p.inJail=false; p.jailTurns=0; 
          state.log.push(`${p.name} used a Get Out of Jail Free card.`); 
          await saveState(state); 
        };
        actionButtons.appendChild(b);
      }
      const b2 = document.createElement('button');
      b2.textContent = 'Pay ₦50k bail';
      b2.disabled = p.cash < 50000;
      b2.onclick = async ()=>{ 
        p.cash-=50000; p.inJail=false; p.jailTurns=0; 
        state.log.push(`${p.name} paid ₦50k bail.`); 
        await saveState(state); 
      };
      actionButtons.appendChild(b2);
    }

    const endBtn = document.createElement('button');
    if(state.doublesCount > 0 && !p.inJail){
      endBtn.className = 'buy';
      endBtn.textContent = '🎲 Roll Again (Doubles!)';
      endBtn.onclick = async ()=>{
        state.turnPhase = 'awaiting_roll';
        await saveState(state);
      };
    } else {
      endBtn.textContent = 'End Turn';
      endBtn.onclick = ()=>doEndTurn(state);
    }
    actionButtons.appendChild(endBtn);
  }
}

function checkBankruptcy(state, p){
  if(p.cash < 0 && !p.bankrupt){
    p.bankrupt = true;
    state.log.push(`💀 ${p.name} went bankrupt and is eliminated!`);
    p.properties.forEach(i=>{ delete state.ownership[i]; });
    p.properties = [];
    const alive = state.players.filter(x=>!x.bankrupt);
    if(alive.length===1){ state.status='over'; state.winner = alive[0].id; }
  }
}

async function doRoll(state){
  const p = state.players[state.currentIdx];
  if(p.skipTurn){
    p.skipTurn = false;
    state.log.push(`${p.name} skipped turn due to fuel scarcity.`);
    return doEndTurn(state);
  }
  const d1 = 1+Math.floor(Math.random()*6), d2 = 1+Math.floor(Math.random()*6);
  state.lastDice = [d1,d2];
  const isDouble = d1===d2;

  if(p.inJail){
    if(isDouble){
      p.inJail=false; p.jailTurns=0;
      state.log.push(`${p.name} rolled doubles and broke out of EFCC Detention!`);
      movePlayer(state, p, d1+d2);
    } else {
      p.jailTurns++;
      if(p.jailTurns>=3){
        p.cash -= 50000; p.inJail=false; p.jailTurns=0;
        state.log.push(`${p.name} paid ₦50k bail after 3 failed attempts.`);
        movePlayer(state, p, d1+d2);
      } else {
        state.log.push(`${p.name} remains in EFCC Detention (attempt ${p.jailTurns}/3).`);
      }
    }
    state.doublesCount = 0;
  } else {
    if(isDouble){
      state.doublesCount = (state.doublesCount||0)+1;
      if(state.doublesCount===3){
        state.log.push(`${p.name} rolled 3 doubles consecutively — sent straight to EFCC!`);
        goToJail(p, state);
        state.doublesCount = 0;
        state.turnPhase='awaiting_end';
        await saveState(state);
        return;
      }
    } else {
      state.doublesCount = 0;
    }
    movePlayer(state, p, d1+d2);
  }

  state.turnPhase = 'awaiting_end';
  await saveState(state);
}

function movePlayer(state, p, steps){
  const oldPos = p.pos;
  let newPos = (oldPos+steps)%40;
  if(newPos < oldPos){ 
    p.cash += N*1000; 
    state.log.push(`${p.name} passed GO and collected ₦${N}k.`); 
  }
  p.pos = newPos;
  state.log.push(`${p.name} rolled ${steps} and stepped onto ${spaces[newPos].name}.`);
  resolveSpace(state, p);
}

function resolveSpace(state, p, isRebound = false){
  const s = spaces[p.pos];
  if(s.type==='prop'||s.type==='rr'||s.type==='util'){
    const own = state.ownership[s.i];
    if(own && own.owner !== p.id){
      payRent(state, p, s, own);
    }
  } else if(s.type==='tax'){
    p.cash -= s.amount*1000;
    state.log.push(`${p.name} paid ₦${s.amount}k for ${s.name}.`);
    checkBankruptcy(state, p);
  } else if(s.type==='chance' && !isRebound){
    const card = chanceCards[Math.floor(Math.random()*chanceCards.length)];
    state._pendingCard = {type:'Wahala Card', text:card.text, playerId:p.id};
    card.effect(p, state);
    checkBankruptcy(state, p);
    state.log.push(`Wahala Card: ${card.text}`);
  } else if(s.type==='chest' && !isRebound){
    const card = chestCards[Math.floor(Math.random()*chestCards.length)];
    state._pendingCard = {type:'Owambe Card', text:card.text, playerId:p.id};
    card.effect(p, state);
    checkBankruptcy(state, p);
    state.log.push(`Owambe Card: ${card.text}`);
  } else if(s.type==='gotojail'){
    goToJail(p, state);
  }
}

function payRent(state, p, s, own){
  const ownerP = state.players.find(x=>x.id===own.owner);
  if(!ownerP || ownerP.bankrupt) return;
  if(own.isMortgaged){
    state.log.push(`${s.name} is mortgaged — no rent collected.`);
    return;
  }
  let rent = 0;
  if(s.type==='prop'){
    rent = s.rent[own.houses];
    if(own.houses===0 && playerOwnsFullGroup(ownerP.id, state.ownership, s.group)) rent *= 2;
  } else if(s.type==='rr'){
    const countOwned = ownerP.properties.filter(i=>spaces[i].type==='rr' && !state.ownership[i].isMortgaged).length;
    rent = [25,50,100,200][countOwned-1] || 25;
  } else if(s.type==='util'){
    const countOwned = ownerP.properties.filter(i=>spaces[i].type==='util' && !state.ownership[i].isMortgaged).length;
    const d1=1+Math.floor(Math.random()*6), d2=1+Math.floor(Math.random()*6);
    rent = (countOwned===2?10:4)*(d1+d2);
  }
  p.cash -= rent*1000;
  ownerP.cash += rent*1000;
  state.log.push(`${p.name} paid ₦${rent}k rent to ${ownerP.name} for ${s.name}.`);
  checkBankruptcy(state, p);
}

async function doBuy(state, s){
  const p = state.players[state.currentIdx];
  p.cash -= s.price*1000;
  p.properties.push(s.i);
  state.ownership[s.i] = { owner: p.id, ownerColor: p.color, houses: 0, isMortgaged: false };
  state.log.push(`${p.name} bought ${s.name} for ₦${s.price}k.`);
  await saveState(state);
}

async function doBuild(state, sp, own){
  const p = state.players[state.currentIdx];
  const label = own.houses===4 ? 'hotel' : `house #${own.houses+1}`;
  p.cash -= sp.houseCost*1000;
  own.houses++;
  state.log.push(`${p.name} built a ${label} on ${sp.name}.`);
  await saveState(state);
}

async function doEndTurn(state){
  state.doublesCount = 0;
  state.lastDice = null;
  state.turnPhase = 'awaiting_roll';
  let idx = state.currentIdx;
  for(let k=0;k<state.players.length;k++){
    idx = (idx+1)%state.players.length;
    if(!state.players[idx].bankrupt) break;
  }
  state.currentIdx = idx;
  state.log.push(`— It's now ${state.players[idx].name}'s turn —`);
  await saveState(state);
}

/* ============================================================
   AUCTION SYSTEM
   ============================================================ */
async function startAuction(state, spaceIdx){
  state.auction = {
    spaceIdx,
    highestBid: 10000,
    highestBidderId: null,
    highestBidderName: 'Nobody',
    endTime: Date.now() + 15000,
    active: true
  };
  state.log.push(`📢 Auction started for ${spaces[spaceIdx].name}! Starting bid: ₦10k.`);
  await saveState(state);
}

function handleAuctionUI(state){
  const s = spaces[state.auction.spaceIdx];
  const me = state.players.find(p => p.id === myId);
  const remaining = Math.max(0, Math.ceil((state.auction.endTime - Date.now()) / 1000));

  const modal = document.getElementById('modal');
  modal.removeAttribute('data-local-open');
  modal.innerHTML = `
    <h3>🏛️ Property Auction</h3>
    <div class="auction-box">${s.name}</div>
    <div class="auction-timer" id="auctionCountdown">${remaining}s remaining</div>
    <p>Top Bid: <strong>₦${(state.auction.highestBid/1000).toLocaleString()}k</strong> by <strong>${state.auction.highestBidderName}</strong></p>
    <div class="modal-btns">
      <button class="primary" id="bid10k" ${me.cash < state.auction.highestBid + 10000 || me.bankrupt ? 'disabled' : ''}>Bid +₦10k</button>
      <button class="primary" id="bid50k" ${me.cash < state.auction.highestBid + 50000 || me.bankrupt ? 'disabled' : ''}>Bid +₦50k</button>
    </div>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';

  document.getElementById('bid10k').onclick = () => submitBid(10000);
  document.getElementById('bid50k').onclick = () => submitBid(50000);

  if(!auctionInterval){
    auctionInterval = setInterval(()=>{
      if(!latestState || !latestState.auction || !latestState.auction.active){
        clearInterval(auctionInterval);
        auctionInterval = null;
        return;
      }
      const rem = Math.max(0, Math.ceil((latestState.auction.endTime - Date.now()) / 1000));
      const cdEl = document.getElementById('auctionCountdown');
      if(cdEl) cdEl.textContent = `${rem}s remaining`;
      if(rem <= 0){
        clearInterval(auctionInterval);
        auctionInterval = null;
        if(latestState.hostId === myId){
          resolveAuction(latestState);
        }
      }
    }, 1000);
  }
}

async function submitBid(amount){
  const me = latestState.players.find(p => p.id === myId);
  latestState.auction.highestBid += amount;
  latestState.auction.highestBidderId = me.id;
  latestState.auction.highestBidderName = me.name;
  latestState.auction.endTime = Date.now() + 8000;
  latestState.log.push(`${me.name} raised bid to ₦${(latestState.auction.highestBid/1000)}k.`);
  await saveState(latestState);
}

async function resolveAuction(state){
  const winner = state.players.find(p => p.id === state.auction.highestBidderId);
  const s = spaces[state.auction.spaceIdx];
  if(winner){
    winner.cash -= state.auction.highestBid;
    winner.properties.push(s.i);
    state.ownership[s.i] = { owner: winner.id, ownerColor: winner.color, houses: 0, isMortgaged: false };
    state.log.push(`🎉 ${winner.name} won the auction for ${s.name} at ₦${(state.auction.highestBid/1000)}k!`);
  } else {
    state.log.push(`Auction for ${s.name} ended with no bids.`);
  }
  state.auction = null;
  document.getElementById('modalOverlay').style.display = 'none';
  await saveState(state);
}

/* ============================================================
   MORTGAGING SYSTEM
   ============================================================ */
function openMortgageModal(state){
  const me = state.players.find(p => p.id === myId);
  const modal = document.getElementById('modal');
  modal.dataset.localOpen = "true";

  let html = `<h3>Mortgage Office</h3>
    <p style="margin:4px 0 12px; font-size:0.85rem;">Mortgaging gives 50% cash. Unmortgaging costs 55% (10% interest). Mortgaged properties collect no rent.</p>
    <div style="text-align:left; max-height:220px; overflow-y:auto; margin-bottom:14px; display:flex; flex-direction:column; gap:6px;">`;

  if(me.properties.length === 0){
    html += `<div style="text-align:center; padding:12px; font-size:0.85rem;">You do not own any properties.</div>`;
  } else {
    me.properties.forEach(i=>{
      const s = spaces[i];
      const own = state.ownership[i] || { houses:0, isMortgaged:false };
      const mortVal = (s.price * 1000) / 2;
      const unmortCost = mortVal * 1.1;

      html += `<div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:6px 10px; border:2px solid var(--ink); border-radius:4px;">
        <span><strong>${s.name}</strong><br><small>${own.isMortgaged ? '🔴 Mortgaged' : '🟢 Active'}</small></span>
        <div>
          ${own.isMortgaged ? 
            `<button class="secondary" onclick="unmortgageProp(${i})" ${me.cash < unmortCost ? 'disabled' : ''}>Unmortgage (₦${unmortCost/1000}k)</button>` : 
            `<button class="secondary" onclick="mortgageProp(${i})" ${own.houses > 0 ? 'disabled' : ''}>Mortgage (+₦${mortVal/1000}k)</button>`
          }
        </div>
      </div>`;
    });
  }

  html += `</div><button class="primary" onclick="closeLocalModal()">Close</button>`;
  modal.innerHTML = html;
  document.getElementById('modalOverlay').style.display = 'flex';
}

window.closeLocalModal = function(){
  const modal = document.getElementById('modal');
  modal.removeAttribute('data-local-open');
  document.getElementById('modalOverlay').style.display = 'none';
};

window.mortgageProp = async function(idx){
  const me = latestState.players.find(p => p.id === myId);
  const s = spaces[idx];
  const own = latestState.ownership[idx];
  if(own.houses > 0) return;
  const mortVal = (s.price * 1000) / 2;
  own.isMortgaged = true;
  me.cash += mortVal;
  latestState.log.push(`${me.name} mortgaged ${s.name} for ₦${mortVal/1000}k.`);
  await saveState(latestState);
  openMortgageModal(latestState);
};

window.unmortgageProp = async function(idx){
  const me = latestState.players.find(p => p.id === myId);
  const s = spaces[idx];
  const own = latestState.ownership[idx];
  const cost = ((s.price * 1000) / 2) * 1.1;
  if(me.cash < cost) return;
  own.isMortgaged = false;
  me.cash -= cost;
  latestState.log.push(`${me.name} unmortgaged ${s.name} for ₦${cost/1000}k.`);
  await saveState(latestState);
  openMortgageModal(latestState);
};

/* ============================================================
   TRADING SYSTEM
   ============================================================ */
function openTradeModal(state){
  const me = state.players.find(p => p.id === myId);
  const otherPlayers = state.players.filter(p => p.id !== myId && !p.bankrupt);
  if(otherPlayers.length === 0) return;

  const modal = document.getElementById('modal');
  modal.dataset.localOpen = "true";

  let html = `<h3>Propose Trade</h3>
    <label class="field-label" style="text-align:left;">Trade with:</label>
    <select id="tradeTarget">
      ${otherPlayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
    </select>
    <div class="trade-columns">
      <div class="trade-col">
        <h4>You Offer</h4>
        <input type="number" id="offerCash" placeholder="₦ Cash" min="0" max="${me.cash}" value="0">
        <div class="trade-list">
          ${me.properties.map(i => `<label class="trade-item"><input type="checkbox" name="myProps" value="${i}"> ${spaces[i].name}</label>`).join('') || '<small>No properties</small>'}
        </div>
      </div>
      <div class="trade-col">
        <h4>You Want</h4>
        <input type="number" id="wantCash" placeholder="₦ Cash" min="0" value="0">
        <div class="trade-list" id="targetPropsList"></div>
      </div>
    </div>
    <div class="modal-btns">
      <button class="primary" id="sendTradeBtn">Send Proposal</button>
      <button class="secondary" onclick="closeLocalModal()">Cancel</button>
    </div>`;

  modal.innerHTML = html;
  document.getElementById('modalOverlay').style.display = 'flex';

  const targetSelect = document.getElementById('tradeTarget');
  const updateTargetProps = () => {
    const target = state.players.find(p => p.id === targetSelect.value);
    const wrap = document.getElementById('targetPropsList');
    if(target && target.properties.length > 0){
      wrap.innerHTML = target.properties.map(i => `<label class="trade-item"><input type="checkbox" name="targetProps" value="${i}"> ${spaces[i].name}</label>`).join('');
    } else {
      wrap.innerHTML = '<small>No properties</small>';
    }
  };
  targetSelect.onchange = updateTargetProps;
  updateTargetProps();

  document.getElementById('sendTradeBtn').onclick = async () => {
    const targetId = targetSelect.value;
    const target = state.players.find(p => p.id === targetId);
    const offerProps = Array.from(document.querySelectorAll('input[name="myProps"]:checked')).map(el => parseInt(el.value));
    const wantProps = Array.from(document.querySelectorAll('input[name="targetProps"]:checked')).map(el => parseInt(el.value));
    const offerCash = Math.max(0, parseInt(document.getElementById('offerCash').value) || 0);
    const wantCash = Math.max(0, parseInt(document.getElementById('wantCash').value) || 0);

    if(offerCash > me.cash){
      alert("You don't have that much cash to offer!");
      return;
    }

    latestState.tradeOffer = {
      fromId: myId,
      toId: targetId,
      offerProps,
      wantProps,
      offerCash,
      wantCash
    };
    latestState.log.push(`${me.name} proposed a trade deal to ${target.name}.`);
    closeLocalModal();
    await saveState(latestState);
  };
}

function showTradeOfferModal(state){
  const offer = state.tradeOffer;
  const fromP = state.players.find(p => p.id === offer.fromId);
  const me = state.players.find(p => p.id === myId);
  const modal = document.getElementById('modal');
  modal.removeAttribute('data-local-open');

  modal.innerHTML = `
    <h3>🤝 Incoming Trade Offer</h3>
    <p><strong>${fromP.name}</strong> wants to deal with you:</p>
    <div class="trade-columns">
      <div class="trade-col">
        <h4>You Receive:</h4>
        <p style="margin:4px 0; font-weight:700;">₦${offer.offerCash.toLocaleString()}</p>
        <div style="font-size:0.75rem;">${offer.offerProps.map(i => spaces[i].name).join(', ') || 'No properties'}</div>
      </div>
      <div class="trade-col">
        <h4>They Want:</h4>
        <p style="margin:4px 0; font-weight:700;">₦${offer.wantCash.toLocaleString()}</p>
        <div style="font-size:0.75rem;">${offer.wantProps.map(i => spaces[i].name).join(', ') || 'No properties'}</div>
      </div>
    </div>
    <div class="modal-btns">
      <button class="primary" id="acceptTrade" ${me.cash < offer.wantCash ? 'disabled' : ''}>Accept Deal</button>
      <button class="secondary" id="rejectTrade">Decline</button>
    </div>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';

  document.getElementById('acceptTrade').onclick = async () => {
    fromP.cash -= offer.offerCash;
    me.cash += offer.offerCash;
    me.cash -= offer.wantCash;
    fromP.cash += offer.wantCash;

    offer.offerProps.forEach(i => {
      fromP.properties = fromP.properties.filter(id => id !== i);
      me.properties.push(i);
      latestState.ownership[i].owner = me.id;
      latestState.ownership[i].ownerColor = me.color;
    });

    offer.wantProps.forEach(i => {
      me.properties = me.properties.filter(id => id !== i);
      fromP.properties.push(i);
      latestState.ownership[i].owner = fromP.id;
      latestState.ownership[i].ownerColor = fromP.color;
    });

    latestState.log.push(`🤝 Trade completed between ${fromP.name} and ${me.name}!`);
    latestState.tradeOffer = null;
    document.getElementById('modalOverlay').style.display = 'none';
    await saveState(latestState);
  };

  document.getElementById('rejectTrade').onclick = async () => {
    latestState.log.push(`${me.name} declined trade offer from ${fromP.name}.`);
    latestState.tradeOffer = null;
    document.getElementById('modalOverlay').style.display = 'none';
    await saveState(latestState);
  };
}

let winShown = false;
function showWin(state){
  if(winShown) return;
  winShown = true;
  const winner = state.players.find(p=>p.id===state.winner);
  document.getElementById('winBox').innerHTML = `<h1>🏆 ${winner ? winner.name : 'Someone'} Wins!</h1>
    <p style="margin-bottom:20px;">Last player standing. Oya, celebrate with some jollof!</p>
    <button class="primary" onclick="localStorage.removeItem('nm_room'); location.reload()">Back to Start</button>`;
  document.getElementById('winOverlay').style.display = 'flex';
}

window.addEventListener('load', async ()=>{
  const savedRoom = localStorage.getItem('nm_room');
  if(savedRoom){
    try{
      const snap = await dbFS.collection('rooms').doc(savedRoom).get();
      if(snap.exists && snap.data().players.find(p=>p.id===myId)){
        roomCode = savedRoom;
        document.getElementById('landing').style.display='none';
        const state = snap.data();
        if(state.status==='lobby'){
          document.getElementById('lobby').style.display='block';
          document.getElementById('roomCodeBig').textContent = savedRoom;
        } else {
          document.getElementById('gameScreen').style.display='block';
          buildBoard();
        }
        subscribeRoom(savedRoom);
      }
    }catch(e){ }
  }
});

})();