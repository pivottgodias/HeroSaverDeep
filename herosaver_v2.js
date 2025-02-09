(() => {
    if (window.saveStl) {
        console.log("HeroSaver já carregado.");
        return;
    }

    function loadSTLExporter(callback) {
        if (window.THREE?.STLExporter) {
            callback();
        } else {
            const script = document.createElement("script");
            script.src = "https://threejs.org/examples/jsm/exporters/STLExporter.js";
            script.onload = callback;
            document.body.appendChild(script);
        }
    }

    function applyTransforms(object) {
        object.updateMatrixWorld(true);

        if (object.isMesh) {
            // Clona a geometria para evitar afetar outras instâncias
            object.geometry = object.geometry.clone();
            object.geometry.applyMatrix4(object.matrixWorld);
            object.matrix.identity();
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
        }

        object.children?.forEach(child => applyTransforms(child));
    }

    window.saveStl = function (fileName = "modelo.stl", scene = null) {
        if (!window.THREE) {
            console.error("Three.js não encontrado.");
            return;
        }

        loadSTLExporter(() => {
            // Tenta encontrar a cena se não for fornecida
            if (!scene) {
                for (const key in window) {
                    if (window[key] instanceof THREE.Scene) {
                        scene = window[key];
                        break;
                    }
                }
            }

            if (!scene) {
                alert("Erro: Cena não encontrada.");
                return;
            }

            const clonedScene = scene.clone();
            clonedScene.traverse(applyTransforms);

            const exporter = new THREE.STLExporter();
            const stlString = exporter.parse(clonedScene);

            const blob = new Blob([stlString], { type: "model/stl" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    console.log("HeroSaver carregado. Use saveStl() para exportar.");
})();
