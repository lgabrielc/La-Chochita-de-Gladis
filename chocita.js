let galleryLinks = [];
let currentIndex = 0;

function refreshGalleryLinks() {
  galleryLinks = Array.from(document.querySelectorAll(".gallery-link"));
  galleryLinks.forEach((link, index) => link.addEventListener("click", (event) => { event.preventDefault(); openLightbox(index); }));
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
function photoUrl(photo) { return photo.url || `/media/${photo.key}`; }

function renderGallery(photos) {
  const gallery = document.querySelector(".galeria");
  gallery.replaceChildren();
  photos.forEach((photo) => {
    const col = document.createElement("div"), link = document.createElement("a"), img = document.createElement("img");
    const source = photoUrl(photo);
    col.className = "col-6 col-md-3";
    link.className = "gallery-link";
    link.href = source;
    img.src = source;
    img.alt = photo.alt || "Foto de La Chocita de Gladis";
    link.append(img);
    col.append(link);
    gallery.append(col);
  });
}

function renderCarousel(photos) {
  const carousel = document.querySelector("#carouselFotos .carousel-inner");
  if (!carousel) return;
  carousel.replaceChildren();
  photos.forEach((photo, index) => {
    const item = document.createElement("div"), img = document.createElement("img");
    item.className = `carousel-item${index === 0 ? " active" : ""}`;
    img.className = "d-block w-100";
    img.src = photoUrl(photo);
    img.alt = photo.alt || "Foto de La Chocita de Gladis";
    item.append(img);
    carousel.append(item);
  });
}

async function loadManagedGallery() {
  try {
    const response = await fetch("/api/gallery", { cache: "no-store" });
    const { photos, carousel, hero } = await response.json();
    if (response.ok && Array.isArray(photos) && photos.length) {
      renderGallery(photos);
      renderCarousel(Array.isArray(carousel) && carousel.length ? carousel : photos);
      if (hero) document.querySelector(".hero").style.backgroundImage = `url("${photoUrl(hero)}")`;
    }
  } catch {
    // La página conserva sus fotos estáticas hasta que el panel esté configurado.
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

async function loadSiteContent() {
  try {
    const site = await (await fetch("/api/site", { cache: "no-store" })).json();
    if (!site.title) return;
    document.title = site.seoTitle || site.title;
    document.querySelector('meta[name="description"]').setAttribute("content", site.seoDescription || "");
    document.querySelector(".hero h1").textContent = site.title;
    document.querySelector(".hero h4").textContent = site.subtitle;
    document.querySelector(".container.py-5 h2").textContent = site.welcomeTitle;
    document.querySelector(".container.py-5 .fs-5").textContent = site.welcomeText;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${site.whatsapp}&text=${encodeURIComponent(`Me interesa saber más sobre ${site.title}`)}`;
    document.querySelectorAll('a[href*="api.whatsapp.com"]').forEach((link) => { link.href = whatsappUrl; });
    document.querySelectorAll(".price-main").forEach((node, index) => { node.textContent = site.weekday[index] || node.textContent; });
    document.querySelectorAll(".price-main2").forEach((node, index) => { node.textContent = site.weekend[index] || node.textContent; });
    const schedule = document.querySelector(".tarifa-card .mt-3.small");
    if (schedule) schedule.innerHTML = `<b>Check-in:</b> ${site.checkIn} &nbsp;|&nbsp; <b>Check-out:</b> ${site.checkOut}<br><i>*Casa privada para familia o grupo*</i>`;
    document.querySelector('a[href*="facebook.com"]').href = site.facebook;
    document.querySelector('a[href*="tiktok.com"]').href = site.tiktok;
    const cards = document.querySelectorAll(".pago-terminos-card ul");
    if (cards[0]) cards[0].querySelectorAll("li").forEach((node, index) => { if (site.payments[index]) node.textContent = site.payments[index]; });
    if (cards[1]) cards[1].querySelectorAll("li").forEach((node, index) => { if (site.terms[index]) node.textContent = site.terms[index]; });
  } catch { /* La página conserva el contenido estático hasta que se guarde desde el panel. */ }
}
loadSiteContent();
