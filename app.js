(function(){
'use strict';
var LANG='fr';
try{var sv=localStorage.getItem('kk_lang');if(sv==='en'||sv==='fr')LANG=sv}catch(e){}
var L=function(fr,en){return LANG==='en'?en:fr};
var F=function(n,d){d=d||0;return Number(n).toLocaleString(LANG==='en'?'en-US':'fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})};
var $=function(id){return document.getElementById(id)};
var GREEN='#16264a',GOLD='#9a7a2e',INK='#0b1426',MUT='#6b6256',GRID='#ddd3bf',BAD='#a3352b';

/* Traduction statique */
document.querySelectorAll('[data-en]').forEach(function(e){e.setAttribute('data-fr',e.innerHTML)});
document.querySelectorAll('[data-alt-en]').forEach(function(e){e.setAttribute('data-alt-fr',e.getAttribute('alt'))});
function applyStatic(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-en]').forEach(function(e){e.innerHTML=LANG==='en'?e.getAttribute('data-en'):e.getAttribute('data-fr')});
  document.querySelectorAll('[data-alt-en]').forEach(function(e){e.setAttribute('alt',LANG==='en'?e.getAttribute('data-alt-en'):e.getAttribute('data-alt-fr'))});
  var v=$('filmv'),sc=$('films'),want='kooskoos_film_v8_'+LANG+'.mp4';
  if(sc.getAttribute('src')!==want){var t=v.currentTime,pl=!v.paused;sc.setAttribute('src',want);v.setAttribute('poster','kooskoos_fin_'+LANG+'.png');v.load();}
  document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===LANG)});
  document.title=L('KOOSKOOS · Dossier investisseur','KOOSKOOS · Investor dossier');
}

/* Navigation */
var secs=[['top','Film','Film'],['proposition','Proposition','Proposal'],['concept','Concept','Concept'],['carte','Carte','Menu'],['marche','Marché','Market'],['production','Production','Production'],['cuisine','Cuisine','Kitchen'],['equipe','Équipe','Team'],['budget','Budget','Budget'],['charges','Charges fixes','Fixed costs'],['eco','Simulateur','Simulator'],['trajectoires','Trajectoires','Trajectories'],['decaissement','Décaissement','Release'],['reseau','Réseau','Network'],['risques','Risques','Risks'],['conclusion','Conclusion','Conclusion']];
var links={};
function drawNav(){
  $('nav').innerHTML=secs.map(function(s){return '<a href="#'+s[0]+'" data-s="'+s[0]+'">'+L(s[1],s[2])+'</a>'}).join('');
  links={};document.querySelectorAll('#nav a').forEach(function(a){links[a.dataset.s]=a});spy();
}
function spy(){var cur=null;secs.forEach(function(s){var e=$(s[0]);if(e&&e.getBoundingClientRect().top<120)cur=s[0]});
  Object.keys(links).forEach(function(k){links[k].classList.toggle('on',k===cur)});
  if(cur&&links[cur]){var n=document.querySelector('nav.top .wrap'),l=links[cur];var t=l.offsetLeft-n.clientWidth/2+l.clientWidth/2;if(Math.abs(n.scrollLeft-t)>40)n.scrollLeft=t}}
window.addEventListener('scroll',spy,{passive:true});

/* Données */
var PRICES=[69,89,79,59],MIX0=[50,25,10,15];
var mix=MIX0.slice();
var S0={vol:40,com:13.8,mat:9.73,pack:3,fix:37500,ren:0};
var S=Object.assign({},S0);
var TR=0.03393,VAT=1.15,RENEW=47000/12;
var RAMPS={'Prudent':[15,20,25,30,35,40,40,45,45,50,50,50],'Central':[20,25,30,35,40,45,50,50,55,60,60,65],'Dynamique':[25,35,45,50,60,70,75,80,85,90,95,100]};
var RNAME={'Prudent':'Prudent','Central':'Central','Dynamique':'Dynamic'};
var scn='Central';

function calc(){
  var ttc=0;for(var i=0;i<4;i++)ttc+=PRICES[i]*mix[i]/100;
  var ht=ttc/VAT;
  var comm=ht*S.com/100,trx=ht*TR;
  var vari=S.mat+S.pack+comm+trx;
  var contrib=ht-vari;
  var fix=S.fix+(S.ren?RENEW:0);
  return {ttc:ttc,ht:ht,comm:comm,trx:trx,vari:vari,contrib:contrib,fix:fix,be:contrib>0?fix/(contrib*30):Infinity};
}

