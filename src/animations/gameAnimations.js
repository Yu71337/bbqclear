/* e:\AIgame\src\animations\gameAnimations.js */
import gsap from 'gsap';

export const playServeAnimation = (elements, onComplete) => {
    if (!elements || elements.length === 0) return;

    const tl = gsap.timeline({ onComplete });

    // 1. 食材先向中心挤压 (弹性)
    tl.to(elements, {
        scale: 0.8,
        duration: 0.15,
        ease: "power2.in"
    });

    // 2. 瞬间向斜上方滑出 (模拟上菜到盘子)
    tl.to(elements, {
        x: 300,
        y: -400,
        rotation: 45,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.in(1.7)"
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
