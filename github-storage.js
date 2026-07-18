// ==================== GitHub 云同步模块 ====================

const GitHubStorage = {
    // GitHub 配置
    config: {
        owner: 'ttt222-del',      // 您的 GitHub 用户名
        repo: '-n',               // 您的仓库名
        branch: 'main',
        token: ''                 // GitHub Token（需要用户设置）
    },
    
    // 数据文件路径
    dataPath: 'data/restaurant-data.json',
    
    // 缓存数据
    cache: null,
    cacheTime: 0,
    CACHE_DURATION: 30000, // 30秒缓存
    
    // 初始化
    init() {
        // 从 localStorage 读取 token
        this.config.token = localStorage.getItem('github_token') || '';
        
        // 从 URL 参数读取配置
        const params = new URLSearchParams(window.location.search);
        if (params.get('owner')) this.config.owner = params.get('owner');
        if (params.get('repo')) this.config.repo = params.get('repo');
        
        console.log('GitHubStorage 初始化完成');
    },
    
    // 检查是否已配置 Token
    isConfigured() {
        return this.config.token !== '';
    },
    
    // 设置 Token
    setToken(token) {
        this.config.token = token;
        localStorage.setItem('github_token', token);
    },
    
    // 获取 API 基础 URL
    getApiUrl(path = '') {
        return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
    },
    
    // 获取文件
    async getFile(path) {
        const url = this.getApiUrl(path);
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }
        
        try {
            const response = await fetch(url, { headers });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            // 解码 Base64 内容
            const content = atob(data.content);
            return {
                content: JSON.parse(content),
                sha: data.sha
            };
        } catch (error) {
            console.error('获取文件失败:', error);
            return null;
        }
    },
    
    // 保存文件
    async saveFile(path, content, sha = null) {
        if (!this.config.token) {
            throw new Error('请先配置 GitHub Token');
        }
        
        const url = this.getApiUrl(path);
        const body = {
            message: `更新数据 ${new Date().toLocaleString('zh-CN')}`,
            content: btoa(JSON.stringify(content, null, 2)),
            branch: this.config.branch
        };
        
        if (sha) {
            body.sha = sha;
        }
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('保存文件失败:', error);
            throw error;
        }
    },
    
    // 加载数据（带缓存）
    async loadData() {
        // 检查缓存
        if (this.cache && (Date.now() - this.cacheTime) < this.CACHE_DURATION) {
            return this.cache;
        }
        
        // 从 GitHub 获取
        const result = await this.getFile(this.dataPath);
        
        if (result) {
            this.cache = result.content;
            this.cacheTime = Date.now();
            this.cache._sha = result.sha;
            return this.cache;
        }
        
        // 返回默认数据
        return this.getDefaultData();
    },
    
    // 保存数据
    async saveData(data) {
        // 获取当前 SHA
        const current = await this.getFile(this.dataPath);
        const sha = current ? current.sha : null;
        
        // 保存到 GitHub
        await this.saveFile(this.dataPath, data, sha);
        
        // 更新缓存
        this.cache = data;
        this.cacheTime = Date.now();
        
        return true;
    },
    
    // 获取默认数据
    getDefaultData() {
        return {
            menu: [],
            orders: [],
            tables: ['A01', 'A02', 'A03', 'A05', 'A06', 'A08', 'B01', 'B02', 'B03', 'B05', 'B06', 'B08'],
            lastUpdate: new Date().toISOString()
        };
    },
    
    // 菜品操作
    async getMenuItems() {
        const data = await this.loadData();
        return data.menu || [];
    },
    
    async saveMenuItems(items) {
        const data = await this.loadData();
        data.menu = items;
        data.lastUpdate = new Date().toISOString();
        return await this.saveData(data);
    },
    
    async addMenuItem(item) {
        const data = await this.loadData();
        if (!data.menu) data.menu = [];
        
        item.id = data.menu.length > 0 ? Math.max(...data.menu.map(i => i.id)) + 1 : 1;
        data.menu.push(item);
        data.lastUpdate = new Date().toISOString();
        
        return await this.saveData(data);
    },
    
    async updateMenuItem(id, updates) {
        const data = await this.loadData();
        const index = data.menu.findIndex(item => item.id === id);
        
        if (index !== -1) {
            data.menu[index] = { ...data.menu[index], ...updates };
            data.lastUpdate = new Date().toISOString();
            return await this.saveData(data);
        }
        
        throw new Error('菜品不存在');
    },
    
    async deleteMenuItem(id) {
        const data = await this.loadData();
        data.menu = data.menu.filter(item => item.id !== id);
        data.lastUpdate = new Date().toISOString();
        return await this.saveData(data);
    },
    
    // 订单操作
    async getOrders() {
        const data = await this.loadData();
        return data.orders || [];
    },
    
    async addOrder(order) {
        const data = await this.loadData();
        if (!data.orders) data.orders = [];
        
        data.orders.unshift(order);
        data.lastUpdate = new Date().toISOString();
        
        return await this.saveData(data);
    },
    
    async updateOrderStatus(orderId, status) {
        const data = await this.loadData();
        const index = data.orders.findIndex(o => o.id === orderId);
        
        if (index !== -1) {
            data.orders[index].status = status;
            data.orders[index].updatedAt = new Date().toISOString();
            data.lastUpdate = new Date().toISOString();
            return await this.saveData(data);
        }
        
        throw new Error('订单不存在');
    },
    
    // 获取今日订单
    async getTodayOrders() {
        const orders = await this.getOrders();
        const today = new Date().toDateString();
        return orders.filter(order => new Date(order.createdAt).toDateString() === today);
    },
    
    // 获取今日营收
    async getTodayRevenue() {
        const todayOrders = await this.getTodayOrders();
        return todayOrders.reduce((sum, order) => sum + order.total, 0);
    },
    
    // 初始化默认菜品数据
    async initDefaultMenu() {
        const data = await this.loadData();
        
        // 如果已有菜品数据，不重复初始化
        if (data.menu && data.menu.length > 0) {
            return false;
        }
        
        // 默认菜品
        data.menu = [
            { id: 1, name: "招牌炒饭", category: "staple", price: 28, description: "秘制酱料炒制，配以鲜虾仁、火腿丁、青豆等", image: "🍚", hot: true, sales: 156, available: true },
            { id: 2, name: "红烧牛肉面", category: "staple", price: 32, description: "浓郁牛肉汤底，搭配手擀面条，大块牛肉", image: "🍜", hot: true, sales: 189, available: true },
            { id: 3, name: "扬州炒饭", category: "staple", price: 22, description: "经典扬州风味，蛋香浓郁，粒粒分明", image: "🍚", hot: false, sales: 98, available: true },
            { id: 4, name: "宫保鸡丁", category: "meat", price: 38, description: "鸡肉嫩滑，花生酥脆，甜辣可口", image: "🍗", hot: true, sales: 203, available: true },
            { id: 5, name: "红烧肉", category: "meat", price: 48, description: "五花肉炖至软糯，色泽红亮，肥而不腻", image: "🥩", hot: true, sales: 167, available: true },
            { id: 6, name: "糖醋里脊", category: "meat", price: 42, description: "外酥里嫩，酸甜适口，老少皆宜", image: "🍖", hot: false, sales: 134, available: true },
            { id: 7, name: "水煮鱼", category: "meat", price: 58, description: "鲜嫩鱼片，麻辣汤底，配菜丰富", image: "🐟", hot: false, sales: 112, available: true },
            { id: 8, name: "麻婆豆腐", category: "vegetable", price: 24, description: "豆腐嫩滑，麻辣鲜香，下饭神器", image: "🧊", hot: true, sales: 145, available: true },
            { id: 9, name: "清炒时蔬", category: "vegetable", price: 18, description: "应季新鲜蔬菜，清淡爽口", image: "🥦", hot: false, sales: 56, available: true },
            { id: 10, name: "番茄蛋花汤", category: "soup", price: 16, description: "酸甜开胃，蛋花细腻", image: "🍲", hot: false, sales: 89, available: true },
            { id: 11, name: "排骨莲藕汤", category: "soup", price: 38, description: "慢炖2小时，汤鲜味美，营养丰富", image: "🍖", hot: true, sales: 98, available: true },
            { id: 12, name: "柠檬水", category: "drink", price: 12, description: "新鲜柠檬，冰爽解渴", image: "🍋", hot: false, sales: 134, available: true },
            { id: 13, name: "酸梅汤", category: "drink", price: 15, description: "传统酸梅汤，消暑解腻", image: "🫐", hot: true, sales: 178, available: true },
            { id: 14, name: "芒果布丁", category: "dessert", price: 22, description: "香甜芒果，嫩滑布丁", image: "🍮", hot: true, sales: 123, available: true }
        ];
        
        data.lastUpdate = new Date().toISOString();
        await this.saveData(data);
        return true;
    }
};

// 初始化
GitHubStorage.init();
