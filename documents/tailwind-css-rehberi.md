# 🎨 TAILWIND CSS REHBERİ
## CineClub Projesi İçin Kullanılan Class'lar ve Açıklamaları

---

## 📋 İÇERİK
1. [Layout & Display](#layout--display)
2. [Flexbox](#flexbox)
3. [Grid](#grid)
4. [Spacing (Padding & Margin)](#spacing-padding--margin)
5. [Sizing (Width & Height)](#sizing-width--height)
6. [Colors & Backgrounds](#colors--backgrounds)
7. [Typography](#typography)
8. [Borders & Rounded](#borders--rounded)
9. [Effects & Filters](#effects--filters)
10. [Transforms & Animations](#transforms--animations)
11. [Responsive Design](#responsive-design)
12. [States (Hover, Focus, etc.)](#states-hover-focus-etc)

---

## 🏗️ LAYOUT & DISPLAY

### **Display Classes**
```css
/* Tailwind Class → Normal CSS */
.flex             → display: flex;
.inline-flex      → display: inline-flex;
.block            → display: block;
.inline-block     → display: inline-block;
.grid             → display: grid;
.hidden           → display: none;
.relative         → position: relative;
.absolute         → position: absolute;
.fixed            → position: fixed;
.sticky           → position: sticky;
```

**Açıklama:**
- `flex`: Elementi flexbox container yapar
- `inline-flex`: Inline-level flexbox container
- `grid`: CSS Grid container oluşturur
- `relative`: Pozisyon referansı için kullanılır
- `absolute`: Sayfadan bağımsız pozisyonlama

---

## 🔄 FLEXBOX

### **Flex Direction**
```css
/* Tailwind Class → Normal CSS */
.flex-row         → flex-direction: row;
.flex-col         → flex-direction: column;
.flex-row-reverse → flex-direction: row-reverse;
.flex-col-reverse → flex-direction: column-reverse;
```

### **Justify Content**
```css
/* Tailwind Class → Normal CSS */
.justify-start    → justify-content: flex-start;
.justify-center   → justify-content: center;
.justify-between  → justify-content: space-between;
.justify-around   → justify-content: space-around;
.justify-end      → justify-content: flex-end;
```

### **Align Items**
```css
/* Tailwind Class → Normal CSS */
.items-start      → align-items: flex-start;
.items-center     → align-items: center;
.items-end        → align-items: flex-end;
.items-stretch    → align-items: stretch;
.items-baseline   → align-items: baseline;
```

### **Gap (Boşluk)**
```css
/* Tailwind Class → Normal CSS */
.gap-1            → gap: 0.25rem;  /* 4px */
.gap-2            → gap: 0.5rem;   /* 8px */
.gap-3            → gap: 0.75rem;  /* 12px */
.gap-4            → gap: 1rem;     /* 16px */
.gap-6            → gap: 1.5rem;   /* 24px */
.gap-8            → gap: 2rem;     /* 32px */
```

**Açıklama:**
- `gap`: Flexbox veya Grid elemanları arasındaki boşluk
- Sayı arttıkça boşluk artar (1 = 4px, 2 = 8px, vs.)

---

## 🎯 GRID

### **Grid Columns**
```css
/* Tailwind Class → Normal CSS */
.grid-cols-1      → grid-template-columns: repeat(1, minmax(0, 1fr));
.grid-cols-2      → grid-template-columns: repeat(2, minmax(0, 1fr));
.grid-cols-3      → grid-template-columns: repeat(3, minmax(0, 1fr));
.grid-cols-4      → grid-template-columns: repeat(4, minmax(0, 1fr));
.grid-cols-5      → grid-template-columns: repeat(5, minmax(0, 1fr));
```

**Açıklama:**
- Grid layout için sütun sayısını belirler
- `grid-cols-3`: 3 eşit sütun oluşturur

---

## 📏 SPACING (PADDING & MARGIN)

### **Padding**
```css
/* Tailwind Class → Normal CSS */
.p-1              → padding: 0.25rem;        /* 4px */
.p-2              → padding: 0.5rem;         /* 8px */
.p-3              → padding: 0.75rem;        /* 12px */
.p-4              → padding: 1rem;           /* 16px */
.p-6              → padding: 1.5rem;         /* 24px */
.p-8              → padding: 2rem;           /* 32px */
.p-12             → padding: 3rem;           /* 48px */
.p-16             → padding: 4rem;           /* 64px */
.p-20             → padding: 5rem;           /* 80px */

/* Yönlü Padding */
.px-4             → padding-left: 1rem; padding-right: 1rem;
.py-2             → padding-top: 0.5rem; padding-bottom: 0.5rem;
.pt-4             → padding-top: 1rem;
.pr-4             → padding-right: 1rem;
.pb-4             → padding-bottom: 1rem;
.pl-4             → padding-left: 1rem;
```

### **Margin**
```css
/* Tailwind Class → Normal CSS */
.m-4              → margin: 1rem;
.mx-auto          → margin-left: auto; margin-right: auto;
.mb-4             → margin-bottom: 1rem;
.mt-6             → margin-top: 1.5rem;
.ml-4             → margin-left: 1rem;
.mr-4             → margin-right: 1rem;
```

**Açıklama:**
- `px`: sol ve sağ padding (x-axis)
- `py`: üst ve alt padding (y-axis)
- `mx-auto`: Elementi ortalar (margin: 0 auto gibi)

---

## 📐 SIZING (WIDTH & HEIGHT)

### **Width**
```css
/* Tailwind Class → Normal CSS */
.w-full           → width: 100%;
.w-1/2            → width: 50%;
.w-1/3            → width: 33.333333%;
.w-2/3            → width: 66.666667%;
.w-1/4            → width: 25%;
.w-3/4            → width: 75%;
.w-auto           → width: auto;
.w-fit            → width: fit-content;
.w-screen         → width: 100vw;

/* Sabit Width */
.w-4              → width: 1rem;     /* 16px */
.w-8              → width: 2rem;     /* 32px */
.w-12             → width: 3rem;     /* 48px */
.w-16             → width: 4rem;     /* 64px */
.w-20             → width: 5rem;     /* 80px */
.w-24             → width: 6rem;     /* 96px */
```

### **Height**
```css
/* Tailwind Class → Normal CSS */
.h-full           → height: 100%;
.h-screen         → height: 100vh;
.h-auto           → height: auto;
.h-fit            → height: fit-content;
.min-h-screen     → min-height: 100vh;

/* Sabit Height */
.h-4              → height: 1rem;    /* 16px */
.h-8              → height: 2rem;    /* 32px */
.h-12             → height: 3rem;    /* 48px */
.h-16             → height: 4rem;    /* 64px */
```

### **Aspect Ratio**
```css
/* Tailwind Class → Normal CSS */
.aspect-square    → aspect-ratio: 1 / 1;
.aspect-video     → aspect-ratio: 16 / 9;
.aspect-[3/4]     → aspect-ratio: 3 / 4;    /* Film posterleri için */
.aspect-[4/3]     → aspect-ratio: 4 / 3;
```

**Açıklama:**
- `aspect-[3/4]`: Film poster oranı (3:4)
- Film kartlarında poster boyutunu korumak için kullanılır

---

## 🎨 COLORS & BACKGROUNDS

### **Background Colors**
```css
/* Tailwind Class → Normal CSS */
.bg-white         → background-color: #ffffff;
.bg-black         → background-color: #000000;
.bg-gray-100      → background-color: #f3f4f6;
.bg-gray-500      → background-color: #6b7280;
.bg-gray-900      → background-color: #111827;

/* Project Colors (tailwind.config.js'den) */
.bg-primary       → background-color: #3b82f6;    /* Blue */
.bg-secondary     → background-color: #64748b;    /* Slate */
.bg-accent        → background-color: #f59e0b;    /* Amber */
.bg-background    → background-color: #ffffff;    /* White */
.bg-card          → background-color: #f8fafc;    /* Light gray */
.bg-foreground    → background-color: #0f172a;    /* Dark */
```

### **Opacity & Alpha**
```css
/* Tailwind Class → Normal CSS */
.bg-white/80      → background-color: rgba(255, 255, 255, 0.8);
.bg-black/20      → background-color: rgba(0, 0, 0, 0.2);
.bg-primary/10    → background-color: rgba(59, 130, 246, 0.1);
.bg-primary/20    → background-color: rgba(59, 130, 246, 0.2);
.bg-primary/90    → background-color: rgba(59, 130, 246, 0.9);
```

### **Text Colors**
```css
/* Tailwind Class → Normal CSS */
.text-white       → color: #ffffff;
.text-black       → color: #000000;
.text-gray-500    → color: #6b7280;
.text-gray-900    → color: #111827;
.text-primary     → color: #3b82f6;
.text-red-500     → color: #ef4444;
.text-yellow-500  → color: #eab308;
.text-green-500   → color: #22c55e;

/* Opacity ile */
.text-white/60    → color: rgba(255, 255, 255, 0.6);
.text-foreground/70 → color: rgba(15, 23, 42, 0.7);
```

**Açıklama:**
- `/80`, `/20` gibi değerler opacity belirtir (%80, %20)
- `text-foreground/70`: Ana metin renginin %70 saydamlığı

---

## ✍️ TYPOGRAPHY

### **Font Size**
```css
/* Tailwind Class → Normal CSS */
.text-xs          → font-size: 0.75rem;   /* 12px */
.text-sm          → font-size: 0.875rem;  /* 14px */
.text-base        → font-size: 1rem;      /* 16px */
.text-lg          → font-size: 1.125rem;  /* 18px */
.text-xl          → font-size: 1.25rem;   /* 20px */
.text-2xl         → font-size: 1.5rem;    /* 24px */
.text-3xl         → font-size: 1.875rem;  /* 30px */
.text-4xl         → font-size: 2.25rem;   /* 36px */
.text-5xl         → font-size: 3rem;      /* 48px */
.text-6xl         → font-size: 3.75rem;   /* 60px */
.text-7xl         → font-size: 4.5rem;    /* 72px */
.text-8xl         → font-size: 6rem;      /* 96px */
```

### **Font Weight**
```css
/* Tailwind Class → Normal CSS */
.font-thin        → font-weight: 100;
.font-light       → font-weight: 300;
.font-normal      → font-weight: 400;
.font-medium      → font-weight: 500;
.font-semibold    → font-weight: 600;
.font-bold        → font-weight: 700;
.font-black       → font-weight: 900;
```

### **Text Alignment**
```css
/* Tailwind Class → Normal CSS */
.text-left        → text-align: left;
.text-center      → text-align: center;
.text-right       → text-align: right;
.text-justify     → text-align: justify;
```

### **Line Height**
```css
/* Tailwind Class → Normal CSS */
.leading-none     → line-height: 1;
.leading-tight    → line-height: 1.25;
.leading-normal   → line-height: 1.5;
.leading-relaxed  → line-height: 1.625;
.leading-loose    → line-height: 2;
```

### **Text Truncation**
```css
/* Tailwind Class → Normal CSS */
.truncate         → overflow: hidden; 
                    text-overflow: ellipsis; 
                    white-space: nowrap;

.line-clamp-2     → display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
```

**Açıklama:**
- `line-clamp-2`: Metni 2 satıra sınırlar, fazlasını `...` ile keser
- Film açıklamalarında uzun metinleri kesmek için kullanılır

---

## 🔲 BORDERS & ROUNDED

### **Border**
```css
/* Tailwind Class → Normal CSS */
.border           → border-width: 1px;
.border-2         → border-width: 2px;
.border-4         → border-width: 4px;
.border-0         → border-width: 0px;

/* Border Renkleri */
.border-gray-200  → border-color: #e5e7eb;
.border-primary   → border-color: #3b82f6;
.border-white/20  → border-color: rgba(255, 255, 255, 0.2);
.border-border    → border-color: #e2e8f0; /* Project rengi */
```

### **Rounded Corners**
```css
/* Tailwind Class → Normal CSS */
.rounded          → border-radius: 0.25rem;  /* 4px */
.rounded-md       → border-radius: 0.375rem; /* 6px */
.rounded-lg       → border-radius: 0.5rem;   /* 8px */
.rounded-xl       → border-radius: 0.75rem;  /* 12px */
.rounded-2xl      → border-radius: 1rem;     /* 16px */
.rounded-3xl      → border-radius: 1.5rem;   /* 24px */
.rounded-full     → border-radius: 9999px;   /* Tam yuvarlak */

/* Yönlü Rounded */
.rounded-t-lg     → border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
```

**Açıklama:**
- `rounded-full`: Butonları ve badge'leri tamamen yuvarlak yapar
- `rounded-xl`: Film kartları için modern görünüm

---

## ✨ EFFECTS & FILTERS

### **Shadow**
```css
/* Tailwind Class → Normal CSS */
.shadow-sm        → box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
.shadow           → box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                                0 1px 2px 0 rgba(0, 0, 0, 0.06);
.shadow-md        → box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                                0 2px 4px -1px rgba(0, 0, 0, 0.06);
.shadow-lg        → box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                                0 4px 6px -2px rgba(0, 0, 0, 0.05);
.shadow-xl        → box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                                0 10px 10px -5px rgba(0, 0, 0, 0.04);
.shadow-2xl       → box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Renkli Shadow */
.shadow-primary/5 → box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.05);
.shadow-primary/10 → box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
```

### **Backdrop Effects**
```css
/* Tailwind Class → Normal CSS */
.backdrop-blur-sm → backdrop-filter: blur(4px);
.backdrop-blur    → backdrop-filter: blur(8px);
.backdrop-blur-lg → backdrop-filter: blur(16px);
```

### **Opacity**
```css
/* Tailwind Class → Normal CSS */
.opacity-0        → opacity: 0;
.opacity-25       → opacity: 0.25;
.opacity-50       → opacity: 0.5;
.opacity-75       → opacity: 0.75;
.opacity-100      → opacity: 1;
```

**Açıklama:**
- `backdrop-blur-sm`: Arkaplana bulanıklık efekti (glassmorphism için)
- `shadow-primary/5`: Renk tonunda gölge efekti

---

## 🔄 TRANSFORMS & ANIMATIONS

### **Scale**
```css
/* Tailwind Class → Normal CSS */
.scale-100        → transform: scale(1);
.scale-105        → transform: scale(1.05);
.scale-110        → transform: scale(1.1);
.scale-125        → transform: scale(1.25);
.scale-[1.02]     → transform: scale(1.02);  /* Özel değer */
```

### **Translate**
```css
/* Tailwind Class → Normal CSS */
.translate-y-0    → transform: translateY(0px);
.-translate-y-1   → transform: translateY(-0.25rem); /* -4px */
.-translate-y-2   → transform: translateY(-0.5rem);  /* -8px */
.translate-x-1/2  → transform: translateX(50%);
.-translate-y-1/2 → transform: translateY(-50%);
```

### **Rotate**
```css
/* Tailwind Class → Normal CSS */
.rotate-0         → transform: rotate(0deg);
.rotate-45        → transform: rotate(45deg);
.rotate-90        → transform: rotate(90deg);
.rotate-180       → transform: rotate(180deg);
```

### **Transitions**
```css
/* Tailwind Class → Normal CSS */
.transition-all   → transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

.transition-colors → transition-property: color, background-color, border-color;
.transition-transform → transition-property: transform;
.transition-opacity → transition-property: opacity;

/* Duration */
.duration-150     → transition-duration: 150ms;
.duration-200     → transition-duration: 200ms;
.duration-300     → transition-duration: 300ms;
.duration-500     → transition-duration: 500ms;
```

### **Animation**
```css
/* Tailwind Class → Normal CSS */
.animate-pulse    → animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
.animate-bounce   → animation: bounce 1s infinite;
.animate-spin     → animation: spin 1s linear infinite;
```

**Açıklama:**
- `scale-105`: Hover efektleri için %5 büyütme
- `transition-all duration-300`: Tüm değişikliklere 300ms geçiş
- Film kartlarında smooth animasyonlar için kullanılır

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
```css
/* Tailwind Breakpoints */
sm:     → @media (min-width: 640px)  { ... }
md:     → @media (min-width: 768px)  { ... }
lg:     → @media (min-width: 1024px) { ... }
xl:     → @media (min-width: 1280px) { ... }
2xl:    → @media (min-width: 1536px) { ... }
```

### **Responsive Kullanım Örnekleri**
```css
/* Tailwind Class → Normal CSS */
.text-sm.sm:text-lg → 
  font-size: 0.875rem;  /* Mobil: 14px */
  @media (min-width: 640px) {
    font-size: 1.125rem; /* Desktop: 18px */
  }

.grid-cols-2.lg:grid-cols-4 →
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* Mobil: 2 sütun */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr)); /* Desktop: 4 sütun */
  }

.gap-4.sm:gap-6 →
  gap: 1rem;        /* Mobil: 16px */
  @media (min-width: 640px) {
    gap: 1.5rem;    /* Desktop: 24px */
  }
```

**Açıklama:**
- Responsive tasarım için mobile-first yaklaşım
- `sm:text-lg`: 640px ve üstünde büyük metin
- Film gridleri responsive olarak 2→3→4→5 sütun

---

## 🎯 STATES (HOVER, FOCUS, ETC.)

### **Hover States**
```css
/* Tailwind Class → Normal CSS */
.hover:bg-blue-600 → 
  &:hover {
    background-color: #2563eb;
  }

.hover:scale-105 →
  &:hover {
    transform: scale(1.05);
  }

.hover:shadow-lg →
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
```

### **Focus States**
```css
/* Tailwind Class → Normal CSS */
.focus:outline-none →
  &:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

.focus:ring-2 →
  &:focus {
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  }

.focus:ring-primary/20 →
  &:focus {
    --tw-ring-color: rgba(59, 130, 246, 0.2);
  }
```

### **Group States**
```css
/* Tailwind Class → Normal CSS */
.group → /* Parent element */

.group-hover:opacity-100 →
  .group:hover & {
    opacity: 1;
  }

.group-hover:scale-105 →
  .group:hover & {
    transform: scale(1.05);
  }
```

### **Active & Disabled States**
```css
/* Tailwind Class → Normal CSS */
.active:bg-primary →
  &:active {
    background-color: #3b82f6;
  }

.disabled:opacity-50 →
  &:disabled {
    opacity: 0.5;
  }

.disabled:cursor-not-allowed →
  &:disabled {
    cursor: not-allowed;
  }
```

**Açıklama:**
- `group`: Parent element'e eklenir
- `group-hover:`: Parent hover olduğunda child element değişir
- Film kartlarında hover efektleri için kullanılır

---

## 🔧 UTILITY CLASSES

### **Overflow**
```css
/* Tailwind Class → Normal CSS */
.overflow-hidden  → overflow: hidden;
.overflow-auto    → overflow: auto;
.overflow-scroll  → overflow: scroll;
.overflow-x-auto  → overflow-x: auto;
.overflow-y-auto  → overflow-y: auto;
```

### **Z-Index**
```css
/* Tailwind Class → Normal CSS */
.z-0              → z-index: 0;
.z-10             → z-index: 10;
.z-20             → z-index: 20;
.z-30             → z-index: 30;
.z-40             → z-index: 40;
.z-50             → z-index: 50;
```

### **Cursor**
```css
/* Tailwind Class → Normal CSS */
.cursor-pointer   → cursor: pointer;
.cursor-default   → cursor: default;
.cursor-not-allowed → cursor: not-allowed;
.cursor-grab      → cursor: grab;
```

### **Select**
```css
/* Tailwind Class → Normal CSS */
.select-none      → user-select: none;
.select-all       → user-select: all;
.select-auto      → user-select: auto;
```

---

## 🎨 PROJECT SPECIFIC EXAMPLES

### **Film Kartı Hover Efekti**
```css
/* Tailwind Classes */
.group.bg-white/80.backdrop-blur-sm.border.border-white/20.rounded-xl.overflow-hidden.hover:bg-white/90.hover:border-primary/20.hover:shadow-lg.hover:shadow-primary/5.transition-all.duration-300.hover:-translate-y-1

/* Normal CSS Karşılığı */
.film-card {
  /* Base styles */
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.film-card:hover {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 10px 15px -3px rgba(59, 130, 246, 0.05);
  transform: translateY(-0.25rem);
}
```

### **Section Badge**
```css
/* Tailwind Classes */
.inline-flex.items-center.gap-2.sm:gap-3.px-4.sm:px-6.py-2.sm:py-3.bg-primary/10.border.border-primary/20.rounded-full.text-primary.text-xs.sm:text-sm.font-medium.mb-4.sm:mb-6

/* Normal CSS Karşılığı */
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .section-badge {
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
}
```

---

## 📝 NOTLAR

### **Naming Convention**
- `xs, sm, base, lg, xl, 2xl...`: Boyut skalası (küçükten büyüğe)
- `50, 100, 200...900`: Renk tonları (açıktan koyuya)
- `1, 2, 3, 4, 6, 8, 12, 16...`: Spacing skalası (4px'in katları)

### **Alpha Channel Kullanımı**
- `/80`: %80 opacity
- `/20`: %20 opacity
- Glassmorphism efektleri için yaygın kullanım

### **Responsive Patterns**
```css
/* Mobil → Desktop Pattern */
text-sm sm:text-base lg:text-lg
gap-4 sm:gap-6 lg:gap-8
grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
py-12 sm:py-16 lg:py-20
```

### **Common Combinations**
```css
/* Card Pattern */
bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl

/* Button Pattern */  
px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors

/* Badge Pattern */
px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md
```

---

Bu rehber, CineClub projesinde kullanılan Tailwind CSS class'larının anlaşılmasını kolaylaştırmak için hazırlanmıştır. Her class'ın normal CSS karşılığını ve kullanım amacını görebilirsiniz. 