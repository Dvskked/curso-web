/**
 * main.js — Capa interactiva del sitio de curso HTML & CSS
 * --------------------------------------------------------
 * Todo vanilla JS, sin dependencias externas.
 * Organizado en funciones/modulos claros, ejecutado al DOMContentLoaded.
 */

// ============================================================
// 0. UTILIDADES GENERALES
// ============================================================

/** Debounce: retrasa la ejecución de `fn` hasta que pasen `ms` sin invocarse. */
const debounce = (fn, ms = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/** Selecciona un único elemento. */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Selecciona una NodeList de elementos. */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Altura fija del header (px). Ajustar si el header cambia. */
const HEADER_OFFSET = 80;

// ============================================================
// 1. ALTERNAR TEMA CLARO / OSCURO
// ============================================================

const initThemeToggle = () => {
  const toggleBtn = $('#themeToggle');
  const html = document.documentElement;

  if (!toggleBtn) {
    console.warn('[Tema] Botón #themeToggle no encontrado.');
    return;
  }

  /** Aplica el tema indicado al <html> y al botón. */
  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    toggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
    );
  };

  /** Determina el tema inicial: localStorage > preferencia del sistema. */
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  // Aplicar tema al cargar
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Alternar al hacer clic
  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
    console.log(`[Tema] Cambiado a: ${next}`);
  });

  // Escuchar cambios en la preferencia del sistema (solo si no hay preferencia guardada)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  console.log('[Tema] Inicializado.');
};

// ============================================================
// 2. MENÚ HAMBURGUESA (Navegación móvil)
// ============================================================

const initHamburgerMenu = () => {
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');

  if (!hamburger || !navLinks) {
    console.warn('[Menú] #hamburger o #navLinks no encontrado.');
    return;
  }

  /** Cierra el menú móvil. */
  const closeMenu = () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /** Abre el menú móvil. */
  const openMenu = () => {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  /** Alterna el menú. */
  const toggleMenu = () => {
    const isOpen = navLinks.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  };

  // Estado inicial accesible
  navLinks.setAttribute('aria-hidden', 'true');

  // Clic en hamburguesa
  hamburger.addEventListener('click', toggleMenu);

  // Cerrar al pulsar un enlace del menú
  $$('a', navLinks).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Cerrar si la ventana supera 768px
  const onResize = debounce(() => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
      closeMenu();
    }
  }, 150);
  window.addEventListener('resize', onResize);

  console.log('[Menú hamburguesa] Inicializado.');
};

// ============================================================
// 3. BOTÓN "VOLVER ARRIBA"
// ============================================================

const initScrollToTop = () => {
  // Usar el botón existente o crearlo dinámicamente
  let btn = $('#scrollTop');

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'scrollTop';
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.innerHTML = '&#8679;'; // flecha hacia arriba
    document.body.appendChild(btn);
  }

  /** Muestra / oculta el botón según la posición del scroll. */
  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  // Escuchar scroll
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility(); // comprobar estado inicial

  // Scroll suave al hacer clic
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  console.log('[ScrollToTop] Inicializado.');
};

// ============================================================
// 4. BARRA DE PROGRESO DE LECTURA
// ============================================================

const initReadingProgress = () => {
  const progressBar = $('.progress-bar');

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Actualizar variable CSS global
    document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  console.log('[Progreso de lectura] Inicializado.');
};

// ============================================================
// 5. LESSON HEADINGS (Accessible, no accordion)
// ============================================================

const initLessonHeadings = () => {
  const lessonHeaders = $$('.lesson-header');

  if (!lessonHeaders.length) {
    console.warn('[Lecciones] No se encontraron .lesson-header.');
    return;
  }

  lessonHeaders.forEach((header) => {
    const content = header.nextElementSibling;
    if (content) {
      content.classList.add('lesson-content');
    }
  });

  console.log(`[Lecciones] ${lessonHeaders.length} encabezados configurados.`);
};

// ============================================================
// 6. SCROLL SUAVE PARA ENLACES DE ANCLA
// ============================================================

