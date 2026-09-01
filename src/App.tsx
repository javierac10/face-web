import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";

type Status =
| "idle"
| "starting"
| "ready"
| "detecting"
| "success"
| "retry"
| "error";

interface FaceDetectionResult {
faceDetected: boolean;
faceCount: number;
}

function App() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const cardId =
    params.get("cardId");


const videoRef = useRef<HTMLVideoElement>(null);
const streamRef = useRef<MediaStream | null>(null);

const [status, setStatus] = useState<Status>("idle");
const [message, setMessage] = useState(
"Activa la cámara para comenzar."
);

const startCamera = async () => {
try {
setStatus("starting");
setMessage("Solicitando acceso a la cámara...");

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
  console.error("Error accediendo a la cámara:", error);

  setStatus("error");
  setMessage(
    "No fue posible acceder a la cámara. Verifica los permisos del navegador."
  );
}

};

const stopCamera = () => {
streamRef.current?.getTracks().forEach((track) => {
track.stop();
});


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

try {
  setStatus("detecting");
  setMessage("Capturando imagen y detectando rostro...");

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

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

  const blob = await new Promise<Blob | null>(
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

  const API_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(
   `${API_URL}/api/face/detect`,
    {
      method: "POST",
      body: formData,
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

  if (
    result.faceDetected &&
    result.faceCount === 1
  ) {
    setStatus("success");

    setMessage(
      "✓ Se detectó correctamente un rostro."
    );

    stopCamera();

    return;
  }

  if (result.faceCount === 0) {
    setStatus("retry");

    setMessage(
      "No se detectó ningún rostro. Asegúrate de estar frente a la cámara e inténtalo nuevamente."
    );

    return;
  }

  setStatus("retry");

  setMessage(
    "Se detectaron varios rostros. Debe aparecer solamente una persona."
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
return () => {
streamRef.current
?.getTracks()
.forEach((track) => {
track.stop();
});
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
  <p>
    Tarjeta solicitada: {cardId}
  </p>
<section
style={{
width: "100%",
maxWidth: "600px",
textAlign: "center",
}}
> <h1>
Verificación facial </h1>


    <p>
      Para continuar con tu solicitud,
      necesitamos detectar tu rostro.
    </p>

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
      {status === "idle" && (
        <button onClick={startCamera}>
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
        <button onClick={startCamera}>
          Intentar nuevamente
        </button>
      )}

      {status === "success" && (
        <button disabled>
          Verificación completada
        </button>
      )}
    </div>

    <p
      style={{
        marginTop: "20px",
      }}
    >
      {message}
    </p>
  </section>
</main>
);
}

export default App;
