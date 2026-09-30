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

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const [message, setMessage] = useState(
    "Cargando solicitud..."
  );

  const [application, setApplication] =
    useState<CardApplication | null>(null);

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
                detectar tu rostro.
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
                    width: "36px",
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
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#667085",
                      margin: 0,
                    }}
                  >
                    Tarjeta
                  </p>

                  <p
                    style={{
                      fontWeight: 600,
                      margin: 0,
                      fontSize: "15px",
                    }}
                  >
                    {application.cardId}
                  </p>
                </div>
              </div>
            )}

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
                  style={buttonStyle()}
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
    </main>
  );
}

export default App;