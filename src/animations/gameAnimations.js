/* e:\AIgame\src\animations\gameAnimations.js */
import gsap from 'gsap';

export const playServeAnimation = (elements, targetElement, onComplete) => {
    if (!elements || elements.length === 0) {
        onComplete && onComplete();
        return;
    }

    const tl = gsap.timeline({ onComplete });
    
    // 获取目标位置 (屏幕坐标)
    const targetRect = targetElement ? targetElement.getBoundingClientRect() : { left: window.innerWidth, top: 0 };
    const elementsRect = elements[0].getBoundingClientRect();

    // 计算相对位移
    const deltaX = targetRect.left - elementsRect.left;
    const deltaY = targetRect.top - elementsRect.top;

    // 1. 食材先向中心挤压 (弹性)
    tl.to(elements, {
        scale: 0.8,
        duration: 0.15,
        ease: "power2.in"
    });

    // 2. 向目标方向飞出并缩小
    tl.to(elements, {
        x: deltaX,
        y: deltaY,
        scale: 0.1,
        rotation: 180,
        opacity: 0,
        zIndex: 1000,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.in"
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
