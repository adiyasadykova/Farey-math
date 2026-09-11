# Farey Sequences & Pythagorean Triples Visualization

A comprehensive web application for exploring the mathematical connections between Farey sequences, Stern-Brocot trees, and Pythagorean triples through interactive visualization.

## Project Overview

This application demonstrates deep connections in number theory:

- **Farey Sequences (F_n)**: All reduced fractions between 0 and 1 with denominator ≤ n, ordered by value
- **Stern-Brocot Tree**: Generates every positive reduced fraction exactly once using recursive mediant properties
- **Pythagorean Triples**: Generated via Euclid's formula from fractions m/n, with primitivity determined by gcd and parity

### Key Mathematical Insight

For any fraction **m/n** (where m > n), Euclid's formula generates:
- **x** = m² - n²
- **y** = 2mn  
- **z** = m² + n²

This triple is **primitive** (i.e., gcd(x,y,z) = 1) if and only if:
1. gcd(m, n) = 1 (m and n are coprime)
2. m and n have opposite parity (one even, one odd)
3. m > n > 0

## Features

### 1. Farey Sequence Explorer
- Interactive slider to explore F_n for n = 1 to 100
- Visual number line showing all fractions with color coding:
  - 🟢 Green: Fractions generating primitive triples
  - 🔴 Red: Fractions generating non-primitive triples
- Click any fraction to jump to the Pythagorean Triple Generator
- Display of neighbor properties: |bc - ad| = 1

### 2. Stern-Brocot Tree Visualizer
- Interactive tree visualization up to depth 8
- Nodes color-coded by primitivity status
- Hover over nodes to see Pythagorean triple details
- Click nodes for detailed mathematical analysis
- Tree statistics and distribution analysis

### 3. Pythagorean Triple Generator
- Input any fraction m/n to generate its corresponding triple
- Verification that x² + y² = z²
- Display of GCD and primitive status
- Shows reduced form for non-primitive triples
- Detailed breakdown of primitivity conditions

### 4. Statistics Dashboard
- Real-time statistics for Farey sequence F_n
- Charts showing:
  - Distribution of primitive vs non-primitive triples
  - Count by tree depth
  - Percentage analysis
- Depth-by-depth breakdown of node distribution

### 5. Comparison View
- Side-by-side view of Farey sequences vs Stern-Brocot tree
- Mathematical insights about their complementary properties
- Visual exploration of how both structures generate the same fractions

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Step 1: Clone or Download
```bash
git clone <repository-url>
cd farey-sequences-app
```

### Step 2: Create Virtual Environment (Optional but Recommended)
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

### Step 5: Open in Browser
Navigate to `http://localhost:5000` in your web browser

## Project Structure

```
project/
├── app.py                      # Flask backend with API routes
├── requirements.txt            # Python dependencies
├── README.md                   # This file
└── templates/
│   └── index.html             # Main HTML page
└── static/
    ├── styles.css             # Dark academic theme styling
    ├── script.js              # Frontend JavaScript logic
    └── tree.js                # D3.js tree visualization
```

## API Endpoints

The backend provides REST API endpoints for all computations:

### Farey Sequence
```
GET /api/farey/<n>
```
Returns all fractions in F_n with order n.

**Parameters**: n (1-500)

**Response**:
```json
{
  "order": 20,
  "fractions": [
    {"num": 0, "den": 1, "decimal": 0.0},
    {"num": 1, "den": 20, "decimal": 0.05},
    ...
  ],
  "count": 43
}
```

### Stern-Brocot Tree
```
GET /api/stern-brocot/<depth>
```
Generates Stern-Brocot tree to specified depth.

**Parameters**: depth (1-8)

**Response**:
```json
{
  "depth": 4,
  "nodes": [
    {
      "id": 0,
      "num": 1,
      "den": 2,
      "depth": 1,
      "primitive": true,
      "triple": [3, 4, 5],
      "gcd": 1
    },
    ...
  ],
  "count": 15
}
```

### Pythagorean Triple
```
GET /api/pythagorean/<m>/<n>
```
Generates Pythagorean triple from Euclid's formula.

**Parameters**: m, n (positive integers, m > n)

**Response**:
```json
{
  "triple": [21, 20, 29],
  "gcd": 1,
  "primitive": true,
  "reduced": null,
  "is_primitive_pair": true
}
```

### Statistics
```
GET /api/statistics/<n>
```
Calculates statistics for Farey sequence F_n.

**Parameters**: n (1-500)

