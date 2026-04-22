// ==================== 粒子背景系统 ====================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4 - 0.15;
        this.opacity = Math.random() * 0.35 + 0.05;
        // 蓝天碧水色系粒子：天蓝、碧水、嫩绿
        const colorTypes = [
            () => `hsla(${200 + Math.random() * 30}, 75%, 55%, ${this.opacity})`,
            () => `hsla(${160 + Math.random() * 20}, 65%, 45%, ${this.opacity})`,
            () => `hsla(${185 + Math.random() * 20}, 80%, 50%, ${this.opacity})`,
        ];
        this._colorFn = colorTypes[Math.floor(Math.random() * colorTypes.length)];
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) {
            this.reset();
            this.y = canvas.height + 10;
        }
    }
    
    draw() {
        const color = this._colorFn();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        if (this.size > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(`, ${this.opacity})`, `, ${this.opacity * 0.15})`);
            ctx.fill();
        }
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    const maxDist = 150;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * 0.08;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(26, 154, 92, ${opacity})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    connectParticles();
    animationId = requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// ==================== 导航栏 ====================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

// 点击导航链接后关闭菜单
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// 滚动时高亮当前section
const sections = document.querySelectorAll('.section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    });
});

// ==================== 数字滚动动画 ====================
function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 2000;
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数 easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = eased * target;
        
        el.textContent = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// 使用 IntersectionObserver 触发数字动画
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter[data-target]');
            counters.forEach(c => animateCounter(c));
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-stats, .data-wall').forEach(el => {
    counterObserver.observe(el);
});

// ==================== 滚动显示动画 ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.journey-node, .project-card, .ccus-project-card, .hydrogen-card, .storage-type, .nuke-card, .wind-fact, .solar-milestone, .ghg-card, .component-card, .contrib-card, .impact-cell, .policy-pillar, .ct-item, .data-card').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ==================== 时间线交互 ====================
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
    item.addEventListener('click', () => {
        timelineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // 可以扩展：根据年份筛选显示对应内容
        const year = item.dataset.year;
        console.log('选择年份:', year);
    });
});

// ==================== 探索地图节点点击 ====================
document.querySelectorAll('.journey-node').forEach(node => {
    node.addEventListener('click', () => {
        const type = node.dataset.node;
        // 高亮效果
        document.querySelectorAll('.journey-node').forEach(n => n.style.borderColor = '');
        node.style.borderColor = '#00d4aa';
        
        // 滚动到对应区域
        let targetId = '';
        switch(type) {
            case 'energy': targetId = 'tech'; break;
            case 'tech': targetId = 'tech'; break;
            case 'finance': targetId = 'market'; break;
            default: targetId = 'projects';
        }
        
        if (targetId) {
            setTimeout(() => {
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            }, 400);
        }
    });
});

// ==================== 项目数据集 ====================
const projectsData = [
    { id: 1, category: 'renewable', icon: '☀️', title: '库布其沙漠光伏治沙基地', location: '📍 内蒙古鄂尔多斯', desc: '全球最大沙漠光伏基地之一，装机容量超10GW，板上发电、板下种植、板间养殖的"立体治沙"模式，年减少碳排放超800万吨。', tags: ['光伏治沙', 'GW级', '生态修复'] },
    { id: 2, category: 'enterprise', icon: '⚡', title: '国家电网特高压输电工程', location: '📍 跨省跨区域', desc: '已建成"西电东送"特高压线路33条，输送能力超3亿千瓦，每年减少东中部地区煤耗约2亿吨标煤，是能源转型的"超级工程"。', tags: ['特高压', '清洁能源输送', '国家工程'] },
    { id: 3, category: 'ccus', icon: '♻️', title: '齐鲁石化-胜利油田CCUS项目', location: '📍 山东东营', desc: '国内首个百万吨级CCUS全产业链项目，年封存CO₂100万吨，相当于600万辆燃油车一年的排放量。覆盖捕集、输送、利用、封存全流程。', tags: ['CCUS', '百万吨级', 'EOR驱油'] },
    { id: 4, category: 'forestry', icon: '🌲', title: '三北防护林体系建设工程（续建）', location: '📍 北方13省区', desc: '中国最大的生态系统修复工程，累计完成造林保存面积超3000万公顷，森林覆盖率从5.05%提升至13.84%，年固碳潜力达数亿吨。', tags: ['林业碳汇', '国家级', '生态屏障'] },
    { id: 5, category: 'region', icon: '🏙️', title: '深圳国际低碳城', location: '📍 广东深圳', desc: '全国首批低碳城试点示范，单位GDP碳排放强度仅为全国平均水平的1/5，打造低碳产业集聚区和绿色生活方式示范区。', tags: ['零碳园区', '城市试点', '深圳模式'] },
    { id: 6, category: 'enterprise', icon: '🚗', title: '比亚迪新能源全产业链', location: '📍 广东/陕西/多地', desc: '从电池、电机到整车制造的全产业链布局，2024年新能源汽车销量超427万辆全球第一，推动交通领域深度脱碳。', tags: ['新能源汽车', '产业链', '全球领先'] },
    { id: 7, category: 'renewable', icon: '💨', title: '白鹤滩水电站', location: '📍 四川/云南交界', desc: '全球第二大水电站，装机容量1600万千瓦，年均发电量624亿度，替代标准煤约1968万吨，减排二氧化碳约5160万吨。', tags: ['水电', '清洁电力', '超级工程'] },
    { id: 8, category: 'government', icon: '🏛️', title: '雄安新区绿色智慧新城', location: '📍 河北雄安', desc: '"千年大计"中的绿色基因——全区清洁能源利用率100%，绿色建筑比例100%，公共交通出行率90%，建设全球领先的绿色城市标杆。', tags: ['绿色城市', '新区示范', '100%清洁'] },
    { id: 9, category: 'ccus', icon: '🏭', title: '国家能源泰州电厂碳捕集项目', location: '📍 江苏泰州', desc: '亚洲最大火电碳捕集示范工程，年捕集CO₂50万吨，捕集纯度超99%，产品用于食品级利用和化工生产。', tags: ['火电捕集', '食品级CO₂', '亚洲之最'] },
    { id: 10, category: 'region', icon: '🌊', title: '福建海上风电集群', location: '📍 福建沿海', desc: '深远海风电示范基地，总规划装机超20GW，采用漂浮式风电机组等前沿技术，探索海洋风电开发新模式。', tags: ['海上风电', '深远海', '漂浮式'] },
    { id: 11, category: 'enterprise', icon: '🔋', title: '宁德时代零碳工厂网络', location: '📍 福建/广东/德国等地', desc: '全球首家获认证的电池行业零碳工厂，通过100%绿电供应+节能技术+碳抵消组合，打造动力电池制造的碳中和样板。', tags: ['零碳工厂', '动力电池', '全球首创'] },
    { id: 12, category: 'government', icon: '🚄', title: '"八纵八横"高速铁路网', location: '📍 全国', desc: '高铁运营里程超4.5万公里占世界70%以上，以电气化铁路替代公路航空出行，大幅降低交通运输碳排放强度。', tags: ['轨道交通', '绿色交通', '世界第一'] },
    { id: 13, category: 'renewable', icon: '🌞', title: '青海-甘肃大型风光基地', location: '📍 青海/甘肃', desc: '沙漠戈壁大型风光基地群，总规模超50GW，配套特高压外送通道，实现"沙戈荒"变"绿能海"。', tags: ['风光大基地', 'GW级', '西电东送'] },
    { id: 14, category: 'forestry', icon: '🌿', title: '红树林保护与蓝碳项目', location: '📍 广东/广西/海南', desc: '中国最大规模的红树林生态修复与蓝碳开发项目，恢复红树林面积约8000公顷，每公顷年固碳约8-12吨。', tags: ['蓝碳', '红树林', '海岸带'] },
    { id: 15, category: 'enterprise', icon: '🏗️', title: '宝武钢铁富氢碳循环高炉', location: '📍 上海', desc: '全球首套工业级富氢碳循环高炉示范装置，氢冶金减碳30%以上，引领钢铁行业深度脱碳技术路线。', tags: ['氢冶金', '钢铁降碳', '全球首创'] },
    { id: 16, category: 'region', icon: '🏘️', title: '浙江安吉"两山"理念实践区', location: '📍 浙江湖州', desc: '"绿水青山就是金山银山"理念发源地，森林覆盖率超70%，生态产品价值实现机制全国领先，GEP核算体系先行先试。', tags: ['两山理念', '生态价值', '浙江经验'] },
];

let displayedProjects = 8;
const projectsGrid = document.getElementById('projectsGrid');

function renderProjects(filter = 'all') {
    const filtered = filter === 'all' 
        ? projectsData 
        : projectsData.filter(p => p.category === filter);
    
    const toShow = filtered.slice(0, displayedProjects);
    
    projectsGrid.innerHTML = toShow.map(p => `
        <div class="project-card reveal visible" data-category="${p.category}">
            <div class="pc-header">
                <span class="pc-icon">${p.icon}</span>
                <div>
                    <div class="pc-category">${getCategoryName(p.category)}</div>
                    <div class="pc-title">${p.title}</div>
                </div>
            </div>
            <div class="pc-location">${p.location}</div>
            <div class="pc-desc">${p.desc}</div>
            <div class="pc-tags">
                ${p.tags.map(t => `<span class="pc-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
    
    // 更新加载更多按钮状态
    const loadMoreBtn = document.getElementById('loadMoreProjects');
    if (toShow.length >= filtered.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `还有 ${filtered.length - toShow.length} 个项目 ↓`;
    }
}

function getCategoryName(cat) {
    const names = {
        renewable: '可再生能源',
        enterprise: '企业行动',
        government: '政府工程',
        ccus: 'CCUS项目',
        region: '地区示范',
        forestry: '碳汇林业'
    };
    return names[cat] || cat;
}

renderProjects();

// 项目筛选器
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayedProjects = 8;
        renderProjects(btn.dataset.filter);
    });
});

// 加载更多
document.getElementById('loadMoreProjects').addEventListener('click', () => {
    displayedProjects += 8;
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    renderProjects(activeFilter);
});

// ==================== 技术标签页切换 ====================
document.querySelectorAll('.tech-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tech-panel').forEach(p => p.classList.remove('active'));
        const panelId = 'panel-' + tab.dataset.tab;
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');
            
            // 触发进度条动画
            setTimeout(() => {
                panel.querySelectorAll('.type-fill, .ghg-fill, .tpb-fill').forEach(bar => {
                    const width = bar.dataset.width || bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => { bar.style.width = width; }, 100);
                });
            }, 100);
        }
    });
});

