/**
 * Farey Sequences & Pythagorean Triples - Frontend JavaScript
 * Handles UI interactions, API calls, and visualization updates
 */

// ============================================================================
// GLOBAL STATE & CONFIGURATION
// ============================================================================

const API_BASE = '/api';
let currentChart = null;


// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    renderMathFormulas();
});


function initializeEventListeners() {

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });


    // Farey Sequence Controls
    const fareySlider = document.getElementById('farey-slider');
    const fareyCompute = document.getElementById('farey-compute');

    if (fareySlider) {
        fareySlider.addEventListener('input', updateFareyValue);
    }

    if (fareyCompute) {
        fareyCompute.addEventListener('click', computeFareySequence);
    }


    // Stern-Brocot Tree Controls
    const treeSlider = document.getElementById('tree-slider');
    const treeCompute = document.getElementById('tree-compute');

    if (treeSlider) {
        treeSlider.addEventListener('input', updateTreeValue);
    }

    if (treeCompute) {
        treeCompute.addEventListener('click', computeSternBrocotTree);
    }


    // Pythagorean Triple Controls
    const tripleCompute = document.getElementById('triple-compute');

    if (tripleCompute) {
        tripleCompute.addEventListener(
            'click',
            computePythagoreanTriple
        );
    }


    // Statistics Controls
    const statsSlider = document.getElementById('stats-slider');
    const statsCompute = document.getElementById('stats-compute');

    if (statsSlider) {
        statsSlider.addEventListener('input', updateStatsValue);
    }

    if (statsCompute) {
        statsCompute.addEventListener(
            'click',
            computeStatistics
        );
    }


    // Comparison Controls
    const compFareySlider =
        document.getElementById('comp-farey-slider');

    const compTreeSlider =
        document.getElementById('comp-tree-slider');

    const compCompute =
        document.getElementById('comp-compute');

    if (compFareySlider) {
        compFareySlider.addEventListener(
            'input',
            updateCompFareyValue
        );
    }

    if (compTreeSlider) {
        compTreeSlider.addEventListener(
            'input',
            updateCompTreeValue
        );
    }

    if (compCompute) {
        compCompute.addEventListener(
            'click',
            computeComparison
        );
    }


    // Auto-compute on page load
    if (fareySlider) {
        computeFareySequence();
    }

    if (treeSlider) {
        computeSternBrocotTree();
    }

    if (statsSlider) {
        computeStatistics();
    }
}


// ============================================================================
// NAVIGATION
// ============================================================================

function handleNavigation(event) {

    const sectionId =
        event.currentTarget.getAttribute('data-section');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    event.currentTarget.classList.add('active');


    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });


    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.add('active');
    }
}


// ============================================================================
// FAREY SEQUENCE EXPLORER
// ============================================================================

function updateFareyValue(event) {

    const element =
        document.getElementById('farey-value');

    if (element) {
        element.textContent = event.target.value;
    }
}


async function computeFareySequence() {

    const slider =
        document.getElementById('farey-slider');

    const detailsBox =
        document.getElementById('farey-details');

    const numberLine =
        document.getElementById('farey-numberline');

    if (!slider) {
        return;
    }

    const n =
        parseInt(slider.value, 10);


    try {

        showLoading(detailsBox);
        showLoading(numberLine);


        const response =
            await fetch(`${API_BASE}/farey/${n}`);


        const data =
            await response.json();


        if (response.ok) {

            displayFareySequence(
                data,
                numberLine,
                detailsBox
            );

        } else {

            showError(
                detailsBox,
                data.error ||
                'Error computing Farey sequence'
            );
        }


    } catch (error) {

        console.error('Farey error:', error);

        showError(
            detailsBox,
            error.message ||
            'Unable to connect to server'
        );
    }
}


