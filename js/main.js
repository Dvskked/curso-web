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
// 5. ACORDIONES DE LECCIONES
// ============================================================

const initLessonAccordions = () => {
  const lessonHeaders = $$('.lesson-header');

  if (!lessonHeaders.length) {
    console.warn('[Acordeón] No se encontraron .lesson-header.');
    return;
  }

  /** Cierra un acordeón. */
  const closeAccordion = (header) => {
    const content = header.nextElementSibling;
    if (!content) return;
    header.classList.remove('active');
    header.setAttribute('aria-expanded', 'false');
    content.style.maxHeight = null;
    content.classList.remove('active');
  };

  /** Abre un acordeón. */
  const openAccordion = (header) => {
    const content = header.nextElementSibling;
    if (!content) return;
    header.classList.add('active');
    header.setAttribute('aria-expanded', 'true');
    content.classList.add('active');
    content.style.maxHeight = `${content.scrollHeight}px`;
  };

  /** Alterna un acordeón y cierra los demás del mismo módulo. */
  const toggleAccordion = (header) => {
    const isOpen = header.classList.contains('active');
    const module = header.closest('.module') || header.closest('section');

    // Cerrar todos los acordeones del mismo módulo (solo uno abierto a la vez)
    if (module) {
      $$('.lesson-header', module).forEach(closeAccordion);
    }

    if (!isOpen) {
      openAccordion(header);
    }
  };

  lessonHeaders.forEach((header) => {
    // Atributos accesibles iniciales
    const content = header.nextElementSibling;
    if (content) {
      content.classList.add('lesson-content');
      content.setAttribute('role', 'region');
    }
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');

    // Clic
    header.addEventListener('click', () => toggleAccordion(header));

    // Teclado: Enter / Space
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(header);
      }
    });
  });

  console.log('[Acordeones] Inicializados.');
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
// 16. TRACKING DE PROGRESO DE MÓDULOS
// ============================================================

const COURSE_PROGRESS_KEY = 'course-progress';

/** Lee el progreso del curso desde localStorage. */
const getCourseProgress = () => {
  try {
    const raw = localStorage.getItem(COURSE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { modules: {} };
  } catch {
    return { modules: {} };
  }
};

/** Guarda el progreso del curso en localStorage. */
const saveCourseProgress = (progress) => {
  try {
    localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('[Progreso] No se pudo guardar en localStorage:', err);
  }
};

/** Recopila todas las lecciones y módulos del DOM. */
const getCourseStructure = () => {
  const modules = $$('.module[id]');
  const structure = {};

  modules.forEach((mod) => {
    const moduleId = mod.id;
    const lessons = $$('.lesson-header', mod);
    structure[moduleId] = {
      totalLessons: lessons.length,
      lessonIds: lessons.map((l) => l.getAttribute('data-lesson-id') || l.id || ''),
    };
  });

  return structure;
};

const initModuleProgress = () => {
  const progress = getCourseProgress();
  const structure = getCourseStructure();
  const allModuleIds = Object.keys(structure);

  // Inicializar módulos que no existan aún en el progreso
  allModuleIds.forEach((id) => {
    if (!progress.modules[id]) {
      progress.modules[id] = { started: false, completedLessons: [] };
    }
  });

  saveCourseProgress(progress);

  // Aplicar estado visual a cada módulo
  allModuleIds.forEach((moduleId) => {
    const modData = progress.modules[moduleId];
    const modEl = $(`#${moduleId}`);
    if (!modEl) return;

    const startBtn = $('.module-start-btn', modEl);
    if (startBtn) {
      startBtn.textContent = modData.started ? 'Continuar' : 'Iniciar';
    }

    // Marcar lecciones completadas
    modData.completedLessons.forEach((lessonId) => {
      if (!lessonId) return;
      const checkbox = $(`.lesson-complete-checkbox[data-lesson-id="${lessonId}"]`, modEl);
      if (checkbox) checkbox.checked = true;

      const lessonItem = checkbox?.closest('.lesson-item') || checkbox?.closest('li');
      if (lessonItem) {
        lessonItem.classList.add('completed');
        const title = $('.lesson-title, h3, h4', lessonItem);
        if (title) title.classList.add('strikethrough');
      }
    });

    // Actualizar barra de progreso del módulo
    updateModuleProgressBar(moduleId);
  });

  // Actualizar progreso general
  updateOverallProgress();

  console.log('[Progreso módulos] Inicializado.');
};

// ============================================================
// 17. BOTÓN INICIAR / CONTINUAR MÓDULO
// ============================================================

const initModuleStartButtons = () => {
  const startButtons = $$('.module-start-btn');

  startButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modEl = btn.closest('.module[id]') || btn.closest('section[id]');
      if (!modEl) return;

      const moduleId = modEl.id;
      const progress = getCourseProgress();

      if (!progress.modules[moduleId]) {
        progress.modules[moduleId] = { started: false, completedLessons: [] };
      }

      progress.modules[moduleId].started = true;
      saveCourseProgress(progress);

      btn.textContent = 'Continuar';

      // Scroll a la primera lección del módulo
      const firstLesson = $('.lesson-header', modEl);
      if (firstLesson) {
        const top = firstLesson.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      console.log(`[Iniciar módulo] "${moduleId}" marcado como iniciado.`);
    });
  });

  console.log(`[Botones iniciar] ${startButtons.length} botones configurados.`);
};

// ============================================================
// 18. TOGGLE DE COMPLETADO DE LECCIÓN
// ============================================================

