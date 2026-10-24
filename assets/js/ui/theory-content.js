/* ============================================================
   Àlgebra · Parcial 1 — Contingut teòric (català)
   ============================================================ */
(function (global) {
  'use strict';
  const Fmt = global.Fmt;

  const matrix = (rows) => Fmt.matHTML(rows);
  const frac = (n, d) => Fmt.fracHTML(global.F(n, d));

  const CONTENT = {
    complexos: {
      title: 'Nombres complexos',
      subtitle: 'Forma binòmica, polar, potències i arrels',
      html: `
        <p class="lead">Un nombre complex és una expressió <span class="math">z = a + bi</span>, on <span class="math">a, b ∈ R</span> i <span class="math">i<sup>2</sup> = −1</span>. La part real és <span class="math">Re(z) = a</span> i la part imaginària és <span class="math">Im(z) = b</span>.</p>

        <h3>1. El pla complex</h3>
        <p>Representem <span class="math">z = a + bi</span> com el punt <span class="math">(a, b)</span> del pla: l'eix horitzontal és l'eix real i el vertical és l'eix imaginari.</p>
        <div class="two-col">
          <div>
            <ul>
              <li><strong>1r quadrant:</strong> <span class="math">a &gt; 0, b &gt; 0</span>.</li>
              <li><strong>2n quadrant:</strong> <span class="math">a &lt; 0, b &gt; 0</span>.</li>
              <li><strong>3r quadrant:</strong> <span class="math">a &lt; 0, b &lt; 0</span>.</li>
              <li><strong>4t quadrant:</strong> <span class="math">a &gt; 0, b &lt; 0</span>.</li>
            </ul>
            <p>Els punts amb <span class="math">a = 0</span> o <span class="math">b = 0</span> són sobre un eix i <strong>no</strong> pertanyen a cap quadrant.</p>
          </div>
          <div class="tip">Dibuixar les arrels en el pla és una pregunta habitual. Marca sempre els eixos, els punts i, si cal, el cercle de radi <span class="math">|z|</span>.</div>
        </div>

        <h3>2. Conjugat, mòdul i argument</h3>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">Conjugat</span><span class="math">z̄ = a − bi</span><p>Canvia el signe de la part imaginària. El conjugat de <span class="math">z̄</span> és <span class="math">z</span>.</p></div>
          <div class="formula"><span class="formula-title">Mòdul</span><span class="math">|z| = √(a<sup>2</sup> + b<sup>2</sup>)</span><p>És la distància de <span class="math">z</span> a l'origen. Sempre <span class="math">|z| ≥ 0</span>.</p></div>
          <div class="formula"><span class="formula-title">Argument</span><span class="math">arg(z) = θ</span><p>Angle que forma el vector amb el semieix real positiu. Es pot donar en radians o en graus.</p></div>
        </div>
        <p>Propietats bàsiques:</p>
        <ul>
          <li><span class="math">|z| = |z̄|</span>, però <span class="math">arg(z̄) = −arg(z)</span> (mòdul <span class="math">2π</span>).</li>
          <li><span class="math">z·z̄ = a<sup>2</sup> + b<sup>2</sup> = |z|<sup>2</sup></span>.</li>
          <li><span class="math">z + z̄ = 2a</span> i <span class="math">z − z̄ = 2bi</span>.</li>
          <li><span class="math">|z·w| = |z|·|w|</span> i <span class="math">|z/w| = |z|/|w|</span>.</li>
        </ul>

        <h3>3. Forma polar i exponencial</h3>
        <p>Si <span class="math">r = |z|</span> i <span class="math">θ = arg(z)</span>, llavors:</p>
        <div class="formula big"><span class="math">z = r(cos θ + i sin θ) = r e<sup>iθ</sup></span></div>
        <p>La igualtat <span class="math">e<sup>iθ</sup> = cos θ + i sin θ</span> és la fórmula d'Euler. La forma <span class="math">r e<sup>iθ</sup></span> és la <strong>forma exponencial</strong> i <span class="math">r<sub>θ</sub></span> la <strong>forma polar</strong>.</p>
        <h4>Passar de cartesiana a polar</h4>
        <div class="formula-grid">
          <div class="formula"><span class="math">r = √(a<sup>2</sup> + b<sup>2</sup>)</span></div>
          <div class="formula"><span class="math">θ = atan2(b, a)</span></div>
        </div>
        <p><strong>Atenció al quadrant!</strong> La funció <span class="math">arctan(b/a)</span> només dona angles entre <span class="math">−π/2</span> i <span class="math">π/2</span>. Cal ajustar segons el quadrant:</p>
        <ul>
          <li>Si <span class="math">a &gt; 0</span>: <span class="math">θ = arctan(b/a)</span>.</li>
          <li>Si <span class="math">a &lt; 0</span>: <span class="math">θ = arctan(b/a) + π</span> (o <span class="math">−π</span> segons el conveni).</li>
          <li>Si <span class="math">a = 0, b &gt; 0</span>: <span class="math">θ = π/2</span>; si <span class="math">b &lt; 0</span>: <span class="math">θ = −π/2</span>.</li>
        </ul>
        <h4>Passar de polar a cartesiana</h4>
        <p><span class="math">a = r cos θ</span> i <span class="math">b = r sin θ</span>.</p>

        <div class="tip"><strong>Els 16 angles privilegiats.</strong> A la secció <a href="#formulari" data-view-link="formulari">Formulari</a> tens la taula amb <span class="math">e<sup>iθ</sup></span> exacte per a <span class="math">θ = 0, ±π/6, ±π/4, ±π/3, ±π/2, ±2π/3, ±3π/4, ±5π/6, π</span>. Memoritzar-los estalvia molt de temps.</div>

        <h3>4. Operacions</h3>
        <h4>Suma i resta</h4>
        <p>Se sumen part real amb part real i part imaginària amb part imaginària:</p>
        <div class="formula"><span class="math">(a + bi) ± (c + di) = (a ± c) + (b ± d)i</span></div>
        <h4>Producte</h4>
        <div class="formula"><span class="math">(a + bi)(c + di) = (ac − bd) + (ad + bc)i</span></div>
        <p>En polar és molt més còmode: <span class="math">(r<sub>1</sub>e<sup>iθ<sub>1</sub></sup>)(r<sub>2</sub>e<sup>iθ<sub>2</sub></sup>) = r<sub>1</sub>r<sub>2</sub>e<sup>i(θ<sub>1</sub>+θ<sub>2</sub>)</sup></span>.</p>
        <h4>Quocient</h4>
        <p>Multiplica numerador i denominador pel conjugat del denominador:</p>
        <div class="formula"><span class="math">z/w = (z·w̄)/(w·w̄) = (z·w̄)/|w|<sup>2</sup></span></div>
        <p>En polar: <span class="math">(r<sub>1</sub>/r<sub>2</sub>) e<sup>i(θ<sub>1</sub>−θ<sub>2</sub>)</sup></span>.</p>
        <h4>Invers</h4>
        <div class="formula"><span class="math">z<sup>−1</sup> = 1/z = z̄/|z|<sup>2</sup></span></div>
        <p>Comprova-ho: <span class="math">z·(z̄/|z|<sup>2</sup>) = |z|<sup>2</sup>/|z|<sup>2</sup> = 1</span>.</p>

        <h3>5. Potències: fórmula de De Moivre</h3>
        <div class="formula big"><span class="math">z<sup>n</sup> = r<sup>n</sup> e<sup>inθ</sup> = r<sup>n</sup>(cos(nθ) + i sin(nθ))</span></div>
        <p>El mòdul s'eleva a <span class="math">n</span> i l'argument es multiplica per <span class="math">n</span>. Després es redueix l'angle mòdul <span class="math">2π</span>.</p>
        <div class="example">
          <h4>Exemple resolt</h4>
          <p>Per a <span class="math">z = 1 + √3 i</span>: <span class="math">|z| = √(1 + 3) = 2</span> i <span class="math">arg(z) = π/3</span> (primer quadrant). Així <span class="math">z = 2e<sup>iπ/3</sup></span>.</p>
          <p><span class="math">z<sup>6</sup> = 2<sup>6</sup>e<sup>i·6π/3</sup> = 64e<sup>i2π</sup> = 64</span>, un real positiu.</p>
          <p><span class="math">z<sup>3</sup> = 8e<sup>iπ</sup> = −8</span>.</p>
        </div>

        <h3>6. Arrels n-èsimes</h3>
        <p>Les solucions de <span class="math">z<sup>n</sup> = w</span>, amb <span class="math">w = ρe<sup>iφ</sup></span>, són:</p>
        <div class="formula big"><span class="math">z<sub>k</sub> = ρ<sup>1/n</sup> e<sup>i(φ + 2πk)/n</sup>, &nbsp; k = 0, 1, …, n−1</span></div>
        <p>Són <span class="math">n</span> punts situats sobre una circumferència de radi <span class="math">ρ<sup>1/n</sup></span>, formant un polígon regular. Si <span class="math">w</span> és real positiu, un angle és <span class="math">0</span>; si és real negatiu, un angle és <span class="math">π/n</span>.</p>
        <div class="example">
          <h4>Exemple: <span class="math">z<sup>3</sup> = −64</span></h4>
          <p><span class="math">−64 = 64e<sup>iπ</sup></span>, així <span class="math">z<sub>k</sub> = 4e<sup>i(π+2πk)/3</sup></span>:</p>
          <p><span class="math">z<sub>0</sub> = 4e<sup>iπ/3</sup> = 2 + 2√3 i</span>, <span class="math">z<sub>1</sub> = 4e<sup>iπ</sup> = −4</span>, <span class="math">z<sub>2</sub> = 4e<sup>i5π/3</sup> = 2 − 2√3 i</span>.</p>
          <p>Factorització a <span class="math">C[x]</span>: <span class="math">x<sup>3</sup>+64 = (x+4)(x−2−2√3i)(x−2+2√3i)</span>. A <span class="math">R[x]</span>: <span class="math">(x+4)(x<sup>2</sup>−4x+16)</span>.</p>
        </div>

        <h3>7. Com resoldre l'exercici del parcial</h3>
        <ol class="checklist">
          <li><strong>Comprovar una arrel:</strong> substitueix <span class="math">z</span> a <span class="math">p(x)</span> i calcula <span class="math">z<sup>2</sup>, z<sup>3</sup></span> amb paciència. Hauria de donar exactament <span class="math">0 + 0i</span>.</li>
          <li><strong>Trobar les altres arrels:</strong> si els coeficients són reals, el conjugat <span class="math">z̄</span> també és arrel. La tercera surt de Vieta: <span class="math">r<sub>1</sub>+r<sub>2</sub>+r<sub>3</sub> = −b/a</span>.</li>
          <li><strong>Dibuixar:</strong> marca <span class="math">(Re, Im)</span> de cada arrel; les complexes conjugades són simètriques respecte de l'eix real.</li>
          <li><strong>Factoritzar a R[x]:</strong> el parell conjugat dona <span class="math">(x−z)(x−z̄) = x<sup>2</sup> − 2ax + (a<sup>2</sup>+b<sup>2</sup>)</span>, que és irreductible perquè el discriminant és <span class="math">−4b<sup>2</sup> &lt; 0</span>.</li>
        </ol>
        <div class="warn"><strong>Error típic:</strong> dir que <span class="math">z<sup>2</sup></span> és del segon quadrant sense calcular-lo. Si <span class="math">z = 1+i</span>, llavors <span class="math">z<sup>2</sup> = 2i</span>, que és sobre l'eix imaginari, no al segon quadrant.</div>
      `
    },

    polinomis: {
      title: 'Polinomis i factorització',
      subtitle: 'Arrels, Vieta, factorització a C[x] i R[x]',
      html: `
        <p class="lead">Un polinomi de grau <span class="math">n</span> és <span class="math">p(x) = a<sub>n</sub>x<sup>n</sup> + … + a<sub>1</sub>x + a<sub>0</sub></span>, amb <span class="math">a<sub>n</sub> ≠ 0</span>. Una <strong>arrel</strong> és un valor <span class="math">r</span> tal que <span class="math">p(r) = 0</span>.</p>

        <h3>1. Teorema fonamental de l'àlgebra</h3>
        <p>Tot polinomi de grau <span class="math">n ≥ 1</span> amb coeficients complexos té exactament <span class="math">n</span> arrels complexes, comptant multiplicitats. Per tant, a <span class="math">C[x]</span>:</p>
        <div class="formula big"><span class="math">p(x) = a<sub>n</sub>(x − r<sub>1</sub>)(x − r<sub>2</sub>)…(x − r<sub>n</sub>)</span></div>
        <p>Si una arrel apareix diverses vegades, es diu que té <strong>multiplicitat</strong> <span class="math">m</span>; el factor corresponent és <span class="math">(x−r)<sup>m</sup></span>.</p>

        <h3>2. Teorema del factor i Ruffini</h3>
        <p><span class="math">r</span> és arrel de <span class="math">p(x)</span> si i només si <span class="math">(x−r)</span> divideix <span class="math">p(x)</span>. Això permet baixar el grau un cop trobada una arrel.</p>
        <div class="example">
          <h4>Exemple de Ruffini</h4>
          <p>Per a <span class="math">p(x) = 2x<sup>3</sup> + 3x<sup>2</sup> + 6x − 65</span>, si <span class="math">r = 5/2</span>:</p>
          <div class="ruffini">
            <div>2 &nbsp; 3 &nbsp; 6 &nbsp; −65</div>
            <div>&nbsp;&nbsp;&nbsp; 5 &nbsp; 20 &nbsp; 65</div>
            <div class="ruffini-line">2 &nbsp; 8 &nbsp; 26 &nbsp; 0</div>
          </div>
          <p>Així <span class="math">p(x) = (x − 5/2)(2x<sup>2</sup> + 8x + 26) = (2x−5)(x<sup>2</sup>+4x+13)</span>.</p>
        </div>

        <h3>3. Coeficients reals: arrels conjugades</h3>
        <div class="keyfact"><strong>Fet clau.</strong> Si <span class="math">p(x) ∈ R[x]</span> i <span class="math">z = a+bi</span> (<span class="math">b ≠ 0</span>) és arrel, aleshores <span class="math">z̄ = a−bi</span> també és arrel.</div>
        <p>Per tant, les arrels no reals van per parelles. Això explica per què un polinomi real de grau senar sempre té almenys una arrel real, i per què el nombre d'arrels no reals és parell.</p>
        <p>El producte del parell conjugat és:</p>
        <div class="formula big"><span class="math">(x−z)(x−z̄) = x<sup>2</sup> − 2ax + (a<sup>2</sup>+b<sup>2</sup>)</span></div>
        <p>Aquest factor quadràtic té discriminant <span class="math">(−2a)<sup>2</sup> − 4(a<sup>2</sup>+b<sup>2</sup>) = −4b<sup>2</sup> &lt; 0</span>, així que és <strong>irreductible a R[x]</strong>.</p>

        <h3>4. Fórmules de Vieta</h3>
        <p>Per a un polinomi <span class="math">a<sub>n</sub>x<sup>n</sup> + a<sub>n−1</sub>x<sup>n−1</sup> + … + a<sub>0</sub></span> d'arrels <span class="math">r<sub>1</sub>, …, r<sub>n</sub></span> (amb <span class="math">a<sub>n</sub> ≠ 0</span>). A la taula, <span class="math">a</span> denota el coeficient principal del polinomi corresponent:</p>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">Grau 2</span><span class="math">r<sub>1</sub>+r<sub>2</sub> = −b/a</span><br><span class="math">r<sub>1</sub>r<sub>2</sub> = c/a</span></div>
          <div class="formula"><span class="formula-title">Grau 3</span><span class="math">r<sub>1</sub>+r<sub>2</sub>+r<sub>3</sub> = −b/a</span><br><span class="math">r<sub>1</sub>r<sub>2</sub>+r<sub>1</sub>r<sub>3</sub>+r<sub>2</sub>r<sub>3</sub> = c/a</span><br><span class="math">r<sub>1</sub>r<sub>2</sub>r<sub>3</sub> = −d/a</span></div>
          <div class="formula"><span class="formula-title">Grau 4</span><span class="math">Σr<sub>i</sub> = −b/a</span><br><span class="math">Σr<sub>i</sub>r<sub>j</sub> = c/a</span><br><span class="math">Σr<sub>i</sub>r<sub>j</sub>r<sub>k</sub> = −d/a</span><br><span class="math">r<sub>1</sub>r<sub>2</sub>r<sub>3</sub>r<sub>4</sub> = e/a</span></div>
        </div>
        <p>Al parcial, la fórmula de la suma de les tres arrels és la més útil: coneixent les dues arrels conjugades, la tercera surt immediatament.</p>

        <h3>5. Irreductibles a R[x]</h3>
        <ul>
          <li>Grau 1: <span class="math">ax+b</span>.</li>
          <li>Grau 2 amb discriminant negatiu: <span class="math">ax<sup>2</sup>+bx+c</span>, <span class="math">b<sup>2</sup>−4ac &lt; 0</span>.</li>
          <li>No n'hi ha de grau superior: qualsevol polinomi real de grau ≥ 3 es pot descompondre.</li>
        </ul>

        <h3>6. Estratègia per a l'exercici de 4 punts</h3>
        <ol class="checklist">
          <li><strong>Comprova l'arrel donada</strong> calculant <span class="math">z<sup>2</sup></span> i <span class="math">z<sup>3</sup></span> i substituint. No t'oblidis de la part imaginària.</li>
          <li><strong>Escriu el conjugat</strong> com a segona arrel (coeficients reals).</li>
          <li><strong>Troba la tercera amb Vieta:</strong> <span class="math">r<sub>3</sub> = −b/a − (z+z̄)</span>.</li>
          <li><strong>Dibuixa</strong> les tres arrels: les conjugades simètriques respecte de l'eix real; la real sobre l'eix.</li>
          <li><strong>Factoritza a R[x]</strong> com <span class="math">(qx−p)(x<sup>2</sup>−2ax+a<sup>2</sup>+b<sup>2</sup>)</span>. Comprova que el discriminant del quadràtic és negatiu.</li>
        </ol>
        <div class="example">
          <h4>Exemple complet</h4>
          <p><span class="math">p(x) = 3x<sup>3</sup> − 4x<sup>2</sup> + 11x + 10</span>, amb <span class="math">z = 1−2i</span>.</p>
          <p><span class="math">z<sup>2</sup> = −3−4i</span>, <span class="math">z<sup>3</sup> = −11+2i</span>. Substituint: <span class="math">3(−11+2i) − 4(−3−4i) + 11(1−2i) + 10 = 0</span>.</p>
          <p>Conjugat: <span class="math">1+2i</span>. Vieta: <span class="math">r<sub>1</sub>+r<sub>2</sub>+r<sub>3</sub> = −b/a = 4/3</span>; com que <span class="math">r<sub>1</sub>+r<sub>2</sub>=2</span>, <span class="math">r<sub>3</sub> = 4/3 − 2 = −2/3</span>.</p>
          <p>Factorització: <span class="math">(x<sup>2</sup>−2x+5)(3x+2)</span>. Arrels: <span class="math">1±2i</span> i <span class="math">−2/3</span>.</p>
        </div>
        <div class="warn"><strong>Error típic:</strong> confondre <span class="math">r<sub>3</sub> = −b/a − 2a</span> amb <span class="math">r<sub>3</sub> = b/a − 2a</span>. El signe de Vieta és <strong>menys</strong> <span class="math">b/a</span>.</div>
      `
    },

    matrius: {
      title: 'Matrius, Gauss-Jordan i rang',
      subtitle: 'Operacions, determinants, forma reduïda i matriu P',
      html: `
        <p class="lead">Una matriu <span class="math">A ∈ M<sub>m×n</sub>(R)</span> és una taula de <span class="math">m</span> files i <span class="math">n</span> columnes. Al parcial treballarem amb matrius petites (3×4, 4×4, 4×5) i coeficients reals.</p>

        <h3>1. Tipus de matrius</h3>
        <div class="three-col">
          <div class="mini-card"><strong>Quadrada</strong><p><span class="math">m = n</span>. Té determinant i pot tenir inversa.</p></div>
          <div class="mini-card"><strong>Identitat</strong><p><span class="math">I<sub>n</sub></span>: 1 a la diagonal, 0 fora. És l'element neutre del producte.</p></div>
          <div class="mini-card"><strong>Transposada</strong><p><span class="math">A<sup>t</sup></span>: intercanvia files i columnes.</p></div>
          <div class="mini-card"><strong>Simètrica</strong><p><span class="math">A<sup>t</sup> = A</span>.</p></div>
          <div class="mini-card"><strong>Diagonal</strong><p>Només té entrades no nul·les a la diagonal.</p></div>
          <div class="mini-card"><strong>Nul·la</strong><p>Totes les entrades són 0.</p></div>
        </div>

        <h3>2. Operacions</h3>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">Suma</span><span class="math">(A+B)<sub>ij</sub> = a<sub>ij</sub>+b<sub>ij</sub></span><p>Mateixa mida. És commutativa.</p></div>
          <div class="formula"><span class="formula-title">Producte per escalar</span><span class="math">(kA)<sub>ij</sub> = k·a<sub>ij</sub></span><p>Multiplica totes les entrades.</p></div>
          <div class="formula"><span class="formula-title">Producte</span><span class="math">(AB)<sub>ij</sub> = Σ<sub>k</sub> a<sub>ik</sub>b<sub>kj</sub></span><p>Cal que el nombre de columnes d'<span class="math">A</span> sigui el de files de <span class="math">B</span>.</p></div>
          <div class="formula"><span class="formula-title">Transposada</span><span class="math">(A<sup>t</sup>)<sub>ij</sub> = a<sub>ji</sub></span><p><span class="math">(AB)<sup>t</sup> = B<sup>t</sup>A<sup>t</sup></span>.</p></div>
        </div>
        <div class="warn"><strong>El producte de matrius no és commutatiu.</strong> En general <span class="math">AB ≠ BA</span>, i de vegades <span class="math">AB</span> existeix però <span class="math">BA</span> no. Aquesta és una font inesgotable de preguntes cert/fals.</div>
        <p><strong>Potències:</strong> si <span class="math">A<sup>2</sup> = kA</span>, llavors <span class="math">A<sup>n</sup> = k<sup>n−1</sup>A</span> per a tot <span class="math">n ≥ 1</span> (es demostra per inducció).</p>

        <h3>3. Determinants</h3>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">1×1</span><span class="math">det(a) = a</span></div>
          <div class="formula"><span class="formula-title">2×2</span><span class="math">det ${matrix([['a','b'],['c','d']])} = ad − bc</span></div>
          <div class="formula"><span class="formula-title">3×3</span><span class="math">det ${matrix([['a','b','c'],['d','e','f'],['g','h','i']])} = aei + bfg + cdh − ceg − fha − bdi</span></div>
        </div>
        <h4>Propietats fonamentals</h4>
        <ul>
          <li><span class="math">det(AB) = det(A)det(B)</span>.</li>
          <li><span class="math">det(A<sup>t</sup>) = det(A)</span>.</li>
          <li><span class="math">det(kA) = k<sup>n</sup>det(A)</span> per a <span class="math">A</span> de mida <span class="math">n×n</span>.</li>
          <li><span class="math">det(A<sup>−1</sup>) = 1/det(A)</span> i <span class="math">det(kA<sup>−1</sup>) = k<sup>n</sup>/det(A)</span>.</li>
          <li>Si una fila és combinació lineal de les altres, <span class="math">det(A)=0</span>.</li>
          <li>Si intercanvies dues files, el determinant canvia de signe.</li>
          <li>Si sumes a una fila un múltiple d'una altra, el determinant no canvia.</li>
          <li><span class="math">A</span> és invertible <span class="math">⇔ det(A) ≠ 0</span>.</li>
        </ul>
        <p>Per a una matriu <span class="math">2×2</span>:</p>
        <div class="formula big"><span class="math">A<sup>−1</sup> = (1/det(A)) ${matrix([['d','−b'],['−c','a']])}</span></div>
        <p>Per a matrius més grans: <span class="math">A<sup>−1</sup> = (1/det(A))·C<sup>t</sup></span>, on <span class="math">C</span> és la matriu dels cofactors,
          <span class="math">C<sub>ij</sub> = (−1)<sup>i+j</sup>M<sub>ij</sub></span>.</p>

        <h3>4. Rang</h3>
        <p>El <strong>rang</strong> d'una matriu és el nombre màxim de files (o columnes) linealment independents. També és el nombre de pivots de la seva forma de Gauss-Jordan.</p>
        <ul>
          <li><span class="math">rang(A) ≤ min(m, n)</span>.</li>
          <li><span class="math">rang(A) = n</span> (columnes) ⇔ les columnes són independents.</li>
          <li><span class="math">rang(AB) ≤ min(rang A, rang B)</span>.</li>
          <li>Les operacions elementals per files <strong>no canvien el rang</strong>.</li>
        </ul>

        <h3>5. Operacions elementals i Gauss-Jordan</h3>
        <p>Les tres operacions elementals per files són:</p>
        <ol>
          <li>Intercanviar dues files: <span class="math">F<sub>i</sub> ↔ F<sub>j</sub></span>.</li>
          <li>Multiplicar una fila per un escalar no nul: <span class="math">F<sub>i</sub> ← kF<sub>i</sub></span>, <span class="math">k ≠ 0</span>.</li>
          <li>Sumar a una fila un múltiple d'una altra: <span class="math">F<sub>i</sub> ← F<sub>i</sub> + kF<sub>j</sub></span>.</li>
        </ol>
        <p>Una matriu està en <strong>forma de Gauss-Jordan</strong> (o forma normal reduïda) si:</p>
        <ul>
          <li>està esglaonada (les files nul·les són a baix, i el primer element no nul de cada fila està més a la dreta que el de la fila anterior);</li>
          <li>tots els pivots són <span class="math">1</span>;</li>
          <li>cada pivot és l'únic element no nul de la seva columna.</li>
        </ul>
        <div class="example">
          <h4>Exemple de reducció</h4>
          <p><span class="math">A = ${matrix([[1,0,-1,0],[3,-2,-3,2],[-1,1,1,-1]])}</span></p>
          <p>Aplicant <span class="math">F<sub>2</sub> ← F<sub>2</sub>−3F<sub>1</sub></span>, <span class="math">F<sub>3</sub> ← F<sub>3</sub>+F<sub>1</sub></span>, després <span class="math">F<sub>2</sub> ← −F<sub>2</sub>/2</span> i <span class="math">F<sub>3</sub> ← F<sub>3</sub>−F<sub>2</sub></span>, s'obté:</p>
          <p><span class="math">J = ${matrix([[1,0,-1,0],[0,1,0,-1],[0,0,0,0]])}</span>, amb <span class="math">rang(A)=2</span>.</p>
        </div>

        <h3>6. La matriu P tal que PA = J</h3>
        <p>Si apliquem una successió d'operacions elementals a <span class="math">A</span> i obtenim <span class="math">J</span>, les mateixes operacions aplicades a la identitat donen una matriu <span class="math">P</span> que compleix:</p>
        <div class="formula big"><span class="math">P·A = J</span></div>
        <p><strong>Mètode pràctic:</strong> considera la matriu ampliada <span class="math">[A | I]</span> i fes Gauss-Jordan fins que l'esquerra sigui <span class="math">J</span>. La part dreta serà <span class="math">P</span>.</p>
        <div class="tip">La matriu <span class="math">P</span> no és única: depèn de les operacions triades. Al parcial n'hi ha prou de trobar-ne una i comprovar <span class="math">PA=J</span>. Calcula també <span class="math">det(P)</span>: si <span class="math">P</span> és invertible, <span class="math">det(P) ≠ 0</span>.</div>

        <h3>7. Fila de J com a combinació lineal de files d'A</h3>
        <p>Com que <span class="math">PA = J</span>, la fila <span class="math">i</span> de <span class="math">J</span> és:</p>
        <div class="formula big"><span class="math">F<sub>i</sub><sup>J</sup> = p<sub>i1</sub>F<sub>1</sub><sup>A</sup> + p<sub>i2</sub>F<sub>2</sub><sup>A</sup> + … + p<sub>im</sub>F<sub>m</sub><sup>A</sup></span></div>
        <p>És a dir, els coeficients són exactament la fila <span class="math">i</span> de <span class="math">P</span>. No cal tornar a resoldre res: llegeix-los de <span class="math">P</span>.</p>

        <h3>8. Errors típics</h3>
        <ul class="warn-list">
          <li>Pensar que <span class="math">AB = BA</span> sempre.</li>
          <li>Confondre <span class="math">det(kA)</span> amb <span class="math">k·det(A)</span>; és <span class="math">k<sup>n</sup>det(A)</span>.</li>
          <li>Pensar que una matriu amb una fila dependent pot ser invertible: una fila dependent implica <span class="math">det(A)=0</span>, així que no pot ser invertible.</li>
          <li>Oblidar que <span class="math">P</span> ha de ser invertible (comprova <span class="math">det(P) ≠ 0</span>).</li>
          <li>No comprovar <span class="math">PA=J</span> al final.</li>
        </ul>
      `
    },

    sistemes: {
      title: 'Sistemes d\'equacions lineals',
      subtitle: 'Rouché-Capelli, solucions paramètriques i paràmetres',
      html: `
        <p class="lead">Un sistema lineal es pot escriure en forma matricial <span class="math">AX = B</span>, on <span class="math">A</span> és la matriu de coeficients, <span class="math">X</span> el vector d'incògnites i <span class="math">B</span> el vector de termes independents.</p>

        <h3>1. Matriu ampliada i compatibilitat</h3>
        <p>La matriu ampliada és <span class="math">(A|B)</span>. El teorema de Rouché-Capelli diu:</p>
        <div class="formula-grid">
          <div class="formula"><span class="formula-title">Incompatible</span><span class="math">rang(A) ≠ rang(A|B)</span><p>No té solució.</p></div>
          <div class="formula"><span class="formula-title">Compatible determinat</span><span class="math">rang(A) = rang(A|B) = n</span><p>Solució única (SCD).</p></div>
          <div class="formula"><span class="formula-title">Compatible indeterminat</span><span class="math">rang(A) = rang(A|B) &lt; n</span><p>Infinites solucions (SCI), amb <span class="math">n − rang(A)</span> graus de llibertat.</p></div>
        </div>
        <p>Aquí <span class="math">n</span> és el nombre d'incògnites.</p>
        <div class="warn"><strong>Un sistema SCD no ha de tenir la matriu <span class="math">A</span> quadrada.</strong> Per exemple,
          <span class="math">${Fmt.systemHTML([[1,0],[0,1],[0,0]], [2,3,0])}</span> té solució única <span class="math">(x,y)=(2,3)</span> amb una <span class="math">A</span> de mida <span class="math">3×2</span>.</div>

        <h3>2. Resolució amb Gauss-Jordan</h3>
        <p>Es fa Gauss-Jordan sobre la matriu ampliada <span class="math">(A|B)</span> fins a obtenir <span class="math">(J|C)</span>. Les files nul·les de <span class="math">J</span> amb terme independent no nul donen una equació <span class="math">0 = c ≠ 0</span>, que és incompatible.</p>
        <ul>
          <li>Les columnes amb pivot corresponen a variables <strong>bàsiques</strong> (les que queden determinades; poden dependre de les lliures).</li>
          <li>Les columnes sense pivot corresponen a variables <strong>lliures</strong> (paràmetres).</li>
        </ul>
        <div class="example">
          <h4>Exemple</h4>
          <p><span class="math">${Fmt.systemHTML([[1,0,-1],[3,-2,-3],[-1,1,1]], [0,2,-1])}</span></p>
          <p>La forma de Gauss-Jordan és <span class="math">x − z = 0</span>, <span class="math">y = −1</span>, <span class="math">0 = 0</span>. La variable <span class="math">z</span> és lliure:</p>
          <p><span class="math">(x,y,z) = (t, −1, t) = (0,−1,0) + t(1,0,1)</span>, amb 1 grau de llibertat.</p>
          <p>La dimensió de la varietat lineal és <span class="math">1</span>.</p>
        </div>

        <h3>3. Solució particular + nucli</h3>
        <p>Si el sistema és compatible, tota solució s'escriu com:</p>
        <div class="formula big"><span class="math">X = X<sub>p</sub> + λ<sub>1</sub>v<sub>1</sub> + … + λ<sub>k</sub>v<sub>k</sub></span></div>
        <p>on <span class="math">X<sub>p</sub></span> és una solució particular i <span class="math">v<sub>1</sub>,…,v<sub>k</sub></span> és una base del nucli de <span class="math">A</span>. El nombre de paràmetres és <span class="math">k = n − rang(A)</span>.</p>

        <h3>4. Sistemes amb paràmetre</h3>
        <p>Quan el terme independent o algun coeficient depèn d'un paràmetre <span class="math">b</span>, has de discutir per a quins valors el sistema és compatible. Dues estratègies:</p>
        <ol>
          <li><strong>Gauss-Jordan simbòlic:</strong> redueix la matriu ampliada tractant <span class="math">b</span> com un nombre. Apareixerà una equació del tipus <span class="math">α(b)x = β(b)</span>; discuteix quan <span class="math">α(b)=0</span>.</li>
          <li><strong>Amb la matriu P:</strong> si ja tens <span class="math">P</span> amb <span class="math">PA=J</span>, aleshores <span class="math">AX=C(b)</span> equival a <span class="math">JX = P·C(b)</span>. Les files nul·les de <span class="math">J</span> donen les condicions de compatibilitat.</li>
        </ol>
        <div class="example">
          <h4>Exemple de discussió</h4>
          <p>Si l'última fila de <span class="math">J</span> és nul·la i l'última component de <span class="math">P·C(b)</span> és <span class="math">b+1</span>, aleshores cal <span class="math">b+1=0</span>, és a dir <span class="math">b=−1</span>.</p>
          <p>Si <span class="math">b=−1</span>: compatible amb <span class="math">n−rang(A)</span> graus de llibertat. Si <span class="math">b≠−1</span>: incompatible.</p>
        </div>

        <h3>5. Preguntes típiques del parcial</h3>
        <ul class="checklist">
          <li>“Expresseu les solucions en forma paramètrica” → dona el vector particular i els vectors de la base.</li>
          <li>“Calculeu la dimensió de la varietat lineal” → <span class="math">n − rang(A)</span>.</li>
          <li>“Hi ha alguna solució amb <span class="math">x=3</span>?” → substitueix a l'expressió paramètrica i mira si el sistema en els paràmetres té solució.</li>
          <li>“Discutiu en funció de <span class="math">b</span>” → troba la condició de compatibilitat i separa els casos.</li>
        </ul>
        <div class="warn"><strong>Error típic:</strong> dir “SCI perquè hi ha una fila de zeros” sense comprovar el terme independent. Una fila <span class="math">0 0 0 | 5</span> és incompatible, no indeterminada.</div>
      `
    },

    teoria: {
      title: 'Qüestions de teoria: cert o fals',
      subtitle: 'Com justificar, contraexemples i fets clau',
      html: `
        <p class="lead">Al parcial, les qüestions de teoria valen 2 punts (4 × 0,5). No n'hi ha prou de dir “cert” o “fals”: cal <strong>justificar</strong> amb un argument breu o un contraexemple.</p>

        <h3>1. Com respondre</h3>
        <ol class="checklist">
          <li><strong>Llegeix bé els quantificadors:</strong> “per a tot”, “existeix”, “si… llavors…”. Un sol contraexemple tomba un “per a tot”.</li>
          <li><strong>Si és cert:</strong> dona la propietat o el càlcul que ho demostra en una o dues línies.</li>
          <li><strong>Si és fals:</strong> dona un contraexemple explícit i comprova'l.</li>
          <li><strong>No facis càlculs llargs</strong> si no cal: les qüestions valen poc i el temps és limitat.</li>
        </ol>

        <h3>2. Fets clau de complexos</h3>
        <div class="fact-table">
          <div><span class="badge true">CERT</span> <span class="math">|z| = |z̄|</span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">arg(z) = arg(z̄)</span> en general; canvia de signe.</div>
          <div><span class="badge true">CERT</span> <span class="math">z·z̄ = |z|<sup>2</sup> ∈ R</span>, i és positiu si <span class="math">z ≠ 0</span>.</div>
          <div><span class="badge true">CERT</span> <span class="math">|zw| = |z||w|</span> i <span class="math">arg(zw) = arg z + arg w</span> (mòdul <span class="math">2π</span>).</div>
          <div><span class="badge false">FALS</span> <span class="math">z<sup>2</sup>=w<sup>2</sup> ⇒ z=w</span>; també pot ser <span class="math">z=−w</span>.</div>
          <div><span class="badge true">CERT</span> Un complex no nul té exactament <span class="math">n</span> arrels <span class="math">n</span>-èsimes diferents.</div>
          <div><span class="badge false">FALS</span> Si <span class="math">z</span> és del primer quadrant, <span class="math">z<sup>2</sup></span> no sempre és del segon: <span class="math">(1+i)<sup>2</sup>=2i</span>.</div>
          <div><span class="badge true">CERT</span> Si <span class="math">arg(z)=θ</span>, <span class="math">z<sup>n</sup></span> és real positiu si <span class="math">nθ≡0 (2π)</span> i real negatiu si <span class="math">nθ≡π (2π)</span>.</div>
          <div><span class="badge false">FALS</span> De <span class="math">z<sup>2</sup>w<sup>4</sup>=1</span> i <span class="math">z<sup>8</sup>=1</span> no se segueix <span class="math">w<sup>8</sup>=1</span>:
            <span class="math">z=e<sup>iπ/4</sup></span>, <span class="math">w=e<sup>−iπ/8</sup></span>.</div>
        </div>

        <h3>3. Fets clau de polinomis</h3>
        <div class="fact-table">
          <div><span class="badge true">CERT</span> Tot polinomi real de grau senar té almenys una arrel real.</div>
          <div><span class="badge true">CERT</span> Les arrels no reals d'un polinomi real van per parelles conjugades.</div>
          <div><span class="badge true">CERT</span> Tot polinomi de grau <span class="math">n</span> té <span class="math">n</span> arrels complexes comptant multiplicitats.</div>
          <div><span class="badge true">CERT</span> Els irreductibles de <span class="math">R[x]</span> són de grau 1 o 2 (discriminant negatiu).</div>
          <div><span class="badge false">FALS</span> Un polinomi de grau 4 pot tenir 3 arrels reals i 1 no real: les no reals van per parelles.</div>
          <div><span class="badge false">FALS</span> La suma de les arrels de <span class="math">ax<sup>3</sup>+bx<sup>2</sup>+cx+d</span> és <span class="math">b/a</span>; és <span class="math">−b/a</span>.</div>
          <div><span class="badge true">CERT</span> Si <span class="math">r</span> és arrel, <span class="math">(x−r)</span> divideix <span class="math">p(x)</span>.</div>
        </div>

        <h3>4. Fets clau de matrius</h3>
        <div class="fact-table">
          <div><span class="badge false">FALS</span> <span class="math">AB=BA</span> per a qualssevol matrius <span class="math">A</span> i <span class="math">B</span>. Contraexemple: <span class="math">A=${matrix([[1,0],[0,0]])}, B=${matrix([[0,1],[0,0]])}</span>.</div>
          <div><span class="badge true">CERT</span> <span class="math">det(AB)=det(A)det(B)</span> i <span class="math">det(A<sup>t</sup>)=det(A)</span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">det(kA)=k·det(A)</span>; és <span class="math">k<sup>n</sup>det(A)</span>.</div>
          <div><span class="badge true">CERT</span> <span class="math">det(A<sup>−1</sup>)=1/det(A)</span> i <span class="math">det(kA<sup>−1</sup>)=k<sup>n</sup>/det(A)</span>.</div>
          <div><span class="badge true">CERT</span> Si una fila és combinació lineal de les altres, <span class="math">det(A)=0</span>.</div>
          <div><span class="badge true">CERT</span> Si <span class="math">A<sup>2</sup>=kA</span>, llavors <span class="math">A<sup>n</sup>=k<sup>n−1</sup>A</span> per a tot <span class="math">n≥1</span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">AB≠BA</span> no impedeix <span class="math">A<sup>2</sup>B<sup>2</sup>=(AB)<sup>2</sup></span>:
            <span class="math">A=${matrix([[0,1],[0,0]])}</span>, <span class="math">B=${matrix([[1,0],[0,0]])}</span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">A<sup>2</sup>=0 ⇒ A=0</span>. Contraexemple: <span class="math">A=${matrix([[0,1],[0,0]])}</span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">AB=0 ⇒ A=0</span> o <span class="math">B=0</span>. Contraexemple: <span class="math">A=${matrix([[1,0],[0,0]])}, B=${matrix([[0,0],[0,1]])}</span>.</div>
          <div><span class="badge true">CERT</span> Si <span class="math">det(B)≠0</span> i <span class="math">AB=0</span>, llavors <span class="math">A=0</span> (multiplica per <span class="math">B<sup>−1</sup></span>).</div>
          <div><span class="badge false">FALS</span> <span class="math">(AB)<sup>−1</sup>=A<sup>−1</sup>B<sup>−1</sup></span>; és <span class="math">B<sup>−1</sup>A<sup>−1</sup></span>.</div>
          <div><span class="badge false">FALS</span> <span class="math">rang(A+B)=rang(A)+rang(B)</span> en general; només ≤.</div>
          <div><span class="badge false">FALS</span> Hi ha exactament 4 matrius 2×2 de Gauss-Jordan; sobre <span class="math">R</span> n'hi ha infinites.</div>
        </div>

        <h3>5. Contraexemples que val la pena memoritzar</h3>
        <div class="three-col">
          <div class="mini-card"><strong>Nilpotent</strong><p><span class="math">A=${matrix([[0,1],[0,0]])}</span>, <span class="math">A<sup>2</sup>=0</span> però <span class="math">A≠0</span>.</p></div>
          <div class="mini-card"><strong>Divisors de zero</strong><p><span class="math">A=${matrix([[1,0],[0,0]])}</span>, <span class="math">B=${matrix([[0,0],[0,1]])}</span>, <span class="math">AB=0</span>.</p></div>
          <div class="mini-card"><strong>No commutatives</strong><p><span class="math">A=${matrix([[0,1],[0,0]])}</span>, <span class="math">B=${matrix([[1,0],[0,0]])}</span>.</p></div>
          <div class="mini-card"><strong>Reflexió</strong><p><span class="math">A=${matrix([[1,0],[0,-1]])}</span>, <span class="math">A<sup>2</sup>=I</span> però <span class="math">A≠±I</span>.</p></div>
          <div class="mini-card"><strong>Quadrat complex</strong><p><span class="math">z=1+i</span>: <span class="math">z<sup>2</sup>=2i</span>, que no és del segon quadrant.</p></div>
          <div class="mini-card"><strong>Argument conjugat</strong><p><span class="math">z=1+i</span>: <span class="math">arg z=π/4</span>, <span class="math">arg z̄=−π/4</span>.</p></div>
        </div>

        <h3>6. Estratègia ràpida</h3>
        <ul>
          <li>Si veus “per a tot” i creus que és fals, busca un exemple 2×2 o un complex petit.</li>
          <li>Si veus una igualtat amb determinants, comprova el nombre de files que multipliques per <span class="math">k</span>.</li>
          <li>Si veus “rang”, recorda que les operacions elementals no el canvien.</li>
          <li>Si veus “arrel complexa”, pensa immediatament en el conjugat.</li>
          <li>Si veus “sistema amb solució única”, pensa en <span class="math">det(A) ≠ 0</span>.</li>
        </ul>
      `
    },

    estrategia: {
      title: 'Estratègia per al parcial',
      subtitle: 'Temps, ordre de resolució i errors a evitar',
      html: `
        <p class="lead">El primer parcial d'Àlgebra sol tenir un patró estable, amb variants: un problema de complexos i polinomis (habitualment 4 punts), un problema de matrius i sistemes (habitualment 4 punts) i qüestions de teoria (habitualment 2 punts). Amb 120 minuts, la gestió del temps és tan important com la teoria.</p>

        <h3>1. Repartiment del temps</h3>
        <div class="timeline">
          <div><span class="time">0–10 min</span><div><strong>Llegeix tot l'examen.</strong> Identifica les preguntes que saps fer i les que et costaran.</div></div>
          <div><span class="time">10–50 min</span><div><strong>Problema 1 (complexos/polinomis).</strong> Comprova l'arrel, troba les altres, dibuixa i factoritza.</div></div>
          <div><span class="time">50–90 min</span><div><strong>Problema 2 (matrius/sistemes).</strong> Gauss-Jordan, P, combinació lineal i sistema.</div></div>
          <div><span class="time">90–105 min</span><div><strong>Qüestions de teoria.</strong> Sigues breu i precís; no hi dediquis més de 3-4 minuts per qüestió.</div></div>
          <div><span class="time">105–120 min</span><div><strong>Repàs.</strong> Comprova signes, que <span class="math">PA=J</span>, que les solucions satisfan el sistema i que has justificat els cert/fals.</div></div>
        </div>

        <h3>2. Checklist del problema 1</h3>
        <ol class="checklist">
          <li>Substitueix l'arrel i ensenya el càlcul de <span class="math">z<sup>2</sup></span> i <span class="math">z<sup>3</sup></span>.</li>
          <li>Escriu el conjugat i justifica que és arrel (coeficients reals).</li>
          <li>Troba la tercera arrel amb Vieta i comprova que la suma quadra.</li>
          <li>Dibuixa el que demani l'enunciat: les tres arrels, o bé <span class="math">z</span>, <span class="math">z<sup>2</sup></span> i <span class="math">z<sup>3</sup></span>, amb eixos i escala.</li>
          <li>Factoritza a <span class="math">R[x]</span> i comprova el discriminant negatiu.</li>
        </ol>

        <h3>3. Checklist del problema 2</h3>
        <ol class="checklist">
          <li>Fes Gauss-Jordan amb ordre i anota les operacions.</li>
          <li>Compta els pivots: aquest és el rang.</li>
          <li>Troba <span class="math">P</span> aplicant les mateixes operacions a la identitat; comprova <span class="math">PA=J</span>.</li>
          <li>Calcula <span class="math">det(P)</span> i comprova que no és zero.</li>
          <li>Per a la combinació lineal, llegeix la fila de <span class="math">P</span>.</li>
          <li>Resol el sistema amb la matriu ampliada; indica dimensió i comprova una solució.</li>
        </ol>

        <h3>4. Errors que costen punts</h3>
        <ul class="warn-list">
          <li>No justificar els cert/fals: una resposta sense argument val menys.</li>
          <li>Confondre el signe de Vieta (<span class="math">−b/a</span>, no <span class="math">b/a</span>).</li>
          <li>Oblidar el conjugat en un polinomi real.</li>
          <li>Donar una matriu <span class="math">P</span> que no compleix <span class="math">PA=J</span>.</li>
          <li>Dir que un sistema és SCI sense comprovar la compatibilitat.</li>
          <li>No indicar els graus de llibertat.</li>
          <li>Treballar amb el determinant d'una matriu no quadrada.</li>
        </ul>

        <h3>5. Pla de repàs</h3>
        <div class="three-col">
          <div class="mini-card"><strong>Dia 1–2</strong><p>Teoria de complexos + 10 exercicis de forma polar i arrels.</p></div>
          <div class="mini-card"><strong>Dia 3–4</strong><p>Polinomis: Vieta, factorització i 10 problemes del patró.</p></div>
          <div class="mini-card"><strong>Dia 5–6</strong><p>Gauss-Jordan, P, determinants i sistemes amb paràmetre.</p></div>
          <div class="mini-card"><strong>Dia 7</strong><p>Parcials complets cronometrats i repàs de cert/fals.</p></div>
        </div>

        <div class="tip"><strong>Consell final:</strong> al parcial, escriu els passos intermedis. Encara que el resultat final falli, els passos correctes donen punts. I si una arrel no surt, deixa plantejada la factorització: també compta.</div>
      `
    }
  };

  function getTheory() { return CONTENT; }
  function getSection(id) { return CONTENT[id] || CONTENT.complexos; }

  global.TheoryContent = { getTheory, getSection };
})(typeof window !== 'undefined' ? window : globalThis);
