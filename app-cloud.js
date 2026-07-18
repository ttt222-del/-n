// ==================== 客户端应用（云同步版）====================

document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const menuGrid = document.getElementById('menuGrid');
    const categoryList = document.getElementById('categoryList');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartBadge = document.getElementById('cartBadge');
    const totalPrice = document.getElementById('totalPrice');
    const bottomTotalPrice = document.getElementById('bottomTotalPrice');
    const bottomCartBar = document.getElementById('bottomCartBar');
    const cartIconWrapper = document.getElementById('cartIconWrapper');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const submitOrder = document.getElementById('submitOrder');
    const orderModal = document.getElementById('orderModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    const orderSummary = document.getElementById('orderSummary');
    const modalTotalPrice = document.getElementById('modalTotalPrice');
    const successModal = document.getElementById('successModal');
    const orderNumber = document.getElementById('orderNumber');
    const successBtn = document.getElementById('successBtn');
    const historyPage = document.getElementById('historyPage');
    const historyOrders = document.getElementById('historyOrders');
    const emptyHistory = document.getElementById('emptyHistory');
    const backFromHistory = document.getElementById('backFromHistory');
    
    let currentCategory = 'all';
    let menuItems = [];
    let isCloudMode = false;
    
    // 初始化
    init();
    
    async function init() {
        // 检查是否配置了云同步
        if (GitHubStorage.isConfigured()) {
            isCloudMode = true;
            showCloudStatus('☁️ 云同步模式');
            try {
                menuItems = await GitHubStorage.getMenuItems();
                if (menuItems.length === 0) {
                    await GitHubStorage.initDefaultMenu();
                    menuItems = await GitHubStorage.getMenuItems();
                }
            } catch (error) {
                console.error('云同步失败，使用本地数据:', error);
                menuItems = Storage.getMenuItems();
                isCloudMode = false;
                showCloudStatus('⚠️ 云同步失败，使用本地数据');
            }
        } else {
            menuItems = Storage.getMenuItems();
            showCloudStatus('💾 本地模式（点击右上角设置开启云同步）');
        }
        
        // 从 URL 获取桌号
        const urlParams = new URLSearchParams(window.location.search);
        const tableParam = urlParams.get('table');
        if (tableParam) {
            document.getElementById('table-number').textContent = tableParam;
        }
        
        renderMenu();
        setupEventListeners();
        updateCartUI();
    }
    
    // 显示云状态
    function showCloudStatus(text) {
        let statusEl = document.getElementById('cloudStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'cloudStatus';
            statusEl.style.cssText = 'position:fixed;top:5px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:white;padding:5px 15px;border-radius:15px;font-size:12px;z-index:1000;';
            document.body.appendChild(statusEl);
        }
        statusEl.textContent = text;
    }
    
    // 渲染菜单
    function renderMenu(category = 'all') {
        currentCategory = category;
        let filteredItems = menuItems;
        
        if (category === 'hot') {
            filteredItems = menuItems.filter(item => item.hot);
        } else if (category !== 'all') {
            filteredItems = menuItems.filter(item => item.category === category);
        }
        
        // 只显示上架的菜品
        filteredItems = filteredItems.filter(item => item.available !== false);
        
        menuGrid.innerHTML = filteredItems.map(item => `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-image">${item.image}</div>
                <div class="menu-info">
                    <h3 class="menu-name">
                        ${item.name}
                        ${item.hot ? '<span class="hot-badge">热销</span>' : ''}
                    </h3>
                    <p class="menu-desc">${item.description}</p>
                    <div class="menu-bottom">
                        <span class="menu-price">¥${item.price}</span>
                        <div class="quantity-control" data-id="${item.id}">
                            <button class="qty-btn minus" data-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-value" data-id="${item.id}">${cart.getItemQuantity(item.id)}</span>
                            <button class="qty-btn plus" data-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 绑定数量控制按钮事件
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const dish = menuItems.find(item => item.id === id);
                if (dish) {
                    cart.addItem(dish);
                    updateQuantityDisplay(id);
                }
            });
        });
        
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                cart.decrement(id);
                updateQuantityDisplay(id);
            });
        });
    }
    
    // 更新数量显示
    function updateQuantityDisplay(dishId) {
        const qtyElements = document.querySelectorAll(`.qty-value[data-id="${dishId}"]`);
        const quantity = cart.getItemQuantity(dishId);
        qtyElements.forEach(el => {
            el.textContent = quantity;
            if (quantity > 0) {
                el.parentElement.classList.add('has-items');
            } else {
                el.parentElement.classList.remove('has-items');
            }
        });
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 分类切换
        categoryList.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (btn) {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMenu(btn.dataset.category);
            }
        });
        
        // 打开购物车
        cartIconWrapper.addEventListener('click', openCart);
        checkoutBtn.addEventListener('click', openCart);
        
        // 关闭购物车
        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
        
        // 提交订单
        submitOrder.addEventListener('click', showOrderConfirm);
        
        // 订单确认弹窗
        modalClose.addEventListener('click', () => orderModal.classList.remove('show'));
        modalCancel.addEventListener('click', () => orderModal.classList.remove('show'));
        modalConfirm.addEventListener('click', submitOrderAction);
        
        // 成功弹窗
        successBtn.addEventListener('click', () => {
            successModal.classList.remove('show');
            showHistoryPage();
        });
        
        // 返回按钮
        backFromHistory.addEventListener('click', hideHistoryPage);
        
        // 购物车监听器
        cart.addListener(updateCartUI);
    }
    
    // 打开购物车
    function openCart() {
        if (cart.isEmpty()) return;
        renderCartItems();
        cartPanel.classList.add('open');
        cartOverlay.classList.add('show');
    }
    
    // 关闭购物车
    function closeCart() {
        cartPanel.classList.remove('open');
        cartOverlay.classList.remove('show');
    }
    
    // 渲染购物车商品
    function renderCartItems() {
        if (cart.isEmpty()) {
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'flex';
            submitOrder.disabled = true;
        } else {
            cartItems.style.display = 'block';
            cartEmpty.style.display = 'none';
            submitOrder.disabled = false;
            
            cartItems.innerHTML = cart.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <span class="cart-item-image">${item.image}</span>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <span class="cart-item-price">¥${item.price}</span>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-qty-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // 绑定购物车内的数量控制
            cartItems.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    cart.increment(id);
                    renderCartItems();
                    updateQuantityDisplay(id);
                });
            });
            
            cartItems.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    cart.decrement(id);
                    renderCartItems();
                    updateQuantityDisplay(id);
                });
            });
        }
    }
    
    // 更新购物车UI
    function updateCartUI() {
        const totalQty = cart.getTotalQuantity();
        const totalPrc = cart.getTotalPrice();
        
        // 更新角标
        cartBadge.textContent = totalQty;
        cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
        
        // 更新价格
        totalPrice.textContent = totalPrc.toFixed(2);
        bottomTotalPrice.textContent = totalPrc.toFixed(2);
        
        // 更新底部栏
        bottomCartBar.classList.toggle('has-items', totalQty > 0);
        checkoutBtn.disabled = totalQty === 0;
        
        // 更新所有菜品卡片上的数量
        menuItems.forEach(item => {
            updateQuantityDisplay(item.id);
        });
    }
    
    // 显示订单确认
    function showOrderConfirm() {
        closeCart();
        
        const tableNumber = document.getElementById('table-number').textContent;
        orderSummary.innerHTML = `
            <div class="order-info">
                <p><i class="fas fa-map-marker-alt"></i> 桌号：${tableNumber}</p>
                <p><i class="fas fa-clock"></i> 时间：${new Date().toLocaleString('zh-CN')}</p>
            </div>
            <div class="order-items-list">
                ${cart.items.map(item => `
                    <div class="order-item-row">
                        <span class="order-item-name">${item.image} ${item.name}</span>
                        <span class="order-item-qty">x${item.quantity}</span>
                        <span class="order-item-price">¥${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        modalTotalPrice.textContent = cart.getTotalPrice().toFixed(2);
        orderModal.classList.add('show');
    }
    
    // 提交订单
    async function submitOrderAction() {
        const tableNumber = document.getElementById('table-number').textContent;
        const order = cart.createOrder(tableNumber);
        
        try {
            if (isCloudMode) {
                // 保存到云端
                await GitHubStorage.addOrder(order);
                showCloudStatus('☁️ 订单已同步到云端');
            } else {
                // 保存到本地
                Storage.saveOrder(order);
            }
            
            // 显示成功
            orderModal.classList.remove('show');
            orderNumber.textContent = order.id;
            successModal.classList.add('show');
            
            // 清空购物车
            cart.clear();
        } catch (error) {
            console.error('保存订单失败:', error);
            alert('订单保存失败，请重试：' + error.message);
        }
    }
    
    // 显示历史订单页面
    async function showHistoryPage() {
        const elements = document.querySelectorAll('body > *:not(script):not(.page-container)');
        elements.forEach(el => {
            if (el !== historyPage) {
                el.style.display = 'none';
            }
        });
        
        historyPage.style.display = 'block';
        await renderHistoryOrders();
    }
    
    // 隐藏历史订单页面
    function hideHistoryPage() {
        historyPage.style.display = 'none';
        const elements = document.querySelectorAll('body > *:not(script):not(.page-container)');
        elements.forEach(el => {
            el.style.display = '';
        });
    }
    
    // 渲染历史订单
    async function renderHistoryOrders() {
        let orders;
        
        if (isCloudMode) {
            orders = await GitHubStorage.getOrders();
        } else {
            orders = Storage.getOrders();
        }
        
        if (orders.length === 0) {
            historyOrders.style.display = 'none';
            emptyHistory.style.display = 'flex';
            return;
        }
        
        emptyHistory.style.display = 'none';
        historyOrders.style.display = 'block';
        
        historyOrders.innerHTML = orders.map(order => {
            const statusInfo = orderStatus[order.status] || orderStatus.pending;
            const orderDate = new Date(order.createdAt);
            
            return `
                <div class="history-order-card">
                    <div class="history-order-header">
                        <div class="history-order-info">
                            <span class="history-order-number">${order.id}</span>
                            <span class="history-order-table">${order.table}</span>
                        </div>
                        <span class="status-badge ${statusInfo.class}">
                            <i class="fas fa-${statusInfo.icon}"></i> ${statusInfo.text}
                        </span>
                    </div>
                    <div class="history-order-items">
                        ${order.items.map(item => `
                            <span class="history-item">${item.name} x${item.quantity}</span>
                        `).join('')}
                    </div>
                    <div class="history-order-footer">
                        <span class="history-order-time">${orderDate.toLocaleString('zh-CN')}</span>
                        <span class="history-order-total">¥${order.total.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
});
