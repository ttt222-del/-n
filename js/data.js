// ==================== 数据模块 ====================

// 菜品数据
const menuData = [
    // 主食
    {
        id: 1,
        name: "招牌炒饭",
        category: "staple",
        price: 28,
        description: "秘制酱料炒制，配以鲜虾仁、火腿丁、青豆等",
        image: "🍚",
        hot: true,
        sales: 156
    },
    {
        id: 2,
        name: "红烧牛肉面",
        category: "staple",
        price: 32,
        description: "浓郁牛肉汤底，搭配手擀面条，大块牛肉",
        image: "🍜",
        hot: true,
        sales: 189
    },
    {
        id: 3,
        name: "扬州炒饭",
        category: "staple",
        price: 22,
        description: "经典扬州风味，蛋香浓郁，粒粒分明",
        image: "🍚",
        hot: false,
        sales: 98
    },
    {
        id: 4,
        name: "担担面",
        category: "staple",
        price: 26,
        description: "四川风味，麻辣鲜香，花生碎点缀",
        image: "🍜",
        hot: false,
        sales: 76
    },
    
    // 荤菜
    {
        id: 5,
        name: "宫保鸡丁",
        category: "meat",
        price: 38,
        description: "鸡肉嫩滑，花生酥脆，甜辣可口",
        image: "🍗",
        hot: true,
        sales: 203
    },
    {
        id: 6,
        name: "红烧肉",
        category: "meat",
        price: 48,
        description: "五花肉炖至软糯，色泽红亮，肥而不腻",
        image: "🥩",
        hot: true,
        sales: 167
    },
    {
        id: 7,
        name: "糖醋里脊",
        category: "meat",
        price: 42,
        description: "外酥里嫩，酸甜适口，老少皆宜",
        image: "🍖",
        hot: false,
        sales: 134
    },
    {
        id: 8,
        name: "水煮鱼",
        category: "meat",
        price: 58,
        description: "鲜嫩鱼片，麻辣汤底，配菜丰富",
        image: "🐟",
        hot: false,
        sales: 112
    },
    {
        id: 9,
        name: "回锅肉",
        category: "meat",
        price: 36,
        description: "川菜经典，蒜苗爆香，肉片卷曲入味",
        image: "🥩",
        hot: false,
        sales: 89
    },
    
    // 素菜
    {
        id: 10,
        name: "干煸四季豆",
        category: "vegetable",
        price: 22,
        description: "四季豆干煸至微焦，肉末提香",
        image: "🥬",
        hot: false,
        sales: 67
    },
    {
        id: 11,
        name: "麻婆豆腐",
        category: "vegetable",
        price: 24,
        description: "豆腐嫩滑，麻辣鲜香，下饭神器",
        image: "🧊",
        hot: true,
        sales: 145
    },
    {
        id: 12,
        name: "清炒时蔬",
        category: "vegetable",
        price: 18,
        description: "应季新鲜蔬菜，清淡爽口",
        image: "🥦",
        hot: false,
        sales: 56
    },
    {
        id: 13,
        name: "地三鲜",
        category: "vegetable",
        price: 26,
        description: "土豆、茄子、青椒，东北家常菜",
        image: "🍆",
        hot: false,
        sales: 78
    },
    
    // 汤品
    {
        id: 14,
        name: "番茄蛋花汤",
        category: "soup",
        price: 16,
        description: "酸甜开胃，蛋花细腻",
        image: "🍲",
        hot: false,
        sales: 89
    },
    {
        id: 15,
        name: "酸辣汤",
        category: "soup",
        price: 18,
        description: "酸辣可口，暖胃佳品",
        image: "🥣",
        hot: false,
        sales: 67
    },
    {
        id: 16,
        name: "排骨莲藕汤",
        category: "soup",
        price: 38,
        description: "慢炖2小时，汤鲜味美，营养丰富",
        image: "🍖",
        hot: true,
        sales: 98
    },
    
    // 饮品
    {
        id: 17,
        name: "柠檬水",
        category: "drink",
        price: 12,
        description: "新鲜柠檬，冰爽解渴",
        image: "🍋",
        hot: false,
        sales: 134
    },
    {
        id: 18,
        name: "酸梅汤",
        category: "drink",
        price: 15,
        description: "传统酸梅汤，消暑解腻",
        image: "🫐",
        hot: true,
        sales: 178
    },
    {
        id: 19,
        name: "鲜榨橙汁",
        category: "drink",
        price: 18,
        description: "现榨橙汁，维C满满",
        image: "🍊",
        hot: false,
        sales: 89
    },
    {
        id: 20,
        name: "可乐/雪碧",
        category: "drink",
        price: 8,
        description: "经典碳酸饮料",
        image: "🥤",
        hot: false,
        sales: 201
    },
    
    // 甜点
    {
        id: 21,
        name: "芒果布丁",
        category: "dessert",
        price: 22,
        description: "香甜芒果，嫩滑布丁",
        image: "🍮",
        hot: true,
        sales: 123
    },
    {
        id: 22,
        name: "红豆双皮奶",
        category: "dessert",
        price: 20,
        description: "奶香浓郁，红豆软糯",
        image: "🍨",
        hot: false,
        sales: 89
    },
    {
        id: 23,
        name: "巧克力熔岩蛋糕",
        category: "dessert",
        price: 28,
        description: "外酥内流，巧克力控最爱",
        image: "🍫",
        hot: false,
        sales: 67
    }
];