const initSmoothScrollLinks = () => {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });

      // Actualizar hash sin salto
      history.pushState(null, '', targetId);
    });
  });

  console.log('[Scroll suave] Inicializado.');
};

// ============================================================
// 7. ANIMACIONES AL DESPLAZAR (IntersectionObserver)
// ============================================================

const initScrollAnimations = () => {
  const animatedElements = $$('.animate-on-scroll');

  if (!animatedElements.length) {
    console.warn('[Animaciones] No se encontraron .animate-on-scroll.');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // desconectar para rendimiento
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  );

  animatedElements.forEach((el) => observer.observe(el));

  console.log(`[Animaciones scroll] Observando ${animatedElements.length} elementos.`);
};

// ============================================================
// 8. RESALTADO DE NAVEGACIÓN ACTIVA
// ============================================================

const initActiveNavigation = () => {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a[href^="#"], .nav-links a');

  if (!sections.length || !navLinks.length) {
    console.warn('[Nav activa] No se encontraron secciones o enlaces.');
    return;
  }

  /** Mapa de hash -> enlace de navegación. */
  const linkMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap.set(href, link);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;

          // Quitar clase active de todos los enlaces
          navLinks.forEach((l) => l.classList.remove('active'));

          // Añadir al enlace correspondiente
          const activeLink = linkMap.get(id);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: `-${HEADER_OFFSET}px 0px -40% 0px`,
    },
  );

  sections.forEach((section) => observer.observe(section));

  console.log('[Navegación activa] Inicializada.');
};

// ============================================================
// 9. BOTÓN DE COPIAR EN BLOQUES DE CÓDIGO
// ============================================================

const initCodeCopyButtons = () => {
  const codeBlocks = $$('.code-block');

  if (!codeBlocks.length) {
    console.warn('[Copiar código] No se encontraron .code-block.');
    return;
  }

  codeBlocks.forEach((block) => {
    // Evitar duplicar botones
    if (block.querySelector('.copy-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copiar código al portapapeles');
    btn.textContent = 'Copiar';
    block.style.position = 'relative';
    block.appendChild(btn);

    btn.addEventListener('click', async () => {
      const code = $('code', block) || $('pre', block);
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copiado!';
        btn.classList.add('copied');
        console.log('[Copiar código] Copiado al portapapeles.');

        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('[Copiar código] Error al copiar:', err);
        btn.textContent = 'Error';

        setTimeout(() => {
          btn.textContent = 'Copiar';
        }, 2000);
      }
    });
  });

  console.log(`[Copiar código] ${codeBlocks.length} bloques configurados.`);
};

// ============================================================
// 10. VALIDACIÓN DE FORMULARIO
// ============================================================

const initFormValidation = () => {
  const form = $('#demoForm');

  if (!form) {
    console.warn('[Formulario] #demoForm no encontrado.');
    return;
  }

  /** Muestra un mensaje de error junto al campo. */
  const showError = (field, message) => {
    field.classList.add('error');

    // Buscar o crear el elemento de error
    let errorEl = field.parentElement?.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      errorEl.setAttribute('role', 'alert');
      field.parentElement?.appendChild(errorEl);
    }
    errorEl.textContent = message;
  };

  /** Limpia el error de un campo. */
  const clearError = (field) => {
    field.classList.remove('error');
    const errorEl = field.parentElement?.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = '';
    }
  };

  /** Comprueba si un email tiene formato válido. */
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /** Valida un campo concreto y retorna true si es válido. */
  const validateField = (field) => {
    const { name, value, type } = field;

    switch (name) {
      case 'nombre': {
        if (!value.trim()) {
          showError(field, 'El nombre es obligatorio.');
          return false;
        }
        if (value.trim().length < 2) {
          showError(field, 'El nombre debe tener al menos 2 caracteres.');
          return false;
        }
        break;
      }
      case 'email': {
        if (!value.trim()) {
          showError(field, 'El email es obligatorio.');
          return false;
        }
        if (!isValidEmail(value.trim())) {
          showError(field, 'Introduce un email válido.');
          return false;
        }
        break;
      }
      case 'mensaje': {
        if (!value.trim()) {
          showError(field, 'El mensaje es obligatorio.');
          return false;
        }
        break;
      }
      case 'privacidad': {
        if (type === 'checkbox' && !field.checked) {
          showError(field, 'Debes aceptar la política de privacidad.');
          return false;
        }
        break;
      }
    }

    clearError(field);
    return true;
  };

  // Limpiar errores al escribir
  $$('input, textarea', form).forEach((field) => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('change', () => clearError(field));
  });

  // Validar al enviar
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = $$('input, textarea', form);
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (isValid) {
      // Ocultar formulario y mostrar mensaje de éxito
      const successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.setAttribute('role', 'status');
      successMsg.innerHTML = `
        <h3>¡Mensaje enviado con éxito!</h3>
        <p>Gracias por tu mensaje. Te responderemos pronto.</p>
      `;

      form.reset();
      form.style.display = 'none';
      form.parentElement?.appendChild(successMsg);

      console.log('[Formulario] Enviado correctamente.');
    } else {
      console.warn('[Formulario] Errores de validación detectados.');

      // Enfocar el primer campo con error
      const firstError = $('.error', form);
      if (firstError) firstError.focus();
    }
  });

  console.log('[Formulario] Validación inicializada.');
};

