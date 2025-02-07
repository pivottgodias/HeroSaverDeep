(() => {
    if (window.exportHighQualityModel) {
        console.log("HeroSaver já carregado.");
        return;
    }

    function loadDependencies(callback) {
        const dependencies = [
            "https://threejs.org/examples/jsm/exporters/STLExporter.js",
            "https://threejs.org/examples/jsm/exporters/OBJExporter.js",
            "https://threejs.org/examples/jsm/exporters/GLTFExporter.js"
        ];

        let loaded = 0;
        dependencies.forEach(src => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === dependencies.length) callback();
            };
            document.body.appendChild(script);
        });
    }

    function findViewerScene() {
        let scenes = [];
        for (const key in window) {
            if (window[key] instanceof THREE.Scene) {
                scenes.push(window[key]);
            }
        }
        
        if (scenes.length === 0) {
            console.error("Nenhuma cena Three.js encontrada.");
            return null;
        }

        if (scenes.length === 1) {
            return scenes[0]; // Se houver só uma, retorna ela diretamente
        }

        console.warn(`Foram detectadas ${scenes.length} cenas. Tentando escolher a correta...`);
        return scenes[scenes.length - 1]; // Tenta pegar a última carregada (geralmente a do visualizador)
    }

    function freezeSkinnedMeshes(scene) {
        scene.traverse(object => {
            if (object.isSkinnedMesh) {
                object.skeleton.update();
                object.updateMatrixWorld(true);

                const tempGeometry = object.geometry.clone();
                object.skeleton.bones.forEach(bone => {
                    bone.updateMatrixWorld(true);
                });
                tempGeometry.applyMatrix4(object.matrixWorld);

                object.geometry = tempGeometry;
                object.position.set(0, 0, 0);
                object.rotation.set(0, 0, 0);
                object.scale.set(1, 1, 1);
            }
        });
    }

    function exportSTL(scene, fileName) {
        const exporter = new THREE.STLExporter();
        const stlString = exporter.parse(scene);

        if (!stlString) {
            console.error("Erro: A exportação do STL falhou.");
            alert("Erro ao exportar STL. O modelo pode estar vazio.");
            return;
        }

        const blob = new Blob([stlString], { type: "model/stl" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("STL exportado com sucesso:", fileName);
    }

    window.exportHighQualityModel = function (format = "stl", fileName = "modelo") {
        if (!window.THREE) {
            console.error("Three.js não encontrado.");
            return;
        }

        loadDependencies(() => {
            let scene = findViewerScene();
            if (!scene) {
                alert("Erro: Nenhuma cena válida foi encontrada.");
                return;
            }

            freezeSkinnedMeshes(scene);

            if (format.toLowerCase() === "stl") {
                exportSTL(scene, `${fileName}.stl`);
            } else {
                alert("Formato não suportado.");
            }
        });
    };

    console.log("HeroSaver carregado. Use exportHighQualityModel() para exportar modelos.");
})();
