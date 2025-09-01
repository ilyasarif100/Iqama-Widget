# 🚀 Iqama Widget - Embed Guide

## Quick Start

Add this code to your website:

```html
<div id="iqama-widget-container"></div>

<script>
// Widget configuration
window.IqamaWidgetConfig = {
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/14yebmqPkLo0fT0GdlXW1vq0Y4jZsYtNgbK3ijTAIQlU/edit?usp=sharing',
    title: 'Your Masjid Name',
    location: 'Your City, Country',
    backgroundColor: '#1a1a1a',
    accentColor: '#ffffff',
    borderRadius: '20px',
    timeType: 'athan',
    jumuahCount: 1
};

// Load the widget script
const script = document.createElement('script');
script.src = 'https://ilyasarif.github.io/Iqama-Widget/iqama-widget-cloud.js';
document.head.appendChild(script);
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `googleSheetUrl` | string | Required | Your Google Sheet URL with prayer times |
| `title` | string | 'Prayer Times' | Masjid name or title |
| `location` | string | 'ICCP AZ' | Location for sunrise times |
| `backgroundColor` | string | '#1F2937' | Main widget background color |
| `accentColor` | string | '#E5E7EB' | Accent color for buttons and highlights |
| `borderRadius` | string | '20px' | Widget corner roundness |
| `timeType` | string | 'athan' | 'athan' or 'iqama' |
| `jumuahCount` | number | 1 | Number of Jumuah prayers (1, 2, or 3) |

## Google Sheet Format

Your Google Sheet should have this structure:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Fajr | 5:30 AM | Sunrise | 6:45 AM | Dhuhr | 12:15 PM | Asr | 3:30 PM | Maghrib | 6:20 PM |
| Isha | 7:45 PM | 1st Jumuah | 1:30 PM | 2:00 PM | | | | | |

## Examples

### Basic Setup
```html
<div id="iqama-widget-container"></div>
<script>
window.IqamaWidgetConfig = {
    googleSheetUrl: 'YOUR_SHEET_URL',
    title: 'Masjid Al-Noor',
    location: 'Phoenix, AZ'
};
const script = document.createElement('script');
script.src = 'https://ilyasarif.github.io/Iqama-Widget/iqama-widget-cloud.js';
document.head.appendChild(script);
</script>
```

### Custom Colors
```html
<div id="iqama-widget-container"></div>
<script>
window.IqamaWidgetConfig = {
    googleSheetUrl: 'YOUR_SHEET_URL',
    title: 'Your Masjid',
    backgroundColor: '#2D3748',
    accentColor: '#F6AD55',
    borderRadius: '16px'
};
const script = document.createElement('script');
script.src = 'https://ilyasarif.github.io/Iqama-Widget/iqama-widget-cloud.js';
document.head.appendChild(script);
</script>
```

### Iqama Times
```html
<div id="iqama-widget-container"></div>
<script>
window.IqamaWidgetConfig = {
    googleSheetUrl: 'YOUR_SHEET_URL',
    title: 'Your Masjid',
    timeType: 'iqama',
    jumuahCount: 2
};
const script = document.createElement('script');
script.src = 'https://ilyasarif.github.io/Iqama-Widget/iqama-widget-cloud.js';
document.head.appendChild(script);
</script>
```

## Support

- **Demo**: [https://ilyasarif.github.io/Iqama-Widget/demo/](https://ilyasarif.github.io/Iqama-Widget/demo/)
- **Source**: [https://github.com/ilyasarif/Iqama-Widget](https://github.com/ilyasarif/Iqama-Widget)

## Features

✅ **Responsive Design** - Works on all devices  
✅ **Customizable Colors** - Match your brand  
✅ **Multiple Jumuah Support** - 1, 2, or 3 prayers  
✅ **Athan/Iqama Toggle** - Show prayer start or call times  
✅ **Automatic Sunrise** - Fetched from your location  
✅ **Google Sheets Integration** - Easy data management  
✅ **Modern UI** - Glassmorphism design  
✅ **Accessibility** - Screen reader friendly
