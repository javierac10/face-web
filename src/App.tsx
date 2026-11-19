import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

type Status =
  | "loading"
  | "idle"
  | "starting"
  | "ready"
  | "detecting"
  | "success"
  | "retry"
  | "error";

interface FaceDetectionResult {
  faceDetected: boolean;
  transactionId?: string;
  status?: string;
}

interface CardApplication {
  transactionId: string;
  cardId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

import cuponClasica from "./assets/cards/visa-clasica.png";
import cuponGold from "./assets/cards/mastercard-gold.png";
import cuponSignature from "./assets/cards/visa-signature.png";
import cuponBlack from "./assets/cards/mastercard-black.png";
import cuponInfinite from "./assets/cards/visa-infinite.png";
import cuponJoven from "./assets/cards/mastercard-joven.png";

const cardById: Record<string, string> = {
  'cupon-esencial': cuponClasica,
  'cupon-plus': cuponGold,
  'cupon-premium': cuponSignature,
  'cupon-black': cuponBlack,
  'cupon-infinite': cuponInfinite,
  'cupon-inicial': cuponJoven,
};

import "./App.css"

const policyHtml = `
<h2>Política de Privacidad – NTTDATABank</h2>
<p><strong>Última actualización:</strong> 19 de noviembre de 2026</p>

<h3>1. Introducción</h3>
<p>NTTDATABank es una aplicación demostrativa desarrollada con fines educativos y tecnológicos, cuyo objetivo es mostrar las capacidades de integración entre aplicaciones, inteligencia artificial y servicios financieros simulados mediante el protocolo Model Context Protocol (MCP).</p>
<p>Esta aplicación no es una entidad financiera, no es un banco real y no ofrece productos financieros reales. Las tarjetas, características, beneficios, tasas y límites mostrados corresponden a información de demostración creada para esta aplicación.</p>
<p>Nos comprometemos a respetar la privacidad de las personas que utilizan NTTDATABank y a proporcionar información transparente sobre el tratamiento de los datos durante su funcionamiento.</p>

<h3>2. Información que recopilamos y procesamos</h3>
<p>NTTDATABank no solicita credenciales bancarias, números de cuentas reales, contraseñas ni información de tarjetas bancarias personales.</p>
<p>Durante el uso de la aplicación pueden procesarse los siguientes datos:</p>
<p><strong>2.1. Información de navegación y solicitudes</strong></p>
<ul>
<li>Identificadores de transacciones generados para las solicitudes de demostración.</li>
<li>Identificadores de las tarjetas seleccionadas dentro del catálogo.</li>
<li>Estados y fechas asociados a las solicitudes de demostración.</li>
<li>Información técnica necesaria para establecer y mantener la comunicación entre los componentes de la aplicación.</li>
</ul>
<p><strong>2.2. Información de la cámara</strong></p>
<p>Cuando el usuario decide iniciar una verificación de vida, la aplicación solicita acceso a la cámara del dispositivo.</p>
<p>Las imágenes y el vídeo capturados se envían al servicio Azure AI Face Liveness de Microsoft para determinar si existe una persona real frente a la cámara.</p>
<p>Esta funcionalidad:</p>
<ul>
<li>Se utiliza exclusivamente para realizar una prueba de detección de vida.</li>
<li>No tiene como finalidad identificar al usuario ni determinar su identidad.</li>
<li>No compara el rostro con documentos de identidad ni con una base de datos de personas.</li>
<li>No almacena las imágenes ni los vídeos capturados en los sistemas propios de NTTDATABank.</li>
</ul>
<p>El procesamiento de las imágenes se realiza mediante la infraestructura de Microsoft Azure y está sujeto a las políticas de privacidad y conservación del servicio correspondiente.</p>

<h3>3. Finalidad del tratamiento</h3>
<p>La información procesada se utiliza exclusivamente para:</p>
<ul>
<li>Mostrar el catálogo y las características de las tarjetas de demostración.</li>
<li>Consultar información de las tarjetas disponibles.</li>
<li>Crear y consultar solicitudes de demostración.</li>
<li>Generar identificadores temporales para gestionar las transacciones.</li>
<li>Ejecutar la prueba de detección de vida cuando el usuario decide iniciar una solicitud.</li>
<li>Comunicar el resultado de la verificación y actualizar el estado de la solicitud.</li>
</ul>
<p>La información no se utiliza para evaluar la solvencia económica, aprobar créditos reales, realizar operaciones bancarias ni tomar decisiones financieras sobre los usuarios.</p>

<h3>4. Uso de servicios de terceros</h3>
<p>Para proporcionar sus funcionalidades, NTTDATABank utiliza servicios tecnológicos de terceros:</p>
<p><strong>Microsoft Azure</strong></p>
<p>Se utiliza Azure AI Face Liveness para realizar la detección de vida mediante la cámara del dispositivo. También se utilizan servicios de infraestructura y comunicación para el funcionamiento de la aplicación.</p>
<p>Microsoft procesa la información de acuerdo con sus condiciones y políticas de privacidad aplicables.</p>
<p>Documentación: <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/face/data-privacy-security" target="_blank" rel="noopener noreferrer">https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/face/data-privacy-security</a></p>
<p><strong>Oracle Cloud Infrastructure</strong></p>
<p>Se utiliza para alojar el servidor backend y proporcionar la infraestructura necesaria para el funcionamiento de las herramientas MCP.</p>
<p><strong>Netlify</strong></p>
<p>Se utiliza para alojar la interfaz web de verificación facial.</p>
<p>Estos proveedores pueden procesar información técnica necesaria para prestar sus servicios, de acuerdo con sus respectivas políticas y condiciones.</p>

<h3>5. Conservación y almacenamiento de información</h3>
<p>NTTDATABank no almacena fotografías ni vídeos capturados durante la verificación facial en sus propios sistemas.</p>
<p>Las imágenes y vídeos son procesados por Azure AI Face Liveness para realizar la clasificación correspondiente.</p>
<p>Microsoft establece condiciones específicas de conservación para su servicio Face Liveness, que pueden variar según la versión y configuración utilizada. Por ello, el procesamiento y la eventual conservación temporal de datos por parte de Microsoft se rigen por su documentación y políticas aplicables.</p>
<p>Los identificadores y estados de las solicitudes de demostración pueden conservarse en los servicios backend durante el tiempo necesario para gestionar y mostrar el resultado de cada transacción.</p>

<h3>6. Seguridad de la información</h3>
<p>Implementamos medidas técnicas y organizativas razonables para proteger la información procesada por NTTDATABank frente a accesos no autorizados, alteraciones o divulgaciones indebidas.</p>
<p>La comunicación entre los componentes de la aplicación utiliza conexiones HTTPS cuando corresponde.</p>
<p>Sin embargo, ningún sistema informático puede garantizar una seguridad absoluta.</p>

<h3>7. Consentimiento para la verificación facial</h3>
<p>La verificación de vida es una funcionalidad opcional asociada al flujo de demostración de solicitud de tarjetas.</p>
<p>Antes de activar la cámara, el usuario debe recibir información sobre la finalidad de la prueba y el procesamiento de imágenes mediante Azure AI Face Liveness.</p>
<p>El usuario puede decidir no continuar con la verificación. En ese caso, no se iniciará la captura de imágenes mediante la cámara.</p>
<p>El permiso solicitado por el navegador para acceder a la cámara es independiente de la información y el consentimiento sobre el tratamiento de datos personales.</p>

<h3>8. Derechos de los usuarios</h3>
<p>Los usuarios pueden solicitar información sobre el tratamiento de sus datos personales y ejercer los derechos que les correspondan conforme a la legislación aplicable.</p>
<p>Para realizar consultas o solicitudes relacionadas con la privacidad, pueden comunicarse mediante el siguiente canal:</p>
<p><strong>Correo electrónico de privacidad:</strong> javieraraujocuadros@gmail.com</p>

<h3>9. Menores de edad</h3>
<p>NTTDATABank es una aplicación de demostración tecnológica y no está diseñada para recopilar deliberadamente información personal de menores de edad.</p>
<p>La utilización de la funcionalidad de verificación facial debe realizarse respetando los requisitos legales aplicables a la edad y al consentimiento de los usuarios.</p>

<h3>10. Modificaciones de esta política</h3>
<p>Esta política puede actualizarse cuando se incorporen nuevas funcionalidades, se modifiquen los servicios utilizados o cambien los requisitos legales aplicables.</p>
<p>La versión vigente estará disponible en la página pública de privacidad de NTTDATABank.</p>

<h3>11. Contacto</h3>
<p>Para consultas relacionadas con esta política de privacidad o con el funcionamiento de NTTDATABank:</p>
<p><strong>Aplicación:</strong> NTTDATABank</p>
<p><strong>Desarrollador / Responsable:</strong> Javier Araujo</p>
<p><strong>Correo electrónico:</strong> javieraraujocuadros@gmail.com</p>
<p><strong>País:</strong> Perú</p>
<hr />
<p>NTTDATABank es una aplicación demostrativa de desarrollo propio. No representa a una institución financiera real ni proporciona servicios bancarios, crediticios o financieros.</p>
`;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const [message, setMessage] = useState(
    "Cargando solicitud..."
  );

