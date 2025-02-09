(() => {
    if (window.saveStl) {
        console.log("HeroSaver já carregado.");
        return;
    }

    function loadDependencies(callback) {
        const dependencies = [
            "https://threejs.org/examples/jsm/exporters/STLExporter.js",
            "https://threejs.org/examples/jsm/modifiers/SubdivisionModifier.js"
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

    function improveMeshQuality(mesh, subdivisions = 2) {
        if (!window.THREE.SubdivisionModifier) {
            console.warn("SubdivisionModifier não carregado. A qualidade não será melhorada.");
            return;
        }

        const modifier = new THREE.SubdivisionModifier(subdivisions);
        const geometry = mesh.geometry.clone();
        modifier.modify(geometry);
        mesh.geometry = geometry;
    }

    window.saveStl = function (fileName = "modelo.stl", scene = null, subdivisions = 2) {
        if (!window.THREE) {
            console.error("Three.js não encontrado.");
            return;
        }

        loadDependencies(() => {
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

            // Clona a cena para evitar modificar a original
            const clonedScene = scene.clone();

            // Aplica transformações e melhora a qualidade da malha
            clonedScene.traverse(object => {
                if (object.isMesh) {
                    applyTransforms(object);
                    if (subdivisions > 0) improveMeshQuality(object, subdivisions);
                }
            });

            // Exporta para STL
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

    console.log("HeroSaver carregado. Use saveStl() para exportar.");
})();