// 订单状态
const orderStatus = {
    pending: { text: '待确认', class: 'status-pending', icon: 'clock' },
    preparing: { text: '制作中', class: 'status-preparing', icon: 'utensils' },
    ready: { text: '待出餐', class: 'status-ready', icon: 'bell' },
    completed: { text: '已完成', class: 'status-completed', icon: 'check-circle' }
};

// 生成订单号
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DD${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

// 本地存储管理
const Storage = {
    // 获取订单
    getOrders() {
        const orders = localStorage.getItem('restaurant_orders');
        return orders ? JSON.parse(orders) : [];
    },
    
    // 保存订单
    saveOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order);
        localStorage.setItem('restaurant_orders', JSON.stringify(orders));
        return order;
    },
    
    // 更新订单状态
    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            orders[index].updatedAt = new Date().toISOString();
            localStorage.setItem('restaurant_orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    },
    
    // 获取今日订单
    getTodayOrders() {
        const today = new Date().toDateString();
        return this.getOrders().filter(order => 
            new Date(order.createdAt).toDateString() === today
        );
    },
    
    // 获取今日营收
    getTodayRevenue() {
        const todayOrders = this.getTodayOrders();
        return todayOrders.reduce((sum, order) => sum + order.total, 0);
    },
    
    // 获取菜品数据
    getMenuItems() {
        const items = localStorage.getItem('restaurant_menu');
        return items ? JSON.parse(items) : [...menuData];
    },
    
    // 保存菜品数据
    saveMenuItems(items) {
        localStorage.setItem('restaurant_menu', JSON.stringify(items));
    },
    
    // 生成模拟历史数据
    generateMockData() {
        const orders = this.getOrders();
        if (orders.length > 0) return; // 已有数据则不生成
        
        const tables = ['A01', 'A02', 'A03', 'A05', 'A06', 'A08', 'B01', 'B02', 'B03', 'B05', 'B06', 'B08'];
        const statuses = ['completed', 'completed', 'completed', 'completed', 'preparing', 'ready'];
        
        // 生成过去7天的订单
        for (let day = 6; day >= 0; day--) {
            const orderCount = Math.floor(Math.random() * 15) + 10; // 每天10-25单
            
            for (let i = 0; i < orderCount; i++) {
                const date = new Date();
                date.setDate(date.getDate() - day);
                date.setHours(Math.floor(Math.random() * 12) + 10); // 10点-22点
                date.setMinutes(Math.floor(Math.random() * 60));
                
                const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4个菜品
                const items = [];
                const usedIds = new Set();
                
                for (let j = 0; j < itemCount; j++) {
                    let dishId;
                    do {
                        dishId = Math.floor(Math.random() * menuData.length) + 1;
                    } while (usedIds.has(dishId));
                    usedIds.add(dishId);
                    
                    const dish = menuData.find(d => d.id === dishId);
                    if (dish) {
                        items.push({
                            id: dish.id,
                            name: dish.name,
                            price: dish.price,
                            quantity: Math.floor(Math.random() * 2) + 1
                        });
                    }
                }
                
                const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const status = day === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : 'completed';
                
                const order = {
                    id: generateOrderNumber(),
                    table: tables[Math.floor(Math.random() * tables.length)],
                    items: items,
                    total: total,
                    status: status,
                    createdAt: date.toISOString(),
                    updatedAt: date.toISOString()
                };
                
                orders.push(order);
            }
        }
        
        localStorage.setItem('restaurant_orders', JSON.stringify(orders));
    }
};

// 初始化模拟数据
Storage.generateMockData();