  const [application, setApplication] =
    useState<CardApplication | null>(null);

  const [accepted, setAccepted] = useState(false);

  const [showPolicy, setShowPolicy] = useState(false);

  const transactionId = new URLSearchParams(
    window.location.search
  ).get("transactionId");

  console.log("API_URL:", API_URL);
  console.log("TransactionId:", transactionId);

  const loadApplication = async () => {
    if (!transactionId) {
      setStatus("error");

      setMessage(
        "No se encontró el identificador de la solicitud."
      );

      return;
    }

    try {
      setMessage("Consultando solicitud...");

      const response = await fetch(
        `${API_URL}/api/card-applications/${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log(
        "card-applications Response:",
        response
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `HTTP ${response.status}: ${errorText}`
        );
      }

      const data =
        (await response.json()) as CardApplication;

      console.log("Solicitud obtenida:", data);

      setApplication(data);

      if (data.status === "FACE_DETECTED") {
        setStatus("success");

        setMessage(
          "✓ Verificación facial ya completada. Puedes volver a ChatGPT para continuar con tu solicitud."
        );

        return;
      }

      setStatus("idle");

      setMessage(
        "Activa la cámara para comenzar la verificación facial."
      );
    } catch (error) {
      console.error(
        "Error consultando solicitud:",
        error
      );

      setStatus("error");

      setMessage(
        "No fue posible obtener la solicitud."
      );
    }
  };

  const startCamera = async () => {
    try {
      setStatus("starting");

      setMessage(
        "Solicitando acceso a la cámara..."
      );

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setStatus("ready");

      setMessage(
        "Cámara activada. Coloca tu rostro frente a la cámara."
      );
    } catch (error) {
      console.error(
        "Error accediendo a la cámara:",
        error
      );

      setStatus("error");

      setMessage(
        "No fue posible acceder a la cámara. Verifica los permisos del navegador."
      );
    }
  };

  const stopCamera = () => {
    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndDetect = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setStatus("error");

      setMessage(
        "La cámara todavía no está lista. Inténtalo nuevamente."
      );

      return;
    }

    if (!transactionId) {
      setStatus("error");

      setMessage(
        "No se encontró el identificador de la solicitud."
      );

      return;
    }

    try {
      setStatus("detecting");

      setMessage(
        "Capturando imagen y detectando rostro..."
      );

      const canvas =
        document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "No fue posible crear el contexto de la imagen."
        );
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/jpeg",
              0.9
            );
          }
        );

      if (!blob) {
        throw new Error(
          "No fue posible generar la imagen."
        );
      }

      const formData = new FormData();

      formData.append(
        "image",
        blob,
        "face.jpg"
      );

      formData.append(
        "transactionId",
        transactionId
      );

      const response = await fetch(
        `${API_URL}/api/face/detect`,
        {
          method: "POST",
          body: formData,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          `HTTP ${response.status}: ${errorText}`
        );
      }

      const result =
        (await response.json()) as FaceDetectionResult;

      console.log(
        "Resultado Face Detection:",
        result
      );

      /*
       * El backend ya realizó la validación
       * y actualizó el estado de la solicitud.
       *
       * No necesitamos volver a consultar
       * /api/card-applications/{transactionId}.
       *
       * FACE_DETECTED es el punto final de
       * esta aplicación de verificación.
       */
      if (
        result.faceDetected &&
        result.status === "FACE_DETECTED"
      ) {
        stopCamera();

        setApplication((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            status: "FACE_DETECTED",
          };
        });

        setStatus("success");

        setMessage(
          "✓ Verificación facial completada correctamente. Puedes volver a ChatGPT para continuar con tu solicitud."
        );

        return;
      }

      /*
       * La detección facial falló.
       *
       * No nos interesa aquí la cantidad de
       * rostros detectados. Esa lógica podrá
       * cambiar posteriormente cuando integremos
       * el plugin de identidad facial.
       */
      setStatus("retry");

      setMessage(
        "No fue posible detectar tu rostro. Asegúrate de estar frente a la cámara e inténtalo nuevamente."
      );
    } catch (error) {
      console.error(
        "Error ejecutando Face Detection:",
        error
      );

      setStatus("error");

      setMessage(
        "Ocurrió un error al procesar la imagen."
      );
    }
  };

  const buttonStyle = (
    disabled?: boolean
  ): CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#ffffff",
    background: disabled ? "#a8b3c7" : "#4f46e5",
    border: "none",
    borderRadius: "12px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s ease",
  });

  useEffect(() => {
    loadApplication();

    return () => {
      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #f6f8fb 0%, #eef1f6 100%)",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        color: "#1a2233",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 32px",
          boxShadow:
            "0 20px 50px rgba(16, 24, 40, 0.10)",
          boxSizing: "border-box",
        }}
      >
        {status === "success" ? (
          <>
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#e6f7ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#16a34a",
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: 600,
                margin: "0 0 8px",
                textAlign: "center",
              }}
            >
              Verificación completada
            </h1>

            <p
              style={{
                textAlign: "center",
                margin: 0,
                lineHeight: "1.6",
                color: "#475467",
              }}
            >
              Tu verificación facial fue
              completada correctamente.
              Puedes volver a{" "}
              <strong>ChatGPT</strong>{" "}
              para continuar con tu
              solicitud.
            </p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  margin: "0 0 6px",
                }}
              >
                Verificación facial
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#475467",
                  lineHeight: "1.5",
                }}
              >
                Para continuar con tu
                solicitud, necesitamos
                comprobar que eres una persona real.
              </p>
            </div>

            {application && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: "1px solid #e4e7ec",
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    width: "84px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {application.cardId.charAt(0).toUpperCase()}
                </span>

                <div
                  style={{
                    textAlign: "left",
                  }}
                >

                  <img className="credit-card__image" src={cardById[application.cardId]} alt={application.cardId} />
                  {/* <p
                    style={{
                      fontWeight: 600,
                      margin: 0,
                      fontSize: "15px",
                    }}
                  >
                    {application.cardId}
                  </p> */}
                </div>
              </div>
            )}

            <div
              style={{
                border: "1px solid #e4e7ec",
                borderRadius: "14px",
                padding: "18px 20px",
                marginBottom: "24px",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    lineHeight: 1,
                  }}
                >
                  ℹ️
                </span>

                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#1a2233",
                  }}
                >
                  Información sobre tu privacidad
                </h2>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#475467",
                }}
              >
                <p style={{ margin: "0 0 8px" }}>
                  Utilizaremos tu cámara y Azure AI
                  Face Liveness para comprobar que hay
                  una persona real frente a ella.
                </p>

                <p style={{ margin: "0 0 8px" }}>
                  Esta prueba no busca identificarte ni
                  reconocer quién eres.
                </p>

                <p style={{ margin: "0 0 8px" }}>
                  Las imágenes y vídeos se procesan
                  mediante Azure. Nuestra aplicación no
                  almacena las capturas de la cámara.
                </p>

                <p style={{ margin: "0 0 12px" }}>
                  Consulta nuestra política de
                  privacidad para conocer el tratamiento
                  y la conservación de los datos.
                </p>

                <button
                  onClick={() => setShowPolicy(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4f46e5",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Leer política de privacidad
                </button>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginTop: "16px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) =>
                    setAccepted(e.target.checked)
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    marginTop: "2px",
                    cursor: "pointer",
                    accentColor: "#4f46e5",
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#1a2233",
                  }}
                >
                  He leído y acepto el tratamiento de
                  mis imágenes para realizar la prueba
                  de detección de vida.
                </span>
              </label>
            </div>

            <div
              style={{
                position: "relative",
                marginBottom: "24px",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: "14px",
                  backgroundColor: "#111827",
                  display: "block",
                }}
              />

              {!["ready", "detecting", "retry"].includes(
                status
              ) && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#9ca3af",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>
                    📷
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    Cámara inactiva
                  </span>
                </div>
              )}
            </div>

            <div style={{ width: "100%" }}>
              {status === "loading" && (
                <button
                  disabled
                  style={buttonStyle(true)}
                >
                  Cargando solicitud...
                </button>
              )}

              {status === "idle" && (
                <button
                  onClick={startCamera}
                  disabled={!accepted}
                  style={buttonStyle(!accepted)}
                >
                  Activar cámara
                </button>
              )}

              {status === "starting" && (
                <button
                  disabled
                  style={buttonStyle(true)}
                >
                  Activando cámara...
                </button>
              )}

              {status === "ready" && (
                <button
                  onClick={captureAndDetect}
                  style={buttonStyle()}
                >
                  Detectar rostro
                </button>
              )}

              {status === "detecting" && (
                <button
                  disabled
                  style={buttonStyle(true)}
                >
                  Analizando...
                </button>
              )}

              {status === "retry" && (
                <button
                  onClick={captureAndDetect}
                  style={buttonStyle()}
                >
                  Intentar nuevamente
                </button>
              )}

              {status === "error" && (
                <button
                  onClick={loadApplication}
                  style={buttonStyle()}
                >
                  Intentar nuevamente
                </button>
              )}
            </div>

            <p
              style={{
                margin: "20px 0 0",
                textAlign: "center",
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#667085",
              }}
            >
              {message}
            </p>
          </>
        )}
      </section>

      {showPolicy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 24, 40, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
          onClick={() => setShowPolicy(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(16, 24, 40, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #e4e7ec",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1a2233",
                }}
              >
                Política de privacidad
              </span>

              <button
                onClick={() => setShowPolicy(false)}
                aria-label="Cerrar"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  lineHeight: 1,
                  color: "#667085",
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "#475467",
              }}
              dangerouslySetInnerHTML={{ __html: policyHtml }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;