// ============================================================
// 11. TABLA DE CONTENIDOS — SCROLL SUAVE
// ============================================================

const initTOCSmoothScroll = () => {
  $$('.toc-item a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', href);
    });
  });

  console.log('[TOC scroll suave] Inicializado.');
};

// ============================================================
// 12. NAVEGACIÓN POR TECLADO
// ============================================================

const initKeyboardNavigation = () => {
  const navLinks = $('#navLinks');
  const hamburger = $('#hamburger');

  /** Trap de foco dentro de un contenedor (accesibilidad del menú móvil). */
  const trapFocus = (container) => {
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container,
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    document.addEventListener('keydown', (e) => {
      if (!navLinks?.classList.contains('active')) return;
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  };

  if (navLinks) trapFocus(navLinks);

  console.log('[Navegación por teclado] Inicializada.');
};

// ============================================================
// 13. SCROLL SPY PARA TABLA DE CONTENIDOS
// ============================================================

const initTOCScrollSpy = () => {
  const tocItems = $$('.toc-item');
  const sections = $$('section[id], .module[id], [id]');

  if (!tocItems.length) {
    console.warn('[Scroll Spy TOC] No se encontraron .toc-item.');
    return;
  }

  /** Mapa de id -> elemento TOC. */
  const tocMap = new Map();
  tocItems.forEach((item) => {
    const link = $('a', item);
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      tocMap.set(href.substring(1), item);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Quitar active de todos los toc-items
          tocItems.forEach((item) => item.classList.remove('active'));

          // Activar el correspondiente
          const tocItem = tocMap.get(entry.target.id);
          if (tocItem) tocItem.classList.add('active');
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
    },
  );

  const observedIds = new Set();
  sections.forEach((section) => {
    if (section.id && tocMap.has(section.id) && !observedIds.has(section.id)) {
      observer.observe(section);
      observedIds.add(section.id);
    }
  });

  console.log(`[Scroll Spy TOC] Observando ${observedIds.size} secciones.`);
};

// ============================================================
// 14. MANEJO DE RESPONSIVE
// ============================================================

const initResponsive = () => {
  const navLinks = $('#navLinks');
  const hamburger = $('#hamburger');

  const handleResize = debounce(() => {
    if (window.innerWidth > 768) {
      if (navLinks?.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
        navLinks?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        console.log('[Responsive] Menú cerrado por cambio de tamaño.');
      }
    }
  }, 150);

  window.addEventListener('resize', handleResize);

  console.log('[Responsive] Inicializado.');
};

// ============================================================
// 15. PERSISTENCIA DE TEMA EN localStorage
// ============================================================

// (Implementado en la función initThemeToggle — punto 1).
// Esta función existe para mantener la numeración del enunciado.

// ============================================================
// 16. COURSE PROGRESS (localStorage)
// ============================================================

const COURSE_PROGRESS_KEY = 'course-progress';
const COURSE_STATE_KEY = 'course-state';

const getCourseProgress = () => {
  try {
    const raw = localStorage.getItem(COURSE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { modules: {} };
  } catch { return { modules: {} }; }
};

const saveCourseProgress = (progress) => {
  try { localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress)); } catch {}
};

const getCourseState = () => {
  try {
    const raw = localStorage.getItem(COURSE_STATE_KEY);
    return raw ? JSON.parse(raw) : { currentModule: 1, started: false };
  } catch { return { currentModule: 1, started: false }; }
};

const saveCourseState = (state) => {
  try { localStorage.setItem(COURSE_STATE_KEY, JSON.stringify(state)); } catch {}
};

// ============================================================
// 17. COURSE PLAYER — Sequential Module Display
// ============================================================

const initCoursePlayer = () => {
  const state = getCourseState();
  const allModules = $$('.module[id]');
  if (!allModules.length) return;

  // If course was started, jump to course mode
  if (state.started) {
    enterCourseMode(state.currentModule);
  }

  // "Empezar Ahora" buttons on landing page
  $$('a[href="#modulo-1"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      enterCourseMode(1);
    });
  });

  // Module card start buttons
  $$('.module-start-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.module-card');
      if (!card) return;
      const num = parseInt(card.id.replace('module-card-', ''), 10);
      enterCourseMode(num);
    });
  });
};