const updateModuleProgressBar = (moduleId) => {
  const modEl = $(`#${moduleId}`);
  if (!modEl) return;

  const progress = getCourseProgress();
  const modData = progress.modules[moduleId];
  if (!modData) return;

  const totalCheckboxes = $$('.lesson-complete-checkbox', modEl);
  const total = totalCheckboxes.length || 1;
  const completed = modData.completedLessons.filter(Boolean).length;
  const pct = Math.round((completed / total) * 100);

  const bar = $('.module-progress-fill', modEl);
  if (bar) bar.style.width = `${pct}%`;

  const text = $('.module-progress-text', modEl);
  if (text) text.textContent = `${pct}%`;
};

const updateOverallProgress = () => {
  const structure = getCourseStructure();
  const progress = getCourseProgress();
  let totalLessons = 0;
  let completedLessons = 0;

  Object.keys(structure).forEach((moduleId) => {
    totalLessons += structure[moduleId].totalLessons;
    const modData = progress.modules[moduleId];
    if (modData) {
      completedLessons += modData.completedLessons.filter(Boolean).length;
    }
  });

  const overallText = $('.overall-progress-text');
  if (overallText) {
    overallText.textContent = `${completedLessons} de ${totalLessons} lecciones completadas`;
  }

  const overallFill = $('.overall-progress-fill');
  if (overallFill) {
    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    overallFill.style.width = `${pct}%`;
  }
};

const initLessonCompletion = () => {
  const checkboxes = $$('.lesson-complete-checkbox');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const lessonId = checkbox.getAttribute('data-lesson-id') || '';
      const modEl = checkbox.closest('.module[id]') || checkbox.closest('section[id]');
      if (!modEl) return;

      const moduleId = modEl.id;
      const progress = getCourseProgress();

      if (!progress.modules[moduleId]) {
        progress.modules[moduleId] = { started: false, completedLessons: [] };
      }

      const modData = progress.modules[moduleId];

      if (checkbox.checked) {
        // Añadir lección completada
        if (!modData.completedLessons.includes(lessonId)) {
          modData.completedLessons.push(lessonId);
        }

        // Feedback visual
        const lessonItem = checkbox.closest('.lesson-item') || checkbox.closest('li');
        if (lessonItem) {
          lessonItem.classList.add('completed');
          const title = $('.lesson-title, h3, h4', lessonItem);
          if (title) title.classList.add('strikethrough');
        }
      } else {
        // Quitar lección completada
        modData.completedLessons = modData.completedLessons.filter((id) => id !== lessonId);

        // Quitar feedback visual
        const lessonItem = checkbox.closest('.lesson-item') || checkbox.closest('li');
        if (lessonItem) {
          lessonItem.classList.remove('completed');
          const title = $('.lesson-title, h3, h4', lessonItem);
          if (title) title.classList.remove('strikethrough');
        }
      }

      // Marcar módulo como iniciado si no lo estaba
      modData.started = true;
      const startBtn = $('.module-start-btn', modEl);
      if (startBtn) startBtn.textContent = 'Continuar';

      saveCourseProgress(progress);

      // Actualizar barras de progreso
      updateModuleProgressBar(moduleId);
      updateOverallProgress();

      console.log(`[Lección] "${lessonId}" ${checkbox.checked ? 'completada' : 'desmarcada'}.`);
    });
  });

  console.log(`[Completado lecciones] ${checkboxes.length} checkboxes configurados.`);
};

// ============================================================
// 19. DISPLAY DE PROGRESO GENERAL
// ============================================================

const initOverallProgress = () => {
  updateOverallProgress();
  console.log('[Progreso general] Inicializado.');
};

// ============================================================
// 20. NAVEGACIÓN SUAVE A MÓDULOS
// ============================================================

const initModuleNavigation = () => {
  $$('.module-card, .toc-item a[href^="#"]').forEach((card) => {
    card.addEventListener('click', (e) => {
      let targetId = null;

      // Si es un enlace con href
      if (card.tagName === 'A') {
        targetId = card.getAttribute('href');
      } else {
        // Buscar el id del módulo asociado
        targetId = card.getAttribute('data-target') || card.getAttribute('href');
      }

      if (!targetId) {
        // Intentar extraer de data-module o clase
        const moduleAttr = card.getAttribute('data-module');
        if (moduleAttr) targetId = `#${moduleAttr}`;
      }

      if (!targetId) return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', targetId);
    });
  });

  console.log('[Navegación módulos] Inicializada.');
};

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('========================================');
  console.log(' Inicializando sitio HTML & CSS...');
  console.log('========================================');

  initThemeToggle();            //  1. Tema claro / oscuro
  initHamburgerMenu();          //  2. Menú hamburguesa
  initScrollToTop();            //  3. Botón volver arriba
  initReadingProgress();        //  4. Barra de progreso
  initLessonAccordions();       //  5. Acordeones de lecciones
  initSmoothScrollLinks();      //  6. Scroll suave en anclas
  initScrollAnimations();       //  7. Animaciones al desplazar
  initActiveNavigation();       //  8. Navegación activa
  initCodeCopyButtons();        //  9. Copiar código
  initFormValidation();         // 10. Validación de formulario
  initTOCSmoothScroll();       // 11. TOC scroll suave
  initKeyboardNavigation();    // 12. Navegación por teclado
  initTOCScrollSpy();          // 13. Scroll Spy TOC
  initResponsive();             // 14. Manejo responsive
  // 15. Persistencia de tema (ya incluida en initThemeToggle)

  // --- Nuevos módulos de progreso ---
  initModuleProgress();         // 16. Tracking de progreso de módulos
  initModuleStartButtons();     // 17. Botones iniciar / continuar
  initLessonCompletion();       // 18. Toggle completado de lecciones
  initOverallProgress();        // 19. Display de progreso general
  initModuleNavigation();       // 20. Navegación suave a módulos

  console.log('========================================');
  console.log(' Todos los módulos inicializados.');
  console.log('========================================');
});