/* Mix de ventes */
var PCT=function(v){return v+(LANG==='en'?'%':' %')};
function syncMix(src){
  var v=[+$('m0').value,+$('m1').value,+$('m2').value];
  var sum=v[0]+v[1]+v[2];
  if(sum>100){v[src]-=sum-100;$('m'+src).value=v[src];sum=100}
  mix=[v[0],v[1],v[2],100-sum];
  for(var i=0;i<4;i++)$('o'+i).textContent=PCT(mix[i]);
  var c=calc();$('avgp').textContent=F(c.ttc,2);$('t-ttc').textContent=F(c.ttc,2);$('t-ht').textContent=F(c.ht,2);
  render();
}
[0,1,2].forEach(function(i){$('m'+i).addEventListener('input',function(){syncMix(i)})});
$('resetmix').addEventListener('click',function(){[0,1,2].forEach(function(i){$('m'+i).value=MIX0[i]});syncMix(0)});

/* Parcours de commande */
var STEPS=[
 [['Approvisionnement','Sourcing'],['Réception des matières et des emballages.','Receiving ingredients and packaging.'],['Qualité, température, dates et traçabilité.','Quality, temperature, dates and traceability.']],
 [['Préparation','Preparation'],['Découpe, pesée, préparation des bouillons.','Cutting, weighing, preparing the broths.'],['Fiches recettes et rendements.','Recipe sheets and yields.']],
 [['Cuisson','Cooking'],['Semoule vapeur, protéines et légumes.','Steamed semolina, proteins and vegetables.'],['Temps, températures, qualité sensorielle.','Times, temperatures, sensory quality.']],
 [['Maintien','Holding'],['Bacs identifiés, chaîne du chaud et du froid.','Labelled containers, hot and cold chain.'],['HACCP, rotation des lots.','HACCP, batch rotation.']],
 [['Commande','Order'],['Pesée, assemblage, bouillon séparé.','Weighing, assembly, separate broth.'],['Grammage, allergènes, présentation.','Portion weight, allergens, presentation.']],
 [['Expédition','Dispatch'],['Scellage, étiquetage, remise au coursier.','Sealing, labelling, hand-over to the courier.'],['Temps de préparation et exactitude.','Preparation time and accuracy.']]];
var stp=0;
function drawSteps(){
  $('steps').innerHTML=STEPS.map(function(s,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(i===stp)+'">'+(i+1)+'. '+L(s[0][0],s[0][1])+'</button>'}).join('');
  var s=STEPS[stp];$('stepbox').innerHTML='<h3>'+L(s[0][0],s[0][1])+'</h3><p style="margin-top:8px"><b>'+L('Organisation.','Organisation.')+'</b> '+L(s[1][0],s[1][1])+'</p><p style="margin:0"><b>'+L('Contrôle.','Control.')+'</b> '+L(s[2][0],s[2][1])+'</p>';
  document.querySelectorAll('#steps button').forEach(function(b){b.addEventListener('click',function(){stp=+b.dataset.i;drawSteps()})});
}

