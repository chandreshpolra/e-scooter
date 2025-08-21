// Blog pagination functionality

function initPagination() {
  const paginationContainer = document.querySelector('.pagination-container');

  if (paginationContainer) {
    paginationContainer.addEventListener('click', function (e) {
      const pageLink = e.target.closest('.page-link');
      if (pageLink && pageLink.hasAttribute('data-page')) {
        e.preventDefault();
        const page = parseInt(pageLink.getAttribute('data-page'));
        changePage(page);
      }
    });
  }
}

function changePage(page) {
  const blogGrid = document.querySelector('.blog-grid');
  const paginationContainer = document.querySelector('.pagination-container');

  if (!blogGrid) return;

  // Show loading spinner
  blogGrid.innerHTML = `
    <div class="text-center p-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;

  fetch(`/api/blogs?page=${page}`)
    .then(response => response.json())
    .then(data => {
      if (data.blogs && data.blogs.length > 0) {
        renderBlogs(data.blogs);

        if (data.pagination) {
          renderPagination(data.pagination);
          if (data.pagination.totalBlogs > 6) initPagination();
        }

        // ✅ Scroll page ke top (header) pe le jao
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } else {
        blogGrid.innerHTML = getEmptyStateHTML();
        if (paginationContainer) paginationContainer.innerHTML = '';
      }
    })
    .catch(error => {
      console.error('Error loading blogs:', error);
      blogGrid.innerHTML = `
        <div class="blog-card">
          <div class="blog-image">
            <img src="/images/ev-logo.png" alt="Electric Scooter">
          </div>
          <div class="blog-content">
            <div class="tag">Error</div>
            <h3 class="blog-title">Failed to load blogs</h3>
            <div class="date">Please try again</div>
            <p class="blog-subtitle">There was an error loading the blogs. Please refresh the page.</p>
          </div>
        </div>
      `;
    });
}

function renderBlogs(blogs) {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;

  if (!blogs || blogs.length === 0) {
    blogGrid.innerHTML = getEmptyStateHTML();
    return;
  }

  // ✅ Ensure latest blogs sabse pehle ho (descending order by date)
  blogs.sort((a, b) => {
    let dateA = new Date(a.publishedDate && a.publishedDate !== "undefined" && a.publishedDate !== "null"
      ? a.publishedDate
      : a.createdAt || 0);

    let dateB = new Date(b.publishedDate && b.publishedDate !== "undefined" && b.publishedDate !== "null"
      ? b.publishedDate
      : b.createdAt || 0);

    return dateB - dateA; // latest first
  });

  let blogsHTML = blogs.map(blog => {
    let dateToUse = blog.publishedDate && blog.publishedDate !== "undefined" && blog.publishedDate !== "null"
      ? blog.publishedDate
      : blog.createdAt;

    let formattedDate = dateToUse
      ? new Date(dateToUse).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
      : "Recently Added";

    return `
      <a href="/blogs/${blog.slug}" class="blog-card">
        <div class="blog-image">
          <img src="${blog.image || '/images/ev-logo.png'}" alt="${blog.title}">
        </div>
        <div class="blog-content">
          <div class="tag">${blog.category || 'Electric Scooter'}</div>
          <h3 class="blog-title">${blog.title}</h3>
          <div class="blog-meta">
            <div class="date">Posted on : ${formattedDate}</div>
            <div class="author">
              <i class="fas fa-user"></i> ${blog.authorName || 'E-Scooter Blog Team'}
            </div>
          </div>
          <p class="blog-subtitle">${(blog.excerpt || '').replace(/<[^>]*>/g, '')}</p>
        </div>
      </a>
    `;
  }).join('');

  blogGrid.innerHTML = blogsHTML;
}


function renderPagination(pagination) {
  const paginationContainer = document.querySelector('.pagination-container');
  if (!paginationContainer || (pagination.totalBlogs || 0) <= 6) {
    paginationContainer.innerHTML = '';
    return;
  }

  const startBlog = (pagination.currentPage - 1) * 6 + 1;
  const endBlog = Math.min(pagination.currentPage * 6, pagination.totalBlogs);

  let paginationHTML = `
    <div class="pagination-info">
      Showing ${startBlog} to ${endBlog} of ${pagination.totalBlogs} blogs
    </div>
    <nav aria-label="Blog pagination">
      <ul class="pagination justify-content-center">
  `;

  // Previous button
  if (pagination.hasPrevPage) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="javascript:void(0)" data-page="${pagination.currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo; Previous</span>
        </a>
      </li>`;
  }

  // Page numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === pagination.currentPage) {
      paginationHTML += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
    } else {
      paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a></li>`;
    }
  }

  // Next button
  if (pagination.hasNextPage) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="javascript:void(0)" data-page="${pagination.currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">Next &raquo;</span>
        </a>
      </li>`;
  }

  paginationHTML += `</ul></nav>`;
  paginationContainer.innerHTML = paginationHTML;
}

function getEmptyStateHTML() {
  return `
    <div class="empty-state">
      <div class="empty-icon"><i class="fas fa-heart"></i></div>
      <h3 class="empty-title">No blogs found</h3>
      <p class="empty-subtitle">Start publishing to see your posts here.</p>
    </div>`;
}

// FAQ Accordion functionality
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (question && answer && icon) {
      // Set initial state
      answer.style.maxHeight = '0px';
      answer.style.opacity = '0';

      question.addEventListener('click', (e) => {
        e.preventDefault();

        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            const otherIcon = otherItem.querySelector('.faq-icon');
            if (otherAnswer) {
              otherAnswer.style.maxHeight = '0px';
              otherAnswer.style.opacity = '0';
            }
            if (otherIcon) {
              otherIcon.style.transform = 'rotate(0deg)';
            }
          }
        });

        // Toggle current item
        const isActive = item.classList.contains('active');

        if (isActive) {
          // Close current item
          item.classList.remove('active');
          answer.style.maxHeight = '0px';
          answer.style.opacity = '0';
          icon.style.transform = 'rotate(0deg)';
        } else {
          // Open current item
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.opacity = '1';
          icon.style.transform = 'rotate(180deg)';
        }
      });

      // Handle window resize to recalculate heights
      window.addEventListener('resize', () => {
        if (item.classList.contains('active')) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFAQ();
  initPagination();
});
