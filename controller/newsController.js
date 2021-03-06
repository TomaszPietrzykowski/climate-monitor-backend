const newsModel = require("../model/newsModel")
const axios = require("axios")
const catchError = require("../utilities/catchError")
const logger = require("../Logger")

// @description: Fetch news
// @route: GET /api/news
// @access: Public
exports.getNews = catchError(async (req, res) => {
  const pageSize = 24
  const page = Number(req.query.page) || 1
  const news = await newsModel.findById("607c0f011bd74a1fe04395b2")
  const count = news.articles.length
  const pages = Math.ceil(count / pageSize)
  if (news && news.articles) {
    const output = news.articles.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    )
    res
      .status(200)
      .json({ articles: output, lastUpdate: news.updatedAt, page, pages })
  } else {
    res.status(404).json({
      status: "fail",
      message: "No data found in database",
    })
  }
})

// @description: Fetch news from NewsAPI and update db
// @route: none
// @access: Application
exports.updateNewsfeed = async () => {
  try {
    const updated = []
    const counter = [1, 2, 3, 4, 5]

    for (const page of counter) {
      const news = await axios.get(
        `https://newsapi.org/v2/everything?q=climate+change&language=en&sortBy=relevance&apiKey=${process.env.NEWS_API_KEY}&page=${page}`
      )
      const articles = news.data.articles
      if (articles && articles.length > 1) {
        articles.forEach((article) => {
          if (
            article.title &&
            article.content &&
            article.url &&
            article.urlToImage &&
            updated.filter((art) => art.title === article.title).length === 0
          ) {
            updated.push({
              source: article.source.name,
              title: article.title,
              description: article.description,
              author: article.author,
              content: article.content,
              url: article.url,
              image: article.urlToImage,
              publishedAt: article.publishedAt.substring(0, 10),
            })
          }
        })
      }
    }
    if (updated.length > 10) {
      let output = await newsModel.findById("607c0f011bd74a1fe04395b2")
      output.articles = updated
      await output.save()
      logger.log(`NEWS UPDATED, array length: ${updated.length}`)
    } else {
      logger.log(
        `FAILED TO UPDATE NEWS, articles array length: ${updated.length}`
      )
    }
  } catch (err) {
    logger.log(`Error updating public dataset: ${err}`)
  }
}
