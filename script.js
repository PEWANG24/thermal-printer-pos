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
        
        this.lastConnectedDevice = this.getStoredDevice();
        this.init();
    }

    init() {
        this.renderProducts();
        this.bindEvents();
        this.updateCartDisplay();
        this.updateConnectButton();
    }

    getStoredDevice() {
        try {
            const stored = localStorage.getItem('thermal-printer-device');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading stored device:', error);
            return null;
        }
    }

    storeDevice(device) {
        try {
            const deviceInfo = {
                id: device.id,
                name: device.name,
                timestamp: Date.now()
            };
            localStorage.setItem('thermal-printer-device', JSON.stringify(deviceInfo));
        } catch (error) {
            console.error('Error storing device:', error);
        }
    }

    updateConnectButton() {
        const connectBtn = document.getElementById('connectBtn');
        if (this.lastConnectedDevice) {
            connectBtn.innerHTML = `Connect to ${this.lastConnectedDevice.name}`;
            connectBtn.title = `Last connected: ${this.lastConnectedDevice.name}`;
        }
    }

    enableTestMode() {
        const connectBtn = document.getElementById('connectBtn');
        const statusElement = document.getElementById('printerStatus');
        
        // Simulate printer connection
        this.printer = {
            device: { name: 'Test Printer (Simulated)' },
            server: null,
            connected: true,
            testMode: true
        };

        statusElement.textContent = 'Printer: Test Mode (Simulated)';
        statusElement.className = 'status-connected';
        connectBtn.textContent = 'Disconnect Test Mode';
        connectBtn.onclick = () => this.disableTestMode();
        
        this.showNotification('Test mode enabled! You can test the POS functionality without a real printer.', 'info');
    }

    disableTestMode() {
        const connectBtn = document.getElementById('connectBtn');
        const statusElement = document.getElementById('printerStatus');
        
        this.printer = null;
        
        statusElement.textContent = 'Printer: Not Connected';
        statusElement.className = 'status-disconnected';
        connectBtn.textContent = 'Connect Printer';
        connectBtn.onclick = () => this.connectPrinter();
        
        this.showNotification('Test mode disabled', 'info');
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
                // Show a modal with test mode option
                const testMode = confirm('Web Bluetooth is not supported in this browser. Would you like to use Test Mode instead? (You can still test the POS functionality without printing)');
                if (testMode) {
                    this.enableTestMode();
                    return;
                } else {
                    throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge for full functionality.');
                }
            }

            let selectedDevice;

            // If we have a last connected device, try to connect to it first
            if (this.lastConnectedDevice) {
                try {
                    selectedDevice = await this.connectToStoredDevice();
                } catch (error) {
                    console.log('Could not connect to stored device, showing selection modal');
                    selectedDevice = await this.showDeviceSelectionModal();
                }
            } else {
                // Show device selection modal
                selectedDevice = await this.showDeviceSelectionModal();
            }

            if (!selectedDevice) {
                throw new Error('No device selected');
            }

            // Connect to GATT server
            const server = await selectedDevice.gatt.connect();
            
            // Debug: List all available services and characteristics
            console.log('Connected to device:', selectedDevice.name);
            console.log('GATT server connected:', server.connected);
            
            try {
                const services = await server.getPrimaryServices();
                console.log('Available services:', services.length);
                
                for (const service of services) {
                    console.log(`Service: ${service.uuid}`);
                    try {
                        const characteristics = await service.getCharacteristics();
                        console.log(`  Characteristics (${characteristics.length}):`);
                        for (const char of characteristics) {
                            console.log(`    ${char.uuid} - Properties:`, char.properties);
                        }
                    } catch (error) {
                        console.log(`  Error getting characteristics: ${error.message}`);
                    }
                }
            } catch (error) {
                console.log('Error listing services:', error.message);
            }
            
            // Store the device for future connections
            this.storeDevice(selectedDevice);
            this.lastConnectedDevice = this.getStoredDevice();
            
            // For thermal printers, we typically need to find the correct service
            // This is a simplified connection - actual implementation may vary
            this.printer = {
                device: selectedDevice,
                server: server,
                connected: true
            };

            statusElement.textContent = `Printer: Connected (${selectedDevice.name})`;
            statusElement.className = 'status-connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.onclick = () => this.disconnectPrinter();
            
            this.showNotification(`Printer connected successfully! (${selectedDevice.name})`, 'success');
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification(`Connection failed: ${error.message}`, 'error');
            
            connectBtn.disabled = false;
            this.updateConnectButton();
        }
    }

    async connectToStoredDevice() {
        // Try to reconnect to the last connected device
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: this.lastConnectedDevice.name }],
            optionalServices: [
                '0000180a-0000-1000-8000-00805f9b34fb', // Generic Access Service
                '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
                '0000180d-0000-1000-8000-00805f9b34fb'  // Device Information Service
            ]
        });
        return device;
    }

    async showDeviceSelectionModal() {
        return new Promise((resolve) => {
            // Create device selection modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Select Thermal Printer</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="device-selection">
                            ${this.lastConnectedDevice ? `
                                <div class="last-device">
                                    <h4>Last Connected Device</h4>
                                    <div class="device-item">
                                        <div class="device-info">
                                            <h4>${this.lastConnectedDevice.name}</h4>
                                            <p>Last used: ${new Date(this.lastConnectedDevice.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button id="quickConnectBtn" class="btn btn-success">Quick Connect</button>
                                    </div>
                                </div>
                                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e1e8ed;">
                            ` : ''}
                            <div class="connection-options">
                                <button id="scanBtn" class="btn btn-primary">Scan for Devices</button>
                                <button id="pairedBtn" class="btn btn-secondary">Show Paired Devices</button>
                            </div>
                            <div id="deviceList" class="device-list">
                                <p class="empty-devices">Click "Scan for Devices" or "Show Paired Devices" to see available printers</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancelDeviceBtn" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const deviceList = modal.querySelector('#deviceList');
            const scanBtn = modal.querySelector('#scanBtn');
            const pairedBtn = modal.querySelector('#pairedBtn');
            const cancelBtn = modal.querySelector('#cancelDeviceBtn');
            const quickConnectBtn = modal.querySelector('#quickConnectBtn');
            
            // Quick connect to last device
            if (quickConnectBtn) {
                quickConnectBtn.addEventListener('click', async () => {
                    try {
                        quickConnectBtn.disabled = true;
                        quickConnectBtn.innerHTML = '<span class="loading"></span> Connecting...';
                        
                        const device = await this.connectToStoredDevice();
                        modal.remove();
                        resolve(device);
                        
                    } catch (error) {
                        console.error('Quick connect failed:', error);
                        this.showNotification(`Quick connect failed: ${error.message}`, 'error');
                        quickConnectBtn.disabled = false;
                        quickConnectBtn.textContent = 'Quick Connect';
                    }
                });
            }
            
            // Scan for devices
            scanBtn.addEventListener('click', async () => {
                try {
                    scanBtn.disabled = true;
                    scanBtn.innerHTML = '<span class="loading"></span> Scanning...';
                    
                    // Clear previous results
                    deviceList.innerHTML = '<p class="empty-devices">Scanning for devices...</p>';
                    
                    // Try different scanning approaches
                    let device = null;
                    
                    // First try: Scan with specific filters
                    try {
                        device = await navigator.bluetooth.requestDevice({
                            filters: [
                                { namePrefix: 'M35' },
                                { namePrefix: 'Micro' },
                                { namePrefix: 'Thermal' },
                                { namePrefix: 'Printer' },
                                { namePrefix: 'POS' },
                                { namePrefix: 'BT' },
                                { namePrefix: 'Bluetooth' }
                            ],
                            optionalServices: [
                                '0000180a-0000-1000-8000-00805f9b34fb', // Generic Access Service
                                '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
                                '0000180d-0000-1000-8000-00805f9b34fb', // Device Information Service
                                '0000ffe0-0000-1000-8000-00805f9b34fb'  // Common printer service
                            ]
                        });
                    } catch (filterError) {
                        console.log('Filtered scan failed, trying acceptAllDevices...');
                        
                        // Second try: Accept all devices (user will see all nearby devices)
                        try {
                            device = await navigator.bluetooth.requestDevice({
                                acceptAllDevices: true,
                                optionalServices: [
                                    '0000180a-0000-1000-8000-00805f9b34fb',
                                    '0000180f-0000-1000-8000-00805f9b34fb',
                                    '0000180d-0000-1000-8000-00805f9b34fb',
                                    '0000ffe0-0000-1000-8000-00805f9b34fb'
                                ]
                            });
                        } catch (acceptAllError) {
                            throw new Error('No devices found or user cancelled selection');
                        }
                    }
                    
                    if (device) {
                        this.addDeviceToList(deviceList, device, () => {
                            modal.remove();
                            resolve(device);
                        });
                    } else {
                        throw new Error('No device selected');
                    }
                    
                } catch (error) {
                    console.error('Scan failed:', error);
                    let errorMessage = 'Scan failed: ';
                    
                    if (error.name === 'NotFoundError') {
                        errorMessage += 'No devices found. Make sure your printer is turned on and in pairing mode.';
                    } else if (error.name === 'SecurityError') {
                        errorMessage += 'Bluetooth access denied. Please allow Bluetooth access and try again.';
                    } else if (error.name === 'NotSupportedError') {
                        errorMessage += 'Bluetooth is not supported on this device.';
                    } else if (error.message.includes('cancelled')) {
                        errorMessage += 'Device selection was cancelled.';
                    } else {
                        errorMessage += error.message;
                    }
                    
                    deviceList.innerHTML = `
                        <div class="error-message">
                            <h4>❌ Scan Failed</h4>
                            <p>${errorMessage}</p>
                            <div class="troubleshooting">
                                <h5>Troubleshooting:</h5>
                                <ul>
                                    <li>Make sure your thermal printer is turned on</li>
                                    <li>Put the printer in pairing mode</li>
                                    <li>Ensure Bluetooth is enabled on your device</li>
                                    <li>Try moving closer to the printer</li>
                                    <li>Check if the printer is already connected to another device</li>
                                </ul>
                            </div>
                        </div>
                    `;
                    
                    scanBtn.disabled = false;
                    scanBtn.textContent = 'Try Again';
                }
            });
            
            // Show paired devices (if available)
            pairedBtn.addEventListener('click', async () => {
                try {
                    pairedBtn.disabled = true;
                    pairedBtn.innerHTML = '<span class="loading"></span> Loading...';
                    
                    // Check Bluetooth availability
                    if (navigator.bluetooth.getAvailability) {
                        const available = await navigator.bluetooth.getAvailability();
                        if (!available) {
                            throw new Error('Bluetooth is not available on this device');
                        }
                    }
                    
                    // Show information about paired devices
                    deviceList.innerHTML = `
                        <div class="paired-info">
                            <h4>📱 Paired Devices Information</h4>
                            <p>Web Bluetooth has limitations with showing paired devices. Here's how to connect:</p>
                            
                            <div class="connection-steps">
                                <h5>Method 1: Direct Scan</h5>
                                <ol>
                                    <li>Make sure your Micro M35 printer is turned on</li>
                                    <li>Put the printer in pairing mode (usually hold power button for 3-5 seconds)</li>
                                    <li>Click "Scan for Devices" above</li>
                                    <li>Select your printer from the list</li>
                                </ol>
                                
                                <h5>Method 2: Manual Pairing</h5>
                                <ol>
                                    <li>Pair your printer with your device through system Bluetooth settings first</li>
                                    <li>Then use "Scan for Devices" to find it</li>
                                </ol>
                                
                                <h5>Common Printer Names to Look For:</h5>
                                <ul>
                                    <li>M35</li>
                                    <li>Micro M35</li>
                                    <li>Thermal Printer</li>
                                    <li>POS Printer</li>
                                    <li>BT Printer</li>
                                </ul>
                            </div>
                            
                            <div class="troubleshooting-tips">
                                <h5>💡 Troubleshooting Tips:</h5>
                                <ul>
                                    <li>Ensure your printer is within 10 feet</li>
                                    <li>Check if the printer is already connected to another device</li>
                                    <li>Try restarting the printer</li>
                                    <li>Make sure you're using Chrome or Edge browser</li>
                                </ul>
                            </div>
                        </div>
                    `;
                    
                    pairedBtn.disabled = false;
                    pairedBtn.textContent = 'Show Paired Devices';
                    
                } catch (error) {
                    console.error('Paired devices failed:', error);
                    deviceList.innerHTML = `
                        <div class="error-message">
                            <h4>❌ Cannot Access Paired Devices</h4>
                            <p>Error: ${error.message}</p>
                            <p>Please try using "Scan for Devices" instead.</p>
                        </div>
                    `;
                    pairedBtn.disabled = false;
                    pairedBtn.textContent = 'Show Paired Devices';
                }
            });
            
            // Cancel button
            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(null);
                }
            });
        });
    }

    addDeviceToList(deviceList, device, onSelect) {
        const deviceItem = document.createElement('div');
        deviceItem.className = 'device-item';
        deviceItem.innerHTML = `
            <div class="device-info">
                <h4>${device.name || 'Unknown Device'}</h4>
                <p>ID: ${device.id}</p>
                <p>Connected: ${device.gatt.connected ? 'Yes' : 'No'}</p>
            </div>
            <button class="btn btn-primary">Select</button>
        `;
        
        deviceItem.querySelector('button').addEventListener('click', () => {
            onSelect();
        });
        
        // Clear empty message if present
        const emptyMsg = deviceList.querySelector('.empty-devices, .paired-info');
        if (emptyMsg) {
            emptyMsg.remove();
        }
        
        deviceList.appendChild(deviceItem);
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
            
            if (this.printer.testMode) {
                // Test mode - just show the receipt content
                console.log('Test Mode - Receipt Content:');
                console.log(receiptContent);
                this.showNotification('Test Mode: Receipt content logged to console', 'info');
            } else {
                // Real printer mode
                await this.sendToPrinter(receiptContent);
                this.showNotification('Receipt printed successfully!', 'success');
            }
            
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
        if (!this.printer || !this.printer.connected) {
            throw new Error('Printer not connected');
        }

        if (this.printer.testMode) {
            // Test mode - just log the data
            console.log(`Test Mode - Would send ${data.length} bytes to printer:`, data);
            return Promise.resolve();
        }

        try {
            // Get the GATT server
            const server = this.printer.server;
            
            // Common services for thermal printers
            const services = [
                '0000180a-0000-1000-8000-00805f9b34fb', // Generic Access Service
                '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
                '0000180d-0000-1000-8000-00805f9b34fb', // Device Information Service
                '0000ffe0-0000-1000-8000-00805f9b34fb', // Common printer service
                '0000ff00-0000-1000-8000-00805f9b34fb'  // Alternative printer service
            ];

            let writeCharacteristic = null;

            // Try to find a writable characteristic
            for (const serviceUUID of services) {
                try {
                    const service = await server.getPrimaryService(serviceUUID);
                    const characteristics = await service.getCharacteristics();
                    
                    for (const char of characteristics) {
                        if (char.properties.write || char.properties.writeWithoutResponse) {
                            writeCharacteristic = char;
                            console.log(`Found writable characteristic in service ${serviceUUID}`);
                            break;
                        }
                    }
                    
                    if (writeCharacteristic) break;
                } catch (error) {
                    console.log(`Service ${serviceUUID} not available:`, error.message);
                    continue;
                }
            }

            if (!writeCharacteristic) {
                // Fallback: try to find any characteristic that can write
                const allServices = await server.getPrimaryServices();
                for (const service of allServices) {
                    const characteristics = await service.getCharacteristics();
                    for (const char of characteristics) {
                        if (char.properties.write || char.properties.writeWithoutResponse) {
                            writeCharacteristic = char;
                            console.log(`Found fallback writable characteristic in service ${service.uuid}`);
                            break;
                        }
                    }
                    if (writeCharacteristic) break;
                }
            }

            if (!writeCharacteristic) {
                throw new Error('No writable characteristic found. The printer may not support the required Bluetooth services.');
            }

            // Send data in chunks to avoid buffer overflow
            const chunkSize = 20; // Small chunks for better compatibility
            const dataArray = Array.from(data);
            
            console.log(`Sending ${data.length} bytes to printer in ${Math.ceil(dataArray.length / chunkSize)} chunks`);
            console.log(`Using characteristic: ${writeCharacteristic.uuid}`);
            console.log(`Characteristic properties:`, writeCharacteristic.properties);
            
            for (let i = 0; i < dataArray.length; i += chunkSize) {
                const chunk = dataArray.slice(i, i + chunkSize);
                const chunkBuffer = new Uint8Array(chunk);
                
                try {
                    if (writeCharacteristic.properties.writeWithoutResponse) {
                        await writeCharacteristic.writeValueWithoutResponse(chunkBuffer);
                        console.log(`Sent chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(dataArray.length / chunkSize)} (${chunk.length} bytes) - writeWithoutResponse`);
                    } else if (writeCharacteristic.properties.write) {
                        await writeCharacteristic.writeValue(chunkBuffer);
                        console.log(`Sent chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(dataArray.length / chunkSize)} (${chunk.length} bytes) - write`);
                    } else {
                        throw new Error('Characteristic does not support writing');
                    }
                    
                    // Small delay between chunks
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                } catch (chunkError) {
                    console.error(`Error sending chunk ${Math.floor(i / chunkSize) + 1}:`, chunkError);
                    throw new Error(`Failed to send data chunk: ${chunkError.message}`);
                }
            }

            console.log('All data sent successfully to printer');
            
        } catch (error) {
            console.error('Bluetooth communication error:', error);
            throw new Error(`Failed to send data to printer: ${error.message}`);
        }
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
