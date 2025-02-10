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

        return scenes[scenes.length - 1]; // Pega a última carregada (geralmente a do visualizador)
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

    function collectTextures(scene) {
        let textures = new Set();

        scene.traverse(object => {
            if (object.isMesh && object.material) {
                let material = object.material;
                
                // Verifica se o material possui texturas associadas
                ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"].forEach(mapType => {
                    if (material[mapType] && material[mapType].image) {
                        textures.add(material[mapType].image.src);
                    }
                });
            }
        });

        return Array.from(textures);
    }

    function downloadTextures(textureUrls) {
        textureUrls.forEach(url => {
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = url.split('/').pop();
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(error => console.error("Erro ao baixar textura:", error));
        });
    }

    function exportGLTF(scene, fileName) {
        const exporter = new THREE.GLTFExporter();
        exporter.parse(scene, gltf => {
            const blob = new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName + ".gltf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log("GLTF exportado com sucesso:", fileName);
        }, { binary: false });
    }

    window.exportHighQualityModel = function (format = "gltf", fileName = "modelo") {
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
            
            // Captura e baixa as texturas
            let textureUrls = collectTextures(scene);
            if (textureUrls.length > 0) {
                console.log("Baixando texturas...");
                downloadTextures(textureUrls);
            } else {
                console.warn("Nenhuma textura foi encontrada na cena.");
            }

            // Exportação
            if (format.toLowerCase() === "gltf") {
                exportGLTF(scene, fileName);
            } else {
                alert("Formato não suportado para texturas. Use GLTF para manter materiais e texturas.");
            }
        });
    };

    console.log("HeroSaver atualizado. Agora suporta texturas!");
})();
