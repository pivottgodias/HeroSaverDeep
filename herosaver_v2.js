(() => {
    if (window.exportHighQualityModel) {
        console.log("HeroSaver já carregado.");
        return;
    }

    let capturedScene = null;
    let capturedRenderer = null;

    // Intercepta a criação do WebGLRenderer para capturar a cena e o contexto
    const originalWebGLRenderer = window.THREE?.WebGLRenderer || Object.values(window).find(obj => obj?.WebGLRenderer)?.WebGLRenderer;

    if (originalWebGLRenderer) {
        window.THREE.WebGLRenderer = function (...args) {
            const renderer = new originalWebGLRenderer(...args);
            capturedRenderer = renderer;

            setTimeout(() => {
                let scenes = Object.values(window).filter(obj => obj instanceof THREE.Scene);
                if (scenes.length > 0) {
                    capturedScene = scenes[scenes.length - 1]; // Última cena detectada
                    console.log("🎯 Cena capturada:", capturedScene);
                } else {
                    console.warn("⚠ Nenhuma cena encontrada ainda. Tentando novamente...");
                }
            }, 3000); // Aguarda 3 segundos para garantir que a cena esteja pronta

            return renderer;
        };
    } else {
        console.error("❌ Erro: Não foi possível interceptar o WebGLRenderer.");
    }

    function exportGLTF(scene, fileName) {
        if (!scene) {
            alert("Erro: Nenhuma cena foi capturada ainda. Aguarde alguns segundos e tente novamente.");
            return;
        }

        const exporter = new THREE.GLTFExporter();
        exporter.parse(scene, gltf => {
            const blob = new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName + ".gltf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("✅ GLTF exportado com sucesso:", fileName);
        }, { binary: false });
    }

    window.exportHighQualityModel = function () {
        if (!capturedScene) {
            alert("Erro: Nenhuma cena foi capturada ainda. Aguarde alguns segundos e tente novamente.");
            return;
        }
        exportGLTF(capturedScene, "heroforge_model");
    };

    console.log("✅ HeroSaver aguardando a cena do HeroForge... Rode `exportHighQualityModel()` após alguns segundos.");
})();