function displayFareySequence(
    data,
    numberLine,
    detailsBox
) {

    const {
        fractions = [],
        count = 0
    } = data;


    if (!numberLine || !detailsBox) {
        return;
    }


    numberLine.innerHTML = '';
    detailsBox.innerHTML = '';


    // Draw axis
    const axis =
        document.createElement('div');

    axis.className =
        'farey-axis';

    numberLine.appendChild(axis);


    // Label 0
    const label0 =
        document.createElement('div');

    label0.className =
        'farey-label';

    label0.style.left =
        '0%';

    label0.textContent =
        '0';

    numberLine.appendChild(label0);


    // Label 1
    const label1 =
        document.createElement('div');

    label1.className =
        'farey-label';

    label1.style.left =
        '100%';

    label1.textContent =
        '1';

    numberLine.appendChild(label1);


    // Draw fractions
    fractions.forEach(frac => {

        const point =
            document.createElement('div');

        point.className =
            'farey-point';


        const decimal =
            Number(frac.decimal) || 0;


        point.style.left =
            `${decimal * 100}%`;


        // Determine primitive status
        if (frac.num > frac.den) {

            const isPrimitive =
                gcd(frac.num, frac.den) === 1 &&
                (frac.num + frac.den) % 2 === 1;


            point.classList.add(
                isPrimitive
                    ? 'primitive'
                    : 'non-primitive'
            );
        }


        point.title =
            `${frac.num}/${frac.den} ≈ ${decimal.toFixed(4)}`;


        point.addEventListener(
            'click',
            () => selectFraction(
                frac.num,
                frac.den
            )
        );


        numberLine.appendChild(point);
    });


    // Details
    let detailsHTML =
        `<strong>Farey Sequence F₍${data.order}₎</strong><br><br>`;

    detailsHTML +=
        `Total fractions: ${count}<br><br>`;

    detailsHTML +=
        `<strong>First 10 fractions:</strong><br>`;


    for (
        let i = 0;
        i < Math.min(10, fractions.length);
        i++
    ) {

        const f =
            fractions[i];

        detailsHTML +=
            `${f.num}/${f.den} `;
    }


    if (fractions.length > 10) {

        detailsHTML +=
            `... and ${fractions.length - 10} more`;
    }


    detailsHTML +=
        `<br><br><strong>Properties:</strong><br>`;

    detailsHTML +=
        `• Consecutive fractions a/b and c/d satisfy |bc - ad| = 1<br>`;

    detailsHTML +=
        `• All fractions are in lowest terms (reduced)<br>`;

    detailsHTML +=
        `• Ordered by value from 0 to 1`;


    detailsBox.innerHTML =
        detailsHTML;
}


function selectFraction(m, n) {

    const mInput =
        document.getElementById('triple-m');

    const nInput =
        document.getElementById('triple-n');


    if (mInput) {
        mInput.value = m;
    }

    if (nInput) {
        nInput.value = n;
    }


    const navigation =
        document.querySelector(
            '[data-section="pythagorean"]'
        );


    if (navigation) {
        navigation.click();
    }


    computePythagoreanTriple();
}


// ============================================================================
// STERN-BROCOT TREE VISUALIZER
// ============================================================================

function updateTreeValue(event) {

    const element =
        document.getElementById('tree-value');

    if (element) {
        element.textContent =
            event.target.value;
    }
}


async function computeSternBrocotTree() {

    const slider =
        document.getElementById('tree-slider');

    const treeContainer =
        document.getElementById('stern-brocot-tree');

    const statsBox =
        document.getElementById('tree-stats');


    if (!slider) {
        return;
    }


    const depth =
        parseInt(slider.value, 10);


    try {

        showLoading(treeContainer);
        showLoading(statsBox);


        const response =
            await fetch(
                `${API_BASE}/stern-brocot/${depth}`
            );


        const data =
            await response.json();


        if (response.ok) {

            displaySternBrocotTree(
                data,
                treeContainer,
                statsBox
            );

        } else {

            showError(
                treeContainer,
                data.error ||
                'Error computing Stern-Brocot tree'
            );
        }


    } catch (error) {

        console.error(
            'Stern-Brocot error:',
            error
        );

        showError(
            treeContainer,
            error.message ||
            'Unable to connect to server'
        );
    }
}


function displaySternBrocotTree(
    data,
    container,
    statsBox
) {

    const {
        nodes = [],
        count = 0,
        depth = 0
    } = data;


    if (!container || !statsBox) {
        return;
    }


    container.innerHTML = '';
    statsBox.innerHTML = '';


    let primitiveCount = 0;
    let nonPrimitiveCount = 0;


    nodes.forEach(node => {

        if (node.primitive) {
            primitiveCount++;
        } else {
            nonPrimitiveCount++;
        }
    });


    statsBox.innerHTML = `
        <strong>Tree Statistics</strong><br><br>
        Depth: ${depth}<br>
        Total nodes: ${count}<br>
        Primitive: ${primitiveCount}<br>
        Non-primitive: ${nonPrimitiveCount}<br><br>
        <strong>Node Details</strong><br>
        Total nodes rendered successfully
    `;


    if (
        typeof visualizeSternBrocotTree ===
        'function'
    ) {

        visualizeSternBrocotTree(
            nodes,
            container,
            depth
        );

    } else {

        container.innerHTML =
            `<p style="padding: 20px;">
                Stern-Brocot Tree loaded
                (${count} nodes).
                Tree visualization function pending.
            </p>`;
    }
}


