'use strict';
/* ============================================================
   script.js — Smart Factory Logic Animation-First Edition
   All real verified specs from 74LS / 74HC / 74HCT datasheets
   ============================================================ */

/* ── VERIFIED DATASHEET VALUES (5V, 25°C) ─────────────────── */
const SPECS = {
  ttl: {
    name:'74LS TTL', color:'#ffb300',
    vcc:'5 V (±0.25 V)', vccV:5,
    vih:2.0, vil:0.8, voh:2.7, vol:0.4,
    ioh:0.4,  // mA magnitude
    iol:8.0,  // mA
    iih:0.02, // mA (20 µA)
    iil:0.4,  // mA (400 µA)
    tpd:'≈ 10 ns',
    trange:'0 °C to 70 °C',
    icc:'≈ 1–4 mA (static)',
    nmH:0.7, nmL:0.4,  // NMH=VOH-VIH=2.7-2.0, NML=VIL-VOL=0.8-0.4
    fanout:20, tech:'Bipolar BJT (Schottky)'
  },
  hc: {
    name:'74HC CMOS', color:'#00e5ff',
    vcc:'2 – 6 V', vccV:5,
    vih:3.5, vil:1.5, voh:4.4, vol:0.1,
    ioh:4.0,  // mA
    iol:4.0,  // mA
    iih:0.001, // mA (1 µA)
    iil:0.001,
    tpd:'≈ 10 ns',
    trange:'-40 °C to +85 °C',
    icc:'< 1 µA (static)',
    nmH:0.9, nmL:1.4,  // NMH=4.4-3.5, NML=1.5-0.1
    fanout:4000, tech:'CMOS MOSFET'
  },
  hct: {
    name:'74HCT CMOS', color:'#00c896',
    vcc:'5 V (±0.5 V)', vccV:5,
    vih:2.0, vil:0.8, voh:4.4, vol:0.1,
    ioh:4.0,
    iol:4.0,
    iih:0.001,
    iil:0.001,
    tpd:'≈ 12 ns',
    trange:'-40 °C to +85 °C',
    icc:'< 1 µA (static)',
    nmH:2.4, nmL:0.7, // NMH=4.4-2.0, NML=0.8-0.1
    fanout:4000, tech:'CMOS MOSFET (TTL-input)'
  }
};

/* ── UTILITY ─────────────────────────────────────────────── */
const $  = (s,ctx=document)=>ctx.querySelector(s);
const $$ = (s,ctx=document)=>[...ctx.querySelectorAll(s)];

/* ── PROGRESS BAR ────────────────────────────────────────── */
function initProgress(){
  const bar=$('#prog');
  if(!bar)return;
  window.addEventListener('scroll',()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(max>0?(window.scrollY/max*100):0)+'%';
  },{passive:true});
}

/* ── NAV ─────────────────────────────────────────────────── */
function initNav(){
  const burger=$('#burger');
  const mob=$('#mobile-nav');
  if(burger&&mob){
    burger.addEventListener('click',()=>{
      mob.classList.toggle('open');
    });
    $$('a',mob).forEach(a=>a.addEventListener('click',()=>mob.classList.remove('open')));
  }
  // active link
  const links=$$('.nav-link');
  const secs=$$('section[id]');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));
      }
    });
  },{rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s=>io.observe(s));
}

/* ── SCROLL REVEAL ───────────────────────────────────────── */
function initReveal(){
  const els=$$('.reveal');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.1});
  els.forEach(el=>io.observe(el));
}

/* ── SMOOTH SCROLL ───────────────────────────────────────── */
function initScroll(){
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1);
      const el=document.getElementById(id);
      if(el){e.preventDefault();window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:'smooth'});}
    });
  });
}

