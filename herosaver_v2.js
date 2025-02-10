(() => {
    if (window.saveStl) {
        console.log("HeroSaver já carregado.");
        return;
    }

    // Carrega o STLExporter do Three.js
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

    // Aplica transformações (posição, rotação, escala) aos objetos da cena
    function applyTransforms(object) {
        object.updateMatrixWorld(true);

        if (object.isMesh) {
            object.geometry = object.geometry.clone();
            object.geometry.applyMatrix4(object.matrixWorld);
            object.matrix.identity();
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
        }

        if (object.children && object.children.length > 0) {
            object.children.forEach(child => applyTransforms(child));
        }
    }

    // Função principal para exportar o modelo como STL
    window.saveStl = function (fileName = "modelo.stl") {
        if (!window.THREE) {
            console.error("Three.js não encontrado.");
            return;
        }

        loadSTLExporter(() => {
            let scene = null;

            // Procura pela cena do Three.js na página
            for (let key in window) {
                if (window[key] && window[key] instanceof THREE.Scene) {
                    scene = window[key];
                    break;
                }
            }

            if (!scene) {
                console.error("Cena Three.js não encontrada.");
                return;
            }

            // Clona a cena para evitar modificar a original
            const clonedScene = scene.clone();
            clonedScene.traverse(applyTransforms); // Aplica transformações

            // Exporta a cena para STL
            const exporter = new THREE.STLExporter();
            const stlString = exporter.parse(clonedScene);

            // Cria um link para download do arquivo STL
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