// ============================================================================
// PYTHAGOREAN TRIPLE GENERATOR
// ============================================================================

function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);


    while (b !== 0) {

        const remainder =
            a % b;

        a = b;
        b = remainder;
    }


    return a;
}


function gcdThree(a, b, c) {
    return gcd(gcd(a, b), c);
}


async function computePythagoreanTriple() {

    const mInput =
        document.getElementById('triple-m');

    const nInput =
        document.getElementById('triple-n');

    const resultBox =
        document.getElementById('triple-result');


    if (!mInput || !nInput || !resultBox) {
        return;
    }


    const m =
        Number(mInput.value);

    const n =
        Number(nInput.value);


    try {

        showLoading(resultBox);


        if (
            !Number.isInteger(m) ||
            !Number.isInteger(n)
        ) {

            showError(
                resultBox,
                'Please enter whole numbers for m and n.'
            );

            return;
        }


        if (m <= 0 || n <= 0) {

            showError(
                resultBox,
                'm and n must be positive integers.'
            );

            return;
        }


        if (m <= n) {

            showError(
                resultBox,
                'm must be greater than n. Use m > n > 0.'
            );

            return;
        }


        const response =
            await fetch(
                `${API_BASE}/pythagorean/${m}/${n}`
            );


        let data;

        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );
        }


        if (!response.ok) {

            showError(
                resultBox,
                data.error ||
                'Error computing Pythagorean triple.'
            );

            return;
        }


        displayPythagoreanTriple(
            data,
            resultBox,
            m,
            n
        );


    } catch (error) {

        console.error(
            'Pythagorean Triple Error:',
            error
        );

        showError(
            resultBox,
            error.message ||
            'Unable to connect to the server.'
        );
    }
}


function displayPythagoreanTriple(
    data,
    resultBox,
    m,
    n
) {

    const triple =
        data.triple;

    const tripleGcd =
        data.gcd;

    const primitive =
        data.primitive;

    const reduced =
        data.reduced;


    if (
        !Array.isArray(triple) ||
        triple.length !== 3
    ) {

        showError(
            resultBox,
            data.error ||
            'Invalid triple returned by server.'
        );

        return;
    }


    const x =
        Number(triple[0]);

    const y =
        Number(triple[1]);

    const z =
        Number(triple[2]);


    const xSquared =
        x * x;

    const ySquared =
        y * y;

    const zSquared =
        z * z;


    const isValid =
        xSquared + ySquared === zSquared;


    const pairGcd =
        gcd(m, n);

    const isPairCoprime =
        pairGcd === 1;

    const hasOppositeParity =
        (m % 2) !== (n % 2);

    const mGreaterThanN =
        m > n;

    const isPrimitivePair =
        isPairCoprime &&
        hasOppositeParity &&
        mGreaterThanN;


    let html = '';


    html += `
        <div class="result-item">
            <div class="result-label">
                Pythagorean Triple
            </div>

            <div class="result-value">
                (${x}, ${y}, ${z})
            </div>
        </div>
    `;


    html += `
        <div class="result-item">
            <div class="result-label">
                Euclid's Formula
            </div>

            <div class="result-value">
                x = ${m}² - ${n}² = ${x}<br>
                y = 2(${m})(${n}) = ${y}<br>
                z = ${m}² + ${n}² = ${z}
            </div>
        </div>
    `;


    html += `
        <div class="result-item">
            <div class="result-label">
                Verification
            </div>

            <div class="result-value">
                ${x}² + ${y}² =
                ${xSquared} + ${ySquared} =
                ${xSquared + ySquared}<br>

                ${z}² = ${zSquared}<br>

                ${
                    isValid
                        ? `<span style="color: var(--color-accent-mint);">
                            ✓ Valid Pythagorean Triple
                           </span>`
                        : `<span style="color: var(--color-accent-red);">
                            ✗ Invalid Pythagorean Triple
                           </span>`
                }
            </div>
        </div>
    `;


    html += `
        <div class="result-item">
            <div class="result-label">
                GCD
            </div>

            <div class="result-value">
                gcd(${x}, ${y}, ${z}) = ${tripleGcd}
            </div>
        </div>
    `;


    html += `
        <div class="result-item">
            <div class="result-label">
                Primitive
            </div>

            <div class="result-value">

                ${
                    primitive
                        ? `<span style="color: var(--color-accent-mint);">
                            ✓ YES
                           </span>
                           — gcd = 1`
                        : `<span style="color: var(--color-accent-red);">
                            ✗ NO
                           </span>
                           — gcd = ${tripleGcd}`
                }

            </div>
        </div>
    `;


    if (
        Array.isArray(reduced) &&
        reduced.length === 3
    ) {

        html += `
            <div class="result-item">
                <div class="result-label">
                    Reduced Primitive
                </div>

                <div class="result-value">
                    (${reduced[0]}, ${reduced[1]}, ${reduced[2]})
                </div>
            </div>
        `;
    }


    html += `
        <div class="result-item">
            <div class="result-label">
                Pair Properties
            </div>

            <div class="result-value">

                gcd(m, n) = 1:
                ${isPairCoprime ? '✓' : '✗'}

                <br>

                Opposite parity:
                ${hasOppositeParity ? '✓' : '✗'}

                <br>

                m &gt; n:
                ${mGreaterThanN ? '✓' : '✗'}

                <br><br>

                ${
                    isPrimitivePair
                        ? `<span style="color: var(--color-accent-mint);">
                            ✓ Primitive parameter pair
                           </span>`
                        : `<span style="color: var(--color-accent-red);">
                            ✗ Non-primitive parameter pair
                           </span>`
                }

            </div>
        </div>
    `;


    resultBox.innerHTML =
        html;
}