/* ── VOLTAGE BARS (Section 4) ───────────────────────────── */
function buildVoltageTracks(){
  const container=$('#voltage-tracks');
  if(!container)return;

  ['ttl','hc','hct'].forEach(key=>{
    const s=SPECS[key];
    const vcc=5; // 5V reference
    const px=h=>(h/vcc)*100+'%'; // voltage to percent height from bottom
    const top=v=>( (vcc-v)/vcc*100 )+'%'; // top offset
    const ht=v1=>( (v1/vcc)*100 )+'%'; // height of segment

    const track=document.createElement('div');
    track.className='v-track';
    track.setAttribute('data-key',key);

    // Regions from bottom to top: GND → VOL → VIL → VIH → VOH → VCC
    const regions=[
      // [topV, bottomV, label, bg, textColor, valueStr]
      [vcc,  s.voh, 'V_OH region',  'rgba(0,200,150,.22)', '#00c896', `> ${s.voh}V`],
      [s.voh,s.vih, 'NM_H = '+(s.nmH.toFixed(1))+'V', 'rgba(0,229,255,.12)', '#00e5ff', `NM_H = ${s.nmH.toFixed(1)}V`],
      [s.vih, s.vil,'Undefined',     'rgba(255,179,0,.09)','#ffb300','Undefined'],
      [s.vil, s.vol,'NM_L = '+(s.nmL.toFixed(1))+'V', 'rgba(0,229,255,.08)', '#00e5ff',`NM_L = ${s.nmL.toFixed(1)}V`],
      [s.vol, 0,    'V_OL region',   'rgba(255,79,79,.18)', '#ff4f4f',`< ${s.vol}V`],
    ];

    let html=`
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;">
        <div class="v-divider-line" style="top:0;"></div>
    `;

    regions.forEach(([topV,botV,label,bg,clr,val])=>{
      const topPct=((vcc-topV)/vcc*100).toFixed(1)+'%';
      const heightPct=((topV-botV)/vcc*100).toFixed(1)+'%';
      html+=`
        <div class="v-rail" style="top:${topPct};height:${heightPct};background:${bg};align-items:center;">
          <div style="width:100%;padding:2px 6px;">
            <div class="v-label" style="color:${clr};font-size:.58rem;">${val}</div>
          </div>
        </div>
        <div class="v-divider-line" style="top:calc(${topPct} + ${heightPct});"></div>
      `;
    });

    // VCC and GND labels
    html+=`
      <div style="position:absolute;top:3px;left:0;right:0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.5);">VCC = ${vcc}V</div>
      <div style="position:absolute;bottom:3px;left:0;right:0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.5);">GND = 0V</div>
      </div>
    `;

    html+=`<div class="v-chip-name" style="color:${s.color};">${s.name}</div>`;
    track.innerHTML=html;
    container.appendChild(track);
  });
}

/* ── NOISE MARGIN ANIMATION (Section 5) ─────────────────── */
function buildNoiseMargin(){
  const container=$('#nm-container');
  if(!container)return;

  ['ttl','hc','hct'].forEach(key=>{
    const s=SPECS[key];
    const card=document.createElement('div');
    card.className='nm-card reveal';

    // For the animated bar: 200px height = 0 to 5V
    // px per volt = 200/5 = 40px/V
    const pxV=38; // px per volt (in 190px usable area)
    const vh=s.voh*pxV; // VOH height from bottom
    const nih=s.vih*pxV;
    const nil=s.vil*pxV;
    const vl=s.vol*pxV;
    const total=5*pxV;

    // Spike height: try to exceed NMH but fail for CMOS, succeed visually threatening for TTL
    const spikeH=Math.min(s.nmH*pxV*0.85, 18);
    const spikeOk=s.nmH>=0.8;
    const spikeColor=spikeOk?'#ff4f4f':'#ff4f4f';

    card.innerHTML=`
      <div class="nm-card-title">${s.name}</div>
      <div class="nm-bar-wrap" style="height:${total}px;">
        <!-- VOH region (top) -->
        <div class="nm-region" style="bottom:${vh}px;height:${total-vh}px;background:rgba(0,200,150,.18);color:#00c896;font-size:.58rem;padding-top:4px;">
          VOH ≥ ${s.voh}V
        </div>
        <!-- NMH band -->
        <div class="nm-region" style="bottom:${nih}px;height:${vh-nih}px;background:rgba(0,229,255,.1);color:#00e5ff;">
          <span>NM_H = ${s.nmH.toFixed(1)}V</span>
        </div>
        <!-- Undefined -->
        <div class="nm-region" style="bottom:${nil}px;height:${nih-nil}px;background:rgba(255,179,0,.1);color:#ffb300;font-size:.55rem;">
          UNDEFINED
        </div>
        <!-- NML band -->
        <div class="nm-region" style="bottom:${vl}px;height:${nil-vl}px;background:rgba(0,229,255,.1);color:#00e5ff;">
          NM_L = ${s.nmL.toFixed(1)}V
        </div>
        <!-- VOL region (bottom) -->
        <div class="nm-region" style="bottom:0;height:${vl}px;background:rgba(255,79,79,.18);color:#ff4f4f;align-items:flex-end;padding-bottom:2px;font-size:.58rem;">
          VOL ≤ ${s.vol}V
        </div>
        <!-- Noise spike in the NMH zone -->
        <div style="position:absolute;bottom:${vh}px;left:50%;transform:translateX(-50%);width:4px;height:0;background:${spikeColor};border-radius:2px;animation:spike-${key} 2.8s ease-in-out infinite;box-shadow:0 0 6px ${spikeColor};"></div>
      </div>
      <div class="nm-verdict" style="background:${spikeOk?'rgba(0,200,150,.1)':'rgba(255,79,79,.1)'};color:${spikeOk?'#00c896':'#ff4f4f'};border:1px solid ${spikeOk?'rgba(0,200,150,.3)':'rgba(255,79,79,.3)'};">
        ${spikeOk?'✓ Noise absorbed safely':'⚠ Narrow margin — risky in factory'}
      </div>

      <!-- Inline keyframe for spike -->
      <style>
        @keyframes spike-${key}{
          0%,100%{height:0;opacity:0}
          30%{height:${spikeH}px;opacity:1}
          60%{height:${spikeH}px;opacity:1}
          80%{height:0;opacity:0}
        }
      </style>
    `;
    container.appendChild(card);
  });
}

