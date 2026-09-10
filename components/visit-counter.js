/**
 * 访问统计组件
 * 用于记录和展示页面访问数据
 */

class VisitCounterComponent {
    constructor(options = {}) {
        this.containerId = options.containerId || 'visit-counter-container';
        this.dataFile = options.dataFile || 'data/visits/count.json';
        this.autoIncrement = options.autoIncrement !== false;
        this.showDetails = options.showDetails !== false;
        this.visitData = null;
    }

    /**
     * 初始化访问计数器
     */
    async init() {
        await this.loadVisitData();
        
        if (this.autoIncrement) {
            await this.incrementVisit();
        }
        
        this.render();
    }

    /**
     * 加载访问数据
     */
    async loadVisitData() {
        try {
            const response = await fetch(this.dataFile);
            if (!response.ok) throw new Error('Failed to load visit data');
            this.visitData = await response.json();
        } catch (error) {
            console.error('Error loading visit data:', error);
            // 如果文件不存在，使用默认数据
            this.visitData = {
                total: 0,
                today: 0,
                lastUpdated: new Date().toISOString(),
                pages: {}
            };
        }
    }

    /**
     * 增加访问计数
     */
    async incrementVisit() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentPage = this.getCurrentPage();

        // 检查是否需要重置今日计数
        const lastUpdateDate = new Date(this.visitData.lastUpdated).toISOString().split('T')[0];
        if (lastUpdateDate !== todayStr) {
            this.visitData.today = 0;
        }

        // 增加总访问量
        this.visitData.total++;
        
        // 增加今日访问量
        this.visitData.today++;
        
        // 更新最后更新时间
        this.visitData.lastUpdated = now.toISOString();

        // 增加页面访问量
        if (!this.visitData.pages[currentPage]) {
            this.visitData.pages[currentPage] = 0;
        }
        this.visitData.pages[currentPage]++;

        // 保存到服务器（需要后端支持）
        await this.saveVisitData();
    }

    /**
     * 保存访问数据
     * 注意：这需要后端 API 支持，纯静态页面只能存储在本地
     */
    async saveVisitData() {
        try {
            // 对于静态网站，我们使用 localStorage 作为后备方案
            localStorage.setItem('visitData', JSON.stringify(this.visitData));
            
            // 如果有后端 API，可以在这里发送请求
            // await fetch('/api/visits', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(this.visitData)
            // });
            
            console.log('Visit data saved successfully');
        } catch (error) {
            console.error('Error saving visit data:', error);
        }
    }

    /**
     * 获取当前页面标识
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop() || 'index.html';
        return pageName;
    }

    /**
     * 格式化数字（添加千位分隔符）
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * 渲染计数器
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        const totalVisits = this.formatNumber(this.visitData.total);
        const todayVisits = this.formatNumber(this.visitData.today);
        const currentPage = this.getCurrentPage();
        const pageVisits = this.visitData.pages[currentPage] || 0;

        let html = `
            <div class="visit-counter glass-card">
                <div class="counter-header">
                    <i class="fas fa-chart-line"></i>
                    <span>访问统计</span>
                </div>
                <div class="counter-grid">
                    <div class="counter-item">
                        <div class="counter-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="counter-info">
                            <span class="counter-label">总访问量</span>
                            <span class="counter-value" id="total-visits">${totalVisits}</span>
                        </div>
                    </div>
                    <div class="counter-item">
                        <div class="counter-icon">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div class="counter-info">
                            <span class="counter-label">今日访问</span>
                            <span class="counter-value" id="today-visits">${todayVisits}</span>
                        </div>
                    </div>
        `;

        if (this.showDetails && pageVisits > 0) {
            html += `
                    <div class="counter-item">
                        <div class="counter-icon">
                            <i class="fas fa-file-page"></i>
                        </div>
                        <div class="counter-info">
                            <span class="counter-label">本页访问</span>
                            <span class="counter-value" id="page-visits">${this.formatNumber(pageVisits)}</span>
                        </div>
                    </div>
            `;
        }

        html += `
                </div>
                <div class="counter-footer">
                    <small>数据更新于：${new Date(this.visitData.lastUpdated).toLocaleString('zh-CN')}</small>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * 从 localStorage 恢复数据（用于静态页面）
     */
    restoreFromLocalStorage() {
        const saved = localStorage.getItem('visitData');
        if (saved) {
            try {
                this.visitData = JSON.parse(saved);
                return true;
            } catch (error) {
                console.error('Error restoring visit data from localStorage:', error);
            }
        }
        return false;
    }

    /**
     * 刷新显示
     */
    refresh() {
        this.render();
    }

    /**
     * 获取访问数据
     */
    getVisitData() {
        return { ...this.visitData };
    }

    /**
     * 重置计数（仅用于测试）
     */
    async reset() {
        this.visitData = {
            total: 0,
            today: 0,
            lastUpdated: new Date().toISOString(),
            pages: {}
        };
        await this.saveVisitData();
        this.render();
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitCounterComponent;
}
