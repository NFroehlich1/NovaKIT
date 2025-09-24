// Single Page Application (SPA) Router for Nova 3D
class SPARouter {
    constructor() {
        this.routes = {
            '/': 'home',
            '/index.html': 'home',
            '/text-to-obj.html': 'text-to-obj',
            '/image-to-3d.html': 'image-to-3d',
            '/text-to-svg.html': 'text-to-svg'
        };

        this.currentPage = '';
        this.init();
    }

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.loadPage(e.state?.page || 'home');
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="/"], a[href$=".html"]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.navigate(href);
            }
        });

        // Load initial page
        const initialPath = window.location.pathname || '/';
        this.loadPage(this.routes[initialPath] || 'home');
    }

    navigate(path) {
        const page = this.routes[path];
        if (page) {
            window.history.pushState({ page }, '', path);
            this.loadPage(page);
        } else {
            // Fallback for pages not in the router, like external links
            window.location.href = path;
        }
    }

    async loadPage(pageName) {
        if (this.currentPage === pageName) return;

        this.currentPage = pageName;

        // Update active navigation
        this.updateNavigation(pageName);

        // Load page content
        const mainElement = document.querySelector('main');

        try {
            const pageFileName = this.getPageFileName(pageName);
            const response = await fetch(pageFileName);
            if (!response.ok) {
                throw new Error(`Could not load page: ${pageName}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('main').innerHTML;

            if (mainElement) {
                // Smooth transition
                mainElement.style.opacity = '0.5';
                setTimeout(() => {
                    mainElement.innerHTML = newContent;
                    mainElement.style.opacity = '1';

                    // Update page title
                    document.title = doc.title || this.getPageTitle(pageName);

                    // Scroll to top
                    window.scrollTo(0, 0);

                    // Re-initialize scripts for dynamic pages
                    if (pageName === 'text-to-obj') {
                        if (typeof TextToObjGenerator !== 'undefined') {
                            new TextToObjGenerator();
                        }
                    }
                    if (pageName === 'text-to-svg') {
                        if (typeof TextToSvgGenerator !== 'undefined') {
                            new TextToSvgGenerator();
                        }
                    }
                    if (pageName === 'image-to-3d') {
                        if (typeof ImageTo3DGenerator !== 'undefined') {
                            new ImageTo3DGenerator();
                        }
                    }

                }, 150);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            if (mainElement) {
                mainElement.innerHTML = `<p>Error loading page. Please try again.</p>`;
            }
        }
    }

    updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const linkPage = this.routes[href];
            if (linkPage === activePage) {
                link.classList.add('active');
            }
        });
    }

    getPageTitle(pageName) {
        const titles = {
            'home': 'Nova 3D - 3D Printing Technology',
            'image-to-3d': 'Image to 3D - Nova 3D',
            'text-to-obj': 'Text to 3D Object - Nova 3D',
            'text-to-svg': 'Text to SVG - Nova 3D'
        };
        return titles[pageName] || 'Nova 3D';
    }

    getPageFileName(pageName) {
        const fileMap = {
            'home': 'index.html',
            'image-to-3d': 'image-to-3d.html',
            'text-to-obj': 'text-to-obj.html',
            'text-to-svg': 'text-to-svg.html'
        };
        return fileMap[pageName] || 'index.html';
    }

    getPageContent(pageName) {
        // This function is no longer the primary source of content, 
        // but can be kept for fallback or for pages without separate files.
        // For this refactoring, we will rely on fetching files.
        return '';
    }
}

// Initialize SPA Router
let spaRouter;

// Enhanced ElevenLabs integration with SPA support
function initElevenLabsIntegration() {
    const widget = document.querySelector('elevenlabs-convai');
    if (widget) {
        widget.addEventListener('elevenlabs-convai:call', (event) => {
            event.detail.config = event.detail.config || {};
            event.detail.config.clientTools = {
                redirectToExternalURL: ({ url }) => {
                    // Use SPA navigation instead of page reload
                    if (spaRouter) {
                        spaRouter.navigate(url);
                        return { success: true, message: `Navigating to ${url}` };
                    } else {
                        // Fallback to traditional navigation
                        window.location.href = url;
                        return { success: true, message: `Navigating to ${url}` };
                    }
                },
                // Keep backward compatibility
                navigateToPage: ({ page }) => {
                    if (spaRouter) {
                        spaRouter.navigate(page);
                        return { success: true, message: `Navigating to ${page}` };
                    } else {
                        window.location.href = page;
                        return { success: true, message: `Navigating to ${page}` };
                    }
                }
            };
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    spaRouter = new SPARouter();
    initElevenLabsIntegration();
});



