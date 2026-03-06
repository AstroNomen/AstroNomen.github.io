document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('.site-footer');
  const tocSidebar = document.querySelector('.single-sidebar');
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  const toolsDock = document.querySelector('.metro-tools-dock');
  const backToTopBtn = document.getElementById('back-to-top');

  // ==========================================
  // 1. 目录功能
  // ==========================================
  const headers = document.querySelectorAll('.single-content h2[id], .single-content h3[id], .single-content h4[id]');
  
  if (tocLinks.length > 0 && headers.length > 0) {
    const scrollspyObserver = new IntersectionObserver(entries => {
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
    }, { rootMargin: '0px 0px -75% 0px' });

    headers.forEach(header => scrollspyObserver.observe(header));
  }

  // ==========================================
  // 2. Footer: 侧边栏自动隐藏
  // ==========================================
  let isFooterVisible = false;
  
  if (footer) {
    const footerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isFooterVisible = entry.isIntersecting;
        
        if (tocSidebar) {
           isFooterVisible ? tocSidebar.classList.add('fade-out') : tocSidebar.classList.remove('fade-out');
        }
        
        updateDockVisibility();
      });
    }, { rootMargin: '0px', threshold: 0.1 }); 

    footerObserver.observe(footer);
  }

  const updateDockVisibility = () => {
    if (toolsDock) {
      if (window.scrollY > 300 && !isFooterVisible) {
        toolsDock.classList.add('show');
      } else {
        toolsDock.classList.remove('show');
      }
    }
  };

  window.addEventListener('scroll', updateDockVisibility);

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo(0, 0));
  }

  // ==========================================
  // 3. 移动端目录抽屉逻辑
  // ==========================================
  const tocToggleBtn = document.getElementById('mobile-toc-toggle');
  const tocBackdrop = document.querySelector('.toc-backdrop');
  const closeTocBtn = document.getElementById('close-toc-btn');

  if (tocToggleBtn && tocSidebar && tocBackdrop) {
    
    const closeToc = () => {
      tocSidebar.classList.remove('sheet-open');
      tocBackdrop.classList.remove('show');
      document.documentElement.style.overflow = '';
    };

    const openToc = () => {
      tocSidebar.classList.add('sheet-open');
      tocBackdrop.classList.add('show');
      document.documentElement.style.overflow = 'hidden'; 
    };

    if (closeTocBtn) closeTocBtn.addEventListener('click', closeToc);
    tocToggleBtn.addEventListener('click', openToc);
    tocBackdrop.addEventListener('click', closeToc);

    // 点击外部非目录区域退出
    document.addEventListener('click', (e) => {
      if (tocSidebar.classList.contains('sheet-open') &&
          !tocSidebar.contains(e.target) &&
          !tocToggleBtn.contains(e.target)) {
        closeToc();
      }
    });

    if (tocLinks.length > 0) {
      tocLinks.forEach(link => link.addEventListener('click', closeToc));
    }
  }

  // ==========================================
  // 4. 图片灯箱 (Lightbox)
  // ==========================================
  const lightbox = document.createElement('div');
  lightbox.className = 'metro-lightbox';
  lightbox.innerHTML = `<img src="" alt="Enlarged image">`;
  document.body.appendChild(lightbox);
  
  const lightboxImg = lightbox.querySelector('img');

  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.metro-figure img')) {
      lightboxImg.src = e.target.src; 
      lightbox.classList.add('active'); 
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden'; 
    } 
    else if (e.target.closest('.metro-lightbox')) {
      lightbox.classList.remove('active'); 
      document.documentElement.style.overflow = '';
      document.body.style.overflow = ''; 
    }
  });

  // ==========================================
  // 5. 隐私链接
  // ==========================================
  document.querySelectorAll('.protected-email').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      window.location.href = 'mailto:' + this.getAttribute('data-contact'); 
    });
  });

  document.querySelectorAll('.secure-social').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const encodedUrl = this.getAttribute('data-sl');
      if (encodedUrl) window.open(atob(encodedUrl), '_blank', 'noopener,noreferrer');
    });
  });

});