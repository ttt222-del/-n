// ==================== 购物车模块 ====================

class ShoppingCart {
    constructor() {
        this.items = [];
        this.listeners = [];
    }
    
    // 添加商品
    addItem(dish, quantity = 1) {
        const existingItem = this.items.find(item => item.id === dish.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                image: dish.image,
                quantity: quantity
            });
        }
        
        this.notifyListeners();
        this.showToast(`已添加 ${dish.name}`);
        return this.items;
    }
    
    // 移除商品
    removeItem(dishId) {
        this.items = this.items.filter(item => item.id !== dishId);
        this.notifyListeners();
        return this.items;
    }
    
    // 更新数量
    updateQuantity(dishId, quantity) {
        const item = this.items.find(item => item.id === dishId);
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(dishId);
            }
            item.quantity = quantity;
            this.notifyListeners();
        }
        return this.items;
    }
    
    // 增加数量
    increment(dishId) {
        const item = this.items.find(item => item.id === dishId);
        if (item) {
            item.quantity++;
            this.notifyListeners();
        }
        return this.items;
    }
    
    // 减少数量
    decrement(dishId) {
        const item = this.items.find(item => item.id === dishId);
        if (item) {
            if (item.quantity <= 1) {
                return this.removeItem(dishId);
            }
            item.quantity--;
            this.notifyListeners();
        }
        return this.items;
    }
    
    // 获取商品数量
    getItemQuantity(dishId) {
        const item = this.items.find(item => item.id === dishId);
        return item ? item.quantity : 0;
    }
    
    // 获取总数量
    getTotalQuantity() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // 获取总价
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // 清空购物车
    clear() {
        this.items = [];
        this.notifyListeners();
        return this.items;
    }
    
    // 检查是否为空
    isEmpty() {
        return this.items.length === 0;
    }
    
    // 添加监听器
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    // 通知监听器
    notifyListeners() {
        this.listeners.forEach(callback => callback(this));
    }
    
    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    // 创建订单数据
    createOrder(tableNumber) {
        return {
            id: generateOrderNumber(),
            table: tableNumber,
            items: this.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: this.getTotalPrice(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
}

// 创建全局购物车实例
const cart = new ShoppingCart();
