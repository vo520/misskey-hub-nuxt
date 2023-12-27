import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
    scrollBehavior(to, from, savedPosition) {
        const width = window ? window.innerWidth : 0;

        if (savedPosition) {
            return savedPosition;
        } else if (to.meta.layout && to.hash) {
            switch (to.meta.layout) {
                case 'blank':
                    return { el: to.hash };

                case 'docs':
                    if (width < 1024) {
                        return { top: 128, el: to.hash };
                    } else {
                        return { top: 80, el: to.hash };
                    }

                case 'slim':
                case 'tools':
                    return { top: 80, el: to.hash };
                
                default:
                    if (width < 1024) {
                        return { top: 80, el: to.hash };
                    } else {
                        return { top: 96, el: to.hash };
                    }
            }
        }
    },
}