// ============================================================================
// STATISTICS DASHBOARD
// ============================================================================

function updateStatsValue(event) {

    const element =
        document.getElementById('stats-value');

    if (element) {
        element.textContent =
            event.target.value;
    }
}


async function computeStatistics() {

    const slider =
        document.getElementById('stats-slider');

    const overviewBox =
        document.getElementById('stats-overview');

    const depthBox =
        document.getElementById('stats-depth');


    if (!slider) {
        return;
    }


    const n =
        parseInt(slider.value, 10);


    try {

        showLoading(overviewBox);

        if (depthBox) {
            showLoading(depthBox);
        }


        const response =
            await fetch(
                `${API_BASE}/statistics/${n}`
            );


        const data =
            await response.json();


        if (response.ok) {

            displayStatistics(data);

        } else {

            showError(
                overviewBox,
                data.error ||
                'Error computing statistics'
            );
        }


    } catch (error) {

        console.error(
            'Statistics error:',
            error
        );

        showError(
            overviewBox,
            error.message ||
            'Unable to connect to server'
        );
    }
}


function displayStatistics(data) {

    const {
        total_fractions = 0,
        primitive_triples = 0,
        non_primitive_triples = 0,
        primitive_percentage = 0,
        depth_distribution = {}
    } = data;


    // Overview
    const totalEl =
        document.getElementById('stat-total');

    const primEl =
        document.getElementById('stat-primitive');

    const nonPrimEl =
        document.getElementById('stat-non-primitive');

    const percEl =
        document.getElementById('stat-percentage');


    if (totalEl) {
        totalEl.textContent =
            total_fractions;
    }

    if (primEl) {
        primEl.textContent =
            primitive_triples;
    }

    if (nonPrimEl) {
        nonPrimEl.textContent =
            non_primitive_triples;
    }

    if (percEl) {
        percEl.textContent =
            Number(primitive_percentage).toFixed(1) + '%';
    }


    // Depth analysis
    const depthBox =
        document.getElementById('stats-depth');


    if (depthBox) {

        if (
            !depth_distribution ||
            Object.keys(depth_distribution).length === 0
        ) {

            depthBox.innerHTML =
                '<p>No depth distribution data available.</p>';

        } else {

            let depthHTML =
                '<strong>Distribution by Tree Depth</strong><br><br>';


            Object.keys(depth_distribution)
                .sort((a, b) => Number(a) - Number(b))
                .forEach(depth => {

                    const dist =
                        depth_distribution[depth] || {};

                    const total =
                        Number(dist.total) || 0;

                    const primitive =
                        Number(dist.primitive) || 0;

                    const nonPrimitive =
                        Math.max(
                            0,
                            total - primitive
                        );

                    const primPercent =
                        total > 0
                            ? (
                                primitive /
                                total *
                                100
                            ).toFixed(1)
                            : '0.0';


                    depthHTML += `
                        Depth ${depth}: ${total} nodes
                        (${primitive} primitive,
                        ${nonPrimitive} non-primitive,
                        ${primPercent}% primitive)
                        <br>
                    `;
                });


            depthBox.innerHTML =
                depthHTML;
        }
    }


    // Chart
    createStatisticsChart(
        total_fractions,
        primitive_triples,
        non_primitive_triples,
        depth_distribution
    );
}


