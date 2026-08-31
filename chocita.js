let galleryLinks = [];
let currentIndex = 0;

function refreshGalleryLinks() {
  galleryLinks = Array.from(document.querySelectorAll(".gallery-link"));
  galleryLinks.forEach((link, index) => link.addEventListener("click", (event) => {
    event.preventDefault();
    openLightbox(index);
  }));
}

function openLightbox(index) {
  const imgSrc = galleryLinks[index].getAttribute("href");
  document.getElementById("lightbox-img").src = imgSrc;
  document.getElementById("lightbox").classList.add("active");
  currentIndex = index;
}

function closeLightbox(event) {
  if (event.target.classList.contains("lightbox") || event.target.classList.contains("lightbox-close")) {
    document.getElementById("lightbox").classList.remove("active");
    document.getElementById("lightbox-img").src = "";
  }
}

function showImage(index) {
  if (index < 0) index = galleryLinks.length - 1;
  if (index >= galleryLinks.length) index = 0;
  openLightbox(index);
}

function prevImage(event) { event.stopPropagation(); showImage(currentIndex - 1); }
function nextImage(event) { event.stopPropagation(); showImage(currentIndex + 1); }

async function loadManagedGallery() {
  try {
    const response = await fetch("/api/gallery", { cache: "no-store" });
    const { photos } = await response.json();
    if (!response.ok || !Array.isArray(photos) || !photos.length) return;
    const gallery = document.querySelector(".galeria");
    gallery.replaceChildren();
    photos.forEach((photo) => {
      const col = document.createElement("div");
      const link = document.createElement("a");
      const img = document.createElement("img");
      const source = photo.url || `/media/${photo.key}`;
      col.className = "col-6 col-md-3";
      link.className = "gallery-link";
      link.href = source;
      img.src = source;
      img.alt = photo.alt || "Foto de La Chocita de Gladis";
      link.append(img);
      col.append(link);
      gallery.append(col);
    });
  } catch {
    // La galería original continúa visible si el panel aún no está configurado.
  }
  refreshGalleryLinks();
}

document.addEventListener("keydown", (event) => {
  if (!document.getElementById("lightbox").classList.contains("active")) return;
  if (event.key === "Escape") closeLightbox({ target: document.getElementById("lightbox") });
  if (event.key === "ArrowLeft") showImage(currentIndex - 1);
  if (event.key === "ArrowRight") showImage(currentIndex + 1);
});

loadManagedGallery();
