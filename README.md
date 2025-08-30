# 🕌 ICCP Iqama Times Widget

A beautiful, responsive prayer times widget for the Islamic Center of Central Phoenix (ICCP). This widget displays current prayer times, highlights the current/next prayer, and provides easy access to the full Iqama schedule.

## ✨ Features

- **Real-time Prayer Status**: Shows current prayer (within 30-minute window) or next upcoming prayer
- **Friday Logic**: Automatically handles Jumuah prayer on Fridays
- **Google Sheets Integration**: Fetches prayer times from a public Google Sheet
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Islamic-inspired design with gold accents and smooth animations
- **Auto-updating**: Refreshes automatically and updates daily at midnight
- **Current Prayer Highlighting**: Glowing effects and "NOW" badges for current prayers

## 🚀 Quick Start

### 1. Setup Google Sheets
**Option A: Use the provided CSV template (Recommended)**
1. Download `prayer-times-calendar.csv` from this repository
2. Go to [Google Sheets](https://sheets.google.com) and create a new sheet
3. Go to **File → Import → Upload** and select the CSV file
4. The sheet will automatically have the correct column structure

**Option B: Create manually**
1. Create a Google Sheet with the following columns:
   ```
   Month | Day | Fajr | Zuhr | Asr | Maghrib | Isha | Jumuah
   ```
2. Copy data from the CSV file or enter your own prayer times

**Make the sheet public:**
- Click **Share** button (top right)
- Change to **"Anyone with the link can view"**
- Copy the Sheet ID from the URL

### 2. Update Configuration
In `iqama-widget.html`, update the Google Sheets configuration:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Sheet1';
```

### 3. Deploy
- **Squarespace**: Paste the entire `<script>` block into a Code Block
- **WordPress**: Use as a custom HTML widget
- **Any Website**: Include the script in your HTML

## 📱 Widget Layout

### Header Section
- Current date display
- "Prayer Times" title
- ICCP AZ location identifier
- ICCP logo (top right)

### Prayer Times Display
- **Top Row**: Fajr, Dhuhr, Asr
- **Bottom Row**: Maghrib, Isha
- **Special Section**: Jumuah (Friday Prayer)
- Each prayer shows name, time, and AM/PM

### Status Display
- Shows "Current Prayer: [Name] (Time)" or "Next Prayer: [Name] (Time)"
- Automatically detects next-day Fajr after Isha

### Action Button
- "View Full Iqama Schedule" button
- Links directly to the Google Sheets

## 🔧 Technical Details

### Prayer Status Logic
- **Current Prayer**: 30-minute window after prayer time
- **Next Prayer**: Closest upcoming prayer time
- **Friday Handling**: Automatically replaces Dhuhr with Jumuah
- **Next-Day Logic**: After Isha's window, shows tomorrow's Fajr

### Data Fetching
- Fetches from Google Sheets using CSV export
- Multiple fallback endpoints for compatibility
- Automatic error handling and retry logic

### Responsive Design
- **Desktop**: 3-column layout for prayers
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Single-column stacked layout with perfect spacing

## 🎨 Customization

### Colors
The widget uses ICCP brand colors:
- **Primary Green**: `#0F4C3A`
- **Gold Accent**: `#D4AF37`
- **Dark Green**: `#1D231C`

### Fonts
- **Title**: Georgia serif (elegant)
- **Prayer Names**: Segoe UI (readable)
- **Times**: Courier New (monospace for alignment)

### Sizing
- **Prayer Circles**: 100px (desktop), 60px (mobile)
- **Font Sizes**: 28px prayer names, 32px times
- **Spacing**: 40px between prayer items on mobile

## 📊 Google Sheets Format

Your Google Sheet should have this structure:

| Month | Day | Fajr | Zuhr | Asr | Maghrib | Isha | Jumuah |
|-------|-----|------|------|-----|---------|------|---------|
| Aug   | 30  | 4:30 | 12:30| 4:00| 7:15   | 8:30 | 1:00    |

**Important Notes:**
- Use 12-hour format with AM/PM
- Jumuah is always 1:00 PM
- Make sure the sheet is public
- Column order must match exactly

## 🛠️ Development

### Local Testing
```bash
# Start local server
python3 -m http.server 8000

# Access widget
http://localhost:8000/iqama-widget.html
```

### File Structure
```
├── iqama-widget.html          # Main widget file
├── prayer-times-calendar.csv  # 📊 READY-TO-USE CSV template for Google Sheets
├── test-sheet-access.html     # Testing utility
└── README.md                  # This file
```

**📊 `prayer-times-calendar.csv`** - This is your **ready-to-use template**! 
- Contains a full year of sample prayer times
- Perfect format for Google Sheets import
- Just download and import - no manual setup needed

### Key Functions
- `fetchPrayerTimes()`: Fetches data from Google Sheets
- `getPrayerStatus()`: Determines current/next prayer
- `createWidget()`: Renders the widget HTML
- `timeToMinutes()`: Converts time strings to minutes

## 🔍 Troubleshooting

### Common Issues

**"Prayer times loaded: 0 days"**
- Check if Google Sheet is public
- Verify column names match exactly
- Ensure sheet has data

**Widget not displaying**
- Check browser console for errors
- Verify Google Sheets ID is correct
- Ensure internet connection

**Mobile spacing issues**
- Widget automatically adjusts for mobile
- All spacing is handled by CSS media queries
- Test on different screen sizes

### Debug Mode
The widget includes extensive console logging:
- Prayer times loading status
- Current/next prayer detection
- Error messages and warnings

## 📈 Performance

- **Lightweight**: Single HTML file with inline CSS/JS
- **Efficient**: Only fetches data once per session
- **Fast**: Minimal DOM manipulation
- **Cached**: Prayer times cached in memory

## 🌟 Features in Detail

### Current Prayer Detection
- 30-minute window after prayer time
- Orange glow effect and "NOW" badge
- Automatic status updates

### Next Prayer Logic
- Calculates shortest time difference
- Handles next-day transitions
- Friday Jumuah integration

### Responsive Breakpoints
- **Desktop**: 769px and above
- **Tablet**: 481px - 768px
- **Mobile**: 480px and below
- **Small Mobile**: 390px and below

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **ICCP Community**: For prayer time data and feedback
- **Islamic Design Elements**: Inspired by traditional Islamic architecture
- **Google Sheets API**: For reliable data storage and access

## 📞 Support

For questions or issues:
- Check the troubleshooting section above
- Review browser console for error messages
- Ensure Google Sheets is properly configured

---

**Built with ❤️ for the ICCP Community**

*May this widget help you stay connected to your prayer times and community.*
