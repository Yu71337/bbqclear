/* e:\AIgame\src\animations\gameAnimations.js */
import gsap from 'gsap';

export const playServeAnimation = (elements, targetElement, onComplete) => {
    if (!elements || elements.length === 0) {
        onComplete && onComplete();
        return;
    }

    const tl = gsap.timeline({ onComplete });
    
    // 1. 食材先向中心挤压 (弹性)
    tl.to(elements, {
        scale: 0.8,
        duration: 0.15,
        ease: "power2.in"
    });

    // 2. 向右上方飞出 (固定位姿)
    tl.to(elements, {
        x: 400,
        y: -600,
        scale: 0.2,
        rotation: 45,
        opacity: 0,
        zIndex: 1000,
        duration: 0.6,
        stagger: 0.05,
        ease: "power1.in"
    });
};

export const playPopScore = (targetRef, points) => {
    const el = document.createElement('div');
    el.className = 'pop-score';
    el.innerText = `+${points}`;
    document.body.appendChild(el);

    const rect = targetRef.getBoundingClientRect();
    gsap.set(el, {
        x: rect.left + rect.width / 2,
        y: rect.top,
        opacity: 1,
        scale: 0.5,
        position: 'fixed'
    });

    gsap.to(el, {
        y: '-=100',
        opacity: 0,
        scale: 1.5,
        duration: 0.8,
        onComplete: () => el.remove()
    });
};