// ==================== 技术区科技粒子背景 ====================
function initTechCanvas() {
    const techCanvas = document.getElementById('techCanvas');
    if (!techCanvas) return;

    const tCtx = techCanvas.getContext('2d');
    let techParticles = [];

    function resizeTechCanvas() {
        const section = document.getElementById('tech');
        if (!section) return;
        techCanvas.width = section.offsetWidth;
        techCanvas.height = section.offsetHeight;
    }

    class TechParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * techCanvas.width;
            this.y = Math.random() * techCanvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.05;
            this.color = Math.random() > 0.5
                ? `rgba(26, 154, 92, ${this.opacity})`
                : `rgba(27, 136, 216, ${this.opacity})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > techCanvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > techCanvas.height) this.speedY *= -1;
        }
        draw() {
            tCtx.beginPath();
            tCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            tCtx.fillStyle = this.color;
            tCtx.fill();
        }
    }

    function initTechParticles() {
        techParticles = [];
        const count = Math.min(80, Math.floor((techCanvas.width * techCanvas.height) / 20000));
        for (let i = 0; i < count; i++) techParticles.push(new TechParticle());
    }

    function connectTechParticles() {
        const maxDist = 120;
        for (let i = 0; i < techParticles.length; i++) {
            for (let j = i + 1; j < techParticles.length; j++) {
                const dx = techParticles[i].x - techParticles[j].x;
                const dy = techParticles[i].y - techParticles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const op = (1 - dist / maxDist) * 0.04;
                    tCtx.beginPath();
                    tCtx.strokeStyle = `rgba(26, 154, 92, ${op})`;
                    tCtx.lineWidth = 0.4;
                    tCtx.moveTo(techParticles[i].x, techParticles[i].y);
                    tCtx.lineTo(techParticles[j].x, techParticles[j].y);
                    tCtx.stroke();
                }
            }
        }
    }

    function animateTechParticles() {
        tCtx.clearRect(0, 0, techCanvas.width, techCanvas.height);
        techParticles.forEach(p => { p.update(); p.draw(); });
        connectTechParticles();
        requestAnimationFrame(animateTechParticles);
    }

    resizeTechCanvas();
    initTechParticles();
    animateTechParticles();
    window.addEventListener('resize', () => { resizeTechCanvas(); initTechParticles(); });
}

// ==================== 技术区计数器 ====================
const techCounterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.tech-counter[data-target]').forEach(c => animateCounter(c));
            techCounterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const techDash = document.querySelector('.tech-dashboard');
if (techDash) techCounterObserver.observe(techDash);

// ==================== 技术里程碑滚动动画 ====================
const tmObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.tm-item, .tech-dash-card, .trm-domain').forEach(el => {
    el.classList.add('reveal');
    tmObserver.observe(el);
});

// ==================== 回到顶部按钮 ====================
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==================== 中国地图简化版SVG ====================
const chinaMapEl = document.getElementById('chinaMap');
const tooltip = document.getElementById('regionTooltip');

// 简化的区域数据（使用圆形定位代替完整地图路径）
const regionsData = [
    { name: '北京', x: 68, y: 32, score: 92, projects: '京津冀协同发展低碳示范区、大兴国际机场零碳运营、冬奥场馆100%绿电', color: '#059669' },
    { name: '上海', x: 78, y: 58, score: 90, projects: '临港新片区低碳发展、长三角生态绿色一体化示范区、崇明世界级生态岛', color: '#059669' },
    { name: '广东', x: 68, y: 78, score: 88, projects: '粤港澳大湾区碳市场、深圳国际低碳城、海上风电产业集群、珠三角绿色转型', color: '#059669' },
    { name: '江苏', x: 75, y: 48, score: 86, projects: '泰州CCUS项目、盐城海上风电、苏州工业园区低碳改造、南京绿色建筑推广', color: '#059669' },
    { name: '浙江', x: 77, y: 58, score: 87, projects: '安吉两山理念实践区、舟山群岛清洁能源、杭州数字经济低碳转型', color: '#059669' },
    { name: '山东', x: 72, y: 40, score: 82, projects: '齐鲁石化CCUS项目、青岛中德生态园、烟台海上风电、济南新旧动能转换', color: '#10b981' },
    { name: '福建', x: 74, y: 65, score: 83, projects: '海上风电集群、宁德时代零碳工厂、三明林票制碳汇交易', color: '#10b981' },
    { name: '四川', x: 42, y: 56, score: 79, projects: '白鹤滩水电站、成都公园城市、雅砻江流域水电开发', color: '#10b981' },
    { name: '内蒙古', x: 52, y: 26, score: 85, projects: '库布其光伏治沙、大型风电光伏基地、呼包鄂榆新能源城市群', color: '#059669' },
    { name: '新疆', x: 22, y: 38, score: 76, projects: '准东煤化工CCUS、哈密风光大基地、塔克拉玛干沙漠光伏', color: '#10b981' },
    { name: '甘肃', x: 35, y: 45, score: 74, projects: '河西走廊清洁能源走廊、敦煌光热电站、酒泉风电基地', color: '#34d399' },
    { name: '青海', x: 28, y: 46, score: 78, projects: '共和光热电站、海西风光储多能互补、三江源生态保护碳汇', color: '#10b981' },
    { name: '湖北', x: 62, y: 53, score: 80, projects: '武汉碳市场试点、三峡集团清洁能源、长江经济带绿色发展', color: '#10b981' },
    { name: '安徽', x: 70, y: 52, score: 77, projects: '淮南采煤沉陷区光伏、合肥新能源汽车产业、黄山生态碳汇', color: '#34d399' },
    { name: '河北', x: 64, y: 34, score: 81, projects: '雄安新区绿色新城、张家口可再生能源示范区、唐山钢铁超低排放', color: '#10b981' },
    { name: '山西', x: 57, y: 38, score: 72, projects: '煤炭清洁高效利用、太原气候投融资试点、大同光伏领跑者基地', color: '#34d399' },
    { name: '陕西', x: 52, y: 44, scores: 73, projects: '榆林能源化工基地低碳转型、西安新能源汽车、秦岭生态保护碳汇', color: '#34d399' },
    { name: '黑龙江', x: 75, y: 14, score: 70, projects: '大小兴安岭森林碳汇、哈尔滨冰雪产业低碳化、大庆油田CCUS', color: '#34d399' },
    { name: '吉林', x: 73, y: 22, score: 69, projects: '长白山森林碳汇、一汽红旗电动化转型、西部风光资源开发', color: '#34d399' },
    { name: '辽宁', x: 71, y: 28, score: 71, projects: '大连氢能产业示范区、鞍钢超低排放改造、辽东湾海上风电', color: '#34d399' },
];

function renderChinaMap() {
    let svgHtml = `<svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">`;
    
    // 绘制连接线（模拟省份边界）
    svgHtml += `<path d="M20,35 Q40,25 55,30 T70,35 Q80,40 82,55 T75,72 Q65,78 55,75 T40,65 Q30,55 22,45Z" 
               fill="none" stroke="rgba(0,212,170,0.15)" stroke-width="0.5"/>`;
    
    regionsData.forEach(region => {
        const radius = 2 + (region.score / 100) * 3.5;
        const opacity = 0.5 + (region.score / 200);
        
        // 外圈光晕
        svgHtml += `<circle cx="${region.x}" cy="${region.y}" r="${radius + 2}" 
                    fill="none" stroke="${region.color}" stroke-width="0.4" opacity="${opacity * 0.3}"/>`;
        
        // 主圆点
        svgHtml += `<circle cx="${region.x}" cy="${region.y}" r="${radius}" 
                    fill="${region.color}" opacity="${opacity}" class="region-dot"
                    data-region="${JSON.stringify(region).replace(/"/g, '&quot;')}" style="cursor:pointer;transition:all 0.3s"/>
                    <text x="${region.x}" y="${region.y + 5.5}" fill="rgba(255,255,255,0.7)" 
                    font-size="3" text-anchor="middle" font-weight="bold">${region.name}</text>`;
    });
    
    // 图例说明
    svgHtml += `<text x="50" y="86" fill="rgba(148,163,184,0.5)" font-size="2.8" text-anchor="middle">* 圆点大小反映低碳综合指数 · 鼠标悬停查看详情</text>`;
    svgHtml += '</svg>';
    
    chinaMapEl.innerHTML = svgHtml;
    
    // 绑定事件
    chinaMapEl.querySelectorAll('.region-dot').forEach(dot => {
        dot.addEventListener('mouseenter', (e) => {
            try {
                const data = JSON.parse(dot.dataset.region.replace(/&quot;/g, '"'));
                tooltip.innerHTML = `
                    <strong style="color:#0d6e3d;font-size:15px;">${data.name} · 综合指数 ${data.score}分</strong><br/>
                    <span style="color:#2d6a4f;font-size:12px;">${data.projects}</span>
                `;
                tooltip.style.display = 'block';
                
                const rect = chinaMapEl.getBoundingClientRect();
                let left = e.clientX - rect.left + 16;
                let top = e.clientY - rect.top - 20;
                
                // 防止超出边界
                if (left + 240 > rect.width) left = rect.left - 260;
                if (top + 150 > rect.height) top = rect.top - 140;
                
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            } catch(err) {}
        });
        
        dot.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        dot.addEventListener('mousemove', (e) => {
            const rect = chinaMapEl.getBoundingClientRect();
            let left = e.clientX - rect.left + 16;
            let top = e.clientY - rect.top - 20;
            
            if (left + 240 > rect.width) left = e.clientX - rect.left - 256;
            if (top + 150 > rect.height) top = e.clientY - rect.top - 156;
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        });
    });
}

renderChinaMap();

