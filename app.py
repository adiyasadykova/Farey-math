"""
Farey Sequences and Pythagorean Triples Visualization
A mathematical research application for visualizing the connection between
Farey sequences, Stern-Brocot trees, and Pythagorean triples.
"""

from flask import Flask, jsonify, render_template
from math import gcd
import json

app = Flask(__name__)

# ============================================================================
# MATHEMATICAL CORE FUNCTIONS
# ============================================================================

def farey_sequence(n):
    """
    Generate Farey sequence F_n (all reduced fractions between 0 and 1
    with denominator ≤ n, in ascending order).
    
    Uses the efficient algorithm that generates neighbors directly.
    Property: For consecutive fractions a/b and c/d in F_n, we have |bc - ad| = 1
    """
    if n < 1:
        return []
    
    fractions = []
    a, b, c, d = 0, 1, 1, n
    fractions.append({'num': a, 'den': b, 'decimal': 0.0})
    
    while c <= n:
        k = (n + b) // d
        a, b, c, d = c, d, k*c - a, k*d - b
        decimal_value = a / b if b != 0 else 0
        fractions.append({'num': a, 'den': b, 'decimal': decimal_value})
    
    return fractions


def is_primitive_pair(m, n):
    """
    Check if (m, n) generates a primitive Pythagorean triple.
    
    Conditions:
    1. gcd(m, n) = 1 (coprime)
    2. m and n have opposite parity (one even, one odd)
    3. m > n > 0
    """
    if m <= n or n <= 0:
        return False
    return gcd(m, n) == 1 and (m + n) % 2 == 1


