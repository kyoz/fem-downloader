const args = require('args');
const FemDowloaderClient = require('./fem-downloader-client');

args
  .option('user', 'Username or Email')
  .option('pass', 'Password')
  .option('course', 'Slug for the course download (ex.: web-performance for https://frontendmasters.com/courses/web-performance/')
  .option('skip', 'Number of videos to skip', 0)
  .option('dest', 'Destination download folder')
  .option('format', 'webm or mp4', 'webm')
  .option('resolution', '720 or 1080', 1080);

const userOptions = args.parse(process.argv);
async function run(options) {
  const {
    user,
    pass,
    course,
    skip,
    dest,
    format,
    resolution,
  } = options;
  const client = new FemDowloaderClient(format, resolution, dest);
  const authed = await client.authenticate(user, pass);
  if (authed) {
    log(` > ${user} logged in successful.`);
    const data = await client.downloadCourseInfo(course);
    log(` > "${data.title}" is starting to download...`);
    client.skipLessons(skip);
    log(` > Downloading ${client.downloadQueue.length} videos  ( to "${dest ? dest : 'Downloaded'}" )`);
    await client.downloadCourse();
  } else {
    log(' > Authentication failed');
  }
}

function log(message) {
  console.log(`\x1b[32m${message}\x1b[0m`)
}

run(userOptions);