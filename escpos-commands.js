/**
 * ESC/POS Command Generator for Thermal Printers
 * Compatible with Micro M35 and other ESC/POS printers
 */

class ESCPOSCommands {
    constructor() {
        this.commands = [];
    }

    // Basic control commands
    initialize() {
        this.commands.push(0x1B, 0x40); // ESC @ - Initialize printer
        return this;
    }

    // Text formatting
    bold(enabled = true) {
        if (enabled) {
            this.commands.push(0x1B, 0x45, 0x01); // ESC E 1 - Bold on
        } else {
            this.commands.push(0x1B, 0x45, 0x00); // ESC E 0 - Bold off
        }
        return this;
    }

    underline(enabled = true) {
        if (enabled) {
            this.commands.push(0x1B, 0x2D, 0x01); // ESC - 1 - Underline on
        } else {
            this.commands.push(0x1B, 0x2D, 0x00); // ESC - 0 - Underline off
        }
        return this;
    }

    // Text alignment
    alignLeft() {
        this.commands.push(0x1B, 0x61, 0x00); // ESC a 0 - Left align
        return this;
    }

    alignCenter() {
        this.commands.push(0x1B, 0x61, 0x01); // ESC a 1 - Center align
        return this;
    }

    alignRight() {
        this.commands.push(0x1B, 0x61, 0x02); // ESC a 2 - Right align
        return this;
    }

    // Font size
    fontSize(size = 1) {
        // Size 1: normal, Size 2: double width/height
        if (size === 2) {
            this.commands.push(0x1B, 0x21, 0x30); // ESC ! 0x30 - Double size
        } else {
            this.commands.push(0x1B, 0x21, 0x00); // ESC ! 0x00 - Normal size
        }
        return this;
    }

    // Line spacing
    lineSpacing(spacing = 0) {
        this.commands.push(0x1B, 0x33, spacing); // ESC 3 n - Set line spacing
        return this;
    }

    // Print text
    text(text) {
        const textBytes = new TextEncoder().encode(text);
        this.commands.push(...textBytes);
        return this;
    }

    // Print line with automatic line feed
    line(text = '') {
        this.text(text);
        this.lineFeed();
        return this;
    }

    // Line feed
    lineFeed(lines = 1) {
        for (let i = 0; i < lines; i++) {
            this.commands.push(0x0A); // LF - Line feed
        }
        return this;
    }

    // Horizontal line
    horizontalLine(char = '=', length = 32) {
        this.line(char.repeat(length));
        return this;
    }

    // Cut paper
    cutPaper() {
        this.commands.push(0x1D, 0x56, 0x00); // GS V 0 - Full cut
        return this;
    }

    // Partial cut
    partialCut() {
        this.commands.push(0x1D, 0x56, 0x01); // GS V 1 - Partial cut
        return this;
    }

    // Print barcode
    printBarcode(data, type = 73) {
        // Type 73 = Code 128
        const dataBytes = new TextEncoder().encode(data);
        this.commands.push(0x1D, 0x6B, type, dataBytes.length, ...dataBytes);
        return this;
    }

    // Print QR code
    printQRCode(data, size = 3) {
        // Set QR code model
        this.commands.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
        
        // Set QR code size
        this.commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size);
        
        // Set QR code error correction
        this.commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);
        
        // Store QR code data
        const dataBytes = new TextEncoder().encode(data);
        const p1 = dataBytes.length % 256;
        const p2 = Math.floor(dataBytes.length / 256);
        this.commands.push(0x1D, 0x28, 0x6B, p1, p2, 0x31, 0x50, 0x30, ...dataBytes);
        
        // Print QR code
        this.commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
        
        return this;
    }

    // Print receipt header
    printHeader(storeName, address = '', phone = '') {
        this.initialize();
        this.alignCenter();
        this.fontSize(2);
        this.bold(true);
        this.line(storeName);
        this.fontSize(1);
        this.bold(false);
        
        if (address) {
            this.line(address);
        }
        if (phone) {
            this.line(`Tel: ${phone}`);
        }
        
        this.lineFeed(1);
        this.horizontalLine();
        this.alignLeft();
        return this;
    }

    // Print receipt footer
    printFooter(thankYouMessage = 'Thank you for your business!') {
        this.lineFeed(1);
        this.alignCenter();
        this.line(thankYouMessage);
        this.line('Visit us again soon!');
        this.lineFeed(2);
        this.horizontalLine();
        this.lineFeed(3);
        this.cutPaper();
        return this;
    }

    // Print item line
    printItemLine(name, quantity, price, total) {
        this.alignLeft();
        this.line(name);
        
        // Right align the numbers
        const quantityStr = `Qty: ${quantity}`;
        const priceStr = `@ $${price.toFixed(2)}`;
        const totalStr = `$${total.toFixed(2)}`;
        
        // Create a line with right-aligned numbers
        const line = `${quantityStr.padStart(8)} ${priceStr.padStart(12)} ${totalStr.padStart(8)}`;
        this.line(line);
        this.lineFeed(1);
        return this;
    }

    // Print total line
    printTotalLine(label, amount, isTotal = false) {
        this.alignLeft();
        if (isTotal) {
            this.bold(true);
            this.fontSize(2);
        }
        
        const amountStr = `$${amount.toFixed(2)}`;
        const line = `${label.padEnd(20)} ${amountStr.padStart(8)}`;
        this.line(line);
        
        if (isTotal) {
            this.bold(false);
            this.fontSize(1);
        }
        return this;
    }

    // Get final command array
    getCommands() {
        return new Uint8Array(this.commands);
    }

    // Reset for new receipt
    reset() {
        this.commands = [];
        return this;
    }

    // Generate complete receipt
    generateReceipt(receiptData) {
        const {
            storeName = 'THERMAL PRINTER POS',
            address = '',
            phone = '',
            items = [],
            subtotal = 0,
            tax = 0,
            total = 0,
            date = new Date(),
            receiptNumber = Math.floor(Math.random() * 10000)
        } = receiptData;

        this.reset();
        
        // Header
        this.printHeader(storeName, address, phone);
        
        // Receipt info
        this.line(`Receipt #: ${receiptNumber}`);
        this.line(`Date: ${date.toLocaleDateString()}`);
        this.line(`Time: ${date.toLocaleTimeString()}`);
        this.lineFeed(1);
        this.horizontalLine();
        this.line('ITEMS:');
        this.horizontalLine();
        
        // Items
        items.forEach(item => {
            this.printItemLine(item.name, item.quantity, item.price, item.total);
        });
        
        // Totals
        this.horizontalLine();
        this.printTotalLine('Subtotal:', subtotal);
        this.printTotalLine('Tax (8%):', tax);
        this.horizontalLine();
        this.printTotalLine('TOTAL:', total, true);
        this.horizontalLine();
        
        // Footer
        this.printFooter();
        
        return this.getCommands();
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ESCPOSCommands;
} else {
    window.ESCPOSCommands = ESCPOSCommands;
}