const enterCourseMode = (moduleNum) => {
  const state = getCourseState();
  state.started = true;
  state.currentModule = moduleNum;
  saveCourseState(state);

  document.body.classList.add('course-mode');

  // Hide all modules, show only current
  $$('.module[id]').forEach(mod => mod.classList.remove('active-module'));
  const target = $(`#modulo-${moduleNum}`);
  if (target) {
    target.classList.add('active-module');
    // Scroll to top of module
    setTimeout(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 100);
  }

  // Update module card buttons
  $$('.module-start-btn').forEach(btn => {
    const card = btn.closest('.module-card');
    if (!card) return;
    const num = parseInt(card.id.replace('module-card-', ''), 10);
    const progress = getCourseProgress();
    const modData = progress.modules[`modulo-${num}`];
    if (num < moduleNum || (modData && modData.completed)) {
      btn.textContent = 'Completado';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-ghost');
    } else if (num === moduleNum) {
      btn.textContent = 'Continuar';
    } else {
      btn.textContent = 'Iniciar';
      btn.classList.remove('btn-ghost');
      btn.classList.add('btn-primary');
    }
  });
};

const exitCourseMode = () => {
  document.body.classList.remove('course-mode');
  $$('.module[id]').forEach(mod => mod.classList.remove('active-module'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================================
// 18. MODULE NEXT BUTTONS
// ============================================================

const initModuleNextButtons = () => {
  $$('.module-next-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextNum = parseInt(btn.getAttribute('data-next'), 10);
      if (nextNum && nextNum <= 10) {
        enterCourseMode(nextNum);
      } else {
        // Course complete
        exitCourseMode();
        const completeEl = $('.course-complete');
        if (completeEl) {
          document.body.classList.add('course-mode');
          completeEl.style.display = 'block';
        }
      }
    });
  });

  // Back to home buttons
  $$('.module-back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      exitCourseMode();
    });
  });
};

// ============================================================
// 19. LESSON COMPLETION TOGGLE
// ============================================================

const updateModuleProgressInCard = (moduleNum) => {
  const moduleId = `modulo-${moduleNum}`;
  const card = $(`#module-card-${moduleNum}`);
  if (!card) return;

  const progress = getCourseProgress();
  const modData = progress.modules[moduleId];
  if (!modData) return;

  const modEl = $(`#${moduleId}`);
  if (!modEl) return;

  const totalLessons = $$('.lesson', modEl).length || 1;
  const completed = (modData.completedLessons || []).filter(Boolean).length;
  const pct = Math.round((completed / totalLessons) * 100);

  const bar = $('.progress-fill', card);
  if (bar) bar.style.width = `${pct}%`;

  const status = $('.module-status', card);
  if (status) {
    status.className = 'module-status';
    if (pct >= 100) {
      status.classList.add('completed');
      status.textContent = 'Completado';
      modData.completed = true;
      saveCourseProgress(progress);
    } else if (pct > 0 || modData.started) {
      status.classList.add('in-progress');
      status.textContent = `${pct}%`;
    } else {
      status.classList.add('not-started');
      status.textContent = 'No iniciado';
    }
  }

  // Update module progress header if visible
  const modHeader = $(`.module-progress-label`, $(`#${moduleId}`));
  if (modHeader) modHeader.textContent = `Modulo ${moduleNum} — ${completed}/${totalLessons} lecciones`;
};