/* Tableaux fixes */
function tbl(id,head,rows,total){
  var h='<tr>'+head.map(function(x,i){return '<th'+(i>0?' class="n"':'')+'>'+x+'</th>'}).join('')+'</tr>';
  h+=rows.map(function(r){return '<tr>'+r.map(function(c,i){return '<td'+(i>0?' class="n"':'')+'>'+c+'</td>'}).join('')+'</tr>'}).join('');
  if(total)h+='<tr class="total">'+total.map(function(c,i){return '<td'+(i>0?' class="n"':'')+'>'+c+'</td>'}).join('')+'</tr>';
  $(id).innerHTML=h;
}
var N=function(s){return LANG==='en'?String(s).replace(/ /g,','):s};
function drawTables(){
  var EQ=[['Couscoussiers vapeur','Steam couscous pots',2,2250,4500],['Fourneau 4 feux','4-burner range',1,3500,3500],['Marmites','Stock pots',3,800,2400],['Poêles / casseroles','Pans / saucepans',2,600,1200],['Bain-marie','Bain-marie',1,4500,4500],['Tables inox','Stainless tables',2,1500,3000],['Étagères inox','Stainless shelving',2,750,1500],['Bacs GN et couvercles','GN pans and lids',1,2500,2500],['Ustensiles','Utensils',1,2500,2500],['Balances et thermomètres','Scales and thermometers',1,800,800],['Poste conditionnement','Packing station',1,2500,2500],['Froid complémentaire','Additional refrigeration',1,8000,8000],['Hygiène et sécurité','Hygiene and safety',1,2500,2500],['Installation / raccordements','Installation / connections',1,5000,5000]];
  tbl('tb-eq',[L('Équipement','Equipment'),L('Qté','Qty'),L('Unitaire','Unit'),L('Total SAR','Total SAR')],EQ.map(function(r){return [L(r[0],r[1]),r[2],F(r[3]),F(r[4])]}),[L('Total','Total'),'','',F(44400)]);
  tbl('tb-for',[L('Poste','Item'),L('Calcul','Calculation'),L('Total SAR','Total SAR')],[[L('Transferts / visas','Transfers / visas'),'4 × 2 000'.replace(' ',LANG==='en'?',':' '),F(8000)],[L('Permis de travail','Work permits'),'4 × 9 600'.replace(' ',LANG==='en'?',':' '),F(38400)],['Iqama','4 × 650',F(2600)],[L('Assurance médicale','Medical insurance'),'4 × 1 500'.replace(' ',LANG==='en'?',':' '),F(6000)],[L('Examens et formalités','Medical exams and formalities'),'4 × 1 000'.replace(' ',LANG==='en'?',':' '),F(4000)]],[L('Total','Total'),'',F(59000)]);
  tbl('tb-stock',[L('Famille','Category'),L('Budget SAR','Budget SAR')],[[L('Semoule','Semolina'),F(2000)],[L('Viandes','Meats'),F(10000)],[L('Légumes','Vegetables'),F(4000)],[L('Pois chiches','Chickpeas'),F(1500)],[L('Huiles et épices','Oils and spices'),F(2000)],[L('Sauces','Sauces'),F(1500)],[L('Bowls et couvercles','Bowls and lids'),F(5000)],[L('Sacs, étiquettes, couverts','Bags, labels, cutlery'),F(3000)],[L('Consommables','Consumables'),F(1000)]],[L('Total','Total'),F(30000)]);
}

/* Barres */
function bars(id,items,total){
  var mx=Math.max.apply(null,items.map(function(i){return i[1]}));
  $(id).innerHTML=items.map(function(i){return '<div class="r"><span>'+L(i[0],i[2])+'</span><div class="t"><i style="width:'+(i[1]/mx*100)+'%"></i></div><b>'+F(i[1])+'</b></div>'}).join('')+
  '<div class="r" style="border-top:2px solid var(--ink);margin-top:6px"><span><b>Total</b></span><div></div><b>'+F(total)+' SAR</b></div>';
}
function drawBars(){
bars('openbars',[['Constitution de la société, deux licences',110000,'Company incorporation, two licences'],['Licences et autorisations',10000,'Licences and permits'],['Équipements et installation',44400,'Equipment and installation'],['Caution et activation cuisine',18000,'Kitchen deposit and activation'],['Formalités de quatre salariés',59000,'Formalities for four employees'],['Marketing de préouverture',12000,'Pre-opening marketing'],['Stock initial',30000,'Initial stock'],['Réserve de trésorerie initiale',25000,'Initial cash reserve'],['Imprévus',15000,'Contingency']],323400);
bars('fixbars',[['Salaires, 4 collaborateurs',14000,'Salaries, 4 team members'],['Marketing récurrent',10000,'Recurring marketing'],['Loyer cuisine HOT',6000,'HOT kitchen rent'],['Logement et transport',3000,'Housing and transport'],['Électricité, eau, énergie',1800,'Electricity, water, energy'],['Administration et logiciels',1300,'Administration and software'],['Nettoyage, hygiène, maintenance',900,'Cleaning, hygiene, maintenance'],['Divers',500,'Miscellaneous']],37500);
}

