(function(module) {
  function Article (opts) {
    Object.keys(opts).forEach(function(e, index, keys) {
      this[e] = opts[e];
    },this);
  }

  Article.all = [];

  Article.createTable = function(callback) {
    webDB.execute(
      'CREATE TABLE IF NOT EXISTS articles (' +
        'id INTEGER PRIMARY KEY, ' +
        'title VARCHAR(255) NOT NULL, ' +
        'month VARCHAR(255) NOT NULL, ' +
        'authorUrl VARCHAR (255), ' +
        'url VARCHAR (255),' +
        'category VARCHAR(20), ' +
        'publishedOn DATETIME, ' +
        'body TEXT NOT NULL);',
      callback
    );
  };

  Article.truncateTable = function(callback) {
    webDB.execute(
      'DELETE FROM articles;',
      callback
    );
  };

  Article.prototype.insertRecord = function(callback) {
    webDB.execute(
      [
        {
          'sql': 'INSERT INTO articles (title, month, authorUrl, url, category, publishedOn, body) VALUES (?, ?, ?, ?, ?, ?, ?);',
          'data': [this.title, this.month, this.authorUrl, this.url, this.category, this.publishedOn, this.body],
        }
      ],
      callback
    );
  };

  Article.prototype.deleteRecord = function(callback) {
    webDB.execute(
      [
        {
          'sql': 'DELETE FROM articles WHERE id = ?;',
          'data': [this.id]
        }
      ],
      callback
    );
  };

  Article.prototype.updateRecord = function(callback) {
    webDB.execute(
      [
        {
          'sql': 'UPDATE articles SET title = ?, month = ?, authorUrl = ?, url = ?, category = ?, publishedOn = ?, body = ? WHERE id = ?;',
          'data': [this.title, this.month, this.authorUrl, this.url, this.category, this.publishedOn, this.body, this.id]
        }
      ],
      callback
    );
  };

  Article.loadAll = function(rows) {
    Article.all = rows.map(function(ele) {
      return new Article(ele);
    });
  };

  Article.fetchAll = function(callback) {
    webDB.execute('SELECT * FROM articles ORDER BY publishedOn DESC', function(rows) {
      if (rows.length) {
        Article.loadAll(rows);
        callback();
      } else {
        $.getJSON('/data/projects.json', function(rawData) {
          // Cache the json, so we don't need to request it next time:
          rawData.forEach(function(item) {
            var article = new Article(item); // Instantiate an article based on item from JSON
            article.insertRecord(); // Cache the article in DB
          });
          webDB.execute('SELECT * FROM articles', function(rows) {
            Article.loadAll(rows);
            callback();
          });
        });
      }
    });
  };

  Article.findWhere = function(field, value, callback) {
    webDB.execute(
      [
        {
          sql: 'SELECT * FROM articles WHERE ' + field + ' = ?;',
          data: [value]
        }
      ],
      callback
    );
  };

  // DONE: Example of synchronous, FP approach to getting unique data
  Article.allMonths = function() {
    return Article.all.map(function(article) {
      return article.month;
    })
    .reduce(function(names, name) {
      if (names.indexOf(name) === -1) {
        names.push(name);
      }
      return names;
    }, []);
  };

  // DONE: Example of async, SQL-based approach to getting unique data
  Article.allCategories = function(callback) {
    webDB.execute('SELECT DISTINCT category FROM articles;', callback);
  };

  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
      return article.body.match(/\b\w+/g).length;
    })
    .reduce(function(a, b) {
      return a + b;
    });
  };

  Article.numWordsByAuthor = function() {
    return Article.allMonths().map(function(month) {
      return {
        name: month,
        numWords: Article.all.filter(function(a) {
          return a.month === month;
        })
        .map(function(a) {
          return a.body.match(/\b\w+/g).length;
        })
        .reduce(function(a, b) {
          return a + b;
        })
      };
    });
  };

  Article.stats = function() {
    return {
      numArticles: Article.all.length,
      numWords: Article.numwords(),
      Months: Article.allMonths(),
    };
  };

  module.Article = Article;
})(window);