// ==================== 平滑滚动增强 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 滚动视差效果 ====================
function initParallax() {
    const sections = [
        { id: 'hero', content: '.hero-content', speed: 0.15 },
        { id: 'journey', content: '.journey-section .container', speed: 0.08 },
        { id: 'projects', content: '.projects-section .container', speed: 0.06 },
        { id: 'tech', content: '.tech-section > .container', speed: 0.06 },
        { id: 'achievements', content: '.achievements-section .container', speed: 0.05 },
        { id: 'market', content: '.market-section .container', speed: 0.05 },
        { id: 'policy', content: '.policy-section .container', speed: 0.04 },
        { id: 'global', content: '.global-section .container', speed: 0.04 },
    ];
    
    // 检测是否移动端（移动端禁用视差以提升性能）
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const vh = window.innerHeight;
                
                sections.forEach(({ id, content, speed }) => {
                    const section = document.getElementById(id);
                    if (!section) return;
                    const el = section.querySelector(content);
                    if (!el) return;
                    
                    const rect = section.getBoundingClientRect();
                    // 只在section可见时应用视差
                    if (rect.bottom > 0 && rect.top < vh) {
                        const offset = (vh - rect.top - vh / 2) * speed;
                        el.style.transform = `translateY(${offset * 0.3}px)`;
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ==================== 章节进入时的创意过渡 ====================
function initSectionTransitions() {
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '-5% 0px -5% 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-in-view');
                // 为内部元素添加交错延迟动画
                const children = entry.target.querySelectorAll('.reveal:not(.visible)');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${Math.min(i * 0.06, 0.4)}s`;
                });
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.section').forEach(section => {
        sectionObserver.observe(section);
    });
}

// ==================== 页面加载完成后的初始化 ====================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // 触发首屏数字动画
    setTimeout(() => {
        document.querySelectorAll('.hero-stats .counter').forEach(c => animateCounter(c));
    }, 800);
    
    // 初始化技术区科技粒子画布
    initTechCanvas();
    
    // 初始化侧边导航
    initSideNav();
    
    // 初始化全局搜索
    initGlobalSearch();
    
    // 初始化滚动视差
    initParallax();
    
    // 初始化章节过渡
    initSectionTransitions();
    
    console.log('🌿 碳索之旅 — 中国低碳建设全景展示平台 已就绪');
});

// ==================== 侧边浮动导航（滑出式，默认隐藏） ====================
function initSideNav() {
    const sideNav = document.getElementById('sideNav');
    const sideNavToggle = document.getElementById('sideNavToggle');
    const progressFill = document.getElementById('readingProgress');
    const sidenavItems = document.querySelectorAll('.sidenav-item');
    
    if (!sideNav || !sideNavToggle) return;

    let isVisible = false;

    // 点击触发按钮：显示/隐藏侧边栏
    sideNavToggle.addEventListener('click', () => {
        isVisible = !isVisible;
        sideNav.classList.toggle('visible', isVisible);
        sideNavToggle.classList.toggle('active', isVisible);
        // 按钮图标切换：☰ → ✕
        sideNavToggle.textContent = isVisible ? '✕' : '☰';
    });

    // 点击页面空白处关闭侧边栏（移动端友好）
    document.addEventListener('click', (e) => {
        if (isVisible && !sideNav.contains(e.target) && e.target !== sideNavToggle) {
            isVisible = false;
            sideNav.classList.remove('visible');
            sideNavToggle.classList.remove('active');
            sideNavToggle.textContent = '☰';
        }
    });

    // 阅读进度条更新 + 当前章节高亮
    const allSections = [
        { id: 'hero', label: '首页' },
        { id: 'journey', label: '探索路线' },
        { id: 'projects', label: '低碳项目' },
        { id: 'tech', label: '技术创新' },
        { id: 'achievements', label: '降碳成果' },
        { id: 'market', label: '碳市场' },
        { id: 'policy', label: '政策推动' },
        { id: 'global', label: '全球贡献' },
        { id: 'platforms', label: '服务平台' },
    ];

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const readProgress = Math.min((scrollTop / docHeight) * 100, 100);

        // 更新进度条
        if (progressFill) {
            progressFill.style.width = readProgress + '%';
        }

        // 计算当前所在章节
        let currentSection = allSections[0].id;
        for (let i = allSections.length - 1; i >= 0; i--) {
            const section = document.getElementById(allSections[i].id);
            if (section && section.offsetTop - 200 <= scrollTop) {
                currentSection = allSections[i].id;
                break;
            }
        }

        // 高亮当前章节
        sidenavItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.target === currentSection) {
                item.classList.add('active');
            }
        });
    });

    // 点击跳转（跳转后不自动收起，保持目录可见）
    sidenavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const offset = 80;
                const top = targetEl.offsetTop - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ==================== 全局搜索功能 ====================
function initGlobalSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchPanel = document.getElementById('searchPanel');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchToggle || !searchPanel || !searchInput || !searchResults) return;
    
    // 搜索数据源
    const searchData = [
        // 项目数据
        ...projectsData.map(p => ({
            type: 'project',
            title: p.title,
            desc: p.desc,
            category: getCategoryName(p.category),
            location: p.location,
            tags: p.tags,
            targetId: 'projects',
            icon: p.icon,
        })),
        // 技术领域
        { type: 'tech', title: 'CCUS碳捕集', desc: '中国已建成/在建CCUS项目超过50个，年捕集能力突破600万吨', category: '技术领域', targetId: 'tech', icon: '♻️' },
        { type: 'tech', title: '氢能产业', desc: '中国氢能产量居世界首位，绿氢产能加速扩张，燃料电池汽车保有量全球领先', category: '技术领域', targetId: 'tech', icon: '💧' },
        { type: 'tech', title: '新型储能', desc: '2025年中国新型储能装机预计突破80GW，占全球新增装机40%以上', category: '技术领域', targetId: 'tech', icon: '🔋' },
        { type: 'tech', title: '光伏科技', desc: '中国光伏产能占全球80%以上，叠层电池效率突破34.6%', category: '技术领域', targetId: 'tech', icon: '☀️' },
        { type: 'tech', title: '风电技术', desc: '风电总装机520GW+，22MW海上风机全球最大单机容量', category: '技术领域', targetId: 'tech', icon: '💨' },
        { type: 'tech', title: '先进核能', desc: '"华龙一号"走向世界，第四代核电技术领跑全球', category: '技术领域', targetId: 'tech', icon: '⚛️' },
        // 政策关键词
        { type: 'policy', title: '双碳目标', desc: '2030年前碳达峰、2060年前碳中和——中国向世界的庄严承诺', category: '政策体系', targetId: 'policy', icon: '🎯' },
        { type: 'policy', title: '"1+N"政策体系', desc: '顶层设计与落地措施相结合，构建完整的碳达峰碳中和制度框架', category: '政策体系', targetId: 'policy', icon: '📜' },
        { type: 'policy', title: '全国碳市场', desc: '全球覆盖温室气体排放量最大的碳市场，2025年扩围至钢铁、水泥、铝冶炼', category: '碳市场', targetId: 'market', icon: '⚖️' },
        { type: 'policy', title: '白皮书', desc: '2025年11月《碳达峰碳中和的中国行动》白皮书发布，全面介绍五年成就', category: '政策动态', targetId: 'global', icon: '📰' },
        { type: 'policy', title: 'CCER重启', desc: '自愿减排市场2024年重启，支持全社会自愿减排行动', category: '碳市场', targetId: 'market', icon: '🍃' },
        // 企业/成果关键词
        { type: 'achievement', title: '新能源汽车', desc: '新能源汽车保有量1287万辆（2024），全球第一，比亚迪销量超427万辆', category: '降碳成果', targetId: 'achievements', icon: '🚗' },
        { type: 'achievement', title: '比亚迪', desc: '从电池到整车全产业链布局，2024年新能源汽车销量全球第一', category: '企业行动', targetId: 'projects', icon: '🚗' },
        { type: 'achievement', title: '宁德时代', desc: '全球首家获认证的电池行业零碳工厂，动力电池制造碳中和样板', category: '企业行动', targetId: 'projects', icon: '🔋' },
        { type: 'achievement', title: '可再生能源装机', desc: '可再生能源总装机1300GW，风电光伏装机之和超越煤电', category: '降碳成果', targetId: 'achievements', icon: '⚡' },
        { type: 'achievement', title: '特高压输电', desc: '"西电东送"特高压线路33条，输送能力超3亿千瓦', category: '国家工程', targetId: 'projects', icon: '⚡' },
        { type: 'achievement', title: '雄安新区', desc: '"千年大计"绿色基因——清洁能源利用率100%，绿色建筑比例100%', category: '绿色城市', targetId: 'projects', icon: '🏛️' },
        // 碳足迹与零碳园区
        { type: 'footprint', title: '产品碳足迹', desc: '基于ISO 14067标准量化产品全生命周期温室气体排放', category: '碳足迹', targetId: 'carbon-footprint', icon: '🔬' },
        { type: 'footprint', title: '企业碳足迹', desc: '按GHG Protocol分为Scope 1/2/3三大范畴进行碳排放核算', category: '碳足迹', targetId: 'carbon-footprint', icon: '🏭' },
        { type: 'footprint', title: 'ISO 14067', desc: '国际通行产品碳足迹量化标准', category: '碳足迹标准', targetId: 'carbon-footprint', icon: '📋' },
        { type: 'footprint', title: 'CBAM碳边境调节', desc: '欧盟碳关税要求进口产品申报碳排放数据，倒逼出口企业碳足迹核算', category: '碳足迹', targetId: 'carbon-footprint', icon: '🇪🇺' },
        { type: 'footprint', title: 'EPD环境产品声明', desc: '经第三方验证的标准化环境声明，涵盖碳足迹等全维度指标', category: '碳足迹认证', targetId: 'carbon-footprint', icon: '📄' },
        { type: 'footprint', title: '碳标签', desc: '标注产品碳足迹数值，面向消费者透明展示碳排放信息', category: '碳足迹认证', targetId: 'carbon-footprint', icon: '🌱' },
        { type: 'footprint', title: '零碳园区', desc: '通过能源清洁替代、产业低碳转型实现温室气体净零排放的产业集聚区', category: '零碳园区', targetId: 'carbon-footprint', icon: '🏗️' },
        { type: 'footprint', title: '远景赤峰零碳产业园', desc: '全球首个零碳产业园，风光储绿色能源+绿色电池产业链', category: '零碳园区', targetId: 'carbon-footprint', icon: '🏆' },
        { type: 'footprint', title: '宁德时代零碳工厂', desc: '全球首批灯塔工厂+零碳工厂，光伏+储能+绿证实现运营碳中和', category: '零碳园区', targetId: 'carbon-footprint', icon: '🔋' },
        { type: 'footprint', title: '雄安新区零碳园区', desc: '全域绿色建筑、100%清洁能源供应、智慧能源管理平台', category: '零碳园区', targetId: 'carbon-footprint', icon: '🏛️' },
    ];
    
    // 加入服务平台数据（含功能标签）
    const platformSearchData = platformsData.map(p => {
        const funcNames = getPlatformFunctionNames(p).join(' ');
        return {
            type: 'platform',
            title: p.name,
            desc: p.desc,
            category: getPlatformCategoryName(p.category) + ' | ' + funcNames,
            tags: [...p.tags, ...getPlatformFunctionNames(p)],
            targetId: 'platforms',
            icon: p.icon,
        };
    });
    const allSearchData = [...searchData, ...platformSearchData];
    
    let isSearchOpen = false;
    
    // 打开搜索面板
    function openSearch() {
        isSearchOpen = true;
        searchPanel.classList.remove('hidden');
        searchInput.focus();
        searchToggle.classList.add('active');
    }
    
    // 关闭搜索面板
    function closeSearch() {
        isSearchOpen = false;
        searchPanel.classList.add('hidden');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchToggle.classList.remove('active');
    }
    
    // 切换搜索面板
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isSearchOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    });
    
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        // Ctrl+K / Cmd+K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (isSearchOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        // ESC 关闭
        if (e.key === 'Escape' && isSearchOpen) {
            closeSearch();
        }
    });
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (isSearchOpen && !searchPanel.contains(e.target) && e.target !== searchToggle) {
            closeSearch();
        }
    });
    
    // 搜索逻辑
    let searchTimer = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const query = searchInput.value.trim().toLowerCase();
            
            if (query.length < 1) {
                searchResults.innerHTML = '<div class="search-empty">输入关键词开始搜索...</div>';
                return;
            }
            
            // 执行搜索
            const results = allSearchData.filter(item => {
                const searchText = `${item.title} ${item.desc} ${item.category} ${(item.tags || []).join(' ')} ${(item.location || '')}`.toLowerCase();
                return searchText.includes(query);
            }).slice(0, 8); // 最多显示8条结果
            
            if (results.length === 0) {
                searchResults.innerHTML = `<div class="search-empty">未找到与 "<strong>${escapeHtml(query)}</strong>" 相关的结果</div>
                    <div class="search-suggestions">💡 建议尝试：CCUS、光伏、碳中和、比亚迪、碳市场、氢能、储能</div>`;
                return;
            }
            
            // 渲染结果
            const typeLabels = {
                project: '📋 项目',
                tech: '🔬 技术',
                policy: '📜 政策',
                achievement: '📊 成果',
                platform: '🔧 平台',
                footprint: '👣 碳足迹',
            };
            
            searchResults.innerHTML = results.map(item => `
                <div class="search-result-item" data-target="${item.targetId}">
                    <div class="sri-icon">${item.icon}</div>
                    <div class="sri-content">
                        <div class="sri-title">${highlightMatch(item.title, query)}</div>
                        <div class="sri-desc">${item.desc}</div>
                        <div class="sri-meta">
                            <span class="sri-type">${typeLabels[item.type] || item.type}</span>
                            <span class="sri-category">${item.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // 绑定点击事件
            searchResults.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    const targetId = el.dataset.target;
                    closeSearch();
                    setTimeout(() => {
                        const target = document.getElementById(targetId);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 200);
                });
            });
        }, 200);
    });
    
    // 初始提示
    searchResults.innerHTML = '<div class="search-empty">输入关键词开始搜索...<br/><span style="font-size:12px;color:#aaa;">支持搜索：项目名称、技术领域、政策关键词、企业名称</span></div>';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightMatch(text, query) {
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// ==================== 碳管理服务平台数据与交互 ====================

// ==================== 功能分类定义 ====================
const functionCategories = {
    'carbon-footprint': { name: '碳足迹核算', icon: '👣', desc: '产品碳足迹、LCA分析、背景数据库' },
    'accounting': { name: '碳排放盘查', icon: '📊', desc: '企业碳核算、MRV、清单编制' },
    'certification': { name: '认证合规', icon: '✓', desc: '认证、核查、EPD声明、CBAM合规' },
    'trading': { name: '碳交易履约', icon: '💹', desc: '配额交易、CCER、碳金融' },
    'green-cert': { name: '绿证碳汇', icon: '🍃', desc: '绿证、碳汇、自愿减排' },
    'data-query': { name: '数据查询', icon: '🔍', desc: '因子库、排放数据、统计数据' },
    'policy-info': { name: '政策资讯', icon: '📰', desc: '政策文件、新闻动态、行业资讯' },
    'tool-platform': { name: '工具平台', icon: '🔧', desc: 'SaaS工具、计算平台、管理系统' },
    'standard': { name: '标准方法', icon: '📜', desc: '国际标准、方法学、技术规范' },
    'research': { name: '研究智库', icon: '🎓', desc: '研究报告、智库机构、学术资源' }
};

const platformsData = [
    // ===== 一、政府平台 =====
    { id: 1, category: 'gov', icon: '&#127793;', name: '国家温室气体排放因子数据库', url: 'https://data.ncsc.org.cn/factories/index', desc: '生态环境部建立的国家温室气体排放因子数据库，发布全国（部分因子细分到区域）温室气体排放因子和碳足迹因子，提供政策文件、标准规范和碳排放计算工具等模块。是国家统一核算的重要公共基础。', tags: ['国家级', '因子数据', '免费'], region: '全国', functions: ['data-query', 'accounting', 'standard'] },
    { id: 2, category: 'gov', icon: '&#127795;', name: '江苏省产品碳足迹公共服务平台', url: 'https://jstzj.fzggw.jiangsu.gov.cn/portal/home/index', desc: '江苏省发改委主导建设的碳足迹公共服务平台，提供产品碳足迹建模、核算、认证及采信一站式服务。已入驻企业1018家，完成核算报告500份，认证报告230份。', tags: ['省级', '认证服务', '企业已超1000家'], region: '江苏' },
    { id: 3, category: 'gov', icon: '&#127796;', name: '浙江省产品碳足迹服务平台', url: 'https://ny.fzggw.zj.gov.cn/tzj/org/home/#/platForm', desc: '以"方法统一、数据可信"为原则，采用"全省规范指导、市场自主实践"模式，建立符合省情、衔接国家、接轨国际的产品碳足迹数据库。适合产业集群地区企业使用。', tags: ['省级', '市场化实践', '产业集群'], region: '浙江' },
    { id: 4, category: 'gov', icon: '&#127781;', name: '山东省企业产品碳足迹一站式服务平台', url: 'https://cfootprint.greendev.org.cn/user/login', desc: '山东省生态环境厅组织开发的公益性平台，覆盖ecoinvent因子库、中国LCA因子库、山东本土因子库等权威数据库。依据ISO14067、PAS2050国际标准快速精准核算。', tags: ['省级', '公益性', '多因子库', 'ISO标准'], region: '山东' },
    { id: 5, category: 'gov', icon: '&#127779;', name: '上海市产品碳足迹背景数据库', url: 'https://www.shlcd.org.cn/admin/portal/home', desc: '以"专业透明、全链协同、开放共享、国际兼容"为特色，每条数据均采用生命周期评价方法开展清单级建模与计算，不同数据间沿供应链形成数据网络，实现产业链级的层层精准追溯。', tags: ['直辖市', '高质量背景数据', 'LCA建模'], region: '上海' },
    { id: 6, category: 'gov', icon: '&#127798;', name: '湖北省产品碳足迹公共服务平台', url: 'https://hbcfp.hbets.com.cn/web/#/home', desc: '定位为全省碳足迹的数据归集中心、管理平台和服务枢纽，实现产品碳足迹"核算-认证-标识-披露"全流程管理。内置化工、电池、光纤等重点产品15类核算模型，一键生成报告。', tags: ['省级', '四位一体', '15类模型'], region: '湖北' },
    { id: 7, category: 'gov', icon: '&#129353;', name: '粤港澳大湾区碳足迹标识认证平台', url: 'https://www.smq.com.cn/gbalca/gateway/#/index', desc: '全国首个聚焦碳足迹标识认证工作的公共服务平台，率先实现认证申请、核算、核查、报告、证书及标识发放的一体化管理。实现"五个统一"。', tags: ['大湾区', '认证闭环', '五个统一'], region: '粤港澳大湾区' },
    { id: 8, category: 'gov', icon: '&#127800;', name: '大连碳足迹标识认证公共服务平台', url: 'https://dllca.dlitg.com/dl/gateway/#/about/index', desc: '聚焦东北地区绿色贸易合规与重点行业碳管理需求，打造东北地区首个集"一站式、全流程、多场景"于一体的碳足迹数字化公共服务体系。', tags: ['市级', '东北首站', '贸易合规'], region: '辽宁/大连' },
    { id: 9, category: 'gov', icon: '&#127812;', name: '绍兴碳足迹公共服务平台', url: 'https://fzlca.kq.gov.cn:8001/common#/home', desc: '围绕纺织等地方特色产业构建的碳服务平台，说明地方平台最有效的路径是围绕主导产业深入做场景而非"大而全"。依托绍兴柯桥区政务云和一体化数据平台建设。', tags: ['地市级', '纺织行业', '特色产业'], region: '浙江/绍兴' },
    { id: 10, category: 'gov', icon: '&#127805;', name: '秦皇岛碳足迹公共服务平台', url: 'http://qhdztgs.cn/login', desc: '由秦皇岛国资委监管企业研发搭建，通过多源数据采集和智能分析，整合企业各部门及业务流程中的碳排放数据，进行量化分析，协助企业设定科学合理的碳减排目标。', tags: ['地市级', '国企研发', '减排目标管理'], region: '河北/秦皇岛' },

    // ===== 二、碳交易平台 =====
    { id: 11, category: 'market', icon: '&#127919;', name: '全国碳排放权交易系统（全国碳市场信息网）', url: 'https://www.cets.org.cn', desc: '2021年7月16日正式开市，全球覆盖温室气体排放量最大的碳市场。初期以发电行业为突破口，纳入2000+家重点排放单位，覆盖年排放量51亿吨。官方唯一指定管理与交易服务平台。', tags: ['国家级', 'ETS强制市场', '51亿吨覆盖', '全球最大'], region: '全国' },
    { id: 12, category: 'market', icon: '&#127808;', name: 'CCER自愿减排交易平台', url: 'https://www.ccer.com.cn', desc: '2024年在北京重启，2025年完成首批登记884.41万吨，成交额6.26亿元。支持全社会自愿减排行动，涵盖光热发电、海上风电、生物质能等项目类型。企业盘活碳资产的关键途径。', tags: ['国家级', '自愿减排', '重启', '6.26亿成交额'], region: '全国' },
    { id: 13, category: 'market', icon: '&#128187;', name: 'CCER注册登记系统及信息平台', url: 'https://ccer.cets.org.cn/client/home', desc: '新版CCER注册登记系统，包含CCER政策、方法学技术规范、项目与减排量信息、审定核查机构名单等核心内容。与CCER交易平台配合使用。', tags: ['国家级', '注册登记', '方法学', '核查机构'], region: '全国' },
    { id: 14, category: 'market', icon: '&#128507;', name: '北京绿色交易所', url: 'https://www.cbgex.com.cn', desc: '原名北京环境交易所，2008年成立，注册资本6.51亿元。综合性环境权益交易机构，2020年更名为北京绿色交易所，承担全国CCER交易中心职能。', tags: ['地方试点', '注册资本6.51亿', 'CCER中心'], region: '北京' },
    { id: 15, category: 'market', icon: '&#128176;', name: '上海环境能源交易所', url: 'https://www.cneeex.com', desc: '全国首家环境能源类交易平台，上海市碳交易试点指定平台，同时是生态环境部指定的全国碳排放权交易系统建设和运营机构。可查询碳配额交易行情。', tags: ['地方试点', '全国碳市场运营方', '行情查询'], region: '上海' },
    { id: 16, category: 'market', icon: '&#127970;', name: '广州碳排放权交易中心', url: 'https://www.cnemission.com', desc: '广东省和广州市合作共建的国家级碳排放权交易试点交易所，大湾区唯一兼具国家碳交易试点和绿色金融改革创新试验区试点的双试点机构。', tags: ['地方试点', '大湾区双试点', '绿色金融'], region: '广东' },
    { id: 17, category: 'market', icon: '&#127968;', name: '湖北省碳排放权交易中心', url: 'https://www.hbets.cn', desc: '中部地区核心碳交易试点，严格遵循《湖北省碳排放权交易管理暂行办法》，聚焦本地重点排放单位的配额分配、交易、履约管理。', tags: ['地方试点', '中部核心', '履约管理'], region: '湖北' },
    { id: 18, category: 'market', icon: '&#127978;', name: '深圳绿色交易所', url: 'https://www.szets.com', desc: '原名深圳排放权交易所，2010年成立，2019年成为深圳交易集团控股企业，2024年更名。已成长为集交易所、智库、能力建设中心于一体的综合性交易机构。', tags: ['地方试点', '更名绿交所', '综合型'], region: '广东/深圳' },
    { id: 19, category: 'market', icon: '&#127966;', name: '天津排放权交易所', url: 'https://www.chinatcx.com.cn', desc: '北方地区重要碳交易试点，聚焦本地工业企业碳排放管控，提供配额交易、履约清缴、碳核查等服务，衔接京津冀协同降碳工作。', tags: ['地方试点', '北方枢纽', '京津冀协同'], region: '天津' },
    { id: 20, category: 'market', icon: '&#127974;', name: '重庆碳排放权交易中心', url: 'https://tpf.cqggzy.com', desc: '服务西南地区低碳转型需求，覆盖本地重点排放单位，定期公布年度重点排放单位名单，提供配额交易、履约管理等服务。助力重庆打造西部双碳示范高地。', tags: ['地方试点', '西部示范', '履约管理'], region: '重庆' },
    { id: 21, category: 'market', icon: '&#127965;', name: '福建省海峡股权交易中心（碳市场）', url: 'https://carbon.hxee.com.cn', desc: '东南地区碳交易试点，适配福建绿色产业发展特点，覆盖电力、钢铁、化工等重点行业，提供配额交易、碳核查、履约清缴等服务，与全国碳市场协同联动。', tags: ['地方试点', '海峡特色', '多行业覆盖'], region: '福建' },
    { id: 22, category: 'market', icon: '&#128176;', name: '四川联合环境交易所', url: 'https://www.sceex.com.cn', desc: '西部地区重要的环境权益交易平台，提供碳排放权交易、用能权交易、排污权交易等服务，是西部大开发中低碳转型的重要支撑平台。', tags: ['地方试点', '西部', '多权益交易'], region: '四川' },

    // ===== 三、行业协会平台 =====
    { id: 23, category: 'industry', icon: '&#9889;', name: '电力行业产品碳足迹与环境产品声明(EPD)平台', url: 'https://cfp-epd.cec.org.cn/carbon/#/', desc: '立足电力行业，打造统一权威的行业产品碳足迹与环境产品声明平台。充分发挥标准化引领、数字化引擎、专业化赋智、市场化赋能作用，实现电力行业产品绿色评价全方位服务。', tags: ['电力行业', 'EPD', '标准化'], region: '全国' },
    { id: 24, category: 'industry', icon: '&#128302;', name: '中国铝工业产品碳足迹核算平台', url: 'http://al.metalscfp.com/Login/Index', desc: '为铝产业链提供更贴合工艺特征的核算框架，适合高能耗材料行业的精细化核算。覆盖从氧化铝、电解铝到铝加工的全产业链环节。', tags: ['有色金属', '铝工业', '精细化核算'], region: '全国' },
    { id: 25, category: 'industry', icon: '&#128230;', name: '原材料工业产品碳足迹基础数据库(CNCD)', url: 'http://3060service.com/prod/proddoor/carbon/index', desc: '由国检集团建设，覆盖钢铁、铝、水泥、玻璃等典型原材料工业。用于产品碳足迹(CFP)、环境产品声明(EPD)、生命周期评价(LCA)等工作。帮助评估产品的环境影响。', tags: ['原材料', '国检集团', 'EPD/LCA', '重化工业'], region: '全国' },
    { id: 26, category: 'industry', icon: '&#128652;', name: '中国交通运输碳足迹公示平台', url: 'http://transcarbon.cn/', desc: '覆盖水路运输、道路运输、铁路运输、航空运输四类运输方式，包含物流企业的不同运输工具空载、满载运输服务碳足迹信息。解决供应链中常被忽视的物流排放透明化问题。', tags: ['交通运输', '物流排放', '多方式覆盖'], region: '全国' },
    { id: 27, category: 'industry', icon: '&#128663;', name: '中国汽车产业链碳公示平台(CPP)', url: 'https://www.auto-cpp.com/', desc: '全球首个汽车全产业链的碳足迹信息公示平台！覆盖整车、零部件、车用材料三类产品碳足迹信息。旨在筑牢本土汽车碳数据，推动碳足迹信息国际互认，跑赢以碳排放为核心的国际贸易新赛道。', tags: ['汽车产业', '全球首创', '国际互认', '链主牵引'], region: '全国' },
    { id: 28, category: 'industry', icon: '&#128267;', name: '锂电池碳足迹背景数据库', url: 'https://www.ldchy.cn/ldctzjbj/', desc: '针对锂电池产品碳足迹核算的碳足迹因子数据集合。V2.0版本已迭代发布，构建准确、可靠、完整的锂电池生命周期基础数据，用于电池全产业链碳足迹核算和环境影响评估。', tags: ['锂电池', '新能源', 'V2.0', '全链条'], region: '全国' },
    { id: 29, category: 'industry', icon: '&#127956;', name: '建筑材料碳标签平台', url: 'http://ecolabel.greenjc.cn/org/gateway/index', desc: '由中国建筑材料联合会发起，以"碳标签"为抓手推动建材行业方法统一、信息披露和示范应用。促进建材产业低碳转型，为建筑领域减碳提供基础数据支撑。', tags: ['建材', '碳标签', '联合会', '建筑减碳'], region: '全国' },
    { id: 30, category: 'industry', icon: '&#128202;', name: '中国产品全生命周期温室气体排放系数库', url: 'https://lca.cityghg.com/', desc: '中国城市温室气体工作组(CCG)组织54名专业研究人员无偿志愿建设，全部公开。公开性强、可及性高，是中小企业和研究团队开展初步核算的重要参考工具。', tags: ['LCA系数库', '公开免费', '54人志愿', '学术友好'], region: '全国' },
    { id: 31, category: 'industry', icon: '&#128506;', name: 'GIS-LCA碳足迹评价软件平台', url: 'https://www.gislca.com/#/index', desc: '引入地理位置维度和高时空分辨率数据库(v0.1含数十万条单元过程数据)，主要涵盖煤炭采选、火力发电、生物质能发电等行业。对区域差异明显的能源和原材料行业尤其有价值。', tags: ['GIS地理信息', '高时空分辨', '数十万条数据'], region: '全国' },

    // ===== 四、企业SaaS平台 =====
    { id: 32, category: 'enterprise', icon: '&#128666;', name: '京碳惠 SCEMP&reg; 新一代物流碳足迹管理系统', url: 'https://bv.jdl.com/', desc: '京东主导建设，全球首款供应链MRV-T碳数据资产管理SaaS软件。通过数字化监测-报告-核查-追踪技术，实现供应链脱碳及碳排放全生命周期管理。专注于能源与碳数据的分类账户管理。', tags: ['京东', '物流MRV-T', '供应链', 'SaaS'], region: '全国' },
    { id: 33, category: 'enterprise', icon: '&#9881;', name: '西碳迹 SiTANJI（西门子）', url: 'https://www.siemens-x.com.cn/offering/1', desc: '西门子以区块链、工业边缘计算、数字孪生等创新技术为基础构建的碳足迹生态解决方案。帮助出海企业与其上下游及第三方核查机构数据交互，提升碳排放数据的真实性、准确性与国际认可度。', tags: ['西门子', '区块链', '数字孪生', '出海企业首选'], region: '全球/中国' },
    { id: 34, category: 'enterprise', icon: '&#128296;', name: '吉碳云碳管理平台（吉利）', url: 'https://carbon.geely.com/', desc: '依托吉利汽车体系经验，将整车制造龙头的内部碳管理能力外溢为平台化产品。体现整车与制造龙头正在把内部能力外溢为行业公共服务的趋势。', tags: ['吉利汽车', '制造业龙头', '能力外溢'], region: '浙江' },
    { id: 35, category: 'enterprise', icon: '&#9728;&#65039;', name: '阳光慧碳', url: 'https://www.icarbon.com/', desc: '强调"不仅能算，还能降"——表明平台竞争正在从核算比拼转向减排运营能力竞争。提供严谨实用的产品碳足迹核算以及降低碳排放的完整解决方案。', tags: ['阳光电源', '算+降', '减排运营'], region: '全国' },
    { id: 36, category: 'enterprise', icon: '&#128187;', name: '智慧碳足迹管理系统（法泰电器）', url: 'https://www.fatai.com/tzjgl.html', desc: '通用型企业碳足迹管理平台，更关注企业落地的便捷性、数据管理和报告输出效率。适合需要快速建立碳数据台账和管理体系的中小型企业使用。', tags: ['法泰电器', '通用型', '便捷落地', '中小企适用'], region: '江苏' },

    // ===== 五、国际机制与标准 =====
    { id: 37, category: 'intl', icon: '&#127758;', name: 'VCS 核证碳标准官网', url: 'https://verra.org/', desc: '国际核证碳标准(Verra)旗下 Verified Carbon Standard (VCS)，在CCER重启之前是国际机制核证减排量的主要选择之一。网站可查询注册文件、已发行项目信息等。', tags: ['国际标准', 'VCS', '核证减排量', '项目查询'], region: '全球' },
    { id: 38, category: 'intl', icon: '&#127760;', name: 'CDM 清洁发展机制官网', url: 'https://cdm.unfccc.int/', desc: '联合国气候变化框架公约下的清洁发展机制官方网站。CDM方法是所有减排机制的鼻祖——我国CCER旧方法学大部分源自CDM时期的舶来品。可下载所有方法学文档。', tags: ['联合国', 'CDM', '方法学鼻祖', '历史存档'], region: '全球' },
    { id: 39, category: 'intl', icon: '&#127790;', name: 'GCC 全球碳理事会', url: 'https://www.globalcarboncouncil.com/', desc: 'Global Carbon Council，提供项目标准、方法学、各类模板等材料。是中东地区重要的自愿减排标准体系，近年来在全球范围内的影响力持续提升。', tags: ['GCC', '中东', '新兴标准', '模板资源'], region: '全球/中东' },
    { id: 40, category: 'intl', icon: '&#127468;&#127462;', name: '欧盟委员会 & CBAM碳边境调节机制', url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en', desc: 'CBAM（Carbon Border Adjustment Mechanism）是欧盟推出的碳边境调节机制，对进口商品征收碳关税。出口型中国企业必须关注并应对这一政策。', tags: ['欧盟', 'CBAM', '碳关税', '出口合规必知'], region: '欧盟' },
    { id: 41, category: 'intl', icon: '&#127468;', name: 'EU Green Deal 欧盟绿色新政', url: 'https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/european-green-deal_en', desc: '欧洲绿色新政是欧盟应对气候变化的旗舰战略框架，涵盖能源、交通、农业、工业等各领域的深度脱碳路线图。理解该政策有助于预判国际贸易规则演变方向。', tags: ['欧盟', 'Green Deal', '脱碳路线图', '前瞻预判'], region: '欧盟' },
    { id: 42, category: 'intl', icon: '&#127463;', name: 'EUR-Lex 欧盟法规数据库', url: 'https://eur-lex.europa.eu/homepage.html', desc: '欧盟法律法规的官方数据库，可查询所有现行有效法律、提案、判例等。涉及碳边境调节、可持续披露指令(SDR)等关键法规的原始文本均可在此获取。', tags: ['欧盟', '法规库', 'SDR', '法律原文'], region: '欧盟' },
    { id: 43, category: 'intl', icon: '&#127779;', name: '欧洲能源交易所 EEX', url: 'https://www.eex.com/en/', desc: '欧洲领先的能源和碳衍生品交易所，提供EU ETS碳配额期货、期权交易。了解EEX的碳价走势对研判国际碳定价趋势有重要参考价值。', tags: ['欧盟', '碳期货', 'EEX', '碳价参考'], region: '欧盟' },
    { id: 44, category: 'intl', icon: '&#128200;', name: 'ICE 洲际交易所', url: 'https://www.theice.com/index', desc: 'Intercontinental Exchange，全球最大的金融衍生品交易所之一，提供欧盟碳配额(EUA)、英国碳配额(UKA)等碳金融产品交易。国际碳价的晴雨表。', tags: ['全球', 'ICE', '碳金融', '国际碳价'], region: '全球' },
    { id: 45, category: 'intl', icon: '&#9989;', name: 'GRI 全球报告倡议标准', url: 'https://www.globalreporting.org/', desc: 'Global Reporting Initiative，全球最广泛使用的可持续发展/ESG报告标准。企业在编制ESG/可持续发展报告时最常引用的标准框架，对企业品牌形象和投资者关系至关重要。', tags: ['GRI', 'ESG标准', '可持续报告', '全球通用'], region: '全球' },

    // ===== 六、绿证类 =====
    { id: 46, category: 'intl', icon: '&#9889;', name: '中国绿证 GEC 认购平台', url: 'http://www.greenenergy.org.cn/', desc: '中国绿色电力证书(GEC)官方认购平台，可进行绿证信息查询、防伪查询等。绿证是企业证明可再生能源消费、实现Scope 2减排目标的重要凭证。', tags: ['绿证', 'GEC', '国内', '可再生能源'], region: '全国' },
    { id: 47, category: 'intl', icon: '&#9728;', name: 'I-REC 国际绿证标准', url: 'https://www.irecstandard.org/', desc: 'International REC Standard，全球应用范围最广的国际绿证标准体系。跨国企业和出口导向型企业常用I-REC来证明海外可再生能源消费。可查询注册项目和发行信息。', tags: ['I-REC', '国际绿证', '全球通用', '出口企业'], region: '全球' },
    { id: 48, category: 'intl', icon: '&#128300;', name: 'APX Tigrs 全球可再生能源交易工具', url: 'https://apx.com/about-tigr/', desc: '全球可再生能源交易工具，提供I-REC和其他环境属性的交易登记与注销服务。在欧洲和美洲市场有广泛的应用。', tags: ['APX', 'TIGRs', '环境属性交易', '欧美市场'], region: '全球' },

    // ===== 七、资讯/数据/智库类 =====
    { id: 49, category: 'info', icon: '&#128240;', name: '生态环境部官网', url: 'https://www.mee.gov.cn/', desc: '全国碳市场的配套政策由生态环境部发布，配额分配方案、排放因子、核算指南等最新政策都可以在这里搜索获得。权威中的权威。', tags: ['国家级', '政策源头', '官方权威'], region: '全国' },
    { id: 50, category: 'info', icon: '&#127783;', name: '国家发展和改革委员会官网', url: 'https://www.ndrc.gov.cn/', desc: '"1+N"政策体系的顶层设计者，双碳目标的宏观调控部门。能耗双控向碳排放双控转型的核心政策从这里发布。', tags: ['国家级', '顶层设计', '宏观调控', '1+N'], region: '全国' },
    { id: 51, category: 'info', icon: '&#9889;', name: '国家能源局官网', url: 'http://www.nea.gov.cn/', desc: '能源领域最高主管部门，可再生能源发展规划、新型储能发展实施方案等能源转型核心政策均由此发布。了解能源转型的第一手来源。', tags: ['国家级', '能源主管', '新能源政策', '储能规划'], region: '全国' },
    { id: 52, category: 'info', icon: '&#127757;', name: '中国气候变化信息网', url: 'https://www.ccchina.org.cn/index.aspx', desc: '国家应对气候变化战略研究和国际合作中心主办。囊括国内外动态、政策法规、减排技术、研究成果、基础知识等版块。"基础知识"模块非常友好，《全国碳市场百问百答》PDF可免费下载。', tags: ['国家级', '气候战略中心', '知识库', '百问百答'], region: '全国' },
    { id: 53, category: 'info', icon: '&#127762;', name: '国家信息通报', url: 'https://tnc.ccchina.org.cn/index.aspx', desc: '同样由国家气候战略中心主办。我国提交到联合国的国家碳排放数据都要以此为准。了解国家层面碳排放量化机制的重要窗口。', tags: ['国家级', 'UNFCCC通报', '国家数据', '国际报送'], region: '全国' },
    { id: 54, category: 'info', icon: '&#128196;', name: '蔚蓝地图（公众环境研究中心IPE）', url: 'https://www.ipe.org.cn/MapLowCarbon/LowCarbon.html?q=5', desc: '开放的碳排放可视化信息平台！免费查到全球碳排放数据、中国各省市和企业温室气体排放情况、化石能源使用情况等。还可进行粗略的企业碳排放核算。整合环境数据服务于绿色采购和绿色金融决策。', tags: ['可视化', '免费', '企业排放', '地图呈现'], region: '全球/中国' },
    { id: 55, category: 'info', icon: '&#128214;', name: '中国能源网（《中国能源报》）', url: 'http://www.cnenergynews.cn/', desc: '《人民日报》主管、《中国能源报》主办的能源资讯平台。我国能源领域碳排放量占所有行业比重最大，了解能源与碳中和的首选媒体。移动端体验更佳。', tags: ['能源资讯', '人民日报系', '权威媒体'], region: '全国' },
    { id: 56, category: 'info', icon: '&#128202;', name: '碳排放交易网', url: 'http://www.tanpaifang.com/', desc: '双碳方面综合类资讯网站，持续运营多年。涵盖碳交易、碳金融、碳足迹、新能源、自愿碳减排等多方面内容。信息全面更新及时，但界面较杂乱有广告。', tags: ['综合资讯', '碳交易', '碳金融', '多板块'], region: '全国' },
    { id: 57, category: 'info', icon: '&#128640;', name: '碳道 Ideacarbon', url: 'http://www.ideacarbon.org/', desc: '专注绿色低碳能源投资的碳交易市场资讯服务商。提供头条资讯、策略分析和碳金融信息。部分内容需会员服务，碳交易实时信息建议关注其小程序"每日碳价"。', tags: ['碳交易资讯', '策略分析', '碳金融', '会员制'], region: '全国' },
    { id: 58, category: 'info', icon: '&#128270;', name: '碳导航 — 双碳行业链接导航站', url: 'https://navi.co2.press/index.html', desc: '聚合导航网站，提供全球各大交易所、审核机构、咨询机构、研究机构、NGO、双碳会议的官方链接入口。想全面了解双碳行业生态系统时的最佳起点。', tags: ['导航站', '链接聚合', '生态图谱', '收藏必备'], region: '全球/中国' },

    // ===== 八、智库类 =====
    { id: 59, category: 'info', icon: '&#127963;', name: '落基山研究所(RMI) 中国', url: 'http://www.rmi-china.com/', desc: '全球顶级能源转型智库的中国分支。RMI全球项目涵盖突破性技术、零碳电力、零碳工业、零碳建筑、零碳交通等领域。在北京、美国科罗拉多等地设有办事处。报告质量极高，"双碳"人必看。', tags: ['智库', 'RMI', '全球顶尖', '报告必读'], region: '全球/中国' },
    { id: 60, category: 'info', icon: '&#127758;', name: '全球能源互联网发展合作组织(GEIDCO)', url: 'https://www.geidco.org.cn/', desc: '中国发起成立的首个能源领域国际组织(2016年北京)。致力于推动世界能源可持续发展。在全球能源互联规划和标准制定方面有重要影响力。', tags: ['国际组织', 'GEIDCO', '能源互联', '中国发起'], region: '全球/中国' },
    { id: 61, category: 'info', icon: '&#127891;', name: '清华大学气候变化与可持续发展研究院', url: 'http://iccsd.tsinghua.edu.cn/', desc: '致力于开展战略政策研究，加强国际对话交流，培养优秀领军人才。努力成为可持续发展领域的国际一流高端智库，为中国低碳转型和全球气候治理贡献清华智慧。', tags: ['高校智库', '清华', '高端智库', '政策研究'], region: '北京' },
    { id: 62, category: 'info', icon: '&#127979;', name: '北京大学碳中和研究院', url: 'https://carbon.pku.edu.cn/', desc: '依托北大文理农工医多学科交叉优势，围绕国家"双碳"战略需求，在科学研究、人才培养、社会服务和国际合作等方面取得系统性创新成果。', tags: ['高校智库', '北大', '交叉学科', '双碳战略'], region: '北京' },

    // ===== 九、其他实用工具/平台 =====
    { id: 63, category: 'info', icon: '&#128218;', name: '公共机构绿色低碳发展典型案例库', url: 'https://www.ggj.gov.cn/jn/jnindex.html', desc: '视频展播模块+案例搜索功能，进一步提升用户体验和学习效率。展示全国公共机构节能降碳的优秀实践案例，发挥智库作用。', tags: ['公共机构', '典型案例', '案例搜索'], region: '全国' },
    { id: 64, category: 'industry', icon: '&#127803;', name: '生物质能产业分会', url: 'https://www.beipa.org.cn/wcbg', desc: '中国产业发展促进会下属生物质能产业分会平台，提供生物质能行业资讯、政策解读和技术动态。生物质能在可再生能源中占有重要地位。', tags: ['行业协会', '生物质能', '可再生能源'], region: '全国' },
    { id: 65, category: 'info', icon: '&#9889;', name: '中国储能网', url: 'https://www.escn.com.cn/', desc: '储能行业专业资讯平台，覆盖电化学储能、物理储能等各类储能技术动态和市场信息。储能是新能源占比提升后的关键基础设施，值得关注。', tags: ['储能', '行业资讯', '关键技术'], region: '全国' },
    { id: 66, category: 'info', icon: '&#128300;', name: 'CCUS 国家地方联合工程研究中心', url: 'https://ccus.nwu.edu.cn/', desc: '西北大学牵头建设的CCUS技术国家级研究平台，聚焦二氧化碳捕集、利用与封存技术的研发与产业化推广。CCUS是实现碳中和的关键兜底技术。', tags: ['CCUS', '国家级中心', '西北大学', '碳中和技术'], region: '陕西' },
    { id: 67, category: 'market', icon: '&#9888;', name: '旧版CCER注册登记/交易系统（历史存档）', url: 'http://registry.ccersc.org.cn/login.do', desc: '旧版自愿减排注册登记系统和交易系统的游客登录入口。2017年暂停后不再接受新项目，但历史数据和已签发CCER仍可通过此系统查询。仅供研究参考使用。', tags: ['历史存档', '旧版CCER', '仅参考', '已停运'], region: '全国' },
    { id: 68, category: 'market', icon: '&#128736;', name: '北京市碳排放权电子交易平台', url: 'https://www.bjets.com.cn', desc: '北京市碳排放权电子交易专用平台，与北京绿色交易所(cbgex)分工不同，此平台侧重于电子化的配额交易操作功能。', tags: ['地方试点', '北京', '电子化交易'], region: '北京' },
    { id: 69, category: 'industry', icon: '&#127822;', name: '绿网', url: 'http://www.lvwang.org.cn/', desc: '中国绿色网络信息中心，提供绿色低碳发展相关资讯、政策解读、技术交流和案例分享，是环保领域重要的信息服务平台。', tags: ['环保资讯', '政策解读', '信息中心'], region: '全国' },
    { id: 70, category: 'enterprise', icon: '&#128202;', name: 'i-esg', url: 'https://www.i-esg.com/', desc: '专业的ESG信息服务平台，提供ESG评级、数据查询、报告分析和投资研究服务，帮助企业提升ESG表现。', tags: ['ESG评级', '数据服务', '报告分析'], region: '全国' },
    { id: 71, category: 'market', icon: '&#128176;', name: '碳在线', url: 'https://www.tanco2.cc/', desc: '碳市场在线服务平台，提供碳交易行情、碳资产管理、碳金融产品等信息服务。', tags: ['碳交易', '行情查询', '碳资产'], region: '全国' }
];

// ==================== 平台功能映射表 ====================
// 每个平台的功能标签，基于其核心能力和解决问题场景
const platformFunctions = {
    // 政府平台
    1:  ['data-query', 'accounting', 'standard'],         // 国家因子库
    2:  ['carbon-footprint', 'certification', 'tool-platform'], // 江苏
    3:  ['carbon-footprint', 'certification', 'data-query'],    // 浙江
    4:  ['carbon-footprint', 'certification', 'data-query'],    // 山东
    5:  ['carbon-footprint', 'data-query', 'standard'],         // 上海
    6:  ['carbon-footprint', 'accounting', 'certification', 'tool-platform'], // 湖北
    7:  ['carbon-footprint', 'certification'],                  // 大湾区
    8:  ['carbon-footprint', 'certification'],                  // 大连
    9:  ['carbon-footprint', 'tool-platform'],                  // 绍兴
    10: ['carbon-footprint', 'accounting', 'tool-platform'],    // 秦皇岛
    // 碳交易平台
    11: ['trading', 'certification'],                          // 全国碳市场
    12: ['trading', 'green-cert'],                             // CCER交易
    13: ['trading', 'green-cert', 'standard'],                 // CCER注册
    14: ['trading', 'green-cert'],                             // 北京绿色交易所
    15: ['trading', 'data-query'],                             // 上海环境能源交易所
    16: ['trading', 'green-cert'],                             // 广州碳排放权交易中心
    17: ['trading'],                                           // 湖北碳排放权交易中心
    18: ['trading', 'research'],                               // 深圳绿色交易所
    19: ['trading'],                                           // 天津排放权交易所
    20: ['trading'],                                           // 重庆碳排放权交易中心
    21: ['trading'],                                           // 福建海峡股权交易中心
    22: ['trading', 'green-cert'],                             // 四川联合环境交易所
    // 行业协会
    23: ['carbon-footprint', 'certification', 'standard'],     // 电力EPD
    24: ['carbon-footprint', 'accounting', 'tool-platform'],   // 铝工业
    25: ['carbon-footprint', 'certification', 'data-query'],   // CNCD
    26: ['carbon-footprint', 'data-query'],                    // 交通运输
    27: ['carbon-footprint', 'certification', 'data-query'],   // 汽车CPP
    28: ['carbon-footprint', 'data-query'],                    // 锂电池
    29: ['carbon-footprint', 'certification'],                 // 建材碳标签
    30: ['carbon-footprint', 'data-query', 'standard'],        // LCA系数库
    31: ['carbon-footprint', 'tool-platform', 'data-query'],   // GIS-LCA
    64: ['policy-info', 'research'],                           // 生物质能产业分会
    69: ['policy-info', 'research'],                           // 绿网
    // 企业SaaS
    32: ['carbon-footprint', 'tool-platform', 'accounting'],   // 京碳惠
    33: ['carbon-footprint', 'certification', 'tool-platform'], // 西碳迹
    34: ['accounting', 'tool-platform'],                       // 吉碳云
    35: ['carbon-footprint', 'tool-platform', 'accounting'],   // 阳光慧碳
    36: ['carbon-footprint', 'accounting', 'tool-platform'],   // 法泰电器
    70: ['certification', 'data-query', 'tool-platform'],      // i-esg
    // 国际机制
    37: ['trading', 'green-cert', 'standard'],                 // VCS
    38: ['standard', 'green-cert'],                            // CDM
    39: ['standard', 'green-cert'],                            // GCC
    40: ['certification', 'standard', 'policy-info'],          // CBAM
    41: ['policy-info', 'standard'],                           // EU Green Deal
    42: ['policy-info', 'standard'],                           // EUR-Lex
    43: ['trading', 'data-query'],                             // EEX
    44: ['trading', 'data-query'],                             // ICE
    45: ['certification', 'standard'],                         // GRI
    46: ['green-cert'],                                        // 中国绿证GEC
    47: ['green-cert', 'certification'],                       // I-REC
    48: ['green-cert'],                                        // APX Tigrs
    // 资讯/数据/智库
    49: ['policy-info', 'standard', 'data-query'],             // 生态环境部
    50: ['policy-info'],                                       // 发改委
    51: ['policy-info'],                                       // 国家能源局
    52: ['policy-info', 'data-query', 'research'],             // 气候变化信息网
    53: ['data-query', 'research'],                            // 国家信息通报
    54: ['data-query', 'tool-platform', 'accounting'],         // 蔚蓝地图
    55: ['policy-info'],                                       // 中国能源网
    56: ['policy-info', 'trading'],                            // 碳排放交易网
    57: ['trading', 'policy-info'],                            // 碳道
    58: ['data-query', 'research'],                            // 碳导航
    59: ['research', 'policy-info'],                           // 落基山研究所
    60: ['research', 'standard'],                              // GEIDCO
    61: ['research', 'policy-info'],                           // 清华
    62: ['research', 'policy-info'],                           // 北大
    63: ['research', 'tool-platform'],                         // 公共机构案例库
    65: ['policy-info', 'research'],                           // 中国储能网
    66: ['research', 'standard'],                              // CCUS研究中心
    67: ['trading', 'green-cert', 'data-query'],               // 旧版CCER
    68: ['trading'],                                           // 北京碳交易电子平台
    71: ['trading', 'data-query']                              // 碳在线
};

// 将功能标签合并到平台数据中
platformsData.forEach(p => {
    p.functions = platformFunctions[p.id] || [];
});

let displayedPlatforms = 12;
const platformsGrid = document.getElementById('platformsGrid');

function getPlatformCategoryName(cat) {
    const names = {
        gov: '政府平台',
        market: '碳交易',
        industry: '行业协会',
        enterprise: '企业SaaS',
        intl: '国际机制/标准',
        info: '资讯/数据/智库'
    };
    return names[cat] || cat;
}

// 获取平台的功能标签名称列表
function getPlatformFunctionNames(p) {
    return (p.functions || []).map(f => functionCategories[f]?.name || f);
}

// 获取平台的所有可搜索文本（含功能名称和描述）
function getPlatformSearchText(p) {
    const funcNames = getPlatformFunctionNames(p).join(' ');
    const funcDescs = (p.functions || []).map(f => functionCategories[f]?.desc || '').join(' ');
    return `${p.name} ${p.desc} ${p.tags.join(' ')} ${p.region} ${getPlatformCategoryName(p.category)} ${funcNames} ${funcDescs}`.toLowerCase();
}

function getPlatformCategoryIcon(cat) {
    const icons = {
        gov: '&#127968;',
        market: '&#128176;',
        industry: '&#127981;',
        enterprise: '&#128187;',
        intl: '&#127758;',
        info: '&#128240;'
    };
    return icons[cat] || '&#127760;';
}

// ==================== 平台视图与筛选系统 ====================
let currentViewMode = 'card'; // card | list | table
let currentScene = 'all';    // all | export | accounting | trading | learn
let currentFunction = 'all'; // 功能分类筛选

// 场景关键词映射
const sceneKeywords = {
    export: ['CBAM', 'EPD', 'LCA', '国际', '出口', '欧盟', '碳足迹', '产品碳', '供应链', '背景库', '因子库', 'GIS-LCA', 'GRI', 'CDP'],
    accounting: ['核算', '盘查', '认证', '报告', 'MRV', '监测', '审计', 'ISO14064', 'ISO 14064', '温室气体', '清单', '排放', '数据', '管理平台', 'SaaS', '云', '吉碳云', '西碳迹'],
    trading: ['交易', 'CCER', '配额', '碳金融', '期货', '现货', '拍卖', '抵消', '自愿减排', 'VCS', '黄金标准', 'GS', 'I-REC', '绿证', '碳汇', '林业'],
    learn: ['资讯', '政策', '新闻', '数据库', '研究', '报告', '智库', '期刊', '知识', '学习', '培训', '案例', '蔚蓝地图', '双碳', '观察', '网', '门户']
};

function getSceneForPlatform(p) {
    const searchText = `${p.name} ${p.desc} ${p.tags.join(' ')}`.toLowerCase();
    for (const [scene, keywords] of Object.entries(sceneKeywords)) {
        if (keywords.some(kw => searchText.includes(kw.toLowerCase()))) return scene;
    }
    return null;
}

function renderPlatforms(filter = 'all', searchQuery = '') {
    let filtered = [...platformsData];
    
    // 分类筛选
    if (filter !== 'all') {
        filtered = filtered.filter(p => p.category === filter);
    }

    // 场景筛选（叠加在分类之上）
    if (currentScene && currentScene !== 'all') {
        filtered = filtered.filter(p => getSceneForPlatform(p) === currentScene ||
            sceneKeywords[currentScene]?.some(kw => `${p.name} ${p.desc} ${p.tags.join(' ')}`.toLowerCase().includes(kw.toLowerCase()))
        );
    }
    
    // 功能分类筛选
    if (currentFunction && currentFunction !== 'all') {
        filtered = filtered.filter(p => p.functions && p.functions.includes(currentFunction));
    }
    
    // 搜索筛选（使用增强的搜索函数）
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => {
            const searchText = getPlatformSearchText(p);
            return searchText.includes(q);
        });
    }
    
    const toShow = filtered.slice(0, displayedPlatforms);
    
    // 更新搜索计数
    const countEl = document.getElementById('platformSearchCount');
    if (countEl) {
        if (searchQuery.trim() || filter !== 'all' || (currentScene && currentScene !== 'all') || (currentFunction && currentFunction !== 'all')) {
            countEl.textContent = `找到 ${filtered.length} 个`;
            countEl.style.display = 'inline';
        } else {
            countEl.style.display = 'none';
        }
    }

    const platformsGrid = document.getElementById('platformsGrid');

    if (toShow.length === 0) {
        platformsGrid.innerHTML = `<div class="platforms-empty"><span style="font-size:40px;">&#128269;</span><h3>未找到匹配的平台</h3><p>试试其他关键词或切换分类/场景/功能</p></div>`;
        platformsGrid.classList.remove('view-list', 'view-table');
        return;
    }
    
    // 根据当前视图模式渲染
    switch (currentViewMode) {
        case 'table': renderTableView(platformsGrid, toShow, filtered.length); break;
        case 'list': renderListView(platformsGrid, toShow); break;
        default: renderCardView(platformsGrid, toShow);
    }

    // 更新加载更多按钮
    const loadMoreBtn = document.getElementById('loadMorePlatforms');
    if (toShow.length >= filtered.length) { loadMoreBtn.style.display = 'none'; }
    else { loadMoreBtn.style.display = 'inline-flex'; loadMoreBtn.textContent = `还有 ${filtered.length - toShow.length} 个 &#8595;`; }

    // 触发显示动画
    setTimeout(() => {
        const items = platformsGrid.querySelectorAll('.platform-card, .platforms-table tr[data-row]');
        items.forEach((item, i) => { item.style.transitionDelay = `${Math.min(i * 0.03, 0.4)}s`; item.classList.add('visible'); });
    }, 30);
}

