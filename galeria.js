document.addEventListener('DOMContentLoaded', function() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      const src = img.src;
      
      // Criar modal
      const modal = document.createElement('div');
      modal.className = 'gallery-modal';
      modal.innerHTML = '<span class="gallery-modal-close">&times;</span><img src="' + src + '" alt="">';
      document.body.appendChild(modal);
      
      // Fechar modal
      modal.querySelector('.gallery-modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    });
  });
});
