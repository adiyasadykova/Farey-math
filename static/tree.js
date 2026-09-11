/**
 * D3.js Stern-Brocot Tree Visualization
 * Renders an interactive tree with color-coded nodes based on primitivity
 */

function visualizeSternBrocotTree(nodes, container, depth) {
    // Clear container
    container.innerHTML = '';

    // Set dimensions
    const width = Math.max(1200, nodes.length * 80);
    const height = depth * 120 + 100;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    // Create group for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom)
        .call(zoom.transform, d3.zoomIdentity.translate(50, 30));

    // Build tree structure with parent-child relationships
    const nodeMap = {};
    const links = [];

    nodes.forEach((node, index) => {
        nodeMap[node.id] = {
            ...node,
            x: 0,
            y: 0,
            index: index
        };
    });

    // Calculate node positions using tree layout
    const depthCounts = {};
    nodes.forEach(node => {
        if (!depthCounts[node.depth]) {
            depthCounts[node.depth] = 0;
        }
        depthCounts[node.depth]++;
    });

    let depthIndices = {};
    nodes.forEach(node => {
        if (!depthIndices[node.depth]) {
            depthIndices[node.depth] = 0;
        }

        const totalAtDepth = depthCounts[node.depth];
        const indexAtDepth = depthIndices[node.depth];

        // Position nodes horizontally at their depth
        const xSpacing = width / (totalAtDepth + 1);
        const ySpacing = 120;

        nodeMap[node.id].x = (indexAtDepth + 1) * xSpacing;
        nodeMap[node.id].y = node.depth * ySpacing;

        // Create links
        if (node.parent_id !== -1 && nodeMap[node.parent_id]) {
            links.push({
                source: nodeMap[node.parent_id],
                target: nodeMap[node.id]
            });
        }

        depthIndices[node.depth]++;
    });

    // Draw links
    g.selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
        .attr('stroke', 'rgba(212, 197, 169, 0.2)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4');

    // Draw nodes
    const nodeGroups = g.selectAll('g.node')
        .data(Object.values(nodeMap))
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
            showNodeInfo(d);
        })
        .on('mouseover', function(event, d) {
            d3.select(this).select('circle')
                .attr('r', d => d.primitive ? 20 : 18)
                .attr('filter', 'drop-shadow(0 0 8px ' + (d.primitive ? '#7FBA9A' : '#E06C6C') + ')');
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('circle')
                .attr('r', d => d.primitive ? 16 : 14)
                .attr('filter', 'none');
        });

    // Add circles for nodes
    nodeGroups.append('circle')
        .attr('r', d => d.primitive ? 16 : 14)
        .attr('fill', d => d.primitive ? '#7FBA9A' : '#E06C6C')
        .attr('stroke', 'rgba(245, 240, 232, 0.3)')
        .attr('stroke-width', 2);

    // Add text for fractions
    nodeGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('font-family', "'Courier Prime', monospace")
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#0D1F1D')
        .text(d => `${d.num}/${d.den}`)
        .style('pointer-events', 'none');

    // Add tooltip-like info on hover
    nodeGroups.append('title')
        .text(d => {
            const triple = d.triple ? `Triple: (${d.triple[0]}, ${d.triple[1]}, ${d.triple[2]})` : '';
            return `${d.num}/${d.den}\nDepth: ${d.depth}\nPrimitive: ${d.primitive ? 'Yes' : 'No'}\n${triple}`;
        });

    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 220}, 10)`);

    legend.append('rect')
        .attr('width', 210)
        .attr('height', 90)
        .attr('fill', 'rgba(13, 31, 29, 0.8)')
        .attr('stroke', 'rgba(212, 197, 169, 0.3)')
        .attr('rx', 8);

    // Primitive legend
    legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 25)
        .attr('r', 6)
        .attr('fill', '#7FBA9A');

    legend.append('text')
        .attr('x', 35)
        .attr('y', 30)
        .attr('font-family', "'Inter', sans-serif")
        .attr('font-size', '12px')
        .attr('fill', '#F5F0E8')
        .text('Primitive (odd parity)');

    // Non-primitive legend
    legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 50)
        .attr('r', 6)
        .attr('fill', '#E06C6C');

    legend.append('text')
        .attr('x', 35)
        .attr('y', 55)
        .attr('font-family', "'Inter', sans-serif")
        .attr('font-size', '12px')
        .attr('fill', '#F5F0E8')
        .text('Non-primitive (even)');

    // Info text
    legend.append('text')
        .attr('x', 10)
        .attr('y', 75)
        .attr('font-family', "'Inter', sans-serif")
        .attr('font-size', '11px')
        .attr('fill', '#B8B0A0')
        .text('Click node for details');
}

function showNodeInfo(node) {
    const infoBox = document.getElementById('tree-node-info');
    
    let html = `<strong>Node: ${node.num}/${node.den}</strong><br><br>`;
    html += `Depth: ${node.depth}<br>`;
    html += `Decimal: ${(node.num / node.den).toFixed(6)}<br>`;
    html += `Primitive: <span style="color: ${node.primitive ? '#7FBA9A' : '#E06C6C'}">${node.primitive ? 'YES' : 'NO'}</span><br><br>`;
    
    if (node.triple) {
        const [x, y, z] = node.triple;
        html += `<strong>Pythagorean Triple:</strong><br>`;
        html += `(${x}, ${y}, ${z})<br>`;
        html += `Verification: ${x}² + ${y}² = ${x*x + y*y}, ${z}² = ${z*z}<br><br>`;
        html += `GCD(x,y,z) = ${node.gcd}<br>`;
    }
    
    html += `<strong>Primitivity Check:</strong><br>`;
    html += `• gcd(${node.num}, ${node.den}) = ${gcd(node.num, node.den)}<br>`;
    
    const sumParity = node.num + node.den;
    const isParity = sumParity % 2 === 1 ? 'odd' : 'even';
    html += `• (${node.num} + ${node.den}) = ${sumParity} (${isParity})<br>`;
    html += `• Opposite parity: ${isParity === 'odd' ? 'YES ✓' : 'NO ✗'}`;
    
    infoBox.innerHTML = html;
}

/**
 * GCD utility function for tree visualization
 */
function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Alternative horizontal tree layout using D3 hierarchy
 * (unused but kept for reference)
 */
function visualizeSternBrocotTreeHierarchy(nodes, container, depth) {
    container.innerHTML = '';

    const width = 1400;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const tree = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    // Build hierarchy
    const root = { id: -1, num: 0, den: 1, children: [] };
    const nodeMap = {};

    nodes.forEach(node => {
        nodeMap[node.id] = { ...node, children: [] };
    });

    nodes.forEach(node => {
        if (node.parent_id !== -1 && nodeMap[node.parent_id]) {
            nodeMap[node.parent_id].children.push(nodeMap[node.id]);
        } else if (node.parent_id === -1) {
            root.children.push(nodeMap[node.id]);
        }
    });

    const hierarchy = d3.hierarchy(root);
    const treeData = tree(hierarchy);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw links
    g.selectAll('.link')
        .data(treeData.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(212, 197, 169, 0.2)')
        .attr('stroke-width', 1.5);

    // Draw nodes
    g.selectAll('.node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .append('circle')
        .attr('r', d => d.data.primitive ? 12 : 10)
        .attr('fill', d => d.data.primitive ? '#7FBA9A' : '#E06C6C')
        .attr('stroke', 'rgba(245, 240, 232, 0.3)')
        .attr('stroke-width', 1.5);

    // Add labels
    g.selectAll('.label')
        .data(treeData.descendants())
        .enter()
        .append('text')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('font-family', "'Courier Prime', monospace")
        .attr('font-size', '10px')
        .attr('fill', '#F5F0E8')
        .text(d => d.data.num && d.data.den ? `${d.data.num}/${d.data.den}` : '');
}