/* Réserve */
var RES=[3,6,12],resSel=6;
function drawRes(){
  $('resopts').setAttribute('aria-label',L('Scénario de réserve','Reserve scenario'));
  $('resopts').innerHTML=RES.map(function(m){return '<button type="button" data-m="'+m+'" aria-pressed="'+(m===resSel)+'">'+m+L(' mois',' months')+(m===6?L(' · recommandé',' · recommended'):'')+'</button>'}).join('');
  document.querySelectorAll('#resopts button').forEach(function(b){b.addEventListener('click',function(){resSel=+b.dataset.m;drawRes()})});
  var r=37500*resSel,tot=323400+r;
  $('restiles').innerHTML='<div class="tile"><small>'+L('Ouverture','Opening')+'</small><b>'+F(323400)+'</b></div><div class="tile"><small>'+L('Réserve d\'exploitation','Operating reserve')+'</small><b>'+F(r)+'</b></div><div class="tile"><small>'+L('Besoin total calculé','Total need calculated')+'</small><b>'+F(tot)+'</b></div>';
  $('restxt').textContent=resSel===3?L('Réduit la trésorerie de sécurité : le projet absorbe moins de retard commercial.','Reduces the safety cash: the project can absorb less commercial delay.'):resSel===6?L('Protège la continuité si les ventes prennent du retard, sans surcapitaliser avant la validation du modèle. Arrondi à 550 000 SAR, soit 1 600 SAR de marge de présentation.','Protects continuity if sales are delayed, without over-capitalising before the model is validated. Rounded to 550,000 SAR, i.e. 1,600 SAR of presentation margin.'):L('Immobilise davantage de capital avant validation du modèle.','Ties up more capital before the model is validated.');
}

/* Simulateur */
var SIMS=[['vol',function(v){return F(v)+L(' / jour',' / day')}],['com',function(v){return F(v,1)+(LANG==='en'?'%':' %')}],['mat',function(v){return F(v,2)+' SAR'}],['pack',function(v){return F(v,2)+' SAR'}],['fix',function(v){return F(v)+' SAR'}],['ren',function(v){return v?L('Inclus','Included'):L('Exclu','Excluded')}]];
SIMS.forEach(function(s){$('s-'+s[0]).addEventListener('input',function(){S[s[0]]=+this.value;render()})});
$('resetsim').addEventListener('click',function(){S=Object.assign({},S0);SIMS.forEach(function(s){$('s-'+s[0]).value=S0[s[0]]});render()});

function lineChart(el,pts,cur){
  var W=640,H=250,L_=56,R=14,T=14,B=34;
  var ys=pts.map(function(p){return p[1]});var mn=Math.min(0,Math.min.apply(null,ys)),mx=Math.max(0,Math.max.apply(null,ys));
  var pad=(mx-mn)*0.08||1;mn-=pad;mx+=pad;
  var x=function(v){return L_+(v-pts[0][0])/(pts[pts.length-1][0]-pts[0][0])*(W-L_-R)};
  var y=function(v){return T+(mx-v)/(mx-mn)*(H-T-B)};
  var g='';var step=Math.pow(10,Math.floor(Math.log10((mx-mn)/4)));var st=[1,2,5,10].map(function(k){return k*step}).filter(function(k){return (mx-mn)/k<=6})[0]||step*10;
  for(var t=Math.ceil(mn/st)*st;t<=mx;t+=st){g+='<line x1="'+L_+'" x2="'+(W-R)+'" y1="'+y(t)+'" y2="'+y(t)+'" stroke="'+GRID+'"/><text x="'+(L_-6)+'" y="'+(y(t)+4)+'" text-anchor="end">'+F(t)+'</text>'}
  g+='<line x1="'+L_+'" x2="'+(W-R)+'" y1="'+y(0)+'" y2="'+y(0)+'" stroke="'+INK+'" stroke-width="1.4"/>';
  pts.forEach(function(p,i){if(i%2===0||p[0]===pts[pts.length-1][0])g+='<text x="'+x(p[0])+'" y="'+(H-12)+'" text-anchor="middle">'+p[0]+'</text>'});
  g+='<text x="'+((L_+W-R)/2)+'" y="'+(H-0)+'" text-anchor="middle">'+L('bowls par jour','bowls per day')+'</text>';
  var d=pts.map(function(p,i){return (i?'L':'M')+x(p[0]).toFixed(1)+' '+y(p[1]).toFixed(1)}).join('');
  g+='<path d="'+d+'" fill="none" stroke="'+GREEN+'" stroke-width="2.4"/>';
  if(cur){g+='<line x1="'+x(cur[0])+'" x2="'+x(cur[0])+'" y1="'+T+'" y2="'+(H-B)+'" stroke="'+GOLD+'" stroke-dasharray="4 3"/><circle cx="'+x(cur[0])+'" cy="'+y(cur[1])+'" r="5" fill="'+GOLD+'"/>'}
  el.innerHTML='<svg class="ch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+L('Résultat d\'exploitation mensuel selon les bowls par jour','Monthly operating result by bowls per day')+'">'+g+'</svg>';
}

