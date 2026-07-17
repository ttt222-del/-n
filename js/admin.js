// ==================== 商家后台应用 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 侧边栏元素
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const mainContent = document.getElementById('mainContent');
    const pageTitle = document.getElementById('pageTitle');
    const currentTime = document.getElementById('currentTime');
    
    // 页面元素
    const pages = {
        dashboard: document.getElementById('dashboardPage'),
        orders: document.getElementById('ordersPage'),
        menu: document.getElementById('menuPage'),
        revenue: document.getElementById('revenuePage'),
        tables: document.getElementById('tablesPage')
    };
    
    // 图表实例
    let revenueChart = null;
    let topDishesChart = null;
    let revenueTrendChart = null;
    
    // 初始化
    init();
    
    function init() {
        updateClock();
        setInterval(updateClock, 1000);
        setupEventListeners();
        loadDashboard();
    }
    
    // 更新时钟
    function updateClock() {
        const now = new Date();
        currentTime.textContent = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 侧边栏切换
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
        
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
        
        // 导航切换
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                switchPage(page);
            });
        });
        
        // 查看全部订单
        document.querySelectorAll('.view-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('orders');
            });
        });
        
        // 刷新订单
        document.getElementById('refreshOrders').addEventListener('click', loadOrders);
        
        // 筛选订单
        document.getElementById('filterOrdersBtn').addEventListener('click', loadOrders);
        
        // 添加菜品
        document.getElementById('addDishBtn').addEventListener('click', showAddDishModal);
        
        // 菜品表单
        document.getElementById('dishForm').addEventListener('submit', handleDishSubmit);
        document.getElementById('dishModalClose').addEventListener('click', closeDishModal);
        document.getElementById('dishFormCancel').addEventListener('click', closeDishModal);
        
        // 订单详情弹窗
        document.getElementById('orderDetailClose').addEventListener('click', closeOrderDetailModal);
        document.getElementById('orderDetailCancel').addEventListener('click', closeOrderDetailModal);
        document.getElementById('printOrderBtn').addEventListener('click', () => {
            alert('小票打印功能需要连接打印机');
        });
        
        // 营收图表周期
        document.getElementById('revenueChartPeriod').addEventListener('change', loadRevenueTrend);
    }
    
    // 切换页面
    function switchPage(page) {
        // 隐藏所有页面
        Object.values(pages).forEach(p => p.style.display = 'none');
        
        // 更新导航状态
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // 显示目标页面
        pages[page].style.display = 'block';
        
        // 更新标题
        const titles = {
            dashboard: '今日概览',
            orders: '订单管理',
            menu: '菜品管理',
            revenue: '营收统计',
            tables: '桌台管理'
        };
        pageTitle.textContent = titles[page];
        
        // 加载页面数据
        switch(page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'menu':
                loadMenuManagement();
                break;
            case 'revenue':
                loadRevenuePage();
                break;
            case 'tables':
                loadTablesPage();
                break;
        }
        
        // 移动端关闭侧边栏
        sidebar.classList.remove('mobile-open');
    }
    
    // ==================== 今日概览 ====================
    function loadDashboard() {
        const todayOrders = Storage.getTodayOrders();
        const todayRevenue = Storage.getTodayRevenue();
        const pendingOrders = todayOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
        const avgPrice = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
        
        // 更新统计卡片
        document.getElementById('todayRevenue').textContent = todayRevenue.toFixed(2);
        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('avgPrice').textContent = avgPrice.toFixed(2);
        document.getElementById('pendingOrders').textContent = pendingOrders;
        
        // 加载图表
        loadRevenueChart();
        loadTopDishesChart();
        loadRecentOrders();
    }
    
    // 营收趋势图
    function loadRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (revenueChart) {
            revenueChart.destroy();
        }
        
        // 获取最近7天数据
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
            labels.push(dayStr);
            
            const dayOrders = Storage.getOrders().filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === date.toDateString();
            });
            const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
            data.push(dayRevenue);
        }
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '营收 (元)',
                    data: data,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 热销菜品图表
    function loadTopDishesChart() {
        const ctx = document.getElementById('topDishesChart').getContext('2d');
        
        if (topDishesChart) {
            topDishesChart.destroy();
        }
        
        // 统计菜品销量
        const dishSales = {};
        Storage.getOrders().forEach(order => {
            order.items.forEach(item => {
                if (!dishSales[item.name]) {
                    dishSales[item.name] = 0;
                }
                dishSales[item.name] += item.quantity;
            });
        });
        
        // 排序取前5
        const sortedDishes = Object.entries(dishSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const colors = ['#ff6b6b', '#ffa726', '#66bb6a', '#42a5f5', '#ab47bc'];
        
        topDishesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sortedDishes.map(d => d[0]),
                datasets: [{
                    data: sortedDishes.map(d => d[1]),
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    // 最近订单
    function loadRecentOrders() {
        const tbody = document.getElementById('recentOrdersBody');
        const orders = Storage.getTodayOrders().slice(0, 10);
        
        tbody.innerHTML = orders.map(order => {
            const statusInfo = orderStatus[order.status] || orderStatus.pending;
            const orderTime = new Date(order.createdAt);
            const itemNames = order.items.map(i => i.name).join(', ');
            
            return `
                <tr>
                    <td><span class="order-id">${order.id.substring(0, 14)}...</span></td>
                    <td>${order.table}</td>
                    <td><span class="items-preview">${itemNames}</span></td>
                    <td><strong>¥${order.total.toFixed(2)}</strong></td>
                    <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                    <td>${orderTime.toLocaleTimeString('zh-CN')}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${order.status === 'pending' ? `
                            <button class="action-btn accept-btn" data-id="${order.id}">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        // 绑定按钮事件
        tbody.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => showOrderDetail(btn.dataset.id));
        });
        
        tbody.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'preparing'));
        });
    }
    
    // ==================== 订单管理 ====================
    function loadOrders() {
        const container = document.getElementById('ordersList');
        const statusFilter = document.getElementById('orderStatusFilter').value;
        const dateFilter = document.getElementById('orderDateFilter').value;
        
        let orders = Storage.getOrders();
        
        // 状态筛选
        if (statusFilter !== 'all') {
            orders = orders.filter(order => order.status === statusFilter);
        }
        
        // 日期筛选
        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            orders = orders.filter(order => new Date(order.createdAt).toDateString() === filterDate);
        }
        
        container.innerHTML = orders.map(order => {
            const statusInfo = orderStatus[order.status] || orderStatus.pending;
            const orderTime = new Date(order.createdAt);
            
            return `
                <div class="order-card">
                    <div class="order-card-header">
                        <div class="order-card-info">
                            <span class="order-card-number">${order.id}</span>
                            <span class="order-card-table">${order.table}</span>
                        </div>
                        <span class="status-badge ${statusInfo.class}">
                            <i class="fas fa-${statusInfo.icon}"></i> ${statusInfo.text}
                        </span>
                    </div>
                    <div class="order-card-items">
                        ${order.items.map(item => `
                            <div class="order-card-item">
                                <span>${item.name}</span>
                                <span>x${item.quantity}</span>
                                <span>¥${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-card-footer">
                        <span class="order-card-time">${orderTime.toLocaleString('zh-CN')}</span>
                        <div class="order-card-total">
                            <span>合计：</span>
                            <strong>¥${order.total.toFixed(2)}</strong>
                        </div>
                    </div>
                    <div class="order-card-actions">
                        <button class="action-btn detail-btn" data-id="${order.id}">
                            <i class="fas fa-info-circle"></i> 详情
                        </button>
                        ${getActionButtons(order)}
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定按钮事件
        container.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => showOrderDetail(btn.dataset.id));
        });
        
        container.querySelectorAll('.prepare-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'preparing'));
        });
        
        container.querySelectorAll('.ready-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'ready'));
        });
        
        container.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'completed'));
        });
    }
    
    // 获取操作按钮
    function getActionButtons(order) {
        switch(order.status) {
            case 'pending':
                return `<button class="action-btn prepare-btn" data-id="${order.id}">
                    <i class="fas fa-utensils"></i> 开始制作
                </button>`;
            case 'preparing':
                return `<button class="action-btn ready-btn" data-id="${order.id}">
                    <i class="fas fa-bell"></i> 出餐
                </button>`;
            case 'ready':
                return `<button class="action-btn complete-btn" data-id="${order.id}">
                    <i class="fas fa-check-circle"></i> 完成
                </button>`;
            default:
                return '';
        }
    }
    
    // 更新订单状态
    function updateOrderStatus(orderId, status) {
        Storage.updateOrderStatus(orderId, status);
        loadOrders();
        loadDashboard();
    }
    
    // 显示订单详情
    function showOrderDetail(orderId) {
        const orders = Storage.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        const statusInfo = orderStatus[order.status] || orderStatus.pending;
        const orderTime = new Date(order.createdAt);
        
        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <div class="detail-section">
                <h4>订单信息</h4>
                <p><strong>订单号：</strong>${order.id}</p>
                <p><strong>桌号：</strong>${order.table}</p>
                <p><strong>状态：</strong><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></p>
                <p><strong>下单时间：</strong>${orderTime.toLocaleString('zh-CN')}</p>
            </div>
            <div class="detail-section">
                <h4>菜品明细</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>菜品</th>
                            <th>单价</th>
                            <th>数量</th>
                            <th>小计</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>¥${item.price.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>¥${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>合计</strong></td>
                            <td><strong>¥${order.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        document.getElementById('orderDetailModal').classList.add('show');
    }
    
    // 关闭订单详情弹窗
    function closeOrderDetailModal() {
        document.getElementById('orderDetailModal').classList.remove('show');
    }
    
    // ==================== 菜品管理 ====================
    function loadMenuManagement() {
        const container = document.getElementById('menuManagement');
        const menuItems = Storage.getMenuItems();
        
        const categories = {
            staple: '主食',
            meat: '荤菜',
            vegetable: '素菜',
            soup: '汤品',
            drink: '饮品',
            dessert: '甜点'
        };
        
        // 按分类分组
        const grouped = {};
        menuItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        container.innerHTML = Object.entries(grouped).map(([category, items]) => `
            <div class="menu-category-section">
                <h3 class="category-title">${categories[category] || category}</h3>
                <div class="menu-items-grid">
                    ${items.map(item => `
                        <div class="menu-item-card">
                            <div class="menu-item-header">
                                <span class="menu-item-emoji">${item.image}</span>
                                <div class="menu-item-info">
                                    <h4>${item.name}</h4>
                                    <p class="menu-item-price">¥${item.price}</p>
                                </div>
                                ${item.hot ? '<span class="hot-badge">热销</span>' : ''}
                            </div>
                            <p class="menu-item-desc">${item.description}</p>
                            <div class="menu-item-actions">
                                <button class="edit-btn" data-id="${item.id}">
                                    <i class="fas fa-edit"></i> 编辑
                                </button>
                                <button class="toggle-btn ${item.available !== false ? 'active' : ''}" data-id="${item.id}">
                                    <i class="fas fa-${item.available !== false ? 'eye' : 'eye-slash'}"></i>
                                    ${item.available !== false ? '在售' : '下架'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // 绑定编辑按钮
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => showEditDishModal(parseInt(btn.dataset.id)));
        });
        
        // 绑定上下架按钮
        container.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleDishAvailability(parseInt(btn.dataset.id)));
        });
    }
    
    // 显示添加菜品弹窗
    function showAddDishModal() {
        document.getElementById('dishModalTitle').textContent = '添加菜品';
        document.getElementById('dishForm').reset();
        document.getElementById('dishForm').dataset.mode = 'add';
        document.getElementById('dishModal').classList.add('show');
    }
    
    // 显示编辑菜品弹窗
    function showEditDishModal(dishId) {
        const menuItems = Storage.getMenuItems();
        const dish = menuItems.find(item => item.id === dishId);
        if (!dish) return;
        
        document.getElementById('dishModalTitle').textContent = '编辑菜品';
        document.getElementById('dishName').value = dish.name;
        document.getElementById('dishCategory').value = dish.category;
        document.getElementById('dishPrice').value = dish.price;
        document.getElementById('dishDesc').value = dish.description;
        document.getElementById('dishHot').checked = dish.hot;
        document.getElementById('dishForm').dataset.mode = 'edit';
        document.getElementById('dishForm').dataset.id = dishId;
        document.getElementById('dishModal').classList.add('show');
    }
    
    // 关闭菜品弹窗
    function closeDishModal() {
        document.getElementById('dishModal').classList.remove('show');
    }
    
    // 处理菜品表单提交
    function handleDishSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const menuItems = Storage.getMenuItems();
        
        const dishData = {
            name: document.getElementById('dishName').value,
            category: document.getElementById('dishCategory').value,
            price: parseFloat(document.getElementById('dishPrice').value),
            description: document.getElementById('dishDesc').value,
            hot: document.getElementById('dishHot').checked,
            image: getCategoryEmoji(document.getElementById('dishCategory').value)
        };
        
        if (mode === 'add') {
            dishData.id = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
            dishData.sales = 0;
            dishData.available = true;
            menuItems.push(dishData);
        } else {
            const id = parseInt(form.dataset.id);
            const index = menuItems.findIndex(item => item.id === id);
            if (index !== -1) {
                menuItems[index] = { ...menuItems[index], ...dishData };
            }
        }
        
        Storage.saveMenuItems(menuItems);
        closeDishModal();
        loadMenuManagement();
    }
    
    // 获取分类表情
    function getCategoryEmoji(category) {
        const emojis = {
            staple: '🍚',
            meat: '🥩',
            vegetable: '🥬',
            soup: '🍲',
            drink: '🥤',
            dessert: '🍮'
        };
        return emojis[category] || '🍽️';
    }
    
    // 切换菜品上下架
    function toggleDishAvailability(dishId) {
        const menuItems = Storage.getMenuItems();
        const index = menuItems.findIndex(item => item.id === dishId);
        if (index !== -1) {
            menuItems[index].available = menuItems[index].available === false ? true : false;
            Storage.saveMenuItems(menuItems);
            loadMenuManagement();
        }
    }
    
    // ==================== 营收统计 ====================
    function loadRevenuePage() {
        const orders = Storage.getOrders();
        const today = new Date();
        
        // 今日营收
        const todayRevenue = orders.filter(o => new Date(o.createdAt).toDateString() === today.toDateString())
            .reduce((sum, o) => sum + o.total, 0);
        
        // 本周营收
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekRevenue = orders.filter(o => new Date(o.createdAt) >= weekStart)
            .reduce((sum, o) => sum + o.total, 0);
        
        // 本月营收
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRevenue = orders.filter(o => new Date(o.createdAt) >= monthStart)
            .reduce((sum, o) => sum + o.total, 0);
        
        document.getElementById('revenueToday').textContent = todayRevenue.toFixed(2);
        document.getElementById('revenueWeek').textContent = weekRevenue.toFixed(2);
        document.getElementById('revenueMonth').textContent = monthRevenue.toFixed(2);
        
        loadRevenueTrend();
        loadRevenueDetails();
    }
    
    // 加载营收趋势
    function loadRevenueTrend() {
        const ctx = document.getElementById('revenueTrendChart').getContext('2d');
        const period = document.getElementById('revenueChartPeriod').value;
        
        if (revenueTrendChart) {
            revenueTrendChart.destroy();
        }
        
        const days = period === 'week' ? 7 : 30;
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }));
            
            const dayOrders = Storage.getOrders().filter(order => 
                new Date(order.createdAt).toDateString() === date.toDateString()
            );
            data.push(dayOrders.reduce((sum, order) => sum + order.total, 0));
        }
        
        revenueTrendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '日营收',
                    data: data,
                    backgroundColor: 'rgba(255, 107, 107, 0.6)',
                    borderColor: '#ff6b6b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 加载营收明细
    function loadRevenueDetails() {
        const tbody = document.getElementById('revenueDetailsBody');
        const orders = Storage.getOrders();
        
        // 按日期分组
        const dailyData = {};
        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toDateString();
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = { orders: 0, revenue: 0 };
            }
            dailyData[dateStr].orders++;
            dailyData[dateStr].revenue += order.total;
        });
        
        // 排序并取最近7天
        const sortedDates = Object.keys(dailyData)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 7);
        
        tbody.innerHTML = sortedDates.map((dateStr, index) => {
            const date = new Date(dateStr);
            const dayData = dailyData[dateStr];
            
            // 计算环比
            let change = 0;
            if (index < sortedDates.length - 1) {
                const prevData = dailyData[sortedDates[index + 1]];
                if (prevData && prevData.revenue > 0) {
                    change = ((dayData.revenue - prevData.revenue) / prevData.revenue * 100);
                }
            }
            
            return `
                <tr>
                    <td>${date.toLocaleDateString('zh-CN')}</td>
                    <td>${dayData.orders}</td>
                    <td>¥${dayData.revenue.toFixed(2)}</td>
                    <td class="${change >= 0 ? 'positive' : 'negative'}">
                        ${change !== 0 ? (change >= 0 ? '+' : '') + change.toFixed(1) + '%' : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // ==================== 桌台管理 ====================
    function loadTablesPage() {
        const container = document.getElementById('tablesGrid');
        const tables = ['A01', 'A02', 'A03', 'A05', 'A06', 'A08', 'B01', 'B02', 'B03', 'B05', 'B06', 'B08'];
        const todayOrders = Storage.getTodayOrders();
        
        container.innerHTML = tables.map(table => {
            const tableOrders = todayOrders.filter(o => o.table === table);
            const activeOrder = tableOrders.find(o => o.status !== 'completed');
            const totalRevenue = tableOrders.reduce((sum, o) => sum + o.total, 0);
            
            let statusClass = 'available';
            let statusText = '空闲';
            
            if (activeOrder) {
                if (activeOrder.status === 'pending') {
                    statusClass = 'pending';
                    statusText = '待处理';
                } else if (activeOrder.status === 'preparing') {
                    statusClass = 'preparing';
                    statusText = '制作中';
                } else if (activeOrder.status === 'ready') {
                    statusClass = 'ready';
                    statusText = '待取餐';
                }
            }
            
            return `
                <div class="table-card ${statusClass}">
                    <div class="table-header">
                        <h3>${table}</h3>
                        <span class="table-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="table-info">
                        <p>今日订单：${tableOrders.length}单</p>
                        <p>今日营收：¥${totalRevenue.toFixed(2)}</p>
                    </div>
                    ${activeOrder ? `
                        <div class="table-order">
                            <p>当前订单：${activeOrder.id.substring(0, 14)}...</p>
                            <p>金额：¥${activeOrder.total.toFixed(2)}</p>
                        </div>
                    ` : ''}
                    <div class="table-actions">
                        <button class="table-action-btn" data-table="${table}">
                            <i class="fas fa-qrcode"></i> 生成二维码
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定生成二维码按钮
        container.querySelectorAll('.table-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const table = btn.dataset.table;
                alert(`已生成桌号 ${table} 的点餐二维码，请打印并放置在餐桌上。`);
            });
        });
    }
});
