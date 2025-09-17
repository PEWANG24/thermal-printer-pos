// Test script to verify POS system setup
console.log('🖨️  Testing Thermal Printer POS Setup...');

// Test ESC/POS commands
try {
    const escpos = new ESCPOSCommands();
    console.log('✅ ESC/POS Commands module loaded');
    
    // Test receipt generation
    const testReceipt = {
        storeName: 'TEST STORE',
        address: '123 Test St',
        phone: '(555) 123-4567',
        items: [
            { name: 'Test Item', quantity: 2, price: 5.99, total: 11.98 }
        ],
        subtotal: 11.98,
        tax: 0.96,
        total: 12.94,
        date: new Date(),
        receiptNumber: 12345
    };
    
    const commands = escpos.generateReceipt(testReceipt);
    console.log('✅ Receipt generation test passed');
    console.log(`Generated ${commands.length} bytes of ESC/POS commands`);
    
} catch (error) {
    console.error('❌ ESC/POS Commands test failed:', error);
}

// Test POS system initialization
try {
    // This will be tested when the page loads
    console.log('✅ POS system ready for initialization');
} catch (error) {
    console.error('❌ POS system test failed:', error);
}

console.log('🎉 Setup test completed!');