function render(){
  var c=calc();
  SIMS.forEach(function(s){$('so-'+s[0]).textContent=s[1](S[s[0]])});
  var res=S.vol*30*c.contrib-c.fix;
  var cls=function(v){return v>=0?'pos':'neg'};
  $('simtiles').innerHTML=
   '<div class="tile"><small>'+L('Prix moyen TTC / HT','Average price incl. / excl. VAT')+'</small><b>'+F(c.ttc,2)+' / '+F(c.ht,2)+'</b></div>'+
   '<div class="tile"><small>'+L('Coûts variables / bowl','Variable costs / bowl')+'</small><b>'+F(c.vari,2)+'</b></div>'+
   '<div class="tile"><small>'+L('Contribution / bowl','Contribution / bowl')+'</small><b class="'+cls(c.contrib)+'">'+F(c.contrib,2)+'</b></div>'+
   '<div class="tile"><small>'+L('Seuil de rentabilité','Break-even point')+'</small><b>'+(isFinite(c.be)?F(c.be,1)+L(' / jour',' / day'):L('n.d.','n/a'))+'</b></div>'+
   '<div class="tile"><small>'+L('CA TTC mensuel','Monthly sales incl. VAT')+'</small><b>'+F(S.vol*30*c.ttc)+'</b></div>'+
   '<div class="tile"><small>'+L('Résultat mensuel','Monthly result')+'</small><b class="'+cls(res)+'">'+F(res)+'</b></div>';
  var pts=[];for(var v=10;v<=100;v+=5)pts.push([v,v*30*c.contrib-c.fix]);
  lineChart($('simchart'),pts,[Math.min(100,Math.max(10,S.vol)),Math.min(100,Math.max(10,S.vol))*30*c.contrib-c.fix]);
  var vols=[20,30,32,40,50,75,100];
  tbl('tb-be',[L('Bowls / jour','Bowls / day'),L('CA TTC / mois (SAR)','Sales incl. VAT / month (SAR)'),L('Résultat opérationnel / mois (SAR)','Operating result / month (SAR)')],vols.map(function(v){var r=v*30*c.contrib-c.fix;return [v,F(v*30*c.ttc),'<span class="'+cls(r)+'">'+F(r)+'</span>']}));
  drawTraj(c);
}

