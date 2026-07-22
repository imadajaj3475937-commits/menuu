/* ============================================================
   ELECTRONIC RESTAURANT MENU - JAVASCRIPT
   Core Logic, Sanity IO Integration, and UI Interactions
   ============================================================ */

// إعدادات الاتصال بقاعدة بيانات Sanity
const sanityConfig = {
    projectId: 'l97o3isf',
    dataset: 'production',
    apiVersion: '2023-05-03'
};

// تم إزالة الاعتماد على window.SanityClient بالكامل

// 2. Application State
let menuData = {
    restaurantInfo: {},
    categories: [],
    foods: []
};
let favorites = JSON.parse(localStorage.getItem('menu_favorites')) || [];

// 3. DOM Elements
const dom = {
    loadingScreen: document.getElementById('loadingScreen'),
    themeToggle: document.getElementById('themeToggle'),
    searchBtn: document.getElementById('searchBtn'),
    searchContainer: document.getElementById('searchContainer'),
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    restaurantName: document.getElementById('restaurantName'),
    restaurantDesc: document.getElementById('restaurantDesc'),
    restaurantLogo: document.getElementById('restaurantLogo'),
    heroCover: document.getElementById('heroCover'),
    categoriesContainer: document.getElementById('categoriesContainer'),
    menuSectionsContainer: document.getElementById('menuSectionsContainer'),
    emptyState: document.getElementById('emptyState'),
    resetSearchBtn: document.getElementById('resetSearchBtn'),
    // Footer Elements
    footerAddress: document.getElementById('footerAddress'),
    footerPhone: document.getElementById('footerPhone'),
    footerHours: document.getElementById('footerHours'),
    linkFacebook: document.getElementById('linkFacebook'),
    linkInstagram: document.getElementById('linkInstagram'),
    linkWhatsapp: document.getElementById('linkWhatsapp'),
    footerCopyName: document.getElementById('footerCopyName'),
    // Modals
    modalOverlay: document.getElementById('modalOverlay'),
    foodModal: document.getElementById('foodModal'),
    modalClose: document.getElementById('modalClose'),
    modalImage: document.getElementById('modalImage'),
    modalTitle: document.getElementById('modalTitle'),
    modalDescription: document.getElementById('modalDescription'),
    modalPrice: document.getElementById('modalPrice'),
    modalIngredients: document.getElementById('modalIngredients'),
    modalCalories: document.getElementById('modalCalories'),
    modalProtein: document.getElementById('modalProtein'),
    modalFavorite: document.getElementById('modalFavorite'),
    orderBtn: document.getElementById('orderBtn'),
    // FAB & Scroll
    backToTopBtn: document.getElementById('backToTopBtn'),
    scrollProgress: document.getElementById('scrollProgress'),
    toast: document.getElementById('toast')
};

// 4. Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchMenuData();
    setupEventListeners();
});

// 5. Theme Management (Dark / Light Mode)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(isDark ? 'تم تفعيل الوضع الداكن' : 'تم تفعيل الوضع الفاتح');
}

// 6. Fetch Data from Sanity IO using GROQ and native fetch()
async function fetchMenuData() {
    const query = `{
        "restaurantInfo": *[_type == "restaurantSettings"][0]{
            name, description, address, phone, whatsapp, facebook, instagram,
            "logoUrl": logo.asset->url,
            "coverUrl": coverImage.asset->url,
            workHours
        },
        "categories": *[_type == "category"] | order(orderAsc),
        "foods": *[_type == "foodItem" && availability == true] | order(_createdAt desc){
            ...,
            "imageUrl": image.asset->url,
            "categorySlug": category->slug.current,
            "categoryName": category->name
        }
    }`;

    try {
        const encodedQuery = encodeURIComponent(query);

        // إضافة حرف v قبل الـ apiVersion ليتوافق مع معايير Sanity API
        const url = `https://${sanityConfig.projectId}.api.sanity.io/v${sanityConfig.apiVersion}/data/query/${sanityConfig.dataset}?query=${encodedQuery}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        const data = result.result;
        
        menuData.restaurantInfo = data.restaurantInfo || {};
        menuData.categories = data.categories || [];
        menuData.foods = data.foods || [];

        renderRestaurantInfo();
        renderCategories();
        renderMenu(menuData.foods);
        
    } catch (error) {
        console.error("Error fetching data from Sanity:", error);
        showToast("فشل في تحميل البيانات، تحقق من الاتصال");
    } finally {
        if (dom.loadingScreen) dom.loadingScreen.classList.add('hidden');
    }
}

// 7. Render Restaurant Info to UI
function renderRestaurantInfo() {
    const info = menuData.restaurantInfo;
    if (!info) return;

    if (info.name) {
        if (dom.restaurantName) dom.restaurantName.textContent = info.name;
        if (dom.footerCopyName) dom.footerCopyName.textContent = info.name;
        const navAppTitle = document.getElementById('navAppTitle');
        if (navAppTitle) navAppTitle.textContent = info.name;
    }
    if (info.description && dom.restaurantDesc) dom.restaurantDesc.textContent = info.description;
    if (info.logoUrl && dom.restaurantLogo) dom.restaurantLogo.src = info.logoUrl;
    if (info.coverUrl && dom.heroCover) dom.heroCover.src = info.coverUrl;
    if (info.address && dom.footerAddress) dom.footerAddress.textContent = info.address;
    
    if (info.phone && dom.footerPhone) {
        dom.footerPhone.textContent = info.phone;
        dom.footerPhone.closest('a').href = `tel:${info.phone}`;
        const callBtn = document.getElementById('callBtn');
        if (callBtn) callBtn.onclick = () => window.open(`tel:${info.phone}`);
    }

    // Social Links
    if (dom.linkFacebook) info.facebook ? dom.linkFacebook.href = info.facebook : dom.linkFacebook.classList.add('hidden');
    if (dom.linkInstagram) info.instagram ? dom.linkInstagram.href = info.instagram : dom.linkInstagram.classList.add('hidden');
    
    if (info.whatsapp && dom.linkWhatsapp) {
        dom.linkWhatsapp.href = `https://wa.me/${info.whatsapp}`;
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) whatsappBtn.onclick = () => window.open(`https://wa.me/${info.whatsapp}`);
    } else if (dom.linkWhatsapp) {
        dom.linkWhatsapp.classList.add('hidden');
    }

    // Work Hours
    if (info.workHours && info.workHours.length > 0 && dom.footerHours) {
        dom.footerHours.innerHTML = info.workHours.map(item => `<p>${item}</p>`).join('');
    }
}

