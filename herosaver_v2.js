(() => {
    if (window.saveStl) {
        console.log("HeroSaver já carregado.");
        return;
    }

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

    function applyTransforms(object) {
        object.updateMatrixWorld(true); // Atualiza todas as matrizes na cena

        if (object.isMesh) {
            object.geometry.applyMatrix4(object.matrixWorld); // Aplica posição, rotação e escala na geometria
            object.matrix.identity(); // Reseta a matriz do objeto para evitar transformações duplas
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
        }

        // Se o objeto tem filhos, aplica as transformações recursivamente
        if (object.children.length > 0) {
            object.children.forEach(child => applyTransforms(child));
        }
    }

    window.saveStl = function (fileName = "modelo.stl") {
        if (!window.THREE) {
            console.error("Three.js não encontrado na página.");
            return;
        }

        loadSTLExporter(() => {
            let scene = null;
            for (let key in window) {
                if (window[key] && window[key] instanceof THREE.Scene) {
                    scene = window[key];
                    break;
                }
            }

            if (!scene) {
                console.error("Cena Three.js não encontrada.");
                alert("Erro: Nenhuma cena Three.js foi detectada.");
                return;
            }

            const clonedScene = scene.clone(); // Evita modificar a cena original
            clonedScene.traverse(applyTransforms); // Aplica transformações a todos os objetos

            const exporter = new THREE.STLExporter();
            const stlString = exporter.parse(clonedScene);

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
