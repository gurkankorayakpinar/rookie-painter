document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const drawButton = document.getElementById("drawButton");

    let img = new Image();

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    console.log("Resim yüklendi:", img.width, "x", img.height);
                    canvas.width = img.width;
                    canvas.height = img.height;
                    drawButton.disabled = false;
                };
            };
            reader.readAsDataURL(file);
        }
    });

    drawButton.addEventListener("click", () => {
        drawButton.disabled = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(img, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;

        // Pikselleri 4 bölgeye ayır
        const midX = Math.floor(img.width / 2);
        const midY = Math.floor(img.height / 2);
        let topLeft = [];
        let topRight = [];
        let bottomLeft = [];
        let bottomRight = [];

        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                if (x < midX && y < midY) topLeft.push({ x, y });
                else if (x >= midX && y < midY) topRight.push({ x, y });
                else if (x < midX && y >= midY) bottomLeft.push({ x, y });
                else bottomRight.push({ x, y });
            }
        }

        // Her bölgeyi çapraz sırala (köşeden merkeze)
        topLeft.sort((a, b) => {
            const wave = Math.sin((a.x + a.y) * 0.05) * 10;
            return (a.x + a.y + wave) - (b.x + b.y + Math.sin((b.x + b.y) * 0.05) * 10) + (Math.random() - 0.5) * 20;
        });
        topRight.sort((a, b) => {
            const wave = Math.sin((img.width - a.x + a.y) * 0.05) * 10;
            return ((img.width - a.x) + a.y + wave) - ((img.width - b.x) + b.y + Math.sin((img.width - b.x + b.y) * 0.05) * 10) + (Math.random() - 0.5) * 20;
        });
        bottomLeft.sort((a, b) => {
            const wave = Math.sin((a.x + (img.height - a.y)) * 0.05) * 10;
            return (a.x + (img.height - a.y) + wave) - (b.x + (img.height - b.y) + Math.sin((b.x + (img.height - b.y)) * 0.05) * 10) + (Math.random() - 0.5) * 20;
        });
        bottomRight.sort((a, b) => {
            const wave = Math.sin((img.width - a.x + img.height - a.y) * 0.05) * 10;
            return ((img.width - a.x) + (img.height - a.y) + wave) - ((img.width - b.x) + (img.height - b.y) + Math.sin((img.width - b.x + img.height - b.y) * 0.05) * 10) + (Math.random() - 0.5) * 20;
        });

        const totalTime = 2000; // 2 saniye
        const pixelsPerStep = 25; // Her adımda 25 piksel
        const regions = [topLeft, topRight, bottomLeft, bottomRight];

        // 4 bölge için de ayrı çizim fonksiyonu
        regions.forEach((region) => {
            const steps = Math.ceil(region.length / pixelsPerStep);
            const interval = totalTime / steps;
            let index = 0;

            function drawRegionBatch() {
                if (index >= region.length) return;

                const batchSize = Math.min(pixelsPerStep, region.length - index);
                for (let i = 0; i < batchSize; i++) {
                    const { x, y } = region[index];
                    const pixelIndex = (y * img.width + x) * 4;
                    const r = imageData[pixelIndex];
                    const g = imageData[pixelIndex + 1];
                    const b = imageData[pixelIndex + 2];
                    const a = imageData[pixelIndex + 3] / 255;

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                    ctx.fillRect(x, y, 1, 1);

                    index++;
                }

                setTimeout(drawRegionBatch, interval);
            }

            drawRegionBatch(); // 4 bölgeyi de aynı anda başlat.
        });

        // Çizim tamamlandığında buton'u aktif et
        setTimeout(() => {
            console.log("Çizim tamamlandı!");
            drawButton.disabled = false;
        }, totalTime + 100); // Tüm bölgeler bitince
    });
});