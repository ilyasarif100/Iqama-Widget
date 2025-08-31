# Demo Folder Structure

This folder contains the organized demo website for the Iqama Widget with properly separated CSS and JavaScript files.

## 📁 File Structure

```
demo/
├── index.html      # Main HTML file (clean, minimal)
├── styles.css      # All CSS styles (1,414 lines)
└── script.js       # All JavaScript functionality (774 lines)
```

## 🎯 Benefits of This Structure

### ✅ **Separation of Concerns**
- **HTML**: Pure structure and content
- **CSS**: All styling and responsive design
- **JavaScript**: All functionality and interactions

### ✅ **Maintainability**
- Easy to find and edit specific styles
- Clear organization of JavaScript functions
- No more mixed code in HTML files

### ✅ **Performance**
- CSS can be cached separately
- JavaScript can be minified independently
- Better browser caching

### ✅ **Development**
- Easier debugging
- Better IDE support (syntax highlighting, autocomplete)
- Cleaner version control diffs

## 🚀 How to Use

1. **Access the demo**: `http://localhost:8080/demo/index.html`
2. **Edit styles**: Modify `styles.css` for visual changes
3. **Edit functionality**: Modify `script.js` for behavior changes
4. **Edit content**: Modify `index.html` for content changes

## 🔧 Key Features

### **Responsive Design**
- Mobile-first approach
- Industry-standard breakpoints (360px, 390px, 768px, 810px, 1366px, 1920px)
- Fluid typography and spacing

### **Interactive Demo**
- Live widget preview
- Real-time configuration updates
- Color scheme selection
- Time type switching (Athan/Iqama)
- Jumuah count selection (1-3)

### **Modern UI/UX**
- Clean, professional design
- Smooth animations and transitions
- Accessible color schemes
- Mobile-optimized controls

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | 360px, 390px | Single column, compact |
| Tablet | 768px, 810px | Two column, medium spacing |
| Desktop | 1366px, 1920px | Multi-column, full spacing |

## 🎨 Color Schemes

- **Dark**: `#1a1a1a` background, `#ffffff` accent
- **Light**: `#ffffff` background, `#1a1a1a` accent
- **Blue**: `#0f172a` background, `#38bdf8` accent
- **Purple**: `#1e1b4b` background, `#a855f7` accent
- **Green**: `#1f2937` background, `#10b981` accent
- **Red**: `#7f1d1d` background, `#fca5a5` accent

## 🔗 Dependencies

- **Widget Script**: `../iqama-widget-cloud.js`
- **CSV Template**: `../prayer-times-calendar.csv`
- **External APIs**: 
  - Sunrise API: `sunrise-sunset.org`
  - Geocoding API: `nominatim.openstreetmap.org`

## 🛠️ Development Notes

- All JavaScript is wrapped in `DOMContentLoaded` for proper initialization
- CSS uses CSS custom properties for consistent theming
- Responsive design uses mobile-first approach
- Widget updates are debounced for performance
- Location autocomplete includes keyboard navigation