function createStatisticsChart(
    total,
    primitive,
    nonPrimitive,
    depthDist
) {

    const canvas =
        document.getElementById('stats-chart');


    if (!canvas) {
        console.error(
            'stats-chart canvas not found'
        );

        return;
    }


    // Make sure Chart.js exists
    if (typeof Chart === 'undefined') {

        console.error(
            'Chart.js is not loaded.'
        );

        return;
    }


    // Destroy previous chart
    if (currentChart) {

        currentChart.destroy();
        currentChart = null;
    }


    const depths =
        Object.keys(depthDist || {})
            .sort(
                (a, b) => Number(a) - Number(b)
            );


    const primitiveByDepth =
        depths.map(depth => {

            const dist =
                depthDist[depth] || {};

            return Number(
                dist.primitive
            ) || 0;
        });


    const nonPrimitiveByDepth =
        depths.map(depth => {

            const dist =
                depthDist[depth] || {};

            const depthTotal =
                Number(dist.total) || 0;

            const depthPrimitive =
                Number(dist.primitive) || 0;


            return Math.max(
                0,
                depthTotal - depthPrimitive
            );
        });


    const ctx =
        canvas.getContext('2d');


    if (!ctx) {
        console.error(
            'Could not get canvas context.'
        );

        return;
    }


    currentChart =
        new Chart(ctx, {

            type: 'bar',

            data: {

                labels:
                    depths.map(
                        depth => `Depth ${depth}`
                    ),

                datasets: [

                    {
                        label:
                            'Primitive Triples',

                        data:
                            primitiveByDepth,

                        backgroundColor:
                            'rgba(127, 186, 154, 0.8)',

                        borderColor:
                            '#7FBA9A',

                        borderWidth:
                            2
                    },

                    {
                        label:
                            'Non-Primitive',

                        data:
                            nonPrimitiveByDepth,

                        backgroundColor:
                            'rgba(224, 108, 108, 0.8)',

                        borderColor:
                            '#E06C6C',

                        borderWidth:
                            2
                    }
                ]
            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                plugins: {

                    legend: {

                        labels: {

                            color:
                                '#F5F0E8',

                            font: {

                                family:
                                    "'Courier Prime', monospace"
                            }
                        }
                    }
                },

                scales: {

                    y: {

                        beginAtZero:
                            true,

                        ticks: {

                            color:
                                '#B8B0A0',

                            font: {

                                family:
                                    "'Courier Prime', monospace"
                            }
                        },

                        grid: {

                            color:
                                'rgba(212, 197, 169, 0.1)'
                        }
                    },

                    x: {

                        ticks: {

                            color:
                                '#B8B0A0',

                            font: {

                                family:
                                    "'Courier Prime', monospace"
                            }
                        },

                        grid: {

                            color:
                                'rgba(212, 197, 169, 0.1)'
                        }
                    }
                }
            }
        });


    if (canvas.parentElement) {

        canvas.parentElement.style.position =
            'relative';

        canvas.parentElement.style.minHeight =
            '300px';
    }
}


// ============================================================================
// COMPARISON VIEW
// ============================================================================

function updateCompFareyValue(event) {

    const element =
        document.getElementById(
            'comp-farey-value'
        );

    if (element) {
        element.textContent =
            event.target.value;
    }
}


function updateCompTreeValue(event) {

    const element =
        document.getElementById(
            'comp-tree-value'
        );

    if (element) {
        element.textContent =
            event.target.value;
    }
}