const initLessonCompletion = () => {
  $$('.lesson-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const checkbox = $('.lesson-complete-checkbox', btn);
      if (!checkbox) return;

      const lessonId = checkbox.getAttribute('data-lesson') || '';
      const lessonArticle = btn.closest('.lesson');
      if (!lessonArticle) return;

      const moduleSection = lessonArticle.closest('.module[id]');
      if (!moduleSection) return;

      const moduleId = moduleSection.id;
      const moduleNum = parseInt(moduleId.replace('modulo-', ''), 10);
      const progress = getCourseProgress();

      if (!progress.modules[moduleId]) {
        progress.modules[moduleId] = { started: true, completedLessons: [] };
      }

      const modData = progress.modules[moduleId];
      const isCompleted = btn.classList.contains('completed');

      if (!isCompleted) {
        btn.classList.add('completed');
        checkbox.classList.add('completed');
        lessonArticle.classList.add('completed');
        const title = $('h3', lessonArticle);
        if (title) title.style.textDecoration = 'line-through';
        if (!modData.completedLessons.includes(lessonId)) {
          modData.completedLessons.push(lessonId);
        }
      } else {
        btn.classList.remove('completed');
        checkbox.classList.remove('completed');
        lessonArticle.classList.remove('completed');
        const title = $('h3', lessonArticle);
        if (title) title.style.textDecoration = '';
        modData.completedLessons = modData.completedLessons.filter(id => id !== lessonId);
      }

      modData.started = true;
      saveCourseProgress(progress);
      updateModuleProgressInCard(moduleNum);
    });
  });
};

// ============================================================
// 20. RESTORE COMPLETED STATE ON LOAD
// ============================================================

const initRestoreProgress = () => {
  const progress = getCourseProgress();
  Object.keys(progress.modules).forEach(moduleId => {
    const modData = progress.modules[moduleId];
    if (!modData || !modData.completedLessons) return;
    const modEl = $(`#${moduleId}`);
    if (!modEl) return;

    modData.completedLessons.forEach(lessonId => {
      if (!lessonId) return;
      const checkbox = $(`span[data-lesson="${lessonId}"]`, modEl);
      if (checkbox) {
        const btn = checkbox.closest('.lesson-complete-btn');
        if (btn) btn.classList.add('completed');
        checkbox.classList.add('completed');
      }
      const lessonArticle = $(`#${lessonId}`, modEl);
      if (lessonArticle) {
        lessonArticle.classList.add('completed');
        const title = $('h3', lessonArticle);
        if (title) title.style.textDecoration = 'line-through';
      }
    });

    const num = parseInt(moduleId.replace('modulo-', ''), 10);
    updateModuleProgressInCard(num);
  });
};

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('========================================');
  console.log(' Inicializando sitio HTML & CSS...');
  console.log('========================================');

  initThemeToggle();
  initHamburgerMenu();
  initScrollToTop();
  initReadingProgress();
  initLessonHeadings();
  initSmoothScrollLinks();
  initScrollAnimations();
  initActiveNavigation();
  initCodeCopyButtons();
  initFormValidation();
  initTOCSmoothScroll();
  initKeyboardNavigation();
  initTOCScrollSpy();
  initResponsive();

  // Course player & progress
  initRestoreProgress();
  initLessonCompletion();
  initCoursePlayer();
  initModuleNextButtons();

  console.log('========================================');
  console.log(' Todos los módulos inicializados.');
  console.log('========================================');
});
