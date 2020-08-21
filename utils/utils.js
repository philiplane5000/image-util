module.exports = {
  mimeToExt: {
    "image/jpeg": "jpg",
  },
  timestamp: () => {
    // TODO: Update below to moment formatted date for better accuracy
    let now = new Date();
    let month = now.getUTCMonth().toString().length < 2 ? `0${now.getUTCMonth()+1}` : now.getUTCMonth()+1;
    let day = now.getUTCDate().toString().length < 2 ? `0${now.getUTCDate()}` : now.getUTCDate();
    let year = now.getUTCFullYear();
    return `${year}_${month}_${day}`
  }
}