# Política de Privacidad – TarjetaLab

**Última actualización:** 19 de noviembre de 2026

## 1. Introducción

TarjetaLab es una aplicación demostrativa desarrollada con fines educativos y tecnológicos, cuyo objetivo es mostrar las capacidades de integración entre aplicaciones, inteligencia artificial y servicios financieros simulados mediante el protocolo Model Context Protocol (MCP).

Esta aplicación no es una entidad financiera, no es un banco real y no ofrece productos financieros reales. Las tarjetas, características, beneficios, tasas y límites mostrados corresponden a información de demostración creada para esta aplicación.

Nos comprometemos a respetar la privacidad de las personas que utilizan TarjetaLab y a proporcionar información transparente sobre el tratamiento de los datos durante su funcionamiento.

## 2. Información que recopilamos y procesamos

TarjetaLab no solicita credenciales bancarias, números de cuentas reales, contraseñas ni información de tarjetas bancarias personales.

Durante el uso de la aplicación pueden procesarse los siguientes datos:

**2.1. Información de navegación y solicitudes**

- Identificadores de transacciones generados para las solicitudes de demostración.
- Identificadores de las tarjetas seleccionadas dentro del catálogo.
- Estados y fechas asociados a las solicitudes de demostración.
- Información técnica necesaria para establecer y mantener la comunicación entre los componentes de la aplicación.

**2.2. Información de la cámara**

Cuando el usuario decide iniciar una verificación de vida, la aplicación solicita acceso a la cámara del dispositivo.

Las imágenes y el vídeo capturados se envían al servicio Azure AI Face Liveness de Microsoft para determinar si existe una persona real frente a la cámara.

Esta funcionalidad:
- Se utiliza exclusivamente para realizar una prueba de detección de vida.
- No tiene como finalidad identificar al usuario ni determinar su identidad.
- No compara el rostro con documentos de identidad ni con una base de datos de personas.
- No almacena las imágenes ni los vídeos capturados en los sistemas propios de TarjetaLab.

El procesamiento de las imágenes se realiza mediante la infraestructura de Microsoft Azure y está sujeto a las políticas de privacidad y conservación del servicio correspondiente.

## 3. Finalidad del tratamiento

La información procesada se utiliza exclusivamente para:

- Mostrar el catálogo y las características de las tarjetas de demostración.
- Consultar información de las tarjetas disponibles.
- Crear y consultar solicitudes de demostración.
- Generar identificadores temporales para gestionar las transacciones.
- Ejecutar la prueba de detección de vida cuando el usuario decide iniciar una solicitud.
- Comunicar el resultado de la verificación y actualizar el estado de la solicitud.

La información no se utiliza para evaluar la solvencia económica, aprobar créditos reales, realizar operaciones bancarias ni tomar decisiones financieras sobre los usuarios.

## 4. Uso de servicios de terceros

Para proporcionar sus funcionalidades, TarjetaLab utiliza servicios tecnológicos de terceros:

**Microsoft Azure**

Se utiliza Azure AI Face Liveness para realizar la detección de vida mediante la cámara del dispositivo. También se utilizan servicios de infraestructura y comunicación para el funcionamiento de la aplicación.

Microsoft procesa la información de acuerdo con sus condiciones y políticas de privacidad aplicables.

Documentación:
https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/face/data-privacy-security

**Oracle Cloud Infrastructure**

Se utiliza para alojar el servidor backend y proporcionar la infraestructura necesaria para el funcionamiento de las herramientas MCP.

**Netlify**

Se utiliza para alojar la interfaz web de verificación facial.

Estos proveedores pueden procesar información técnica necesaria para prestar sus servicios, de acuerdo con sus respectivas políticas y condiciones.

## 5. Conservación y almacenamiento de información

TarjetaLab no almacena fotografías ni vídeos capturados durante la verificación facial en sus propios sistemas.

Las imágenes y vídeos son procesados por Azure AI Face Liveness para realizar la clasificación correspondiente.

Microsoft establece condiciones específicas de conservación para su servicio Face Liveness, que pueden variar según la versión y configuración utilizada. Por ello, el procesamiento y la eventual conservación temporal de datos por parte de Microsoft se rigen por su documentación y políticas aplicables.

Los identificadores y estados de las solicitudes de demostración pueden conservarse en los servicios backend durante el tiempo necesario para gestionar y mostrar el resultado de cada transacción.

**[Completar: indicar el período efectivo de conservación de las solicitudes y los registros técnicos.]**

## 6. Seguridad de la información

Implementamos medidas técnicas y organizativas razonables para proteger la información procesada por TarjetaLab frente a accesos no autorizados, alteraciones o divulgaciones indebidas.

La comunicación entre los componentes de la aplicación utiliza conexiones HTTPS cuando corresponde.

Sin embargo, ningún sistema informático puede garantizar una seguridad absoluta.

## 7. Consentimiento para la verificación facial

La verificación de vida es una funcionalidad opcional asociada al flujo de demostración de solicitud de tarjetas.

Antes de activar la cámara, el usuario debe recibir información sobre la finalidad de la prueba y el procesamiento de imágenes mediante Azure AI Face Liveness.

El usuario puede decidir no continuar con la verificación. En ese caso, no se iniciará la captura de imágenes mediante la cámara.

El permiso solicitado por el navegador para acceder a la cámara es independiente de la información y el consentimiento sobre el tratamiento de datos personales.

## 8. Derechos de los usuarios

Los usuarios pueden solicitar información sobre el tratamiento de sus datos personales y ejercer los derechos que les correspondan conforme a la legislación aplicable.

Para realizar consultas o solicitudes relacionadas con la privacidad, pueden comunicarse mediante el siguiente canal:

**Correo electrónico de privacidad:** javieraraujocuadros@gmail.com

## 9. Menores de edad

TarjetaLab es una aplicación de demostración tecnológica y no está diseñada para recopilar deliberadamente información personal de menores de edad.

La utilización de la funcionalidad de verificación facial debe realizarse respetando los requisitos legales aplicables a la edad y al consentimiento de los usuarios.

## 10. Modificaciones de esta política

Esta política puede actualizarse cuando se incorporen nuevas funcionalidades, se modifiquen los servicios utilizados o cambien los requisitos legales aplicables.

La versión vigente estará disponible en la página pública de privacidad de TarjetaLab.

## 11. Contacto

Para consultas relacionadas con esta política de privacidad o con el funcionamiento de TarjetaLab:

**Aplicación:** TarjetaLab

**Desarrollador / Responsable:** Javier Araujo

**Correo electrónico:** javieraraujocuadros@gmail.com

**País:** Perú

---

TarjetaLab es una aplicación demostrativa de desarrollo propio. No representa a una institución financiera real ni proporciona servicios bancarios, crediticios o financieros.