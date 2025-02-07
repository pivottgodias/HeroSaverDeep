(() => {
    if (window.exportHighQualityModel) {
        console.log("Script já carregado.");
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

    function findActiveThreeScenes() {
        const scenes = [];
        for (const key in window) {
            if (window[key] instanceof THREE.Scene) {
                scenes.push(window[key]);
            }
        }
        return scenes;
    }

    function applySkinnedMeshTransforms(scene) {
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
            let scenes = findActiveThreeScenes();
            if (scenes.length === 0) {
                console.error("Nenhuma cena Three.js encontrada.");
                return;
            }

            let selectedScene = scenes.length === 1 ? scenes[0] : prompt(`Foram detectadas ${scenes.length} cenas. Escolha um número de 0 a ${scenes.length - 1}:`);
            selectedScene = scenes[selectedScene] || null;

            if (!selectedScene) {
                console.error("Nenhuma cena válida foi selecionada.");
                return;
            }

            applySkinnedMeshTransforms(selectedScene);

            switch (format.toLowerCase()) {
                case "stl":
                    exportSTL(selectedScene, `${fileName}.stl`);
                    break;
                default:
                    console.error("Formato não suportado.");
            }
        });
    };

    console.log("Script carregado. Use exportHighQualityModel() para exportar modelos.");
})();