/* ── FANOUT DOTS (Section 6) ─────────────────────────────── */
function buildFanout(){
  $$('.fanout-dots-inner').forEach(el=>{
    const n=parseInt(el.dataset.n)||10;
    const color=el.dataset.color||'#00e5ff';
    el.innerHTML='';
    const count=Math.min(n,80); // cap display at 80 dots
    for(let i=0;i<count;i++){
      const d=document.createElement('div');
      d.className='fanout-dot';
      d.style.background=color;
      d.style.boxShadow=`0 0 4px ${color}`;
      el.appendChild(d);
    }
  });

  // Animate dots in when visible
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const dots=$$('.fanout-dot',e.target);
        dots.forEach((d,i)=>{
          setTimeout(()=>{d.style.opacity='1';d.style.transform='scale(1)';},i*15);
        });
        io.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  $$('.fanout-dots').forEach(el=>io.observe(el));
}

/* ── DECISION BARS (Section 9) ───────────────────────────── */
function buildDecisionBars(){
  const decGrid=$('#decision-grid');
  if(!decGrid)return;

  const params=[
    {
      label:'Noise Margin HIGH',
      values:{ttl:{v:0.7,pct:22},hc:{v:0.9,pct:28},hct:{v:2.4,pct:75}},
      winner:'hct', unit:'V', note:'Higher = better'
    },
    {
      label:'Noise Margin LOW',
      values:{ttl:{v:0.4,pct:25},hc:{v:1.4,pct:88},hct:{v:0.7,pct:44}},
      winner:'hc', unit:'V', note:'Higher = better'
    },
    {
      label:'Static Power',
      values:{ttl:{v:'1–4 mA',pct:90},hc:{v:'<1 µA',pct:1},hct:{v:'<1 µA',pct:1}},
      winner:'hc', unit:'', note:'Lower = better', invert:true
    },
    {
      label:'Fan-Out',
      values:{ttl:{v:20,pct:1},hc:{v:'4000+',pct:99},hct:{v:'4000+',pct:99}},
      winner:'hc', unit:'', note:'Higher = better'
    },
    {
      label:'Temp Range',
      values:{ttl:{v:'0–70°C',pct:35},hc:{v:'−40–85°C',pct:100},hct:{v:'−40–85°C',pct:100}},
      winner:'hc', unit:'', note:'Wider = better'
    },
    {
      label:'Output Swing',
      values:{ttl:{v:'2.7–0.4V',pct:48},hc:{v:'4.4–0.1V',pct:92},hct:{v:'4.4–0.1V',pct:92}},
      winner:'hc', unit:'', note:'Wider = better'
    },
  ];

  params.forEach(p=>{
    const card=document.createElement('div');
    card.className='param-compare reveal';
    const colors={ttl:'#ffb300',hc:'#00e5ff',hct:'#00c896'};
    const winnerColor=colors[p.winner];

    let rows='';
    Object.entries(p.values).forEach(([k,val])=>{
      const isBest=(p.invert ? val.pct<=2 : val.pct>=85) || k===p.winner;
      rows+=`
        <div class="param-compare-row">
          <span class="param-chip" style="color:${colors[k]};background:rgba(0,0,0,.3);border:1px solid ${colors[k]}33;">${k.toUpperCase()}</span>
          <div class="param-bar">
            <div class="param-bar-fill" style="width:0%;background:${colors[k]};opacity:${isBest?1:.45};" data-target="${val.pct}"></div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:.64rem;color:${colors[k]};min-width:36px;text-align:right;">${typeof val.v==='number'?val.v:val.v}</span>
        </div>
      `;
    });

    card.innerHTML=`
      <div class="param-compare-label">${p.label}</div>
      ${rows}
      <div style="font-size:.6rem;color:var(--muted);margin-top:6px;">${p.note}</div>
    `;
    decGrid.appendChild(card);
  });

  // Animate bars when visible
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        $$('.param-bar-fill',e.target).forEach((bar,i)=>{
          setTimeout(()=>{bar.style.width=bar.dataset.target+'%';},i*120);
        });
        io.unobserve(e.target);
      }
    });
  },{threshold:0.2});
  $$('.param-compare').forEach(c=>io.observe(c));
}

