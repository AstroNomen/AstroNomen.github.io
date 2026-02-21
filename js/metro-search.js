document.addEventListener('DOMContentLoaded', () => {
    
// ==========================================
// 1. 页面滚动监听逻辑
// ==========================================
const header = document.getElementById('siteHeader');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 20) {
    header.classList.add('scrolled');
    } else {
    header.classList.remove('scrolled');
    }

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
    header.classList.add('header-hidden');
    } else {
    header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
});

// ==========================================
// 2. 搜索组件交互逻辑 (现已安全包裹！)
// ==========================================
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// 安全检查：如果找不到搜索组件，不执行后续代码防止报错
if (!searchToggleBtn || !searchInput) return;

let fuse; // 存储 Fuse 实例
let searchData = []; // 存储文章数据

// 切换搜索框
searchToggleBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const isActive = searchContainer.classList.toggle('is-active');
    
    if (isActive) {
    setTimeout(() => searchInput.focus(), 100);
    
    // 静默下载 JSON
    if (!fuse) {
        try {
        const res = await fetch('/index.json');
        
        // 检查网络请求是否成功 (非 404)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        searchData = await res.json();
        
        // 初始化 Fuse
        fuse = new Fuse(searchData, {
            keys: ['title', 'summary'], 
            threshold: 0.3, 
            ignoreLocation: true
        });
        console.log("Fuse.js is ready!"); // 测试用：你可以在按 F12 的 Console 里看到这句话
        } catch (err) {
        console.error('搜索数据加载失败:', err);
        }
    }
    } else {
    searchInput.value = '';
    searchResults.style.display = 'none';
    }
});

// 实时监听输入，进行搜索
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    if (!query || !fuse) {
    searchResults.style.display = 'none';
    return;
    }

    const results = fuse.search(query).slice(0, 5);
    
    if (results.length > 0) {
    searchResults.innerHTML = results.map(r => `
        <a href="${r.item.permalink}" class="search-result-item">
        <div class="search-title">${r.item.title}</div>
        <div class="search-date">${r.item.date}</div>
        </a>
    `).join('');
    searchResults.style.display = 'block';
    } else {
    searchResults.innerHTML = '<div class="search-empty">No results found.</div>';
    searchResults.style.display = 'block';
    }
});

// 点击空白处收起
document.addEventListener('click', (e) => {
    if (searchContainer.classList.contains('is-active') && !searchContainer.contains(e.target)) {
    searchContainer.classList.remove('is-active');
    searchInput.value = '';
    searchResults.style.display = 'none';
    }
});

// 阻止冒泡
searchInput.addEventListener('click', (e) => e.stopPropagation());
if(searchResults) {
    searchResults.addEventListener('click', (e) => e.stopPropagation());
}

// ==========================================
// 3. 移动端全屏菜单交互
// ==========================================
const mobileToggleBtn = document.getElementById('mobileToggleBtn');
const siteHeader = document.getElementById('siteHeader');

if (mobileToggleBtn) {
  mobileToggleBtn.addEventListener('click', () => {
    siteHeader.classList.toggle('menu-open');
    document.body.classList.toggle('menu-open');
  });
}

// 🎯 补上：点击移动端导航链接后，自动关闭遮罩层
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
  });
});

// ==========================================
// 4. 移动端搜索逻辑 (复用 Fuse.js)
// ==========================================
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchResults = document.getElementById('mobileSearchResults');

if (mobileSearchInput) {
mobileSearchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    
    // 按需加载数据和 Fuse (避免未输入时不必要的网络请求)
    if (!fuse && query) {
    try {
        const res = await fetch('/index.json');
        if (res.ok) {
        searchData = await res.json();
        fuse = new Fuse(searchData, {
            keys: ['title', 'summary'], 
            threshold: 0.3, 
            ignoreLocation: true
        });
        }
    } catch (err) {
        console.error('Mobile search load failed:', err);
    }
    }

    if (!query || !fuse) {
    mobileSearchResults.style.display = 'none';
    return;
    }

    const results = fuse.search(query).slice(0, 5); // 移动端屏幕小，最多显示 5 条
    
    if (results.length > 0) {
    mobileSearchResults.innerHTML = results.map(r => `
        <a href="${r.item.permalink}" class="search-result-item">
        <div class="search-title">${r.item.title}</div>
        <div class="search-date">${r.item.date}</div>
        </a>
    `).join('');
    mobileSearchResults.style.display = 'block';
    } else {
    mobileSearchResults.innerHTML = '<div class="search-empty">No results.</div>';
    mobileSearchResults.style.display = 'block';
    }
});
}


});

