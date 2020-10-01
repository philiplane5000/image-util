const dayjs = require('dayjs');

module.exports = {
  mimeToExt: {
    "image/jpeg": "jpg",
  },
  timestamp: () => {
    // TODO: Update below to moment formatted date for better accuracy
    const now = dayjs();
    const month = now.format('MM');
    const year = now.format('YYYY');
    const day = now.format('DD');
    
    return `${year}_${month}_${day}`
  }
}