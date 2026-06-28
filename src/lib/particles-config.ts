// lib/particles-config.ts

export const starryParticlesConfig = {
  particles: {
    number: {
      value: 120,  // 星星数量：120颗（营造繁星效果）
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: ["#ffffff", "#f6ad55", "#63b3ed"]  // 白色星星、星黄星星、星空蓝星星
    },
    opacity: {
      value: 0.5,  // 默认半透明
      random: true,  // 随机透明度（营造闪烁效果）
      anim: {
        enable: true,
        speed: 0.5,  // 闪烁速度：慢
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 2,  // 默认大小：2px
      random: true,  // 随机大小（营造远近感）
      anim: {
        enable: true,
        speed: 2,
        size_min: 0.5,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.05,  // 非常淡的连线（模拟星座）
      width: 1
    },
    move: {
      enable: true,
      speed: 0.3,  // 移动速度：极慢（模拟星空宁静感）
      direction: "none" as const,
      random: true,
      straight: false,
      out_mode: "out" as const,
      bounce: false
    }
  },
  interactivity: {
    detect_on: "canvas" as const,
    events: {
      onhover: {
        enable: true,
        mode: "repulse"  // 鼠标悬停时，星星被排斥（交互效果）
      },
      onclick: {
        enable: true,
        mode: "push"  // 点击时，新增星星
      }
    }
  },
  retina_detect: true
};
