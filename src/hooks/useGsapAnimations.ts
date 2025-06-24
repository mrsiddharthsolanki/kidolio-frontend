import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

export const useGsapAnimations = () => {
  useGSAP(() => {
    // Hero section animations
    const heroTimeline = gsap.timeline();
    
    heroTimeline
      .from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
      })
      .from('.hero-description', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');

    // Stats counter animation
    gsap.from('.stat-number', {
      textContent: '0',
      duration: 2,
      ease: 'power1.out',
      snap: { textContent: 1 },
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.stats-section',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      }
    });

    // Role cards stagger animation
    gsap.from('.role-card', {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.role-cards',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      }
    });

    // Features section animation
    gsap.from('.feature-item', {
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      }
    });

    // Testimonials animation
    gsap.from('.testimonial-card', {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.testimonials-section',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      }
    });

    // CTA section animation
    const ctaTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
      }
    });

    ctaTimeline
      .from('.cta-title', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from('.cta-description', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4')
      .from('.cta-buttons', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
      }, '-=0.2');

    // Background grid animation
    gsap.to('.bg-grid-pattern', {
      backgroundPosition: '100% 100%',
      duration: 20,
      ease: 'none',
      repeat: -1
    });

    // Hover animations for cards
    const cards = document.querySelectorAll('.role-card, .testimonial-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  });
}; 