/* Trajectoires */
function drawTraj(c){
  $('scn').setAttribute('aria-label',L('Scénario','Scenario'));
  $('scn').innerHTML=Object.keys(RAMPS).map(function(k){return '<button type="button" data-k="'+k+'" aria-pressed="'+(k===scn)+'">'+L(k,RNAME[k])+'</button>'}).join('');
  document.querySelectorAll('#scn button').forEach(function(b){b.addEventListener('click',function(){scn=b.dataset.k;render()})});
  var r=RAMPS[scn],cum=0,mn=0,mi=0,rows=[],tot=0,cumA=[];
  r.forEach(function(b,i){var m=b*30*c.contrib-c.fix;cum+=m;cumA.push(cum);if(cum<mn){mn=cum;mi=i}tot+=b*30;rows.push([i+1,b,m,cum])});
  var ann=tot*c.contrib-12*c.fix,be=rows.filter(function(x){return x[2]>=0})[0];
  var cls=function(v){return v>=0?'pos':'neg'};
  $('trtiles').innerHTML=
   '<div class="tile"><small>'+L('Bowls par an','Bowls per year')+'</small><b>'+F(tot)+'</b></div>'+
   '<div class="tile"><small>'+L('CA TTC par an','Annual sales incl. VAT')+'</small><b>'+F(tot*c.ttc)+'</b></div>'+
   '<div class="tile"><small>'+L('Résultat op. annuel','Annual operating result')+'</small><b class="'+cls(ann)+'">'+F(ann)+'</b></div>'+
   '<div class="tile"><small>'+L('Premier mois à l\'équilibre','First break-even month')+'</small><b>'+(be?L('Mois ','Month ')+be[0]:L('Au-delà de 12','Beyond 12'))+'</b></div>'+
   '<div class="tile"><small>'+L('Creux de trésorerie cumulé','Cumulative cash trough')+'</small><b class="neg">'+F(mn)+'</b></div>';
  var W=640,H=270,L_=62,Rr=12,T=16,B=34,vals=rows.map(function(x){return x[2]}).concat(cumA);
  var lo=Math.min(0,Math.min.apply(null,vals)),hi=Math.max(0,Math.max.apply(null,vals));var pd=(hi-lo)*0.08||1;lo-=pd;hi+=pd;
  var y=function(v){return T+(hi-v)/(hi-lo)*(H-T-B)};var bw=(W-L_-Rr)/12;
  var g='';var st=[5000,10000,20000,25000,50000,100000].filter(function(k){return (hi-lo)/k<=7})[0]||100000;
  for(var t=Math.ceil(lo/st)*st;t<=hi;t+=st)g+='<line x1="'+L_+'" x2="'+(W-Rr)+'" y1="'+y(t)+'" y2="'+y(t)+'" stroke="'+GRID+'"/><text x="'+(L_-6)+'" y="'+(y(t)+4)+'" text-anchor="end">'+F(t)+'</text>';
  rows.forEach(function(x,i){var m=x[2],xx=L_+i*bw+bw*0.2,h=Math.abs(y(m)-y(0));g+='<rect x="'+xx+'" y="'+Math.min(y(m),y(0))+'" width="'+bw*0.6+'" height="'+Math.max(h,1)+'" fill="'+(m>=0?GREEN:BAD)+'" opacity=".78"/><text x="'+(L_+i*bw+bw/2)+'" y="'+(H-14)+'" text-anchor="middle">'+(i+1)+'</text>'});
  g+='<line x1="'+L_+'" x2="'+(W-Rr)+'" y1="'+y(0)+'" y2="'+y(0)+'" stroke="'+INK+'" stroke-width="1.4"/><text x="'+((L_+W-Rr)/2)+'" y="'+(H)+'" text-anchor="middle">'+L('mois','months')+'</text>';
  var d=cumA.map(function(v,i){return (i?'L':'M')+(L_+i*bw+bw/2).toFixed(1)+' '+y(v).toFixed(1)}).join('');
  g+='<path d="'+d+'" fill="none" stroke="'+GOLD+'" stroke-width="2.4"/>';
  g+='<circle cx="'+(L_+mi*bw+bw/2)+'" cy="'+y(mn)+'" r="5" fill="'+GOLD+'"/><text x="'+(L_+mi*bw+bw/2+8)+'" y="'+(y(mn)+16)+'" style="fill:'+INK+';font-weight:600">'+L('creux ','trough ')+F(mn)+'</text>';
  g+='<text x="'+(W-Rr)+'" y="'+(y(cumA[11])-8)+'" text-anchor="end" style="fill:'+INK+';font-weight:600">'+L('cumul ','cumulative ')+F(cumA[11])+'</text>';
  $('trchart').innerHTML='<svg class="ch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+L('Résultat mensuel et cumul sur douze mois, scénario ','Monthly result and cumulative total over twelve months, scenario ')+L(scn,RNAME[scn])+'">'+g+'</svg><div style="font-size:13px;color:var(--muted);margin-top:6px">'+L('Barres : résultat d\'exploitation du mois (SAR). Ligne : cumul depuis l\'ouverture.','Bars: operating result for the month (SAR). Line: cumulative since opening.')+'</div>';
  tbl('tb-tr',[L('Mois','Month'),L('Bowls / jour','Bowls / day'),L('Résultat du mois','Result for the month'),L('Cumul','Cumulative')],rows.map(function(x){return [x[0],x[1],'<span class="'+cls(x[2])+'">'+F(x[2])+'</span>',F(x[3])]}));
}

