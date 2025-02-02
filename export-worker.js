// export-worker.js
self.addEventListener('message', (e) => {
    const { vertices, faces, format } = e.data;
    let output = '';
    
    try {
        // Configurar progresso
        const totalFaces = faces.length;
        const progressStep = Math.max(1, Math.floor(totalFaces / 100));
        
        // Gerar cabeçalho STL
        output += 'solid Exported\n';
        
        // Processar cada face
        for(let i = 0; i < totalFaces; i++) {
            const face = faces[i];
            const normal = calculateNormal(vertices, face);
            
            // Adicionar facet
            output += `facet normal ${normal.x.toFixed(6)} ${normal.y.toFixed(6)} ${normal.z.toFixed(6)}\n`;
            output += '  outer loop\n';
            
            // Adicionar vértices
            for(let j = 0; j < 3; j++) {
                const v = vertices[face[j]];
                output += `    vertex ${v[0].toFixed(6)} ${v[1].toFixed(6)} ${v[2].toFixed(6)}\n`;
            }
            
            output += '  endloop\n';
            output += 'endfacet\n';
            
            // Atualizar progresso
            if(i % progressStep === 0) {
                const progress = (i / totalFaces) * 100;
                self.postMessage({ 
                    type: 'progress',
                    value: Math.min(100, progress.toFixed(1))
                });
            }
        }
        
        // Finalizar arquivo
        output += 'endsolid Exported\n';
        self.postMessage({ type: 'complete', data: output });
        
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            error: `Worker Error: ${error.message}` 
        });
    }
});

function calculateNormal(vertices, face) {
    // Obter vértices da face
    const v1 = vertices[face[0]];
    const v2 = vertices[face[1]];
    const v3 = vertices[face[2]];
    
    // Calcular vetores
    const u = [
        v2[0] - v1[0],
        v2[1] - v1[1],
        v2[2] - v1[2]
    ];
    
    const v = [
        v3[0] - v1[0],
        v3[1] - v1[1],
        v3[2] - v1[2]
    ];
    
    // Produto vetorial
    const normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
    
    // Normalizar
    const length = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
    
    return {
        x: normal[0] / length,
        y: normal[1] / length,
        z: normal[2] / length
    };
}
