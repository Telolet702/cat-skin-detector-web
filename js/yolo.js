// js/yolo.js
const ML_CONFIG = {
    modelPath: './models/best_float32.tflite',
    inputSize: 640,
    iouThreshold: 0.45,
    confThreshold: 0.25,
    labels: ['flea_allergy', 'healthy', 'ringworms', 'scabies'],
    colors: ['#FF9500', '#34C759', '#FF3B30', '#007AFF']
};

let tfliteModel = null;

// Inisialisasi Model
async function initModel() {
    try {
        await tf.setBackend('wasm');
        await tf.ready();
        tfliteModel = await tflite.loadTFLiteModel(ML_CONFIG.modelPath);
        console.log("YOLOv26 TFLite Model Loaded!");
        return true;
    } catch (error) {
        console.error("Gagal memuat model:", error);
        return false;
    }
}

// Eksekusi Prediksi
async function predictYOLO(imageElement, originalWidth, originalHeight) {
    if (!tfliteModel) return [];

    const inputTensor = tf.tidy(() => {
        // Ekstraksi pixel dan resize ke 640x640
        const imgTensor = tf.browser.fromPixels(imageElement);
        const resized = tf.image.resizeBilinear(imgTensor, [ML_CONFIG.inputSize, ML_CONFIG.inputSize]);
        // Normalisasi [0, 1] dan ubah menjadi Float32
        const normalized = resized.div(255.0);
        // Expand dimensi ke [1, 640, 640, 3]
        return normalized.expandDims(0);
    });

    // Run inference: Output shape [1, 300, 6] (Karena sudah ada NMS bawaan)
    const outputTensor = tfliteModel.predict(inputTensor);

    // Proses Tensor ke format Bounding Box
    const results = await processTensors(outputTensor, originalWidth, originalHeight);

    // Bersihkan memori GPU/WASM
    inputTensor.dispose();
    outputTensor.dispose();

    return results;
}

// Logika Matematika Post-Processing [1, 300, 6]
async function processTensors(outputTensor, width, height) {
    // 1. Tarik data dari tensor [1, 300, 6] menjadi array JavaScript biasa
    const outputArray = outputTensor.arraySync()[0]; 
    const finalDetections = [];

    // 2. Looping hanya 300 kali
    for (let i = 0; i < outputArray.length; i++) {
        const detection = outputArray[i];
        const score = detection[4]; // Indeks 4 adalah skor (Confidence)

        if (score >= ML_CONFIG.confThreshold) {
            
            const classId = Math.round(detection[5]); // Indeks 5 adalah Class ID
            
            // --- PERBAIKAN BUG MELENCENG (TUKAR INDEKS 0 DAN 1) ---
            // Model Anda ternyata mengeluarkan X lebih dulu, baru Y.
            const xmin = detection[0]; 
            const ymin = detection[1]; 
            const xmax = detection[2]; 
            const ymax = detection[3]; 

            // Kembalikan skalanya sesuai dengan ukuran asli canvas/video di layar
            const x = xmin * width;
            const y = ymin * height;
            const w = (xmax - xmin) * width;
            const h = (ymax - ymin) * height;

            finalDetections.push({
                classId: classId,
                className: ML_CONFIG.labels[classId],
                score: score,
                box: [x, y, w, h], // Format yang diminta UI: [x, y, width, height]
                color: ML_CONFIG.colors[classId]
            });
        }
    }

    return finalDetections;
}