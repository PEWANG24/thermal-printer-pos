// Demo data for testing the POS system
const demoProducts = [
    { id: 1, name: 'Espresso', price: 2.50, category: 'Coffee' },
    { id: 2, name: 'Cappuccino', price: 3.50, category: 'Coffee' },
    { id: 3, name: 'Latte', price: 4.00, category: 'Coffee' },
    { id: 4, name: 'Americano', price: 3.00, category: 'Coffee' },
    { id: 5, name: 'Mocha', price: 4.50, category: 'Coffee' },
    { id: 6, name: 'Tea', price: 2.00, category: 'Tea' },
    { id: 7, name: 'Green Tea', price: 2.25, category: 'Tea' },
    { id: 8, name: 'Chai Latte', price: 3.75, category: 'Tea' },
    { id: 9, name: 'Sandwich', price: 7.99, category: 'Food' },
    { id: 10, name: 'Salad', price: 8.50, category: 'Food' },
    { id: 11, name: 'Soup', price: 5.99, category: 'Food' },
    { id: 12, name: 'Muffin', price: 3.25, category: 'Pastry' },
    { id: 13, name: 'Croissant', price: 2.75, category: 'Pastry' },
    { id: 14, name: 'Cookie', price: 1.99, category: 'Pastry' },
    { id: 15, name: 'Soda', price: 2.00, category: 'Beverages' },
    { id: 16, name: 'Water', price: 1.50, category: 'Beverages' },
    { id: 17, name: 'Juice', price: 3.25, category: 'Beverages' },
    { id: 18, name: 'Energy Drink', price: 3.99, category: 'Beverages' }
];

const demoStores = [
    {
        name: 'Coffee Corner',
        address: '123 Main Street, Downtown',
        phone: '(555) 123-4567'
    },
    {
        name: 'Quick Bites Cafe',
        address: '456 Oak Avenue, Midtown',
        phone: '(555) 987-6543'
    },
    {
        name: 'Thermal Printer POS',
        address: '789 Tech Boulevard, Innovation District',
        phone: '(555) 456-7890'
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demoProducts, demoStores };
} else {
    window.demoData = { demoProducts, demoStores };
}