async function computeComparison() {

    const fareySlider =
        document.getElementById(
            'comp-farey-slider'
        );

    const treeSlider =
        document.getElementById(
            'comp-tree-slider'
        );

    const fareyBox =
        document.getElementById(
            'comp-farey'
        );

    const treeBox =
        document.getElementById(
            'comp-tree'
        );


    if (!fareySlider || !treeSlider) {
        return;
    }


    const fareyOrder =
        parseInt(
            fareySlider.value,
            10
        );

    const treeDepth =
        parseInt(
            treeSlider.value,
            10
        );


    try {

        showLoading(fareyBox);
        showLoading(treeBox);


        const response =
            await fetch(
                `${API_BASE}/comparison/${fareyOrder}/${treeDepth}`
            );


        const data =
            await response.json();


        if (response.ok) {

            displayComparison(
                data,
                fareyBox,
                treeBox
            );

        } else {

            showError(
                fareyBox,
                data.error ||
                'Error in comparison'
            );
        }


    } catch (error) {

        console.error(
            'Comparison error:',
            error
        );

        showError(
            fareyBox,
            error.message ||
            'Unable to connect to server'
        );
    }
}


function displayComparison(
    data,
    fareyBox,
    treeBox
) {

    const {
        farey,
        stern_brocot
    } = data;


    if (!farey || !stern_brocot) {

        showError(
            fareyBox,
            'Invalid comparison data returned by server.'
        );

        return;
    }


    // Farey
    let fareyHTML =
        `<strong>F₍${farey.order}₎ Statistics</strong><br><br>`;


    fareyHTML +=
        `Total fractions: ${farey.count}<br><br>`;


    fareyHTML +=
        `<strong>Fractions:</strong><br>`;


    const fareyFractions =
        Array.isArray(farey.fractions)
            ? farey.fractions.slice(0, 15)
            : [];


    fareyFractions.forEach((f, i) => {

        fareyHTML +=
            `${f.num}/${f.den}`;


        if (
            i <
            fareyFractions.length - 1
        ) {

            fareyHTML +=
                ', ';
        }
    });


    if (
        Array.isArray(farey.fractions) &&
        farey.fractions.length > 15
    ) {

        fareyHTML +=
            `<br><br>(${farey.count - 15} more)`;
    }


    fareyBox.innerHTML =
        fareyHTML;


    // Stern-Brocot
    let treeHTML =
        `<strong>Stern-Brocot Depth ${stern_brocot.depth}</strong><br><br>`;


    treeHTML +=
        `Total nodes: ${stern_brocot.count}<br><br>`;


    let primitiveCount = 0;


    const nodes =
        Array.isArray(stern_brocot.nodes)
            ? stern_brocot.nodes
            : [];


    nodes.forEach(node => {

        if (node.primitive) {
            primitiveCount++;
        }
    });


    const nonPrimitiveCount =
        stern_brocot.count -
        primitiveCount;


    treeHTML +=
        `Primitive nodes: ${primitiveCount}<br>`;


    treeHTML +=
        `Non-primitive: ${nonPrimitiveCount}<br><br>`;


    treeHTML +=
        `<strong>Sample nodes:</strong><br>`;


    const sampleNodes =
        nodes.slice(0, 10);


    sampleNodes.forEach((node, i) => {

        treeHTML +=
            `${node.num}/${node.den} ` +
            `(${node.primitive ? 'P' : 'N'})`;


        if (
            i <
            sampleNodes.length - 1
        ) {

            treeHTML +=
                ', ';
        }
    });


    treeBox.innerHTML =
        treeHTML;
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showLoading(element) {

    if (element) {

        element.innerHTML =
            `<div class="spinner"></div>`;
    }
}


function showError(
    element,
    message
) {

    if (element) {

        element.innerHTML =
            `<p style="color: var(--color-accent-red);">
                Error: ${message}
            </p>`;
    }
}


function renderMathFormulas() {

    const formulaEl =
        document.getElementById(
            'formula-farey'
        );


    if (
        window.renderMathInElement &&
        formulaEl
    ) {

        renderMathInElement(
            formulaEl,
            {
                delimiters: [
                    {
                        left: '$$',
                        right: '$$',
                        display: true
                    },
                    {
                        left: '$',
                        right: '$',
                        display: false
                    }
                ]
            }
        );
    }
}


// ============================================================================
// API HELPER
// ============================================================================

async function apiCall(
    endpoint,
    fallback = null
) {

    try {

        const response =
            await fetch(endpoint);


        if (response.ok) {

            return await response.json();
        }


        return fallback;


    } catch (error) {

        console.error(
            'API Error:',
            error
        );

        return fallback;
    }
}
