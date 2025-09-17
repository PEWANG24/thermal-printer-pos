# 🖨️ Thermal Printer POS System

A simple Point of Sale (POS) system designed to test and demonstrate thermal printer functionality with Bluetooth connectivity. This project is specifically built for the Micro M35 thermal printer but can be adapted for other ESC/POS compatible printers.

## 📋 Features

- **Modern Web Interface**: Clean, responsive design with real-time cart updates
- **Bluetooth Integration**: Connect to thermal printers via Web Bluetooth API
- **ESC/POS Support**: Generates proper receipt formatting for thermal printers
- **Product Management**: Built-in product catalog with categories
- **Receipt Preview**: Preview receipts before printing
- **Real-time Calculations**: Automatic tax calculation and totals
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## 🖨️ Supported Printer

**Micro M35 Thermal Printer**
- **Type**: Portable Thermal Receipt Printer
- **Printing Speed**: 70 mm/s
- **Paper Size**: 58 mm width thermal paper roll
- **Command Support**: ESC/POS
- **Interfaces**: USB, Bluetooth
- **Charging**: USB 5V, 2A

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser with Web Bluetooth support (Chrome, Edge)
- Micro M35 thermal printer (or compatible ESC/POS printer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd thermal-printer-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🌐 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial POS system"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration
   - Deploy!

3. **Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Update DNS settings as instructed

## 🔧 Usage

### Connecting the Printer

1. **Enable Bluetooth** on your printer
2. **Click "Connect Printer"** in the POS interface
3. **Select your printer** from the Bluetooth device list
4. **Wait for connection** confirmation

### Processing Orders

1. **Add items** to cart by clicking product cards
2. **Adjust quantities** using +/- buttons
3. **Remove items** with the remove button
4. **Click "Checkout & Print"** to preview receipt
5. **Print receipt** to your connected thermal printer

### Product Management

The system comes with a sample product catalog. To customize:

1. **Edit products** in `script.js`:
   ```javascript
   this.products = [
       { id: 1, name: 'Your Product', price: 9.99, category: 'Category' },
       // Add more products...
   ];
   ```

## 🛠️ Technical Details

### Architecture

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Pure CSS with responsive design
- **Bluetooth**: Web Bluetooth API for printer connectivity

### ESC/POS Commands

The system generates ESC/POS commands for:
- Text formatting (bold, center, etc.)
- Line breaks and spacing
- Receipt structure
- Paper cutting commands

### Browser Compatibility

- **Chrome**: Full support (recommended)
- **Edge**: Full support
- **Firefox**: Limited Web Bluetooth support
- **Safari**: No Web Bluetooth support

## 🔧 Configuration

### Printer Settings

The system is configured for 58mm thermal printers. To adjust for different widths:

1. **Update receipt width** in `script.js`:
   ```javascript
   receipt += '='.repeat(32) + '\n'; // Adjust number for different widths
   ```

2. **Modify ESC/POS commands** in the `sendToPrinter()` method

### Tax Configuration

Default tax rate is 8%. To change:

```javascript
const tax = subtotal * 0.08; // Change 0.08 to your tax rate
```

## 🐛 Troubleshooting

### Printer Connection Issues

1. **Check Bluetooth**: Ensure printer is in pairing mode
2. **Browser Support**: Use Chrome or Edge for best compatibility
3. **Permissions**: Allow Bluetooth access when prompted
4. **Device Name**: Ensure printer name contains "M35", "Micro", or "Thermal"

### Print Quality Issues

1. **Paper Alignment**: Check thermal paper roll alignment
2. **Print Density**: Adjust printer settings if available
3. **Paper Width**: Ensure 58mm paper is used

### Common Errors

- **"Web Bluetooth not supported"**: Use Chrome or Edge browser
- **"Connection failed"**: Check printer is in pairing mode
- **"Print failed"**: Verify printer is still connected

## 📱 Mobile Usage

The POS system is fully responsive and works on mobile devices:

1. **Open in mobile browser** (Chrome recommended)
2. **Connect printer** via Bluetooth
3. **Use touch interface** for product selection
4. **Print receipts** directly from mobile

## 🔒 Security Notes

- This is a demo system for testing purposes
- No payment processing is included
- No data persistence (cart resets on page refresh)
- For production use, add proper security measures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure printer compatibility
4. Create an issue in the repository

## 🔮 Future Enhancements

- [ ] Payment integration
- [ ] Inventory management
- [ ] Sales reporting
- [ ] Multi-printer support
- [ ] Offline mode
- [ ] Receipt templates
- [ ] Barcode scanning
- [ ] Customer management

---

**Happy Printing! 🖨️✨**