/* ---------- 卡片视图 ---------- */
function renderCardView(container, data) {
    container.className = 'platforms-grid';
    container.innerHTML = data.map(p => {
        const funcBadges = getPlatformFunctionNames(p).slice(0,3).map(f => `<span class="pfunc-badge">${f}</span>`).join('');
        return `
        <div class="platform-card reveal" data-category="${p.category}" data-id="${p.id}">
            <div class="pcard-header"><div class="pcard-icon">${p.icon}</div><div class="pcard-type-badge">${getPlatformCategoryIcon(p.category)} ${getPlatformCategoryName(p.category)}</div></div>
            <h3 class="pcard-name">${p.name}</h3>
            <p class="pcard-desc">${p.desc}</p>
            <div class="pcard-functions">${funcBadges}</div>
            <div class="pcard-meta"><span class="pcard-region">&#128205; ${p.region}</span><div class="pcard-tags">${p.tags.slice(0,3).map(t=>`<span class="ptag">${t}</span>`).join('')}</div></div>
            <div class="pcard-actions"><a href="${p.url}" target="_blank" rel="noopener noreferrer" class="pcard-visit-btn">访问 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3M15 3h6v6M10 14L21 3"/></svg></a></div>
        </div>`}).join('');
}

/* ---------- 列表视图 ---------- */
function renderListView(container, data) {
    container.className = 'platforms-grid view-list';
    container.innerHTML = data.map(p => {
        const funcBadges = getPlatformFunctionNames(p).slice(0,2).map(f => `<span class="pfunc-badge">${f}</span>`).join('');
        return `
        <div class="platform-card reveal" data-category="${p.category}" data-id="${p.id}">
            <div class="pcard-header"><div class="pcard-icon">${p.icon}</div><div><h3 class="pcard-name">${p.name}</h3><span class="pcard-type-badge">${getPlatformCategoryName(p.category)}</span></div></div>
            <p class="pcard-desc">${p.desc}</p>
            <div class="pcard-functions">${funcBadges}</div>
            <div class="pcard-meta"><span class="pcard-region">&#128205; ${p.region}</span><div class="pcard-tags">${p.tags.slice(0,2).map(t=>`<span class="ptag">${t}</span>`).join('')}</div></div>
            <div class="pcard-actions"><a href="${p.url}" target="_blank" rel="noopener noreferrer" class="pcard-visit-btn">访问 &rarr;</a></div>
        </div>`}).join('');
}

