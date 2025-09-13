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

// Skeleton loader function
function getSkeletonLoaderHTML() {
  return `
      <div class="skeleton-loader">
          <div class="skeleton-blog-grid">
              ${Array.from({length: 6}, () => `
                  <div class="skeleton-blog-card">
                      <div class="skeleton-blog-image"></div>
                      <div class="skeleton-blog-content">
                          <div class="skeleton-tag"></div>
                          <div class="skeleton-title"></div>
                          <div class="skeleton-meta">
                              <div class="skeleton-date"></div>
                              <div class="skeleton-author"></div>
                          </div>
                          <div class="skeleton-subtitle"></div>
                      </div>
                  </div>
              `).join('')}
          </div>
      </div>
  `;
}

function changePage(page) {
  const blogGrid = document.querySelector('.blog-grid');
  const paginationContainer = document.querySelector('.pagination-container');
  if (!blogGrid) return;

  // Show skeleton loader at the top
  blogGrid.innerHTML = getSkeletonLoaderHTML();
  
  // Scroll to top immediately when pagination starts
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Record start time for minimum display duration
  const startTime = Date.now();
  const minDisplayTime = 1500; // Minimum 1.5 seconds display time

  fetch(`/api/blogs?page=${page}`)
      .then(response => response.json())
      .then(data => {
          // Calculate remaining time to ensure minimum display duration
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
          
          setTimeout(() => {
              if (data.blogs && data.blogs.length > 0) {
                  renderBlogs(data.blogs);

                  if (data.pagination) {
                      renderPagination(data.pagination);
                      if (data.pagination.totalBlogs > 6) initPagination();
                  }
              } else {
                  blogGrid.innerHTML = getEmptyStateHTML();
                  if (paginationContainer) paginationContainer.innerHTML = '';
              }
          }, remainingTime);
      })
      .catch(error => {
          console.error('Error loading blogs:', error);
          // Also apply minimum display time for error case
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
          
          setTimeout(() => {
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
          }, remainingTime);
      });
}

function renderBlogs(blogs) {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;

  if (!blogs || blogs.length === 0) {
      blogGrid.innerHTML = getEmptyStateHTML();
      return;
  }

  // Sort blogs by date descending
  blogs.sort((a, b) => {
      let dateA = new Date(a.publishedDate && a.publishedDate !== "undefined" && a.publishedDate !== "null" ? a.publishedDate : a.createdAt || 0);
      let dateB = new Date(b.publishedDate && b.publishedDate !== "undefined" && b.publishedDate !== "null" ? b.publishedDate : b.createdAt || 0);
      return dateB - dateA;
  });

  let blogsHTML = blogs.map(blog => {
      let dateToUse = blog.publishedDate && blog.publishedDate !== "undefined" && blog.publishedDate !== "null" ? blog.publishedDate : blog.createdAt;
      let formattedDate = dateToUse ? new Date(dateToUse).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric"
      }) : "Recently Added";

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
      <div class="pagination-info">Showing ${startBlog} to ${endBlog} of ${pagination.totalBlogs} blogs</div>
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
          </li>
      `;
  }

  // Mobile-friendly page numbers (max 3 dots)
  const currentPage = pagination.currentPage;
  const totalPages = pagination.totalPages;
  
  if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
          if (i === currentPage) {
              paginationHTML += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
          } else {
              paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a></li>`;
          }
      }
  } else {
      // Show max 3 page dots with smart positioning
      let startPage, endPage;
      
      if (currentPage <= 2) {
          // Show pages 1, 2, 3
          startPage = 1;
          endPage = Math.min(3, totalPages);
      } else if (currentPage >= totalPages - 1) {
          // Show last 3 pages
          startPage = Math.max(1, totalPages - 2);
          endPage = totalPages;
      } else {
          // Show current page and one on each side
          startPage = currentPage - 1;
          endPage = currentPage + 1;
      }
      
      // Add first page if not in range
      if (startPage > 1) {
          paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="1">1</a></li>`;
          if (startPage > 2) {
              paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
          }
      }
      
      // Add page numbers in range
      for (let i = startPage; i <= endPage; i++) {
          if (i === currentPage) {
              paginationHTML += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
          } else {
              paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a></li>`;
          }
      }
      
      // Add last page if not in range
      if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
              paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
          }
          paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${totalPages}">${totalPages}</a></li>`;
      }
  }

  // Next button
  if (pagination.hasNextPage) {
      paginationHTML += `
          <li class="page-item">
              <a class="page-link" href="javascript:void(0)" data-page="${pagination.currentPage + 1}" aria-label="Next">
                  <span aria-hidden="true">Next &raquo;</span>
              </a>
          </li>
      `;
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
      </div>
  `;
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
                  item.classList.remove('active');
                  answer.style.maxHeight = '0px';
                  answer.style.opacity = '0';
                  icon.style.transform = 'rotate(0deg)';
              } else {
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
