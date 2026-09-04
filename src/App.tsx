import { useEffect, useRef, useState } from "react";

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
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        <h1>
          Verificación facial
        </h1>

        {status !== "success" && (
          <p>
            Para continuar con tu
            solicitud, necesitamos
            detectar tu rostro.
          </p>
        )}

        {status === "success" ? (
          <div
            style={{
              marginTop: "32px",
              padding: "32px 24px",
              border: "1px solid #ddd",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              ✓
            </div>

            <h2>
              Verificación completada
            </h2>

            <p
              style={{
                marginTop: "16px",
                lineHeight: "1.6",
              }}
            >
              Tu verificación facial fue
              completada correctamente.
            </p>

            <p
              style={{
                marginTop: "16px",
                lineHeight: "1.6",
              }}
            >
              Puedes volver a{" "}
              <strong>ChatGPT</strong>{" "}
              para continuar con tu
              solicitud.
            </p>
          </div>
        ) : (
          <>
            {application && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <strong>
                  Solicitud
                </strong>

                <p>
                  <strong>
                    Tarjeta:
                  </strong>{" "}
                  {application.cardId}
                </p>

                <p>
                  <strong>
                    Estado:
                  </strong>{" "}
                  {application.status}
                </p>

                <p>
                  <strong>
                    Transaction ID:
                  </strong>{" "}
                  {application.transactionId}
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "24px",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: "12px",
                  backgroundColor: "#000",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
              }}
            >
              {status === "loading" && (
                <button disabled>
                  Cargando solicitud...
                </button>
              )}

              {status === "idle" && (
                <button
                  onClick={startCamera}
                >
                  Activar cámara
                </button>
              )}

              {status === "starting" && (
                <button disabled>
                  Activando cámara...
                </button>
              )}

              {status === "ready" && (
                <button
                  onClick={captureAndDetect}
                >
                  Detectar rostro
                </button>
              )}

              {status === "detecting" && (
                <button disabled>
                  Analizando...
                </button>
              )}

              {status === "retry" && (
                <button
                  onClick={captureAndDetect}
                >
                  Intentar nuevamente
                </button>
              )}

              {status === "error" && (
                <button
                  onClick={loadApplication}
                >
                  Intentar nuevamente
                </button>
              )}
            </div>
          </>
        )}

        <p
          style={{
            marginTop: "20px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>
      </section>
    </main>
  );
}

export default App;