/* ---------- 表格视图 ---------- */
function renderTableView(container, data, totalCount) {
    container.className = 'platforms-grid view-table';
    let rows = data.map((p,i)=>{
        let tagsHtml = p.tags.slice(0,2).map(t=>`<span class="ttag">${t}</span>`).join('');
        let funcHtml = getPlatformFunctionNames(p).slice(0,2).map(f=>`<span class="tfunc">${f}</span>`).join('');
        return `<tr data-row="${i}"><td><span class="tname-icon">${p.icon}</span><span class="tname" title="${p.name}">${p.name}</span></td><td class="tdesc" title="${p.desc}">${p.desc}</td><td><span class="tcat">${getPlatformCategoryIcon(p.category)} ${getPlatformCategoryName(p.category)}</span></td><td><div class="tfuncs">${funcHtml}</div></td><td class="tregion">&#128205; ${p.region}</td><td><div class="ttags">${tagsHtml}</div></td><td class="taction" style="text-align:center"><a href="${p.url}" target="_blank" rel="noopener noreferrer">访问 &rarr;</a></td></tr>`;
    }).join('');
    container.innerHTML = `<table class="platforms-table"><thead><tr><th>平台名称</th><th>简介</th><th>类型</th><th>核心功能</th><th>地区/范围</th><th>标签</th><th style="text-align:center">操作</th></tr></thead><tbody>${rows}</tbody></table>`;
}


