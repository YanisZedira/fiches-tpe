// Construit le site (docs/) et le README à partir de fiches.mjs : node build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { FICHES } from './fiches.mjs';

const BASE = 'https://yaniszedira.github.io/fiches-tpe';
const Y = 'https://yz-automation.fr';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const DATE = '2026-11-10';

const CSS = `:root{--bg:#f6f8fc;--card:#fff;--ink:#0b1120;--muted:#55607a;--line:#dfe5f0;--accent:#1d4ed8;--soft:#eaf0ff;--ok:#0f7b4f}
@media (prefers-color-scheme:dark){:root{--bg:#0b1120;--card:#121a2e;--ink:#eef2fb;--muted:#a3aec6;--line:#243049;--accent:#7aa5ff;--soft:#182544;--ok:#4ad295}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
a{color:var(--accent)}
.top{display:flex;justify-content:space-between;gap:12px;align-items:center;max-width:980px;margin:0 auto;padding:16px}
.top a{text-decoration:none;font-weight:700;color:var(--ink)}
.top nav a{font-weight:500;color:var(--muted);margin-left:14px}
main{max-width:780px;margin:0 auto;padding:8px 16px 56px}
main.hub{max-width:980px}
.crumb{font-size:.9rem;color:var(--muted);margin:0 0 12px}
.crumb a{color:var(--muted)}
.cat{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
h1{font-size:clamp(1.7rem,5vw,2.4rem);line-height:1.15;letter-spacing:-.02em;margin:0 0 14px;text-wrap:balance}
h2{font-size:1.25rem;line-height:1.3;margin:0 0 10px}
h3{font-size:1.02rem;margin:0}
p{margin:0 0 14px}
.lead{font-size:1.08rem;color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin:0 0 16px}
.model{border:1px solid var(--line);border-radius:12px;margin:0 0 14px;overflow:hidden}
.model header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:var(--soft)}
.model pre{margin:0;padding:14px;white-space:pre-wrap;overflow-wrap:anywhere;font:15px/1.6 inherit;font-family:inherit}
button{font:inherit;font-weight:600;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}
ul{margin:0 0 6px;padding-left:20px}
li{margin-bottom:6px}
.more{background:var(--soft);border-color:transparent}
.grid{display:grid;gap:14px;grid-template-columns:repeat(3,minmax(0,1fr));list-style:none;padding:0;margin:20px 0}
.grid li{margin:0}
.grid a{display:block;height:100%;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;text-decoration:none;color:var(--ink)}
.grid a:hover{border-color:var(--accent)}
.grid b{display:block;line-height:1.3;margin:2px 0 6px}
.grid span.d{color:var(--muted);font-size:.93rem}
.others{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}
.others li{margin:0}
.others a{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--card);text-decoration:none;font-size:.92rem}
footer{max-width:980px;margin:0 auto;padding:20px 16px 40px;color:var(--muted);font-size:.92rem;border-top:1px solid var(--line)}
@media (max-width:820px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:520px){.grid{grid-template-columns:1fr}.top nav a.hide{display:none}}
@media print{.top nav,button,.others,footer{display:none}}`;

const head = (title, desc, url, extra = '') => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<link rel="stylesheet" href="${BASE}/style.css">
${extra}
</head>
<body>
<header class="top">
  <a href="${BASE}/">Fiches pratiques TPE</a>
  <nav><a href="${BASE}/">Toutes les fiches</a><a class="hide" href="${Y}/outils">Outils en ligne</a></nav>
</header>`;

const foot = `<footer>
  <p>Fiches libres de droits (licence MIT), écrites par Yanis Zedira, fondateur de <a href="${Y}">YZ Automation</a> : sites internet, agents IA et automatisations pour les entreprises. <a href="https://github.com/YanisZedira/fiches-tpe">Source sur GitHub</a>.</p>
  <p>Voir aussi : <a href="${Y}/outils">les outils en ligne</a>, <a href="https://yaniszedira.github.io/checklist-seo-local/">la checklist SEO local</a>, <a href="https://yaniszedira.github.io/calculateur-temps-perdu/">le calculateur du temps perdu</a>.</p>
</footer>
<script>
document.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-copy]'); if (!b) return;
  var text = document.getElementById(b.getAttribute('data-copy')).textContent;
  var done = function () { var t = b.textContent; b.textContent = 'Copié'; setTimeout(function () { b.textContent = t; }, 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); return; }
  var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (err) {} ta.remove();
});
</script>
</body>
</html>
`;

mkdirSync('docs', { recursive: true });
writeFileSync('docs/style.css', CSS, 'utf8');
writeFileSync('docs/.nojekyll', '', 'utf8');
const author = { '@type': 'Person', name: 'Yanis Zedira', url: `${Y}/a-propos` };

for (const f of FICHES) {
  const url = `${BASE}/${f.slug}/`;
  // Trois fiches liées : même rubrique d'abord, puis les suivantes dans la liste.
  const rest = FICHES.filter((o) => o.slug !== f.slug);
  const related = [...rest.filter((o) => o.cat === f.cat), ...rest.filter((o) => o.cat !== f.cat)].slice(0, 4);
  const jsonld = [
    ld({ '@context': 'https://schema.org', '@type': 'Article', headline: f.title, description: f.desc, inLanguage: 'fr', datePublished: DATE, dateModified: DATE,
      mainEntityOfPage: url, author, publisher: { '@type': 'Organization', name: 'YZ Automation', url: Y }, isAccessibleForFree: true, license: 'https://opensource.org/licenses/MIT' }),
    ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fiches pratiques TPE', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: f.title, item: url }] }),
  ].join('\n');
  const html = `${head(f.title + ' | Fiches TPE', f.desc, url, jsonld)}
