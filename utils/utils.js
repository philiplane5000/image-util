module.exports = {
  mimeToExt: {
    "image/jpeg": ".jpg",
  },
  timestamp: () => {
    let now = new Date();
    let month = now.getUTCMonth().toString().length < 2 ? `0${now.getUTCMonth()+1}` : now.getUTCMonth()+1;
    let day = now.getUTCDate().toString().length < 2 ? `0${now.getUTCDate()}` : now.getUTCDate();
    let year = now.getUTCFullYear();
    return `${year}${month}${day}`
  }
}