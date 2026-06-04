// js/app.js

// --- Konfigurasi Global UI ---
let currentDisease = 'Healthy';
let prevPage = 'page-home';
let cameraStream = null;
let detectionLoop = null;
let currentFacingMode = 'environment';
let latestDetections = [];

// ==========================================
// MESIN COMPONENT LOADER (Penyedot HTML)
// ==========================================
async function loadHTMLComponents() {
    const listHalaman = [
        'home', 'camera', 'upload', 'processing', 
        'result', 'disease-list', 'disease-detail', 'help'
    ];
    
    for (const halaman of listHalaman) {
        try {
            const response = await fetch(`pages/${halaman}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const htmlText = await response.text();
            document.getElementById(`page-${halaman}`).innerHTML = htmlText;
        } catch (error) {
            console.error(`Gagal memuat halaman: ${halaman}.html`, error);
        }
    }
}

// ==========================================
// INISIALISASI EVENT LISTENER (Dipanggil SETELAH HTML di-load)
// ==========================================
function initEventListeners() {
    // Memasang aksi klik ke tombol Capture Kamera (Baru aman dilakukan disini)
    const btnCapture = document.getElementById('btn-capture');
    if (btnCapture) {
        btnCapture.addEventListener('click', () => {
            if (detectionLoop) cancelAnimationFrame(detectionLoop);
            
            const video = document.getElementById('webcam');
            const resCanvas = document.getElementById('result-canvas');
            
            if(video.videoWidth === 0 || video.videoHeight === 0) {
                alert("Kamera belum siap, coba beberapa detik lagi.");
                return;
            }

            resCanvas.width = video.videoWidth;
            resCanvas.height = video.videoHeight;
            
            const ctx = resCanvas.getContext('2d');
            ctx.drawImage(video, 0, 0, resCanvas.width, resCanvas.height);
            
            if (typeof latestDetections !== 'undefined') {
                drawBoundingBoxes(resCanvas, latestDetections, false);
                processDetectionResultUI(latestDetections);
            } else {
                processDetectionResultUI([]);
            }
        });
    }
}

// ==========================================
// INISIALISASI APLIKASI UTAMA
// ==========================================
window.onload = async () => {
    // 1. TUNGGU SAMPAI SELURUH KOMPONEN HTML DISELESAIKAN (PENTING!)
    await loadHTMLComponents();

    // 2. Sekarang baru aman untuk memasang Event Listener
    initEventListeners();

    // 3. Render daftar menu penyakit
    renderDiseaseList();

    // 4. Muat Model YOLOv11 TFLite
    const statusText = document.getElementById('camera-status');
    const isReady = await initModel();
    if(statusText) {
        statusText.innerText = isReady ? "Arahkan kamera ke area kulit kucing" : "Gagal memuat model. Periksa koneksi.";
    }

    // 5. Akhiri Splash Screen
    setTimeout(() => { document.getElementById('dot1').classList.add('active');
        setTimeout(() => { document.getElementById('dot2').classList.add('active');
            setTimeout(() => { go('page-home'); }, 700);
        }, 700);
    }, 800);
};

// ... (LANJUTKAN DENGAN KODE FUNGSI go(pageId) DAN SETERUSNYA MILIK ANDA) ...

// ==========================================
// NAVIGASI ANTARMUKA (ROUTING)
// ==========================================
function go(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // --- BUG FIX: Matikan kamera otomatis jika keluar dari halaman deteksi ---
    if (pageId !== 'page-camera') {
        if (detectionLoop) {
            cancelAnimationFrame(detectionLoop);
            detectionLoop = null;
        }
        if (cameraStream) {
            // Matikan semua perangkat keras (lensa & mic) yang terhubung
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null; // Kosongkan memori stream
        }
    }
    // --------------------------------------------------------------------------

    // Auto-trigger Kamera jika masuk halaman deteksi
    if (pageId === 'page-camera') startCamera();
    
    // Reset form unggah jika batal
    if (pageId === 'page-upload') resetUploadForm();
}

function goBack() { 
    go(prevPage); 
}

function resetUploadForm() {
    const zone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const btnDetect = document.getElementById('btn-detect-upload');
    
    zone.classList.remove('has-image');
    zone.innerHTML = `
        <i class="ti ti-cloud-upload" style="font-size:36px;color:var(--color-text-secondary);margin-bottom:8px" aria-hidden="true"></i>
        <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:4px">Ketuk untuk memilih gambar</p>
        <p style="font-size:12px;color:var(--color-text-secondary)">dari galeri perangkat</p>
    `;
    
    btnDetect.style.display = 'none';
    fileInput.value = ''; 
}

// ==========================================
// KONTROL KAMERA (WEBRTC)
// ==========================================
async function startCamera() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('overlay');
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: { ideal: 640 }, height: { ideal: 640 } },
            audio: false
        });
        video.srcObject = cameraStream;
        
        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            detectRealTime(video, canvas);
        };
    } catch (err) {
        alert("Akses kamera ditolak. Pastikan memberikan izin kamera pada browser.");
    }
}

function stopCameraAndGoHome() {
    if (detectionLoop) cancelAnimationFrame(detectionLoop);
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    go('page-home');
}

function flipCamera() {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    startCamera();
}

// ==========================================
// LOOP DETEKSI REAL-TIME 
// ==========================================
async function detectRealTime(video, canvas) {
    if (!cameraStream || !cameraStream.active) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        // Sinkronisasi rasio
        if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        // Prediksi dan render Bounding Box
        latestDetections = await predictYOLO(video, canvas.width, canvas.height);
        drawBoundingBoxes(canvas, latestDetections, true);

        // Update Teks Status
        const statusText = document.getElementById('camera-status');
        if (latestDetections.length > 0) {
            const best = latestDetections.reduce((p, c) => p.score > c.score ? p : c);
            const score = Math.round(best.score * 100);
            statusText.innerHTML = `<span style="color: ${best.color}; font-weight: bold; font-size: 15px;">
                Terdeteksi: ${diseasesDB[best.className].title} (${score}%)
            </span>`;
        } else {
            statusText.innerHTML = "Menganalisis... Arahkan kamera ke area kulit kucing";
            statusText.style.color = "var(--color-text-secondary)";
        }
    }

    detectionLoop = requestAnimationFrame(() => detectRealTime(video, canvas));
}

function drawBoundingBoxes(canvas, detections, clearCanvas = true) {
    const ctx = canvas.getContext('2d');
    
    if (clearCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    detections.forEach((det) => {
        const [x, y, w, h] = det.box;
        
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 3; 
        ctx.strokeRect(x, y, w, h);

        const text = `${diseasesDB[det.className].title} ${(det.score * 100).toFixed(0)}%`;
        
        ctx.fillStyle = det.color;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x - 1.5, y - 28, textWidth + 12, 28); 

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(text, x + 4, y - 8);
    });
}

// ==========================================
// FITUR UPLOAD FILE
// ==========================================
function triggerUpload() { document.getElementById('file-input').click(); }

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Error Handling: Ekstensi
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
        alert("⚠️ ERROR: Format file tidak didukung!\nSilakan unggah gambar dengan format JPG, JPEG, atau PNG.");
        resetUploadForm();
        return;
    }

    // Error Handling: Ukuran (Maksimal 5MB)
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        alert(`⚠️ ERROR: Ukuran file terlalu besar!\nMaksimal ukuran gambar adalah ${maxSizeInMB} MB.`);
        resetUploadForm();
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        const imgData = ev.target.result;
        if (!imgData) {
            alert("⚠️ ERROR: Gambar korup atau tidak dapat dibaca oleh sistem.");
            return;
        }
        
        const zone = document.getElementById('upload-zone');
        zone.classList.add('has-image');
        zone.innerHTML = `<img src="${imgData}" alt="Uploaded">`;
        document.getElementById('btn-detect-upload').style.display = 'flex';
        
        const previewImg = document.getElementById('upload-preview-img');
        previewImg.src = imgData;
    };
    
    reader.onerror = () => {
        alert("⚠️ ERROR: Terjadi kesalahan sistem saat membaca file Anda.");
    };

    reader.readAsDataURL(file);
}

async function detectUploadedImage() {
    go('page-processing');
    const imgEl = document.getElementById('upload-preview-img');
    
    setTimeout(async () => {
        const resCanvas = document.getElementById('result-canvas');
        resCanvas.width = imgEl.naturalWidth;
        resCanvas.height = imgEl.naturalHeight;
        
        const ctx = resCanvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, resCanvas.width, resCanvas.height);
        
        const detections = await predictYOLO(imgEl, resCanvas.width, resCanvas.height);
        drawBoundingBoxes(resCanvas, detections, false);
        
        processDetectionResultUI(detections);
    }, 500);
}

// ==========================================
// RENDER HALAMAN HASIL DAN DETAIL
// ==========================================
function processDetectionResultUI(detections) {
    let bestMatch = { className: 'healthy', score: 0.0 }; 
    
    if (detections && detections.length > 0) {
        bestMatch = detections.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    }
    
    const dbData = diseasesDB[bestMatch.className];
    if(!dbData) return;

    const scorePct = Math.round(bestMatch.score * 100);

    const tagEl = document.getElementById('result-disease');
    tagEl.textContent = dbData.title;
    tagEl.className = bestMatch.className === 'healthy' ? 'tag tag-green' : 'tag tag-red';
    
    document.getElementById('result-conf').textContent = `${scorePct}%`;
    document.getElementById('conf-bar').style.width = `${scorePct}%`;
    document.getElementById('result-desc').textContent = dbData.desc;
    
    const btnDetail = document.getElementById('btn-detail-info');
    if (btnDetail) {
        btnDetail.onclick = () => showDiseaseDetail(bestMatch.className);
    }

    go('page-result');
}

function renderDiseaseList() {
    const listWrap = document.getElementById('disease-list-content');
    listWrap.innerHTML = '<p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:14px">Pilih penyakit untuk melihat informasi medis lengkap</p>';
    
    Object.keys(diseasesDB).forEach(key => {
        const d = diseasesDB[key];
        const btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.onclick = () => showDiseaseDetail(key);
        btn.innerHTML = `
            <div class="menu-icon" style="background:${d.color};font-size:22px"><i class="ti ${d.icon}" style="color:${d.iconColor}"></i></div>
            <div class="menu-info">
                <div class="menu-title">${d.title}</div>
                <div class="menu-desc">${d.desc}</div>
            </div>
            <i class="ti ti-chevron-right menu-arrow"></i>
        `;
        listWrap.appendChild(btn);
    });
}

function showDiseaseDetail(classKey) {
    prevPage = document.querySelector('.page.active').id;
    const d = diseasesDB[classKey];
    if(!d) return;

    document.getElementById('detail-topbar').textContent = d.title;
    document.getElementById('disease-name').textContent = d.title;
    document.getElementById('disease-header').style.background = d.iconColor;
    document.getElementById('disease-icon').innerHTML = `<i class="ti ${d.icon}" style="color:#fff;font-size:40px"></i>`;
    
    const imgEl = document.getElementById('disease-image');
    if(imgEl) {
        imgEl.src = d.imgUrl;
        imgEl.style.display = d.imgUrl ? 'block' : 'none';
    }

    const linkEl = document.getElementById('disease-link');
    if(linkEl) linkEl.href = d.articleLink;
    
    document.getElementById('d-cause').innerHTML = d.cause;
    document.getElementById('d-symptoms').innerHTML = d.symptoms;
    document.getElementById('d-treatment').innerHTML = d.treatment;
    document.getElementById('d-prevention').innerHTML = d.prevention;
    
    go('page-disease-detail');
}