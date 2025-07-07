// Recoge todos los enlaces de galería
const galleryLinks = Array.from(document.querySelectorAll(".gallery-link"));
let currentIndex = 0;

function openLightbox(index) {
  const imgSrc = galleryLinks[index].getAttribute("href");
  document.getElementById("lightbox-img").src = imgSrc;
  document.getElementById("lightbox").classList.add("active");
  currentIndex = index;
}

galleryLinks.forEach((link, idx) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    openLightbox(idx);
  });
});

function closeLightbox(e) {
  if (
    e.target.classList.contains("lightbox") ||
    e.target.classList.contains("lightbox-close")
  ) {
    document.getElementById("lightbox").classList.remove("active");
    document.getElementById("lightbox-img").src = "";
  }
}

function showImage(idx) {
  // Corrige para loop infinito (opcional: quitar el loop si no quieres)
  if (idx < 0) idx = galleryLinks.length - 1;
  if (idx >= galleryLinks.length) idx = 0;
  openLightbox(idx);
}

function prevImage(e) {
  e.stopPropagation();
  showImage(currentIndex - 1);
}

function nextImage(e) {
  e.stopPropagation();
  showImage(currentIndex + 1);
}

// Navegación con teclado
document.addEventListener("keydown", function (e) {
  if (!document.getElementById("lightbox").classList.contains("active")) return;
  if (e.key === "Escape")
    closeLightbox({ target: document.getElementById("lightbox") });
  if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  if (e.key === "ArrowRight") showImage(currentIndex + 1);
});