<main>
  <p class="crumb"><a href="${BASE}/">Fiches pratiques</a> / ${esc(f.cat)}</p>
  <span class="cat">${esc(f.cat)}</span>
  <h1>${esc(f.title)}</h1>
  <p class="lead">${esc(f.intro)}</p>

  <section class="card">
    <h2>${f.models.length > 1 ? 'Les modèles à copier' : 'Le modèle à copier'}</h2>
${f.models.map(([label, text], i) => `    <div class="model">
      <header><h3>${esc(label)}</h3><button type="button" data-copy="m${i}">Copier</button></header>
      <pre id="m${i}">${esc(text)}</pre>
    </div>`).join('\n')}
    <p style="margin:0;color:var(--muted);font-size:.92rem">Remplacez les éléments entre crochets par les vôtres.</p>
  </section>

  <section class="card">
    <h2>À savoir avant de s'en servir</h2>
    <ul>
${f.tips.map((t) => `      <li>${esc(t)}</li>`).join('\n')}
    </ul>
  </section>

  <section class="card more">
    <h2>Pour aller plus loin</h2>
    <p style="margin:0">${esc(f.more[2])} <a href="${f.more[0]}">${esc(f.more[1])}</a>.</p>
  </section>

  <section>
    <h2>Fiches liées</h2>
    <ul class="others">
${related.map((o) => `      <li><a href="${BASE}/${o.slug}/">${esc(o.title)}</a></li>`).join('\n')}
    </ul>
  </section>
</main>
${foot}`;
  mkdirSync(`docs/${f.slug}`, { recursive: true });
  writeFileSync(`docs/${f.slug}/index.html`, html, 'utf8');
}

const cats = [...new Set(FICHES.map((f) => f.cat))];
const hubDesc = `${FICHES.length} fiches pratiques pour les dirigeants de TPE : modèles de relance, messages clients, check-lists de site, de sécurité et de gestion. À copier, sans inscription.`;
const hub = `${head('Fiches pratiques pour TPE : modèles et check-lists à copier', hubDesc, BASE + '/',
  ld({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Fiches pratiques pour TPE', url: BASE + '/', description: hubDesc, inLanguage: 'fr', author,
    mainEntity: { '@type': 'ItemList', itemListElement: FICHES.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.title, url: `${BASE}/${f.slug}/` })) } }))}
<main class="hub">
  <h1>Fiches pratiques pour dirigeants de TPE</h1>
  <p class="lead">${FICHES.length} fiches d'une page, avec des modèles prêts à copier : relances, messages aux clients, check-lists. Écrites pour être utilisées dans l'heure, sans inscription ni téléchargement.</p>
${cats.map((c) => `  <h2 style="margin-top:28px">${esc(c)}</h2>
  <ul class="grid">
${FICHES.filter((f) => f.cat === c).map((f) => `    <li><a href="${BASE}/${f.slug}/"><b>${esc(f.title)}</b><span class="d">${esc(f.desc)}</span></a></li>`).join('\n')}
  </ul>`).join('\n')}

  <section class="card">
    <h2>D'où viennent ces fiches</h2>
    <p>Je m'appelle Yanis Zedira. Je conçois des sites, des agents IA et des automatisations pour des entreprises de toutes tailles, et je retrouve partout les mêmes besoins de base : relancer un devis, demander un avis, écrire une procédure, vérifier un devis avant de signer. Ces fiches rassemblent les modèles que je donne à mes clients.</p>
    <p style="margin:0">Elles sont libres : copiez-les, adaptez-les, partagez-les. Pour les calculs du quotidien (TVA, marge, pénalités de retard, QR code), voir <a href="${Y}/outils">les outils en ligne de YZ Automation</a>.</p>
  </section>
</main>
${foot}`;
writeFileSync('docs/index.html', hub, 'utf8');

let md = `# Fiches pratiques pour TPE\n\n${FICHES.length} fiches d'une page pour les dirigeants de petites entreprises : des modèles prêts à copier (relances, messages aux clients, procédures) et des check-lists (site internet, sécurité, RGPD, facture électronique).\n\n**Les lire : [yaniszedira.github.io/fiches-tpe](${BASE}/)**\n`;
for (const c of cats) {
  md += `\n## ${c}\n\n`;
  for (const f of FICHES.filter((x) => x.cat === c)) md += `- [${f.title}](${BASE}/${f.slug}/)\n`;
}
md += `\n## Réutilisation\n\nLicence MIT : copiez, adaptez, traduisez. Tout le contenu est dans \`fiches.mjs\`, et \`node build.mjs\` produit le site dans \`docs/\`. Une correction ou une idée de fiche ? Ouvrez un ticket.\n\nCes fiches donnent des modèles courants et ne remplacent pas un conseil juridique ou comptable.\n\nÉcrites par Yanis Zedira, fondateur de [YZ Automation](${Y}). Voir aussi les [outils en ligne](${Y}/outils), la [checklist SEO local](https://github.com/YanisZedira/checklist-seo-local) et le [calculateur du temps perdu](https://github.com/YanisZedira/calculateur-temps-perdu).\n`;
writeFileSync('README.md', md, 'utf8');

console.log(FICHES.length, 'fiches,', cats.length, 'rubriques');
for (const f of FICHES) {
  const t = f.title + ' | Fiches TPE';
  if (t.length > 75) console.log('  ! titre', t.length, f.slug);
  if (f.desc.length > 165) console.log('  ! description', f.desc.length, f.slug);
}