def pythagorean_from_fraction(m, n):
    """
    Generate Pythagorean triple from Euclid's formula.
    
    For m > n > 0:
    x = m² - n²
    y = 2mn
    z = m² + n²
    
    The triple is primitive iff gcd(m,n)=1 and m,n have opposite parity.
    """
    if m <= n or n <= 0:
        return {
            'error': 'Invalid input: require m > n > 0',
            'triple': None,
            'gcd': None,
            'primitive': None,
            'reduced': None
        }
    
    x = m*m - n*n
    y = 2*m*n
    z = m*m + n*n
    
    # Ensure x < y for consistency
    if x > y:
        x, y = y, x
    
    g = gcd(gcd(x, y), z)
    primitive = (g == 1)
    
    reduced = None
    if not primitive:
        reduced = (x // g, y // g, z // g)
    
    return {
        'triple': (x, y, z),
        'gcd': g,
        'primitive': primitive,
        'reduced': reduced,
        'is_primitive_pair': is_primitive_pair(m, n)
    }


def stern_brocot_tree(depth):
    """
    Generate Stern-Brocot tree to specified depth.
    
    The Stern-Brocot tree generates every positive reduced fraction exactly once.
    Each node (m/n) can generate a Pythagorean triple via Euclid's formula.
    """
    if depth < 1 or depth > 8:
        return []
    
    nodes = []
    
    def build_tree(left_num, left_den, right_num, right_den, current_depth, parent_id):
        """Recursively build the tree using the mediant property."""
        if current_depth > depth:
            return
        
        # Calculate mediant
        med_num = left_num + right_num
        med_den = left_den + right_den
        
        # Check if primitive
        primitive = is_primitive_pair(med_num, med_den)
        
        # Generate Pythagorean triple
        triple_data = pythagorean_from_fraction(med_num, med_den)
        
        node_id = len(nodes)
        nodes.append({
            'id': node_id,
            'parent_id': parent_id,
            'num': med_num,
            'den': med_den,
            'decimal': med_num / med_den,
            'depth': current_depth,
            'primitive': primitive,
            'triple': triple_data['triple'],
            'gcd': triple_data['gcd']
        })
        
        # Recursively build left and right subtrees
        build_tree(left_num, left_den, med_num, med_den, current_depth + 1, node_id)
        build_tree(med_num, med_den, right_num, right_den, current_depth + 1, node_id)
    
    # Start with the implicit boundaries
    build_tree(0, 1, 1, 1, 1, -1)
    
    return nodes


def calculate_statistics(n):
    """
    Calculate statistics about Farey sequence F_n and primitivity.
    """
    fractions = farey_sequence(n)
    
    total_fractions = len(fractions)
    primitive_count = 0
    non_primitive_count = 0
    
    # Exclude 0/1 and 1/1 as they don't generate proper triples
    for frac in fractions[1:]:  # Skip 0/1
        m, n_val = frac['num'], frac['den']
        if m > n_val:  # Only m > n generates proper triples
            if is_primitive_pair(m, n_val):
                primitive_count += 1
            else:
                non_primitive_count += 1
    
    # Count by depth in Stern-Brocot tree
    tree = stern_brocot_tree(min(6, n // 10 + 1))
    depth_stats = {}
    for node in tree:
        d = node['depth']
        if d not in depth_stats:
            depth_stats[d] = {'total': 0, 'primitive': 0, 'non_primitive': 0}
        depth_stats[d]['total'] += 1
        if node['primitive']:
            depth_stats[d]['primitive'] += 1
        else:
            depth_stats[d]['non_primitive'] += 1
    
    return {
        'farey_order': n,
        'total_fractions': total_fractions,
        'primitive_triples': primitive_count,
        'non_primitive_triples': non_primitive_count,
        'total_triples': primitive_count + non_primitive_count,
        'primitive_percentage': (primitive_count / (primitive_count + non_primitive_count) * 100) if (primitive_count + non_primitive_count) > 0 else 0,
        'depth_distribution': depth_stats
    }


# ============================================================================
# FLASK ROUTES
# ============================================================================

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')


@app.route('/api/farey/<int:n>', methods=['GET'])
def api_farey(n):
    """
    GET /api/farey/{n}
    Returns the Farey sequence F_n
    """
    if n < 1 or n > 500:
        return jsonify({'error': 'n must be between 1 and 500'}), 400
    
    try:
        sequence = farey_sequence(n)
        return jsonify({
            'order': n,
            'fractions': sequence,
            'count': len(sequence)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stern-brocot/<int:depth>', methods=['GET'])
def api_stern_brocot(depth):
    """
    GET /api/stern-brocot/{depth}
    Returns the Stern-Brocot tree to specified depth
    """
    if depth < 1 or depth > 8:
        return jsonify({'error': 'depth must be between 1 and 8'}), 400
    
    try:
        tree = stern_brocot_tree(depth)
        return jsonify({
            'depth': depth,
            'nodes': tree,
            'count': len(tree)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pythagorean/<int:m>/<int:n>', methods=['GET'])
def api_pythagorean(m, n):
    """
    GET /api/pythagorean/{m}/{n}
    Returns Pythagorean triple generated from fraction m/n
    """
    if m <= 0 or n <= 0:
        return jsonify({'error': 'm and n must be positive integers'}), 400
    
    try:
        result = pythagorean_from_fraction(m, n)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/statistics/<int:n>', methods=['GET'])
def api_statistics(n):
    """
    GET /api/statistics/{n}
    Returns statistics about Farey sequence F_n
    """
    if n < 1 or n > 500:
        return jsonify({'error': 'n must be between 1 and 500'}), 400
    
    try:
        stats = calculate_statistics(n)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/comparison/<int:n>/<int:depth>', methods=['GET'])
def api_comparison(n, depth):
    """
    GET /api/comparison/{n}/{depth}
    Returns combined data for side-by-side comparison
    """
    if n < 1 or n > 500 or depth < 1 or depth > 8:
        return jsonify({'error': 'Invalid parameters'}), 400
    
    try:
        farey = farey_sequence(n)
        tree = stern_brocot_tree(depth)
        stats = calculate_statistics(n)
        
        return jsonify({
            'farey': {
                'order': n,
                'fractions': farey,
                'count': len(farey)
            },
            'stern_brocot': {
                'depth': depth,
                'nodes': tree,
                'count': len(tree)
            },
            'statistics': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