/* Décaissement */
var DEC=[['Constitution et licences','Incorporation and licences',120000,'#0b1426','Création, enregistrements et autorisations.','Set-up, registrations and permits.'],['Équipements, cuisine, imprévus','Equipment, kitchen, contingency',77400,'#16264a','Achats, caution, activation, raccordements, imprévus.','Purchases, deposit, activation, connections, contingency.'],['Personnel, marketing, stock, réserve initiale','Staff, marketing, stock, initial reserve',126000,'#9a7a2e','Formalités des salariés, préparation commerciale, premiers achats, trésorerie initiale.','Employee formalities, commercial preparation, first purchases, initial cash.'],['Réserve d\'exploitation six mois','Six-month operating reserve',225000,'#d4b46a','Charges fixes disponibles selon les besoins ; non consommée si l\'activité couvre ses charges.','Fixed costs available as needed; not consumed if the business covers its costs.'],['Arrondi d\'enveloppe','Rounding of the envelope',1600,'#6b6256','Marge de présentation.','Presentation margin.']];
var ds=3;
function drawDec(){
  $('seg').innerHTML=DEC.map(function(d,i){return '<button type="button" data-i="'+i+'" aria-label="'+L(d[0],d[1])+'" aria-pressed="'+(i===ds)+'" style="width:'+(d[2]/550000*100)+'%;background:'+d[3]+'"></button>'}).join('');
  $('leg').innerHTML=DEC.map(function(d,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(i===ds)+'"><span class="sw" style="background:'+d[3]+'"></span><span>'+L(d[0],d[1])+'<br><b>'+F(d[2])+' SAR</b> · '+F(d[2]/5500,1)+(LANG==='en'?'%':' %')+'</span></button>'}).join('');
  $('segtxt').innerHTML='<b>'+L(DEC[ds][0],DEC[ds][1])+' · '+F(DEC[ds][2])+' SAR.</b> '+L(DEC[ds][4],DEC[ds][5]);
  document.querySelectorAll('#seg button,#leg button').forEach(function(b){b.addEventListener('click',function(){ds=+b.dataset.i;drawDec()})});
}

/* Conditions d'expansion */
var GATES=[['Demande commerciale','Commercial demand','Volume stable, réachat et zones de livraison identifiées','Stable volume, repeat orders and delivery zones identified'],['Marge','Margin','Contribution réelle positive après commissions et remises','Actual contribution positive after commissions and discounts'],['Qualité','Quality','Recettes reproductibles, délais et réclamations maîtrisés','Reproducible recipes, lead times and complaints under control'],['Production','Production','Capacité de l\'unité centrale à approvisionner un satellite','Central unit able to supply a satellite'],['Trésorerie','Cash','Charges couvertes et réserve de sécurité préservée','Costs covered and safety reserve preserved'],['Implantation','Location','Zone supplémentaire démontrant un potentiel de commandes','Additional area showing order potential']];
var gstate=[0,0,0,0,0,0];
function drawGates(){
  $('gates').innerHTML=GATES.map(function(g,i){return '<label class="gate"><input type="checkbox" data-g="'+i+'"'+(gstate[i]?' checked':'')+'><span><b>'+L(g[0],g[1])+'</b><br>'+L(g[2],g[3])+'</span></label>'}).join('')+'<p id="gtxt" style="margin:14px 0 0;font-weight:600"></p>';
  document.querySelectorAll('#gates input').forEach(function(i){i.addEventListener('change',function(){gstate[+i.dataset.g]=i.checked?1:0;gate()})});gate();
}
function gate(){var n=gstate.reduce(function(a,b){return a+b},0);$('gtxt').textContent=L(n+' critères sur 6 validés'+(n===6?' : la deuxième implantation peut être étudiée.':'.'),n+' of 6 criteria met'+(n===6?': the second site can be considered.':'.'))}

function setLang(l){
  LANG=l;try{localStorage.setItem('kk_lang',l)}catch(e){}
  applyStatic();drawNav();drawSteps();drawTables();drawBars();drawRes();drawDec();drawGates();syncMix(0);
}
document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l)})});
setLang(LANG);
})();