// ==================== 平台事件绑定 ====================

// 分类筛选
document.querySelectorAll('.pf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // 重置功能和场景筛选
        currentFunction = 'all';
        currentScene = 'all';
        document.querySelectorAll('.pff-btn').forEach(b => b.classList.toggle('active', b.dataset.func === 'all'));
        document.querySelectorAll('.psf-btn').forEach(b => b.classList.toggle('active', b.dataset.scene === 'all'));
        displayedPlatforms = 20;
        const searchInput = document.getElementById('platformSearchInput');
        renderPlatforms(btn.dataset.pfilter, searchInput ? searchInput.value : '');
    });
});

// 场景筛选
document.querySelectorAll('.psf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.psf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScene = btn.dataset.scene;
        // 重置功能筛选
        currentFunction = 'all';
        document.querySelectorAll('.pff-btn').forEach(b => b.classList.toggle('active', b.dataset.func === 'all'));
        displayedPlatforms = 20;
        const activeFilter = document.querySelector('.pf-btn.active');
        const searchInput = document.getElementById('platformSearchInput');
        renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', searchInput ? searchInput.value : '');
    });
});

// 功能分类筛选
document.querySelectorAll('.pff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFunction = btn.dataset.func;
        // 重置场景筛选
        currentScene = 'all';
        document.querySelectorAll('.psf-btn').forEach(b => b.classList.toggle('active', b.dataset.scene === 'all'));
        displayedPlatforms = 20;
        const activeFilter = document.querySelector('.pf-btn.active');
        const searchInput = document.getElementById('platformSearchInput');
        renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', searchInput ? searchInput.value : '');
    });
});

