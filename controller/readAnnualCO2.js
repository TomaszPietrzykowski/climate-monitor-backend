const FTPClient = require("ftp")
const c = new FTPClient()
const updateDataset = require("./updateDataset")

const readAnnualCO2 = async () => {
  c.connect({
    host: "aftp.cmdl.noaa.gov"
  })
  c.on("ready", function() {
    console.log("connected to ftp...")
    c.get("products/trends/co2/co2_annmean_mlo.txt", function(err, stream) {
      if (err) throw err
      var content = ""
      stream.on("data", function(chunk) {
        content += chunk.toString()
      })
      stream.on("end", function() {
        const parentArray = content.split("\n")
        const dataArray = parentArray.filter(row => !row.includes("#"))
        const outputLabels = []
        const outputValues = []
        dataArray.forEach(string => {
          const set = string.trim().split(" ")
          if (set[0] && set[3]) {
            outputLabels.push(set[0])
            outputValues.push(set[3] * 1)
          }
        })
        const output = { labels: outputLabels, values: outputValues }
        updateDataset("annualco2", output)
      })
    })
  })
}

module.exports = readAnnualCO2