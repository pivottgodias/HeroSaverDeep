(() => {
    if (window.exportHighQualityModel) {
        console.log("Script já carregado.");
        return;
    }

    // Carrega dependências necessárias
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

    // Extrai URLs de arquivos .ckb da cena
    function extractCkbUrls(scene) {
        const ckbUrls = new Set();

        scene.traverse(object => {
            if (object.isMesh && object.geometry) {
                const geometryUrl = object.geometry.userData.url; // Verifica se há URL associada
                if (geometryUrl && geometryUrl.endsWith(".ckb")) {
                    ckbUrls.add(geometryUrl);
                }
            }
        });

        return Array.from(ckbUrls);
    }

    // Carrega um arquivo .ckb como geometria
    async function loadCkbGeometry(url) {
        try {
            const response = await fetch(url);
            const data = await response.arrayBuffer();
            const loader = new THREE.BufferGeometryLoader();
            const geometry = loader.parse(data);
            geometry.userData.url = url; // Salva o URL para referência
            return geometry;
        } catch (error) {
            console.error(`Erro ao carregar geometria de ${url}:`, error);
            return null;
        }
    }

    // Substitui geometrias da cena por versões carregadas de .ckb
    async function upgradeSceneWithCkb(scene) {
        const ckbUrls = extractCkbUrls(scene);

        for (const url of ckbUrls) {
            const geometry = await loadCkbGeometry(url);
            if (geometry) {
                scene.traverse(object => {
                    if (object.isMesh && object.geometry.userData.url === url) {
                        object.geometry = geometry; // Substitui a geometria
                        console.log(`Geometria substituída: ${url}`);
                    }
                });
            }
        }
    }

    // Clona uma cena e aplica transformações
    function cloneScene(scene) {
        const clonedScene = scene.clone();

        // Clona todos os objetos e suas geometrias
        clonedScene.traverse(object => {
            if (object.isMesh) {
                object.geometry = object.geometry.clone();
                if (object.material) {
                    object.material = object.material.clone();
                }
            }
        });

        return clonedScene;
    }

    // Aplica transformações a todos os objetos
    function applyTransforms(object) {
        object.updateMatrixWorld(true);

        if (object.isMesh) {
            object.geometry.applyMatrix4(object.matrixWorld);
            object.matrix.identity();
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
        }

        object.children?.forEach(child => applyTransforms(child));
    }

    // Exporta a cena para STL
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

    // Exporta a cena para OBJ
    function exportOBJ(scene, fileName) {
        const exporter = new THREE.OBJExporter();
        const objString = exporter.parse(scene);

        const blob = new Blob([objString], { type: "model/obj" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("OBJ exportado com sucesso:", fileName);
    }

    // Exporta a cena para GLTF
    function exportGLTF(scene, fileName) {
        const exporter = new THREE.GLTFExporter();
        exporter.parse(scene, gltf => {
            const blob = new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("GLTF exportado com sucesso:", fileName);
        });
    }

    // Função principal para exportar modelos
    window.exportHighQualityModel = async function (format = "stl", fileName = "modelo") {
        if (!window.THREE) {
            console.error("Three.js não encontrado.");
            return;
        }

        loadDependencies(async () => {
            let scene = null;

            // Tenta encontrar a cena
            for (const key in window) {
                if (window[key] instanceof THREE.Scene) {
                    scene = window[key];
                    break;
                }
            }

            if (!scene) {
                console.error("Cena não encontrada.");
                return;
            }

            // Carrega e substitui geometrias de .ckb
            await upgradeSceneWithCkb(scene);

            // Clona a cena e aplica transformações
            const clonedScene = cloneScene(scene);
            clonedScene.traverse(applyTransforms);

            // Exporta no formato especificado
            switch (format.toLowerCase()) {
                case "stl":
                    exportSTL(clonedScene, `${fileName}.stl`);
                    break;
                case "obj":
                    exportOBJ(clonedScene, `${fileName}.obj`);
                    break;
                case "gltf":
                    exportGLTF(clonedScene, `${fileName}.gltf`);
                    break;
                default:
                    console.error("Formato não suportado. Use 'stl', 'obj' ou 'gltf'.");
            }
        });
    };

    console.log("Script carregado. Use exportHighQualityModel() para exportar modelos.");
})();