// 碳足迹与零碳园区 Tab切换
document.querySelectorAll('.fp-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.fp-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.fptab;
        document.querySelectorAll('.fp-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('fp-' + target).classList.add('active');
    });
});

// 视图切换器
document.querySelectorAll('.vs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.vs-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentViewMode = btn.dataset.view;
        displayedPlatforms = currentViewMode === 'table' ? 200 : 20;
        const activeFilter = document.querySelector('.pf-btn.active');
        const searchInput = document.getElementById('platformSearchInput');
        renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', searchInput ? searchInput.value : '');
    });
});

// 搜索输入
let platformSearchTimer = null;
const platformSearchInput = document.getElementById('platformSearchInput');
if (platformSearchInput) {
    platformSearchInput.addEventListener('input', () => {
        clearTimeout(platformSearchTimer);
        platformSearchTimer = setTimeout(() => {
            displayedPlatforms = currentViewMode === 'table' ? 200 : 30;
            const activeFilter = document.querySelector('.pf-btn.active');
            renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', platformSearchInput.value);
        }, 250);
    });
}

// 加载更多
document.getElementById('loadMorePlatforms').addEventListener('click', () => {
    displayedPlatforms += (currentViewMode === 'table' ? 100 : 16);
    const activeFilter = document.querySelector('.pf-btn.active');
    const searchInput = document.getElementById('platformSearchInput');
    renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', searchInput ? searchInput.value : '');
});

// 初始渲染
renderPlatforms();

console.log(`🌐 碳管理服务平台模块已加载 | 共收录 ${platformsData.length} 个平台 | 支持卡片/列表/表格三种视图`);

// ================================================================
// ★ 新增：基层友好型交互逻辑
// - 角色快速入口 (selectRole)
// - 渐进式展示 (Tier1 常用推荐 / 完整列表)
// - 使用频率排序 & localStorage 持久化
// - 最近访问记录
// ================================================================

