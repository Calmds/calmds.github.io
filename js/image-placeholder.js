// 图片占位服务
class ImagePlaceholder {
    constructor() {
        this.screenshotPlaceholders = [
            {
                id: 1,
                title: '主界面',
                description: '清晰简洁的新闻阅读界面',
                color: '#4a6fa5',
                icon: 'fas fa-newspaper'
            },
            {
                id: 2,
                title: '阅读模式',
                description: '纯净的阅读体验，无干扰',
                color: '#6b5b95',
                icon: 'fas fa-book-reader'
            },
            {
                id: 3,
                title: '收藏管理',
                description: '轻松管理您喜欢的新闻',
                color: '#88b04b',
                icon: 'fas fa-bookmark'
            }
        ];

        this.videoThumbnails = [
            {
                id: 1,
                title: '功能演示',
                description: '了解新闻助手的主要功能和工作流程',
                color: '#ff6b6b',
                icon: 'fas fa-play-circle'
            },
            {
                id: 2,
                title: '使用教程',
                description: '快速上手新闻助手',
                color: '#4ecdc4',
                icon: 'fas fa-graduation-cap'
            }
        ];
    }

    // 生成截图占位图片
    generateScreenshotPlaceholder(index) {
        const placeholder = this.screenshotPlaceholders[index] || this.screenshotPlaceholders[0];

        // 创建Canvas生成图片
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // 背景颜色
        ctx.fillStyle = placeholder.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加渐变效果
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, placeholder.color);
        gradient.addColorStop(1, this.lightenColor(placeholder.color, 20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加图标
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '300px "Font Awesome 5 Free"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📱', canvas.width / 2, canvas.height / 2 - 50);

        // 添加标题
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(placeholder.title, canvas.width / 2, canvas.height / 2 + 80);

        // 添加描述
        ctx.font = '24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(placeholder.description, canvas.width / 2, canvas.height / 2 + 140);

        // 添加应用名称
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('新闻助手', canvas.width / 2, 100);

        return canvas.toDataURL('image/png');
    }

    // 生成视频缩略图占位
    generateVideoThumbnail(index) {
        const placeholder = this.videoThumbnails[index] || this.videoThumbnails[0];

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');

        // 背景颜色
        ctx.fillStyle = placeholder.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加渐变效果
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, placeholder.color);
        gradient.addColorStop(1, this.lightenColor(placeholder.color, 20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加播放按钮
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
        ctx.fill();

        // 添加三角形播放图标
        ctx.fillStyle = placeholder.color;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 20, canvas.height / 2 - 40);
        ctx.lineTo(canvas.width / 2 - 20, canvas.height / 2 + 40);
        ctx.lineTo(canvas.width / 2 + 40, canvas.height / 2);
        ctx.closePath();
        ctx.fill();

        // 添加标题
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(placeholder.title, canvas.width / 2, canvas.height - 80);

        return canvas.toDataURL('image/png');
    }

    // 颜色变亮
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    // 初始化占位图片
    initPlaceholders() {
        // 替换截图占位
        document.querySelectorAll('.screenshot-image img').forEach((img, index) => {
            if (img.src.includes('placeholder') || !img.src || img.src === '') {
                img.src = this.generateScreenshotPlaceholder(index);
                img.onerror = () => {
                    img.src = this.generateScreenshotPlaceholder(index);
                };
            }
        });

        // 替换视频缩略图占位
        document.querySelectorAll('video').forEach((video, index) => {
            if (video.poster && (video.poster.includes('placeholder') || !video.poster)) {
                video.poster = this.generateVideoThumbnail(index);
            }
        });
    }
}

// 创建全局实例
const imagePlaceholder = new ImagePlaceholder();