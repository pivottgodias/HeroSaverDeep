(() => {
    // Verifica se o script já foi carregado para evitar múltiplas execuções
    if (window.saveStl) {
        console.log("HeroSaver já carregado.");
        return;
    }

    // Importa a biblioteca STLExporter do Three.js (se ainda não estiver carregada)
    function loadSTLExporter(callback) {
        if (window.THREE && window.THREE.STLExporter) {
            callback();
        } else {
            const script = document.createElement("script");
            script.src = "https://threejs.org/examples/jsm/exporters/STLExporter.js";
            script.onload = callback;
            document.body.appendChild(script);
        }
    }

    // Função para converter a cena Three.js para STL
    window.saveStl = function (fileName = "modelo.stl") {
        if (!window.THREE) {
            console.error("Three.js não encontrado na página.");
            return;
        }

        loadSTLExporter(() => {
            // Tenta encontrar a cena Three.js na página
            let scene = null;
            for (let key in window) {
                if (window[key] && window[key] instanceof THREE.Scene) {
                    scene = window[key];
                    break;
                }
            }

            if (!scene) {
                console.error("Cena Three.js não encontrada na página.");
                alert("Erro: Nenhuma cena Three.js foi detectada.");
                return;
            }

            // Exporta a geometria como STL
            const exporter = new THREE.STLExporter();
            const stlString = exporter.parse(scene);

            // Cria um link para download
            const blob = new Blob([stlString], { type: "model/stl" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("STL exportado com sucesso:", fileName);
        });
    };

    console.log("HeroSaver carregado. Use saveStl() para baixar o STL da cena.");
})();
