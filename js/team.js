// Team page functionality for cofounder contact modal
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('contactModal');
  const modalClose = document.querySelector('.modal-close');
  const emailOption = document.getElementById('emailOption');
  const linkedinOption = document.getElementById('linkedinOption');
  const clickableElements = document.querySelectorAll('.clickable');

  // Cofounder contact information (placeholder data)
  const cofounderData = {
    1: {
      email: 'Federico.Bise@visposystems.com',
      linkedin: 'https://www.linkedin.com/in/federico-bise-0a739a279/'
    },
    2: {
      email: 'Santiago.Evangelista@visposystems.com',
      linkedin: 'https://www.linkedin.com/in/santiagorevangelista/'
    },
    3: {
      email: 'Riccardo.Lionetto@visposystems.com',
      linkedin: 'https://www.linkedin.com/in/riccardo-lionetto/'
    }
  };

  let currentCofounder = null;

  // Show modal when clicking on cofounder image or name
  clickableElements.forEach(element => {
    element.addEventListener('click', function() {
      const cofounderSection = this.closest('.cofounder');
      const cofounderId = cofounderSection.getAttribute('data-cofounder');
      currentCofounder = cofounderData[cofounderId];

      if (currentCofounder) {
        // Update modal links
        emailOption.href = `mailto:${currentCofounder.email}`;
        linkedinOption.href = currentCofounder.linkedin;
        linkedinOption.target = '_blank';

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
  });

  // Close modal when clicking close button
  modalClose.addEventListener('click', function() {
    closeModal();
  });

  // Close modal when clicking outside of modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    currentCofounder = null;
  }
});