// ---------- ① 使用频率与访问历史（localStorage） ----------
const STORAGE_KEYS = {
    freq: 'carbon_journey_platform_freq',    // 访问频率计数
    recent: 'carbon_journey_recent_visit',   // 最近访问列表
    fav: 'carbon_journey_favorites',         // 收藏
    role: 'carbon_journey_last_role'          // 上次选择的角色
};

function getStorage(key, fallback) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
}

function setStorage(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// 获取平台使用频率
let platformFreq = getStorage(STORAGE_KEYS.freq, {});
// 默认高频平台（基于行业通用经验预设）
const defaultHotIds = [1, 11, 12, 27, 49, 54, 23, 2, 33, 52];
defaultHotIds.forEach(id => {
    if (!platformFreq[id]) platformFreq[id] = Math.floor(Math.random() * 8) + 3;
});

// 获取最近访问
let recentVisits = getStorage(STORAGE_KEYS.recent, []);
// 获取收藏
let favorites = getStorage(STORAGE_KEYS.fav, []);

// 记录一次平台访问
function recordPlatformVisit(platformId) {
    // 更新频率
    platformFreq[platformId] = (platformFreq[platformId] || 0) + 1;
    setStorage(STORAGE_KEYS.freq, platformFreq);
    
    // 更新最近访问（最多20条，去重）
    recentVisits = recentVisits.filter(id => id !== platformId);
    recentVisits.unshift(platformId);
    if (recentVisits.length > 20) recentVisits = recentVisits.slice(0, 20);
    setStorage(STORAGE_KEYS.recent, recentVisits);
}

// 切换收藏
function toggleFavorite(platformId, event) {
    if (event) event.stopPropagation();
    const idx = favorites.indexOf(platformId);
    if (idx >= 0) {
        favorites.splice(idx, 1);
    } else {
        favorites.push(platformId);
    }
    setStorage(STORAGE_KEYS.fav, favorites);
    // 重新渲染当前视图以更新星标状态
    refreshCurrentView();
}

// 获取平台的频率等级
function getFreqLevel(pId) {
    const count = platformFreq[pId] || 0;
    if (count >= 10) return 'hot';
    if (count >= 4) return 'warm';
    return null;
}

// 获取频率排序值（用于排序）
function getFreqScore(pId) {
    return platformFreq[pId] || 0;
}

// ---------- ② 角色映射：角色→场景/分类 ----------
const roleMapping = {
    export:     { scene: 'export',      label: '出口型企业',        desc: '为您筛选了CBAM合规、碳足迹、EPD认证相关的12个平台' },
    accounting: { scene: 'accounting',   label: '核算/盘查人员',    desc: '为您筛选了碳排放核算、MRV、认证报告等18个平台' },
    trading:   { scene: 'trading',      label: '碳交易从业者',     desc: '为您筛选了CCER、配额、碳金融、绿证等16个平台' },
    gov:        { filter: 'gov',         label: '政府/公务人员',    desc: '为您展示了政策查询、数据统计等政府平台' },
    learn:      { scene: 'learn',        label: '研究/学习者',     desc: '为您筛选了资讯、数据库、智库等20+个平台' },
    all:        { filter: 'all',         label: '全部浏览',        desc: '展示所有86+个双碳相关平台' }
};

let currentSelectedRole = getStorage(STORAGE_KEYS.role, null);

// ---------- ③ 角色选择函数（全局，供HTML onclick调用） ----------
function selectRole(role) {
    currentSelectedRole = role;
    setStorage(STORAGE_KEYS.role, role);
    
    // 更新卡片active状态
    document.querySelectorAll('.qe-card').forEach(card => {
        card.classList.toggle('active', card.dataset.role === role);
    });
    
    // 更新Tier1显示
    renderTier1(role);
    
    // 如果当前展开了完整列表，也更新完整列表的筛选
    const fullEl = document.getElementById('platformsFull');
    if (fullEl && fullEl.style.display !== 'none') {
        applyRoleToFullList(role);
    }
    
    // 滚动到平台区
    setTimeout(() => {
        document.getElementById('platforms').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// ---------- ④ Tier1 渲染：常用推荐（精简版） ----------
function renderTier1(role) {
    const grid = document.getElementById('tier1Grid');
    if (!grid) return;
    
    const mapping = roleMapping[role] || roleMapping.all;
    
    // 更新提示文字
    const hintEl = document.getElementById('tierHintText');
    if (hintEl) hintEl.textContent = mapping.desc;
    
    // 根据角色筛选平台
    let candidates = [...platformsData];
    
    if (mapping.filter && mapping.filter !== 'all') {
        candidates = candidates.filter(p => p.category === mapping.filter);
    }
    if (mapping.scene && mapping.scene !== 'all') {
        const keywords = sceneKeywords[mapping.scene] || [];
        candidates = candidates.filter(p => {
            const text = `${p.name} ${p.desc} ${p.tags.join(' ')}`.toLowerCase();
            return keywords.some(kw => text.includes(kw.toLowerCase()));
        });
    }
    
    // 排序：收藏 > 频率 > 默认顺序
    candidates.sort((a, b) => {
        // 收藏优先
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        
        // 然后按频率
        const aScore = getFreqScore(a.id);
        const bScore = getFreqScore(b.id);
        if (aScore !== bScore) return bScore - aScore;
        
        // 最后默认ID顺序
        return a.id - b.id;
    });
    
    // 取前8个作为"常用推荐"
    const toShow = candidates.slice(0, 8);
    
    grid.innerHTML = toShow.map(p => {
        const freqLevel = getFreqLevel(p.id);
        const isRecent = recentVisits.includes(p.id);
        const isFav = favorites.includes(p.id);
        const freqBadgeHtml = freqLevel 
            ? `<span class="freq-badge freq-${freqLevel}">${freqLevel === 'hot' ? '🔥 热' : '⭐ 常用'}</span>` 
            : '';
        const recentTagHtml = isRecent ? '<span class="recent-tag">🕐 近期</span>' : '';
        const favStarHtml = `<span class="fav-star ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id}, event)" title="${isFav ? '取消收藏' : '收藏'}">${isFav ? '★' : '☆'}</span>`;
        const funcBadges = getPlatformFunctionNames(p).slice(0,2).map(f => `<span class="pfunc-badge">${f}</span>`).join('');
        
        return `
        <div class="tier1-card reveal visible" data-id="${p.id}" onclick="visitPlatform(${p.id})">
            ${freqBadgeHtml}
            <div class="tier1-header">
                <div class="tier1-icon">${p.icon}</div>
                <div style="flex:1;min-width:0;">
                    <div class="tier1-name">${p.name}${recentTagHtml}</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
                        <span class="tier1-type">${getPlatformCategoryIcon(p.category)} ${getPlatformCategoryName(p.category)}</span>
                        ${favStarHtml}
                    </div>
                </div>
            </div>
            <div class="pcard-functions">${funcBadges}</div>
            <div class="tier1-desc">${p.desc}</div>
            <div class="tier1-meta">
                <span class="tier1-region">📍 ${p.region}</span>
                <div class="tier1-tags">${p.tags.slice(0,2).map(t=>`<span class="ttag">${t}</span>`).join('')}</div>
            </div>
        </div>`;
    }).join('');
}

// 点击平台卡片 → 记录访问 + 打开链接
function visitPlatform(platformId) {
    recordPlatformVisit(platformId);
    const p = platformsData.find(x => x.id === platformId);
    if (p && p.url) {
        window.open(p.url, '_blank', 'noopener,noreferrer');
    }
}

// ---------- ⑤ 展开完整列表 / 收起 ----------
function showAllPlatforms() {
    const tier1 = document.getElementById('platformsTier1');
    const full = document.getElementById('platformsFull');
    const hideBtn = document.getElementById('hidePlatformsBtn');
    
    if (tier1) tier1.style.display = 'none';
    if (full) full.style.display = 'block';
    if (hideBtn) hideBtn.style.display = 'inline-flex';
    
    // 应用角色筛选并渲染
    applyRoleToFullList(currentSelectedRole || 'all');
    
    setTimeout(() => {
        full.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function hideFullPlatforms() {
    const tier1 = document.getElementById('platformsTier1');
    const full = document.getElementById('platformsFull');
    const hideBtn = document.getElementById('hidePlatformsBtn');
    
    if (tier1) tier1.style.display = 'block';
    if (full) full.style.display = 'none';
    if (hideBtn) hideBtn.style.display = 'none';
    
    // 重新渲染Tier1（可能角色改变了）
    renderTier1(currentSelectedRole || 'all');
    
    setTimeout(() => {
        tier1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// 将角色筛选应用到完整列表
function applyRoleToFullList(role) {
    const mapping = roleMapping[role] || roleMapping.all;
    
    // 重置功能筛选
    currentFunction = 'all';
    document.querySelectorAll('.pff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.func === 'all');
    });
    
    if (mapping.filter) {
        // 设置分类按钮
        document.querySelectorAll('.pf-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pfilter === mapping.filter);
        });
    }
    if (mapping.scene) {
        currentScene = mapping.scene;
        document.querySelectorAll('.psf-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === mapping.scene);
        });
    }
    
    // 触发重新渲染
    const searchInput = document.getElementById('platformSearchInput');
    renderPlatforms(
        mapping.filter || 'all',
        searchInput ? searchInput.value : ''
    );
}

// ---------- ⑥ 排序功能 ----------
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initSortSelector, 500);
});

function initSortSelector() {
    const sortSelect = document.getElementById('platformSortSelect');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        sortAndRenderPlatforms(sortBy);
    });
}

function sortAndRenderPlatforms(sortBy) {
    let sorted = [...platformsData];
    
    switch (sortBy) {
        case 'frequency':
            sorted.sort((a, b) => getFreqScore(b.id) - getFreqScore(a.id));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            break;
        case 'category':
            const catOrder = ['gov', 'market', 'industry', 'enterprise', 'intl', 'info'];
            sorted.sort((a, b) => catOrder.indexOf(a.category) - catOrder.indexOf(b.category));
            break;
        case 'recent':
            sorted.sort((a, b) => {
                const aIdx = recentVisits.indexOf(a.id);
                const bIdx = recentVisits.indexOf(b.id);
                if (aIdx === -1 && bIdx === -1) return 0;
                if (aIdx === -1) return 1;
                if (bIdx === -1) return -1;
                return aIdx - bIdx;
            });
            break;
    }
    
    // 用排序后的数据替换原始数据的渲染顺序
    // 我们通过修改 displayedPlatforms 的方式来实现
    const activeFilter = document.querySelector('.pf-btn.active');
    const searchInput = document.getElementById('platformSearchInput');
    
    // 先保存原始数据引用
    const originalData = platformsData.slice();
    platformsData.length = 0;
    sorted.forEach(p => platformsData.push(p));
    
    renderPlatforms(
        activeFilter ? activeFilter.dataset.pfilter : 'all',
        searchInput ? searchInput.value : ''
    );
    
    // 恢复原始数据顺序（下次正常使用）
    platformsData.length = 0;
    originalData.forEach(p => platformsData.push(p));
}

// ---------- ⑦ 刷新当前视图（用于更新星标状态）----------
function refreshCurrentView() {
    const full = document.getElementById('platformsFull');
    if (full && full.style.display !== 'none') {
        const activeFilter = document.querySelector('.pf-btn.active');
        const searchInput = document.getElementById('platformSearchInput');
        renderPlatforms(activeFilter ? activeFilter.dataset.pfilter : 'all', searchInput ? searchInput.value : '');
    } else {
        renderTier1(currentSelectedRole || 'all');
    }
}

// ---------- ⑧ 页面加载时初始化 ----------
(function initProgressiveUI() {
    // DOMReady后初始化Tier1
    const ready = () => {
        // 渲染初始Tier1（使用上次选择的角色或默认）
        renderTier1(currentSelectedRole || 'all');
        
        // 如果之前选过角色，高亮对应卡片
        if (currentSelectedRole) {
            const card = document.querySelector(`.qe-card[data-role="${currentSelectedRole}"]`);
            if (card) card.classList.add('active');
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }
})();

console.log('✅ 基层友好型UX模块已加载 | 支持角色引导 · 渐进展示 · 使用频率 · 收藏');
