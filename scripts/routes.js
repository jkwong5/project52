page('/',
  articlesController.loadAll,
  articlesController.index);

page('/about', aboutController.index);

page('/article/:id',
  articlesController.loadById,
  articlesController.index);

// Redirect home if the default filter option is selected:
page('/category', '/');
page('/month', '/');

page('/month/:monthName',
  articlesController.loadByMonth,
  articlesController.index);

page('/category/:categoryName',
  articlesController.loadByCategory,
  articlesController.index);

page();
