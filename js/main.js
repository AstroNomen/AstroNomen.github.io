document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. 目录点击平滑滚动 & 历史记录保护
  // ==========================================
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      const targetId = decodeURIComponent(this.getAttribute('href').substring(1)); 
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, null, '#' + targetId);
      }
    });
  });

  // ==========================================
  // 2. 目录滚动监听 (Scrollspy) -> 负责高亮和展开动画
  // ==========================================
  const headers = document.querySelectorAll('.single-content h2[id], .single-content h3[id], .single-content h4[id]');
  
  if (tocLinks.length > 0 && headers.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          
          tocLinks.forEach(link => {
            link.classList.remove('active');
            const li = link.closest('li');
            if (li) li.classList.remove('active-parent');
          });

          const id = entry.target.getAttribute('id');
          const activeLink = document.querySelector(`#TableOfContents a[href="#${CSS.escape(id)}"]`);
          
          if (activeLink) {
            activeLink.classList.add('active');
            let parentLi = activeLink.closest('li');
            while (parentLi) {
              parentLi.classList.add('active-parent');
              parentLi = parentLi.parentElement.closest('li'); 
            }
          }
        }
      });
    }, {
      rootMargin: '0px 0px -75% 0px' 
    });

    headers.forEach(header => observer.observe(header));
  }

  // ==========================================
  // 3. 极简图片灯箱引擎 (Lightbox) - 终极事件委托版
  // ==========================================
  
  // 1. 动态创建灯箱结构并插入
  const lightbox = document.createElement('div');
  lightbox.className = 'metro-lightbox';
  lightbox.innerHTML = `<img src="" alt="Enlarged image">`;
  document.body.appendChild(lightbox);
  
  const lightboxImg = lightbox.querySelector('img');

  // 2. 🎯 使用“事件委托”监听全局点击
  document.body.addEventListener('click', (e) => {
    
    // 如果点击的是正文里的图片
    if (e.target.matches('.metro-figure img')) {
      lightboxImg.src = e.target.src; 
      lightbox.classList.add('active'); 
      
      // 🎯 双重锁死：同时锁住 html 和 body 的滚动条！
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden'; 
    } 
    // 如果点击的是已经弹出的灯箱背景或大图
    else if (e.target.closest('.metro-lightbox')) {
      lightbox.classList.remove('active'); 
      
      // 🎯 解除双重锁定，恢复网页滚动！
      document.documentElement.style.overflow = '';
      document.body.style.overflow = ''; 
    }
    
  });

  // ==========================================
  // 4. 工具箱逻辑 (下拉显示，触底极其优雅地隐藏)
  // ==========================================
  const toolsDock = document.querySelector('.metro-tools-dock');
  const backToTopBtn = document.getElementById('back-to-top');
  const footer = document.querySelector('.site-footer');

  if (toolsDock && backToTopBtn) {
    let isFooterVisible = false;

    // 监听 Footer 是否进入视口
    if (footer) {
      const footerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isFooterVisible = entry.isIntersecting;
          updateDockVisibility(); // 状态改变时，更新显示状态
        });
      }, { rootMargin: '0px' });
      footerObserver.observe(footer);
    }

    // 核心显隐逻辑
    const updateDockVisibility = () => {
      // 只有在：向下滚动超过 300px，并且 Footer 没有出现时，才显示！
      if (window.scrollY > 300 && !isFooterVisible) {
        toolsDock.classList.add('show');
      } else {
        toolsDock.classList.remove('show');
      }
    };

    // 监听滚动
    window.addEventListener('scroll', updateDockVisibility);

    // 点击回到顶部
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 5. 移动端目录抽屉逻辑 (Bottom Sheet)
  // ==========================================
  const tocToggleBtn = document.getElementById('mobile-toc-toggle');
  const tocSidebar = document.querySelector('.single-sidebar');
  const tocBackdrop = document.querySelector('.toc-backdrop');
  const allTocLinks = document.querySelectorAll('#TableOfContents a');

  if (tocToggleBtn && tocSidebar && tocBackdrop) {
    // 点击按钮，弹出抽屉和遮罩
    tocToggleBtn.addEventListener('click', () => {
      tocSidebar.classList.add('sheet-open');
      tocBackdrop.classList.add('show');
      document.documentElement.style.overflow = 'hidden'; // 锁死背景滚动
    });

    // 点击遮罩，关闭抽屉
    tocBackdrop.addEventListener('click', () => {
      tocSidebar.classList.remove('sheet-open');
      tocBackdrop.classList.remove('show');
      document.documentElement.style.overflow = '';
    });

    // 🎯 点击目录里的任何一个链接跳转后，自动关闭抽屉！
    allTocLinks.forEach(link => {
      link.addEventListener('click', () => {
        tocSidebar.classList.remove('sheet-open');
        tocBackdrop.classList.remove('show');
        document.documentElement.style.overflow = '';
      });
    });
  }


});