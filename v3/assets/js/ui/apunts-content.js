/* ============================================================
   Àlgebra · Primer Parcial — Apunts (resum fidel del llibre)
   Font: "Apunts d'àlgebra lineal" (E. Nart i X. Xarles), capítols
   1 (Nombres complexos) i 2 (Matrius), que és el temari del
   primer parcial. S'hi citen els teoremes amb la numeració
   original del llibre perquè es puguin localitzar fàcilment.
   ============================================================ */
(function (global) {
  'use strict';
  const Fmt = global.Fmt;
  const matrix = (rows) => Fmt.matHTML(rows);

  const CONTENT = {

    cosPolinomis: {
      title: 'Cossos i polinomis',
      subtitle: '§1.1–1.2 dels apunts · fonaments: K, K[x], Ruffini',
      html: `
        <p class="lead">Un <strong>cos</strong> és un conjunt <span class="math">K</span> amb suma i producte que compleixen les propietats associativa, commutativa, distributiva, l'existència d'elements neutres <span class="math">0, 1</span> i l'existència d'elements simètrics (<span class="math">−a</span> per a tot <span class="math">a</span>, i <span class="math">a<sup>−1</sup></span> per a tot <span class="math">a ≠ 0</span>).</p>

        <h3>1. Els cossos que fem servir</h3>
        <p>Al curs només apareixen quatre cossos: <span class="math">Q ⊂ R ⊂ C</span> i, a part, <span class="math">Z<sub>2</sub> = {0, 1}</span>. <span class="math">N</span> i <span class="math">Z</span> <strong>no</strong> són cossos: no tenen inversos (ni simètrics en el cas de <span class="math">N</span>).</p>
        <div class="keyfact"><strong>Fet curiós de <span class="math">Z<sub>2</sub></span>.</strong> Només hi ha dos elements i es compleix <span class="math">1 + 1 = 0</span>, és a dir <span class="math">1 = −1</span>. Sumar i restar són la mateixa operació. Als apunts apareix a tallers i exercicis (codis correctors d'errors); al parcial 1 treballem sempre amb <span class="math">R</span> o <span class="math">C</span>.</div>

        <h3>2. Polinomis a K[x]</h3>
        <p>Un polinomi és <span class="math">p(x) = a<sub>0</sub> + a<sub>1</sub>x + … + a<sub>m</sub>x<sup>m</sup></span>. El <strong>grau</strong> és l'índex del monomi no nul més gran; el <strong>coeficient principal</strong> és el seu coeficient, i el polinomi és <strong>mònic</strong> si aquest val 1.</p>
        <div class="thm"><span class="thm-label">Teorema 1.1 (divisió euclidiana)</span>Donats <span class="math">f(x), g(x) ∈ K[x]</span> amb <span class="math">g(x) ≠ 0</span>, existeixen uns únics <span class="math">q(x), r(x)</span> amb <span class="math">f(x) = q(x)g(x) + r(x)</span> i <span class="math">deg(r(x)) &lt; deg(g(x))</span>.</div>
        <div class="thm"><span class="thm-label">Teorema 1.2 (factorització)</span>Tot polinomi <span class="math">f(x) ∈ K[x]</span> es descompon, de manera única llevat de l'ordre, com a producte del seu coeficient principal i polinomis mònics irreductibles.</div>
        <p>Un polinomi de grau <span class="math">n &gt; 0</span> és <strong>irreductible</strong> si cap factor seu té grau estrictament entre <span class="math">0</span> i <span class="math">n</span>. Ser irreductible depèn del cos: <span class="math">x<sup>2</sup>−2</span> és irreductible a <span class="math">Q[x]</span> però factoritza a <span class="math">R[x]</span>.</p>

        <h3>3. Arrels i el teorema de Ruffini</h3>
        <p><span class="math">u ∈ K</span> és una <strong>arrel</strong> de <span class="math">f(x)</span> si <span class="math">f(u) = 0</span>.</p>
        <div class="thm"><span class="thm-label">Teorema de Ruffini</span>El residu de dividir <span class="math">f(x)</span> per <span class="math">x − u</span> és exactament <span class="math">f(u)</span>. Per tant, <span class="math">u</span> és arrel de <span class="math">f(x)</span> si, i només si, <span class="math">(x−u)</span> divideix <span class="math">f(x)</span>.</div>
        <div class="keyfact"><strong>Corol·lari 1.3.</strong> Un polinomi de grau 1 és sempre irreductible. Un de grau <strong>2 o 3</strong> és irreductible si, i només si, <strong>no té cap arrel</strong> a <span class="math">K</span>.
          <div class="warn" style="margin:.6rem 0 0">Aquest criteri <strong>no val a partir de grau 4</strong>: <span class="math">x<sup>4</sup>+1</span> no té cap arrel real, però factoritza a <span class="math">R[x]</span> com <span class="math">(x<sup>2</sup>+√2x+1)(x<sup>2</sup>−√2x+1)</span>. Una pregunta de teoria clàssica juga amb aquest parany.</div>
        </div>
        <p>La <strong>multiplicitat</strong> d'una arrel <span class="math">u</span> és el màxim <span class="math">n</span> tal que <span class="math">(x−u)<sup>n</sup></span> divideix <span class="math">f(x)</span>.</p>
        <div class="thm"><span class="thm-label">Corol·lari 1.4</span>Un polinomi de grau <span class="math">n</span> té com a molt <span class="math">n</span> arrels, comptant multiplicitats.</div>
        <div class="tip">Al parcial, tot això es concreta en: comprovar una arrel amb Ruffini/substitució, usar el conjugat (coeficients reals) i Vieta per trobar les altres, i factoritzar. Detalls pràctics i exemples resolts a <a href="#teoria/polinomis" data-view-link="teoria" data-theory="polinomis">Teoria → Polinomis</a>.</div>
      `
    },

    complexosPolar: {
      title: 'Nombres complexos: construcció i forma polar',
      subtitle: '§1.3–1.5 dels apunts · C com a cos, arrels n-èsimes, teorema fonamental',
      html: `
        <p class="lead">Els complexos s'inventen perquè <span class="math">R</span> no basta: <span class="math">x<sup>2</sup>+1</span> no té arrel real. Es defineix <span class="math">i</span> amb <span class="math">i<sup>2</sup> = −1</span> i <span class="math">C = {x + yi ∣ x, y ∈ R}</span>.</p>

        <h3>1. C és un cos</h3>
        <p>Amb la suma i el producte habituals, <span class="math">C</span> satisfà totes les propietats de cos. En particular tot complex no nul és invertible:</p>
        <div class="formula big"><span class="math">(x+yi)<sup>−1</sup> = (x−yi)/(x<sup>2</sup>+y<sup>2</sup>)</span></div>

        <h3>2. Dades d'un complex</h3>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">Part real / imaginària</span><span class="math">Re(z) = x</span>, <span class="math">Im(z) = y</span></div>
          <div class="formula"><span class="formula-title">Mòdul</span><span class="math">|z| = √(x<sup>2</sup>+y<sup>2</sup>) ∈ R<sub>≥0</sub></span></div>
          <div class="formula"><span class="formula-title">Conjugat</span><span class="math">z̄ = x − yi</span></div>
        </div>
        <p>Propietats bàsiques (totes demostrables directament): <span class="math">|z| = 0 ⇔ z = 0</span>; <span class="math">|zw| = |z||w|</span>; <span class="math">|z+w| ≤ |z|+|w|</span> (desigualtat triangular); <span class="math">z+w = z̄+w̄</span>, <span class="math">zw = z̄w̄</span>, <span class="math">z̄̄ = z</span>; i <span class="math">z·z̄ = |z|<sup>2</sup></span>.</p>

        <h3>3. Forma polar: l'argument no és un nombre real</h3>
        <div class="warn"><strong>Compte.</strong> L'argument <span class="math">θ = arg(z)</span> viu a <span class="math">R/2πZ</span>: dos angles que es diferencien en un múltiple enter de <span class="math">2π</span> representen el mateix argument (<span class="math">2π = 0</span>, <span class="math">3π/2 = −π/2</span>...). Oblidar-se de reduir mòdul <span class="math">2π</span> és un error típic en preguntes de teoria i en l'exercici de potències.</div>
        <div class="thm"><span class="thm-label">Teorema 1.5</span><span class="math">|zw| = |z||w|</span> i <span class="math">arg(zw) = arg(z) + arg(w)</span>.</div>
        <p>Es defineix <span class="math">e<sup>iθ</sup> = cos θ + i sin θ</span> (mòdul 1, argument <span class="math">θ</span>), i la forma polar de <span class="math">z ≠ 0</span> és <span class="math">z = re<sup>iθ</sup></span>. El Teorema 1.5 es tradueix en <span class="math">(re<sup>iθ</sup>)(se<sup>iω</sup>) = (rs)e<sup>i(θ+ω)</sup></span>: multiplicar és sumar arguments.</p>
        <p>Els <strong>16 arguments privilegiats</strong> (múltiples de <span class="math">π/6</span> i <span class="math">π/4</span>) tenen conversió exacta i estan tots a <a href="#formulari" data-view-link="formulari">Formulari</a>.</p>

        <h3>4. Arrels n-èsimes</h3>
        <div class="thm"><span class="thm-label">Teorema 1.6</span>Per a <span class="math">n ≥ 2</span>, tot complex no nul <span class="math">z = re<sup>iθ</sup></span> té exactament <span class="math">n</span> arrels n-èsimes diferents: <span class="math">w<sub>k</sub> = r<sup>1/n</sup>e<sup>i(θ+2kπ)/n</sup></span>, per a <span class="math">k = 0, …, n−1</span>.</div>
        <p>Totes tenen el mateix mòdul <span class="math">r<sup>1/n</sup></span> i formen un polígon regular de <span class="math">n</span> costats al pla complex. Les arrels n-èsimes de <strong>la unitat</strong> són <span class="math">ζ<sub>k</sub> = e<sup>i2kπ/n</sup></span>, i les arrels de qualsevol <span class="math">z</span> s'obtenen com <span class="math">w<sub>0</sub>·ζ<sub>k</sub></span>.</p>

        <h3>5. Teorema fonamental de l'Àlgebra</h3>
        <div class="thm"><span class="thm-label">Teorema fonamental</span>Un polinomi complex de grau <span class="math">n &gt; 0</span> té exactament <span class="math">n</span> arrels complexes, comptant multiplicitats: <span class="math">f(x) = a<sub>n</sub>(x−u<sub>1</sub>)…(x−u<sub>n</sub>)</span>.</div>
        <p>Aquest és el resultat que fa que, a <span class="math">C[x]</span>, <strong>tot</strong> polinomi factoritzi completament en factors de grau 1. A <span class="math">R[x]</span>, les arrels no reals s'agrupen per parelles conjugades i donen factors de grau 2 irreductibles.</p>
        <div class="tip">Tot això ja ho fas servir a l'exercici 1 del parcial. Pràctica i exemples pas a pas a <a href="#teoria/complexos" data-view-link="teoria" data-theory="complexos">Teoria → Nombres complexos</a>.</div>
      `
    },

    matriusInvertibles: {
      title: 'Matrius invertibles',
      subtitle: '§2.1–2.2 dels apunts · definició, unicitat de la inversa, GLₙ(K)',
      html: `
        <p class="lead">La matriu identitat <span class="math">I<sub>n</sub></span> és l'element neutre del producte: <span class="math">AI = A</span>, <span class="math">IB = B</span>.</p>

        <h3>1. Definició i unicitat de la inversa</h3>
        <div class="keyfact"><strong>Definició.</strong> <span class="math">A ∈ K<sup>n×n</sup></span> és <strong>invertible</strong> si existeix <span class="math">B</span> amb <span class="math">AB = BA = I</span>. Aquesta <span class="math">B</span> és única i es denota <span class="math">A<sup>−1</sup></span>.</div>
        <p>La unicitat es demostra en tres línies: si <span class="math">B, B′</span> compleixen (2.3), aleshores <span class="math">B = B(AB′) = (BA)B′ = B′</span>.</p>
        <p>El conjunt <span class="math">GL<sub>n</sub>(K)</span> de les matrius invertibles és un <strong>grup</strong> (no commutatiu si <span class="math">n &gt; 1</span>):</p>
        <ul>
          <li><span class="math">I</span> és invertible, <span class="math">I<sup>−1</sup> = I</span>.</li>
          <li>Si <span class="math">A</span> és invertible, <span class="math">(A<sup>−1</sup>)<sup>−1</sup> = A</span>.</li>
          <li><span class="math">(AB)<sup>−1</sup> = B<sup>−1</sup>A<sup>−1</sup></span> — <strong>l'ordre s'inverteix</strong>.</li>
          <li><span class="math">(A<sup>t</sup>)<sup>−1</sup> = (A<sup>−1</sup>)<sup>t</sup></span>.</li>
        </ul>
        <div class="tip">Mnemotècnia del llibre per <span class="math">(AB)<sup>−1</sup>=B<sup>−1</sup>A<sup>−1</sup></span>: per calçar-te et poses primer els mitjons i després les sabates; per descalçar-te, treus primer les sabates i després els mitjons. Desfer un procés en dues etapes es fa en l'ordre invers.</div>

        <h3>2. Aïllar la incògnita a AX = B o XA = B</h3>
        <p>Com que el producte de matrius <strong>no és commutatiu</strong>, cal vigilar per quin costat multipliques per la inversa:</p>
        <div class="two-col">
          <div class="formula"><span class="formula-title">AX = B, amb A invertible</span><span class="math">X = A<sup>−1</sup>B</span><p>Multiplica per l'<strong>esquerra</strong>.</p></div>
          <div class="formula"><span class="formula-title">XA = B, amb A invertible</span><span class="math">X = BA<sup>−1</sup></span><p>Multiplica per la <strong>dreta</strong>.</p></div>
        </div>

        <h3>3. Un criteri (parcial) de NO invertibilitat</h3>
        <div class="thm"><span class="thm-label">Lema 2.2</span>Si una fila (o columna) d'una matriu quadrada <span class="math">A</span> és combinació lineal de les altres, <span class="math">A</span> <strong>no</strong> és invertible.</div>
        <div class="warn">Aquest lema només dona una condició <strong>suficient</strong> de no invertibilitat. El criteri complet (equivalent a <span class="math">det(A) ≠ 0</span> i a <span class="math">rang(A)=n</span>) arriba amb el Teorema 2.12, a la secció següent.</div>
      `
    },

    rangGauss: {
      title: 'Transformacions elementals, rang i Gauss-Jordan',
      subtitle: '§2.3–2.4 dels apunts · el nucli tècnic de tot el parcial',
      html: `
        <h3>1. Les tres transformacions elementals</h3>
        <ol>
          <li>Intercanviar dues files: <span class="math">F<sub>i</sub> ↔ F<sub>j</sub></span>.</li>
          <li>Multiplicar una fila per un escalar no nul: <span class="math">λF<sub>i</sub></span>.</li>
          <li>Sumar a una fila un múltiple d'una altra: <span class="math">λF<sub>j</sub> → F<sub>i</sub></span>.</li>
        </ol>
        <p>Aplicar-les a la identitat produeix una <strong>matriu elemental</strong> <span class="math">E</span>; multiplicar <span class="math">EA</span> equival a aplicar la mateixa transformació a <span class="math">A</span>. Totes les matrius elementals són invertibles (la inversa d'una transformació és una altra transformació elemental).</p>

        <div class="thm"><span class="thm-label">Teorema 2.4</span>Si <span class="math">A′</span> s'obté aplicant una sèrie de transformacions elementals a <span class="math">A</span>, existeix una matriu invertible <span class="math">P</span> (producte de les matrius elementals usades) tal que <span class="math">PA = A′</span>. Aquesta mateixa <span class="math">P</span> s'obté aplicant la cadena de transformacions a la identitat.</div>
        <p>Conseqüències immediates: si <span class="math">A</span> és invertible, qualsevol <span class="math">A′</span> obtinguda per transformacions elementals també ho és (Cor. 2.5); i cada fila de <span class="math">A′</span> és combinació lineal de les files de <span class="math">A</span>, amb els coeficients a la fila corresponent de <span class="math">P</span> (Cor. 2.6) — <strong>això és exactament l'apartat “fila de J com a combinació lineal”</strong> del parcial.</p>

        <div class="thm"><span class="thm-label">Teorema 2.8</span>Aplicant transformacions elementals, tota matriu es porta a una forma normal de <strong>Gauss-Jordan</strong>, i aquesta forma és <strong>única</strong>.</div>
        <div class="keyfact"><strong>Compte amb aquest matís en preguntes de teoria:</strong> la J <strong>d'una matriu concreta</strong> és única, però <strong>matrius diferents poden compartir la mateixa J</strong> (per exemple, <span class="math">I</span> i <span class="math">2I</span> tenen totes dues forma de Gauss-Jordan <span class="math">I</span>). Confondre les dues afirmacions és un parany real al parcial.</div>

        <h3>2. Rang i criteri d'invertibilitat</h3>
        <div class="keyfact"><strong>Definició.</strong> El <strong>rang</strong> de <span class="math">A</span> és el nombre de files no nul·les de la seva forma de Gauss-Jordan (= el nombre de pivots).</div>
        <p><strong>Proposició 2.11:</strong> les transformacions elementals no canvien el rang; i si <span class="math">U</span> és invertible, <span class="math">rang(UA) = rang(A)</span>.</p>
        <div class="thm"><span class="thm-label">Teorema 2.12 (criteri d'invertibilitat)</span>Per a <span class="math">A</span> quadrada de mida <span class="math">n</span>, són <strong>equivalents</strong>: (1) <span class="math">A</span> és invertible; (2) la forma de Gauss-Jordan de <span class="math">A</span> és <span class="math">I</span>; (3) <span class="math">rang(A) = n</span>.</div>
        <div class="thm"><span class="thm-label">Corol·lari 2.13</span>Si <span class="math">AB = I</span>, aleshores <strong>ambdues</strong> <span class="math">A</span> i <span class="math">B</span> són invertibles i cadascuna és la inversa de l'altra — no cal comprovar <span class="math">BA=I</span> a part.</div>

        <h3>3. Càlcul pràctic</h3>
        <p>Per trobar <span class="math">J</span>, <span class="math">rang(A)</span> i una <span class="math">P</span> amb <span class="math">PA=J</span> alhora: aplica Gauss-Jordan a la matriu ampliada <span class="math">(A ∣ I)</span>. Quan a l'esquerra hi quedi <span class="math">J</span>, a la dreta hi tens <span class="math">P</span>. Si <span class="math">A</span> és invertible, <span class="math">J=I</span> i la dreta és directament <span class="math">A<sup>−1</sup></span>.</p>
        <div class="example">
          <h4>Exemple (igual que el mètode del parcial)</h4>
          <p><span class="math">A = ${matrix([[1, 2], [3, 4]])}</span>. Fent <span class="math">(A|I) → (I|A<sup>−1</sup>)</span> s'arriba a <span class="math">A<sup>−1</sup> = ${matrix([['−2', 1], ['3/2', '−1/2']])}</span>.</p>
        </div>
        <div class="tip">Aquest bloc és el <strong>més rentable</strong> del parcial: J+rang i la P surten literalment igual cada any (vegeu <a href="#prioritats" data-view-link="prioritats">Prioritats</a>). Practica'l fins que sigui mecànic a <a href="#generador/matrius" data-view-link="generador" data-topic="matrius">Generador → Matrius</a>.</div>
      `
    },

    sistemesRouche: {
      title: 'Sistemes d’equacions lineals: Teorema de Rouché',
      subtitle: '§2.5 dels apunts · varietats lineals, compatibilitat, dimensió',
      html: `
        <h3>1. Vocabulari formal</h3>
        <ul>
          <li>La <strong>varietat lineal</strong> és el conjunt de solucions d'un sistema lineal.</li>
          <li>Una <strong>equació cartesiana</strong> és el sistema tal com es dona; una <strong>equació paramètrica</strong> el descriu en termes de paràmetres lliures.</li>
          <li>El sistema és <strong>compatible</strong> si té alguna solució; <strong>incompatible</strong> si no en té cap.</li>
          <li>La <strong>dimensió</strong> de la varietat lineal és el nombre de paràmetres lliures.</li>
        </ul>
        <p>En forma matricial, <span class="math">AX = B</span>. <strong>Observació 2.14:</strong> resoldre el sistema equival a preguntar si <span class="math">B</span> és combinació lineal de les columnes de <span class="math">A</span> — les solucions són precisament els coeficients d'aquesta combinació.</p>

        <h3>2. Per què funciona Gauss-Jordan amb sistemes</h3>
        <p>Si <span class="math">P</span> és invertible, <span class="math">AX=B</span> i <span class="math">(PA)X = PB</span> tenen <strong>exactament les mateixes solucions</strong> (multiplica i desmultiplica per <span class="math">P</span>, que és invertible). Per tant, reduir <span class="math">(A|B)</span> a <span class="math">(J|C)</span> per files dona un sistema equivalent, molt més fàcil de llegir.</p>
        <p>Les columnes amb pivot de <span class="math">J</span> corresponen a incògnites <strong>lligades</strong>; la resta són <strong>lliures</strong> (paràmetres).</p>

        <div class="thm"><span class="thm-label">Teorema de Rouché</span>(1) <span class="math">AX=B</span> és compatible si, i només si, <span class="math">rang(A) = rang(A∣B)</span>. (2) En aquest cas, la dimensió de la varietat de solucions és <span class="math">n − rang(A)</span>, on <span class="math">n</span> és el nombre d'incògnites.</div>
        <div class="keyfact"><strong>Corol·lari 2.16.</strong> <span class="math">B</span> és combinació lineal de les columnes de <span class="math">A</span> si, i només si, <span class="math">rang(A) = rang(A∣B)</span>. (És la mateixa afirmació que Rouché, vista des de l'Observació 2.14.)</div>

        <h3>3. L'equació paramètrica vectorial</h3>
        <p>Si la varietat té dimensió <span class="math">d</span>, qualsevol solució s'escriu <span class="math">P = P<sub>0</sub> + p<sub>1</sub>v<sub>1</sub> + … + p<sub>d</sub>v<sub>d</sub></span>, amb <span class="math">P<sub>0</sub></span> una solució particular (paràmetres a 0) i <span class="math">v<sub>1</sub>,…,v<sub>d</sub></span> els <strong>vectors directors</strong>: les coordenades de <span class="math">v<sub>i</sub></span> són els coeficients que acompanyen el paràmetre <span class="math">p<sub>i</sub></span> a cada equació.</p>

        <div class="warn"><strong>Error típic.</strong> Una fila <span class="math">0 ⋯ 0 ∣ b</span> amb <span class="math">b ≠ 0</span> fa el sistema <strong>incompatible</strong>, no "compatible indeterminat". No hi ha varietat de solucions a discutir si <span class="math">rang(A) ≠ rang(A∣B)</span>.</div>
        <div class="tip">Amb paràmetre (<span class="math">b</span> al terme independent): un cop tens <span class="math">P</span> de la secció anterior, calcula <span class="math">P·C(b)</span>; la condició de compatibilitat surt de les files nul·les de <span class="math">J</span>. Pràctica completa a <a href="#teoria/sistemes" data-view-link="teoria" data-theory="sistemes">Teoria → Sistemes</a>.</div>
      `
    },

    determinants: {
      title: 'Determinants',
      subtitle: '§2.6 dels apunts · Laplace, Sarrus, adjunta i Cramer',
      html: `
        <h3>1. Definició (desenvolupament de Laplace)</h3>
        <p>Per a <span class="math">A</span> de mida 1, <span class="math">det(A)</span> és l'única entrada. Per a mida <span class="math">n &gt; 1</span>, escollint qualsevol fila <span class="math">i</span> (o columna <span class="math">j</span>):</p>
        <div class="formula big"><span class="math">det(A) = Σ<sub>j</sub> (−1)<sup>i+j</sup> a<sub>ij</sub> det(A<sub>ij</sub>)</span></div>
        <p>on <span class="math">A<sub>ij</sub></span> és la submatriu que resulta d'esborrar la fila <span class="math">i</span> i la columna <span class="math">j</span>. El resultat és el <strong>mateix</strong> sigui quina sigui la fila o columna triada — un fet remarcable que el curs no demostra, però que es pot aprofitar escollint la fila/columna amb més zeros.</p>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">2×2</span><span class="math">det ${matrix([['a', 'b'], ['c', 'd']])} = ad − bc</span></div>
          <div class="formula"><span class="formula-title">3×3 (Sarrus)</span><span class="math">det ${matrix([['a', 'b', 'c'], ['u', 'v', 'w'], ['r', 's', 't']])} = avt+usc+rbw−cvr−wsa−tbu</span></div>
        </div>

        <h3>2. Propietats (totes són font de preguntes de teoria)</h3>
        <ol class="checklist">
          <li><span class="math">det(A) = det(A<sup>t</sup>)</span>.</li>
          <li>Si <span class="math">A</span> està esglaonada, <span class="math">det(A)</span> és el producte de la diagonal.</li>
          <li>Intercanviar dues files (o columnes) canvia el signe de <span class="math">det</span>.</li>
          <li>Multiplicar una fila per <span class="math">λ</span> multiplica <span class="math">det</span> per <span class="math">λ</span> — per això <span class="math">det(kA) = k<sup>n</sup>det(A)</span> en una matriu <span class="math">n×n</span> (es multiplica <strong>cada</strong> fila).</li>
          <li>Sumar a una fila un múltiple d'una altra <strong>no canvia</strong> <span class="math">det</span>.</li>
          <li>Fila (o columna) combinació lineal de les altres ⇒ <span class="math">det(A) = 0</span>.</li>
          <li><span class="math">det(AB) = det(A)det(B)</span>.</li>
          <li>(Interpretació geomètrica) A <span class="math">R<sup>n</sup></span>, <span class="math">|det(A)|</span> és el volum del paral·lelepípede que generen les files de <span class="math">A</span>.</li>
        </ol>
        <div class="tip">Les propietats 3–5 permeten calcular determinants <strong>esglaonant</strong> (molt més ràpid que Laplace per matrius grans): vas anotant com canvia <span class="math">det</span> a cada pas i, al final, el multiplies pel producte de la diagonal de la matriu esglaonada.</div>

        <h3>3. Matriu adjunta, inversa i Cramer</h3>
        <p>El <strong>valor adjunt</strong> de <span class="math">A</span> en <span class="math">(i,j)</span> és <span class="math">(−1)<sup>i+j</sup>det(A<sub>ij</sub>)</span>; la <strong>matriu adjunta</strong> <span class="math">A<sup>ad</sup></span> els recull tots.</p>
        <div class="thm"><span class="thm-label">Proposicions 2.17–2.18</span><span class="math">A(A<sup>ad</sup>)<sup>t</sup> = det(A)·I</span>. En particular, <span class="math">A</span> és invertible si, i només si, <span class="math">det(A) ≠ 0</span>, i llavors <span class="math">A<sup>−1</sup> = det(A)<sup>−1</sup>(A<sup>ad</sup>)<sup>t</sup></span>.</div>
        <p>Per a <span class="math">2×2</span> això es simplifica a la fórmula coneguda: <span class="math">A<sup>−1</sup> = det(A)<sup>−1</sup>${matrix([['d', '−b'], ['−c', 'a']])}</span>.</p>
        <div class="thm"><span class="thm-label">Regla de Cramer</span>Si <span class="math">AX=B</span> amb <span class="math">A</span> invertible, l'única solució és <span class="math">x<sub>i</sub> = det(C<sub>i</sub>)/det(A)</span>, on <span class="math">C<sub>i</sub></span> és <span class="math">A</span> amb la columna <span class="math">i</span> substituïda per <span class="math">B</span>.</div>
        <div class="warn">Als parcials reals (2017–2025) mai es demana explícitament Cramer ni l'adjunta: el mètode esperat és sempre Gauss-Jordan amb la matriu <span class="math">P</span>. Aquesta secció et serveix sobretot per <strong>preguntes de teoria</strong> curtes sobre determinants i inverses.</div>
      `
    }
  };

  function getApunts() { return CONTENT; }
  function getSection(id) { return CONTENT[id] || CONTENT.cosPolinomis; }

  global.ApuntsContent = { getApunts, getSection };
})(typeof window !== 'undefined' ? window : globalThis);
