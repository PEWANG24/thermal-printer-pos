class ThermalPrinterPOS {
    constructor() {
        this.printer = null;
        this.cart = [];
        this.products = [
            { id: 1, name: 'Coffee', price: 3.50, category: 'Beverages' },
            { id: 2, name: 'Tea', price: 2.50, category: 'Beverages' },
            { id: 3, name: 'Sandwich', price: 7.99, category: 'Food' },
            { id: 4, name: 'Salad', price: 8.50, category: 'Food' },
            { id: 5, name: 'Cookie', price: 1.99, category: 'Dessert' },
            { id: 6, name: 'Muffin', price: 3.25, category: 'Dessert' },
            { id: 7, name: 'Soda', price: 2.00, category: 'Beverages' },
            { id: 8, name: 'Water', price: 1.50, category: 'Beverages' },
            { id: 9, name: 'Pizza Slice', price: 4.99, category: 'Food' },
            { id: 10, name: 'Chips', price: 1.25, category: 'Snacks' }
        ];
        
        this.init();
    }

    init() {
        this.renderProducts();
        this.bindEvents();
        this.updateCartDisplay();
    }

    bindEvents() {
        // Printer connection
        document.getElementById('connectBtn').addEventListener('click', () => this.connectPrinter());
        
        // Cart actions
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.showReceiptPreview());
        
        // Modal events
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('printReceiptBtn').addEventListener('click', () => this.printReceipt());
        document.getElementById('cancelPrintBtn').addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('receiptModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async connectPrinter() {
        const connectBtn = document.getElementById('connectBtn');
        const statusElement = document.getElementById('printerStatus');
        
        try {
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<span class="loading"></span> Connecting...';
            
            // Check if Web Bluetooth is supported
            if (!navigator.bluetooth) {
                throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
            }

            // Request Bluetooth device
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: 'M35' },
                    { namePrefix: 'Micro' },
                    { namePrefix: 'Thermal' }
                ],
                optionalServices: ['0000180a-0000-1000-8000-00805f9b34fb'] // Generic Access Service
            });

            // Connect to GATT server
            const server = await device.gatt.connect();
            
            // For thermal printers, we typically need to find the correct service
            // This is a simplified connection - actual implementation may vary
            this.printer = {
                device: device,
                server: server,
                connected: true
            };

            statusElement.textContent = 'Printer: Connected';
            statusElement.className = 'status-connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.onclick = () => this.disconnectPrinter();
            
            this.showNotification('Printer connected successfully!', 'success');
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification(`Connection failed: ${error.message}`, 'error');
            
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect Printer';
        }
    }

    disconnectPrinter() {
        if (this.printer && this.printer.device.gatt.connected) {
            this.printer.device.gatt.disconnect();
        }
        
        this.printer = null;
        
        const statusElement = document.getElementById('printerStatus');
        const connectBtn = document.getElementById('connectBtn');
        
        statusElement.textContent = 'Printer: Not Connected';
        statusElement.className = 'status-disconnected';
        connectBtn.textContent = 'Connect Printer';
        connectBtn.onclick = () => this.connectPrinter();
        
        this.showNotification('Printer disconnected', 'info');
    }

    renderProducts() {
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <div class="price">$${product.price.toFixed(2)}</div>
                <div class="category">${product.category}</div>
            `;
            
            productCard.addEventListener('click', () => this.addToCart(product));
            productGrid.appendChild(productCard);
        });
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartDisplay();
        this.showNotification(`${product.name} added to cart`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCartDisplay();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
        this.showNotification('Cart cleared', 'info');
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">No items in cart</p>';
            subtotalElement.textContent = '$0.00';
            taxElement.textContent = '$0.00';
            totalElement.textContent = '$0.00';
            return;
        }

        cartItems.innerHTML = '';
        
        let subtotal = 0;
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn" onclick="pos.updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="pos.updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="pos.removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    showReceiptPreview() {
        if (this.cart.length === 0) {
            this.showNotification('Cart is empty', 'error');
            return;
        }

        const receiptContent = this.generateReceiptContent();
        document.getElementById('receiptPreview').textContent = receiptContent;
        document.getElementById('receiptModal').style.display = 'block';
    }

    generateReceiptContent() {
        const now = new Date();
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        let receipt = '';
        receipt += '='.repeat(32) + '\n';
        receipt += '        THERMAL PRINTER POS\n';
        receipt += '='.repeat(32) + '\n';
        receipt += `Date: ${now.toLocaleDateString()}\n`;
        receipt += `Time: ${now.toLocaleTimeString()}\n`;
        receipt += '-'.repeat(32) + '\n';
        receipt += 'ITEMS:\n';
        receipt += '-'.repeat(32) + '\n';

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            receipt += `${item.name}\n`;
            receipt += `  ${item.quantity} x $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}\n`;
        });

        receipt += '-'.repeat(32) + '\n';
        receipt += `Subtotal:        $${subtotal.toFixed(2)}\n`;
        receipt += `Tax (8%):        $${tax.toFixed(2)}\n`;
        receipt += '='.repeat(32) + '\n';
        receipt += `TOTAL:           $${total.toFixed(2)}\n`;
        receipt += '='.repeat(32) + '\n';
        receipt += '\n';
        receipt += 'Thank you for your business!\n';
        receipt += 'Visit us again soon!\n';
        receipt += '\n';
        receipt += '='.repeat(32) + '\n';

        return receipt;
    }

    async printReceipt() {
        if (!this.printer || !this.printer.connected) {
            this.showNotification('Printer not connected', 'error');
            return;
        }

        try {
            const receiptContent = this.generateReceiptContent();
            await this.sendToPrinter(receiptContent);
            
            this.showNotification('Receipt printed successfully!', 'success');
            this.closeModal();
            this.clearCart();
            
        } catch (error) {
            console.error('Print failed:', error);
            this.showNotification(`Print failed: ${error.message}`, 'error');
        }
    }

    async sendToPrinter(content) {
        try {
            // Generate ESC/POS commands
            const receiptData = this.generateReceiptData();
            const escpos = new ESCPOSCommands();
            const commands = escpos.generateReceipt(receiptData);
            
            console.log('Generated ESC/POS commands:', commands);
            
            // In a real implementation, you would send these commands to the printer
            // via the Bluetooth characteristic. For now, we'll simulate the process.
            
            // Simulate sending data to printer
            await this.sendBluetoothData(commands);
            
            console.log('Print completed successfully');
            
        } catch (error) {
            console.error('Print error:', error);
            throw error;
        }
    }

    generateReceiptData() {
        const now = new Date();
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        return {
            storeName: 'THERMAL PRINTER POS',
            address: '123 Main Street, City, State',
            phone: '(555) 123-4567',
            items: this.cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            subtotal: subtotal,
            tax: tax,
            total: total,
            date: now,
            receiptNumber: Math.floor(Math.random() * 10000)
        };
    }

    async sendBluetoothData(data) {
        // This is where you would implement the actual Bluetooth communication
        // For the Micro M35 printer, you would need to:
        // 1. Find the correct service and characteristic
        // 2. Send the ESC/POS commands as bytes
        
        if (!this.printer || !this.printer.connected) {
            throw new Error('Printer not connected');
        }

        // Simulate Bluetooth data transmission
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Simulated sending ${data.length} bytes to printer`);
                resolve();
            }, 1500);
        });
    }

    closeModal() {
        document.getElementById('receiptModal').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            animation: 'slideInRight 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the POS system when the page loads
let pos;
document.addEventListener('DOMContentLoaded', () => {
    pos = new ThermalPrinterPOS();
});