// 8. Render Categories Navigation
function renderCategories() {
    if (!dom.categoriesContainer) return;
    
    let html = `<button class="category-btn active" data-category="all">الكل</button>`;
    
    menuData.categories.forEach(cat => {
        html += `<button class="category-btn" data-category="${cat.slug.current}">${cat.name}</button>`;
    });
    
    dom.categoriesContainer.innerHTML = html;

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterMenu();
        });
    });
}

// 9. Render Menu Items & Sections
function renderMenu(foods) {
    if (!dom.menuSectionsContainer) return;

    if (foods.length === 0) {
        dom.menuSectionsContainer.innerHTML = '';
        if (dom.emptyState) dom.emptyState.style.display = 'block';
        return;
    }
    if (dom.emptyState) dom.emptyState.style.display = 'none';

    dom.menuSectionsContainer.innerHTML = '';

    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';

    if (activeCategory === 'all') {
        const grouped = {};
        foods.forEach(food => {
            if (!grouped[food.categorySlug]) {
                grouped[food.categorySlug] = {
                    name: food.categoryName || 'أخرى',
                    items: []
                };
            }
            grouped[food.categorySlug].items.push(food);
        });

        for (const slug in grouped) {
            buildSectionDOM(grouped[slug].name, grouped[slug].items);
        }
    } else {
        const currentCatName = menuData.categories.find(c => c.slug.current === activeCategory)?.name || 'الأطباق';
        buildSectionDOM(currentCatName, foods);
    }
}

function buildSectionDOM(sectionTitle, items) {
    const section = document.createElement('section');
    section.className = 'menu-section';
    
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = sectionTitle;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'foods-grid';

    items.forEach(item => {
        const isFav = favorites.includes(item._id);
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="food-image-wrapper">
                <img class="food-image" src="${item.imageUrl || './img/logo.jpg'}" alt="${item.name}" loading="lazy">
                ${item.badge ? `<span class="food-badge ${item.badge}">${getBadgeLabel(item.badge)}</span>` : ''}
            </div>
            <div class="food-details">
                <div class="food-header">
                    <h3 class="food-name">${item.name}</h3>
                </div>
                <p class="food-description">${item.description || ''}</p>
                <div class="food-footer">
                    <span class="food-price">${item.price.toLocaleString()} <span class="food-price-currency">د.ع</span></span>
                    <div class="food-actions">
                        <button class="btn-favorite-small ${isFav ? 'active' : ''}" data-id="${item._id}" aria-label="المفضلة">
                            ${isFav ? '♥' : '♡'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-favorite-small')) {
                e.stopPropagation();
                toggleFavorite(item._id, e.target.closest('.btn-favorite-small'));
                return;
            }
            openFoodModal(item);
        });

        grid.appendChild(card);
    });

    section.appendChild(grid);
    dom.menuSectionsContainer.appendChild(section);
}

// 10. Filter & Search Logic
function filterMenu() {
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    const searchKeyword = dom.searchInput ? dom.searchInput.value.trim().toLowerCase() : '';

    let filtered = menuData.foods;

    if (activeCategory !== 'all') {
        filtered = filtered.filter(food => food.categorySlug === activeCategory);
    }

    if (searchKeyword) {
        filtered = filtered.filter(food => 
            food.name.toLowerCase().includes(searchKeyword) || 
            (food.description && food.description.toLowerCase().includes(searchKeyword))
        );
    }

    renderMenu(filtered);
}

