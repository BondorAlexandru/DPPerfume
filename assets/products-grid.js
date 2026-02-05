(function () {
  const sortTypes = {
    alphabetical: 'title-ascending',
    alphabetical_reversed: 'title-descending',
    products_high: 'price-ascending',
    products_low: 'price-descending',
    date: 'created-ascending',
    date_reversed: 'created-descending',
  };

  function getCollectionUrl(collectionHandle, sortType) {
    const currentDomain = window.location.origin;
    const sortBy = sortTypes[sortType] || 'title-ascending';
    return `${currentDomain}/collections/${collectionHandle}?sort_by=${sortBy}`;
  }

  function handleResponse(response, section, limitProducts) {
    response.text().then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const targetGrid = section.querySelector('.products-grid__wrapper');
      const sourceGrid = doc.getElementById('product-grid');
      if (!targetGrid || !sourceGrid || !sourceGrid?.children) return;

      const sourceItems = Array.from(sourceGrid.children);
      if (sourceItems.length > limitProducts) {
        const firstItems = sourceItems.slice(0, limitProducts);
        targetGrid.innerHTML = '';
        firstItems.forEach((item) => {
          targetGrid.appendChild(item);
        });
      } else {
        targetGrid.innerHTML = sourceGrid.innerHTML;
      }
    });
  }

  const initSection = (section) => {
    if (!section || !section.classList.contains('products-grid-section')) return;

    const box = section.querySelector('.products-grid');
    if (!box) return;

    const collectionHandle = box.dataset.collectionHandle;
    const totalShopProducts = Number(box.dataset.totalShopProducts);
    const sortType = box.dataset.sortType;
    const limitProducts = Number(box.dataset.limitProducts);
    if (
      !collectionHandle ||
      collectionHandle === 'none' ||
      !sortType ||
      !totalShopProducts ||
      totalShopProducts === 0 ||
      totalShopProducts <= 50
    ) {
      return;
    }

    const url = getCollectionUrl(collectionHandle, sortType);

    box.classList.add('products-grid--loading');
    fetch(url)
      .then((response) => handleResponse(response, section, limitProducts))
      .catch((error) => {
        console.error('Products grid: Error when fetching the collection page:', error);
      })
      .finally(() => {
        box.classList.remove('products-grid--loading');
      });
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener('shopify:section:load', function (event) {
    initSection(event.target);
  });
})();
