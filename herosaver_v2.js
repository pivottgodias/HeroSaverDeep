(async function() {
    console.log('🔍 Iniciando HeroSaver...');

    async function extractScene() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.textContent = `(() => {
                const scene = window.THREE && window.THREE.Scene ? window.THREE.Scene : null;
                if (scene) {
                    window.postMessage({ type: 'SCENE_DATA', scene: JSON.stringify(scene) }, '*');
                }
            })();`;
            document.documentElement.appendChild(script);
            script.remove();

            window.addEventListener('message', (event) => {
                if (event.data.type === 'SCENE_DATA') {
                    resolve(JSON.parse(event.data.scene));
                }
            });
        });
    }

    function downloadFile(data, filename, type) {
        const blob = new Blob([data], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function exportModel(scene) {
        return new Promise((resolve, reject) => {
            try {
                const exporter = new THREE.GLTFExporter();
                exporter.parse(scene, (gltf) => {
                    const json = JSON.stringify(gltf);
                    downloadFile(json, 'heroforge_model.glb', 'application/octet-stream');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async function downloadTextures(scene) {
        return new Promise((resolve, reject) => {
            try {
                const textures = scene.materials.map((mat) => mat.map);
                textures.forEach((tex, index) => {
                    if (tex && tex.image) {
                        const link = document.createElement('a');
                        link.href = tex.image.src;
                        link.download = `texture_${index}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    async function main() {
        try {
            console.log('🎮 Capturando a cena do HeroForge...');
            const sceneData = await extractScene();

            console.log('📦 Exportando modelo...');
            await exportModel(sceneData);

            console.log('🎨 Baixando texturas...');
            await downloadTextures(sceneData);

            console.log('✅ Exportação concluída!');
        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    main();
})();