// 11. Modal Logic (Displaying Item Details)
function openFoodModal(item) {
    if (!dom.modalOverlay) return;

    if (dom.modalImage) dom.modalImage.src = item.imageUrl || './img/logo.jpg';
    if (dom.modalTitle) dom.modalTitle.textContent = item.name;
    if (dom.modalDescription) dom.modalDescription.textContent = item.description || 'لا يوجد وصف متاح.';
    
if (dom.modalPrice) {
    dom.modalPrice.innerHTML =
        `${item.price.toLocaleString()} <span style="font-size:16px;">د.ع</span>`;
}
    
    if (dom.modalIngredients) {
        if (item.ingredients && item.ingredients.length > 0) {
            dom.modalIngredients.innerHTML = item.ingredients.map(ing => `<li>${ing}</li>`).join('');
            dom.modalIngredients.closest('.modal-section').style.display = 'block';
        } else {
            dom.modalIngredients.closest('.modal-section').style.display = 'none';
        }
    }

    if (dom.modalCalories) dom.modalCalories.textContent = item.calories ? `${item.calories} سعرة` : '-';
    if (dom.modalProtein) dom.modalProtein.textContent = item.protein ? `${item.protein} غرام` : '-';

    if (dom.modalFavorite) {
        if (favorites.includes(item._id)) {
            dom.modalFavorite.classList.add('active');
            dom.modalFavorite.textContent = '♥';
        } else {
            dom.modalFavorite.classList.remove('active');
            dom.modalFavorite.textContent = '♡';
        }

        dom.modalFavorite.onclick = () => {
            toggleFavorite(item._id, dom.modalFavorite);
            const smallFavBtn = document.querySelector(`.btn-favorite-small[data-id="${item._id}"]`);
            if (smallFavBtn) {
                const isFav = favorites.includes(item._id);
                smallFavBtn.classList.toggle('active', isFav);
                smallFavBtn.textContent = isFav ? '♥' : '♡';
            }
        };
    }

    if (dom.orderBtn) {
        dom.orderBtn.onclick = () => {
            const text = encodeURIComponent(`مرحباً مطعم ${menuData.restaurantInfo.name || ''}، أود طلب: ${item.name}`);
            window.open(`https://wa.me/${menuData.restaurantInfo.whatsapp || ''}?text=${text}`);
        };
    }

    dom.modalOverlay.classList.add('active');
    document.body.classList.add('loading');
}

function closeFoodModal() {
    if (dom.modalOverlay) dom.modalOverlay.classList.remove('active');
    document.body.classList.remove('loading');
}

// 12. Favorites Management
function toggleFavorite(id, buttonEl) {
    if (!buttonEl) return;
    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
        buttonEl.classList.add('active');
        buttonEl.textContent = '♥';
        showToast("تمت الإضافة للمفضلة");
    } else {
        favorites.splice(index, 1);
        buttonEl.classList.remove('active');
        buttonEl.textContent = '♡';
        showToast("تمت الإزالة من المفضلة");
    }
    localStorage.setItem('menu_favorites', JSON.stringify(favorites));
}

// 13. Helpers & Global Interactions
function getBadgeLabel(badge) {
    const labels = { 'hot': 'حار 🔥', 'new': 'جديد ✨', 'spicy': 'سبايسي 🌶️', 'best': 'الأكثر طلباً ⭐' };
    return labels[badge] || '';
}

function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

function setupEventListeners() {
    if (dom.themeToggle) dom.themeToggle.addEventListener('click', toggleTheme);
    
    if (dom.searchBtn && dom.searchContainer && dom.searchInput) {
        dom.searchBtn.addEventListener('click', () => {
            dom.searchContainer.classList.toggle('active');
            if(dom.searchContainer.classList.contains('active')) dom.searchInput.focus();
        });
    }

    if (dom.searchInput) dom.searchInput.addEventListener('input', filterMenu);
    
    if (dom.clearSearch && dom.searchInput) {
        dom.clearSearch.addEventListener('click', () => {
            dom.searchInput.value = '';
            filterMenu();
            dom.searchInput.focus();
        });
    }

    if (dom.resetSearchBtn && dom.searchInput) {
        dom.resetSearchBtn.addEventListener('click', () => {
            dom.searchInput.value = '';
            filterMenu();
        });
    }

    if (dom.modalClose) dom.modalClose.addEventListener('click', closeFoodModal);
    if (dom.modalOverlay) {
        dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === dom.modalOverlay) closeFoodModal();
        });
    }

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (dom.scrollProgress) dom.scrollProgress.style.width = scrolled + "%";

        if (dom.backToTopBtn) {
            if (winScroll > 300) {
                dom.backToTopBtn.classList.add('visible');
            } else {
                dom.backToTopBtn.classList.remove('visible');
            }
        }
    });

    if (dom.backToTopBtn) {
        dom.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}