**Response**:
```json
{
  "farey_order": 20,
  "total_fractions": 43,
  "primitive_triples": 12,
  "non_primitive_triples": 8,
  "total_triples": 20,
  "primitive_percentage": 60.0,
  "depth_distribution": { ... }
}
```

### Comparison
```
GET /api/comparison/<n>/<depth>
```
Combined data for side-by-side comparison.

**Parameters**: n (1-500), depth (1-8)

## Design & Styling

The application uses a **Dark Academic Theme** with:
- **Background**: Deep emerald-black (#0D1F1D)
- **Primary Text**: Warm cream white (#F5F0E8)
- **Accent Color**: Chalk yellow (#FFE066)
- **Primitive Indicator**: Mint green (#7FBA9A)
- **Non-Primitive Indicator**: Soft red (#E06C6C)

Typography:
- UI: Inter font family
- Mathematics: Courier Prime monospace
- KaTeX for mathematical formula rendering

## Technologies Used

### Backend
- **Flask 2.3.3**: Lightweight Python web framework
- **Python 3**: Core mathematical computations
- Standard library `math` module for GCD calculations

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript ES6**: Frontend logic and interactivity
- **D3.js 7.8.5**: Advanced tree visualization
- **Chart.js 3.9.1**: Statistics charts
- **KaTeX 0.16.0**: Mathematical formula rendering

### Libraries
- D3.js for tree visualization and interactive graphics
- Chart.js for statistical charts
- KaTeX for rendering LaTeX mathematics
- Responsive design with mobile support

## Mathematical Concepts

### Farey Sequence F_n
The Farey sequence of order n is the sorted sequence of completely reduced fractions between 0 and 1 which have denominators less than or equal to n.

Key properties:
- All fractions are in lowest terms
- Consecutive fractions a/b and c/d satisfy |bc - ad| = 1
- Total count of fractions in F_n is 1 + Σφ(k) for k=1 to n, where φ is Euler's totient function

### Stern-Brocot Tree
An infinite binary tree of fractions with interesting properties:
- Every positive rational appears exactly once
- Generated recursively via the mediant: between a/b and c/d lies (a+c)/(b+d)
- Left child is obtained by replacing c with a+c
- Right child is obtained by replacing a with a+c

### Primitive Pythagorean Triples
A Pythagorean triple (x, y, z) where x² + y² = z² is primitive if gcd(x, y, z) = 1.

Euclid's formula generates ALL primitive Pythagorean triples:
- For coprime m, n with m > n > 0 and opposite parity:
  - x = m² - n²
  - y = 2mn
  - z = m² + n²

## Testing the Application

### Test Cases

**Farey Sequence F₁₀**:
- Contains 43 fractions
- Includes 0/1, 1/10, 1/9, ..., 9/10, 1/1

**Stern-Brocot Tree Depth 4**:
- Contains 15 nodes
- Root is 1/2
- Full binary tree structure

**Pythagorean Triple from 5/2**:
- Triple: (21, 20, 29)
- Primitive: Yes
- Verification: 21² + 20² = 441 + 400 = 841 = 29²

**Statistics for F₂₀**:
- Total fractions: 43
- Primitive triples: ~24
- Non-primitive: ~12

## Performance Notes

- Farey sequence generation: O(n log log n)
- Stern-Brocot tree: O(2^depth) nodes, fast generation
- GCD computation: O(log(min(m,n)))
- Maximum n for Farey: 500 (performance limit)
- Maximum tree depth: 8 (UI readability limit)

## Browser Compatibility

- Chrome/Chromium: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Edge: ✓ Full support
- Mobile browsers: ✓ Responsive design

## Future Enhancements

Potential additions:
- Export visualizations as PNG/SVG
- Animation of tree generation process
- Integration with number theory databases
- 3D visualization options
- Performance optimizations for larger n
- Mobile app version

## Credits & References

Mathematical concepts and formulas based on:
- Euclid's formula for Pythagorean triples
- Properties of Farey sequences (Hardy & Wright)
- Stern-Brocot tree theory (Calkin-Wilf tree connections)

Libraries:
- D3.js by Observable
- Chart.js by Chart.js Contributors
- KaTeX by Khan Academy
- Flask by Pallets Projects

## License

This project is provided as an educational resource for mathematical research and visualization.

## Author

Created as a mathematical research project exploring connections between Farey sequences, Stern-Brocot trees, and Pythagorean triples.

## Contact & Support

For issues, questions, or suggestions, please refer to the project documentation or contact the development team.

---

**Enjoy exploring the beautiful world of number theory!** 🔢✨

Visit the application at: `http://localhost:5000`