/* ── POWER ANIMATION ─────────────────────────────────────── */
function initPowerAnim(){
  const ttlChip=$('#ttl-chip');
  const cmosChip=$('#cmos-chip-idle');
  const cmosSwitch=$('#cmos-chip-switch');
  const ttlBar=$('#ttl-power-bar');
  const cmosBar=$('#cmos-power-bar');

  // TTL always glowing
  if(ttlChip){
    ttlChip.style.animation='ttl-power 1.2s ease-in-out infinite';
  }
  // CMOS idle
  if(cmosChip){
    cmosChip.style.animation='cmos-idle 2s ease-in-out infinite';
  }

  // Show TTL bar full
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        if(ttlBar) setTimeout(()=>ttlBar.style.width='90%',200);
        if(cmosBar) setTimeout(()=>cmosBar.style.width='2%',400);
        io.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  const sec=$('#power');
  if(sec) io.observe(sec);

  // Click CMOS to show switching power spike
  if(cmosSwitch){
    cmosSwitch.addEventListener('click',()=>{
      cmosChip.style.animation='cmos-switch .4s ease';
      if(cmosBar){
        cmosBar.style.transition='width .2s ease';
        cmosBar.style.width='40%';
        setTimeout(()=>{
          cmosBar.style.transition='width .5s ease';
          cmosBar.style.width='2%';
          cmosChip.style.animation='cmos-idle 2s ease-in-out infinite';
        },500);
      }
    });
  }
}

/* ── WAVEFORM SVG ANIMATION ──────────────────────────────── */
function initWaveform(){
  $$('.wave-svg').forEach(svg=>{
    const paths=$$('path.animated',svg);
    paths.forEach(p=>{
      const len=p.getTotalLength?p.getTotalLength():300;
      p.style.strokeDasharray=len;
      p.style.strokeDashoffset=len;
      p.style.transition='stroke-dashoffset 1.5s ease .3s';
    });
  });

  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        $$('path.animated',e.target).forEach(p=>p.style.strokeDashoffset='0');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.4});
  $$('.wave-svg').forEach(s=>io.observe(s));
}

/* ── INTERFACE CARDS ─────────────────────────────────────── */
function initIfaceCards(){
  $$('.iface-card').forEach(card=>{
    card.addEventListener('click',()=>{
      $$('.iface-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  initProgress();
  initNav();
  initReveal();
  initScroll();
  buildVoltageTracks();
  buildNoiseMargin();
  buildFanout();
  buildDecisionBars();
  initPowerAnim();
  initWaveform();
  initIfaceCards();
});
