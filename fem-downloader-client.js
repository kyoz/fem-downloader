require('dotenv').config({ silent: true });
const _util = require('util');
const _fs = require('fs');
const _mkdirp = require('mkdirp')
const _request = require('request');
const _sanitize = require('sanitize-filename');
const _path = require('path');

function extractNonce(html) {
  return html.match(/name="nonce" value="(\w+)"/)[1];
}

class Client {
  constructor(format = 'webm', resolution = 720, dest = 'Downloaded') {
    this.request = _util.promisify(_request);
    this.baseUrl = 'https://frontendmasters.com';
    this.baseUrlApi = 'https://api.frontendmasters.com';
    this.format = format;
    this.resolution = resolution;
    this.dest = dest;
  }

  async authenticate(username, password) {
    const form = {
      username,
      password,
      remember: 'on'
    };
    const config = this.requestConfig({
      form,
      url: 'login/',
      method: 'POST'
    });
    form.nonce = await this.getNonce();
    const { statusCode } = await this.request(config);
    return statusCode === 302;
  }

  async getNonce() {
    const config = this.requestConfig({
      url: 'login/'
    });
    const { body } = await this.request(config);
    return extractNonce(body);
  }

  requestConfig(config) {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    };
    return {
      headers,
      baseUrl: this.baseUrl,
      jar: true,
      ...config
    };
  }

  async downloadCourseInfo(course) {
    const config = this.requestConfig({
      baseUrl: this.baseUrlApi,
      url: `v1/kabuki/courses/${course}`,
      json: true
    });
    const res = await this.request(config);
    this.courseData = res.body;
    this.lessonData = this.courseData.lessonData;
    this.downloadQueue = this.courseData.lessonHashes;
    return this.courseData;
  }

  skipLessons(qty) {
    this.downloadQueue = this.downloadQueue.slice(qty);
  }

  async downloadCourse() {
    const { downloadQueue } = this;
    const lesson = downloadQueue.shift();
    const remaining = await this.downloadLesson(lesson);
    if (remaining) return this.downloadCourse();
    return null;
  }

  async downloadLesson(lesson) {
    let url;
    let format;
    while (!url) {
      const res = await this.getVideoUrl(this.lessonData[lesson].sourceBase);
      url = res.url;
      format = res.format;
    }
    const ix = this.lessonData[lesson].index + 1;
    const filename = _sanitize(
      `${ix < 10 ? '0' : ''}${ix}.${this.lessonData[lesson].title}.${format}`
    );

    const read = _request({
      url,
      jar: true
    });
    const writeStream = this.writeStream(filename, read);
    let total = 0;
    read.on('data', ({ length }) => {
      process.stdout.write(
        `  -> ${filename}: ${this.formatBytes(total += length, 2)} bytes downloaded \r`
      );
    });
    return new Promise(resolve => {
      writeStream.on('finish', () => process.stdout.write('\n'));
      writeStream.on('finish', () => resolve(this.downloadQueue.length));
    });
  }

  async getVideoUrl(sourceBase, _resolution, _format) {
    const resolution = _resolution || this.resolution;
    const format = _format || this.format;
    const config = {
      baseUrl: sourceBase,
      url: '/source',
      qs: { r: resolution, f: format },
      json: true,
      jar: true
    };
    const res = await this.request(config);
    const { body } = res;
    return {
      resolution,
      format,
      ...body
    };
  }

  writeStream(filename, read) {
    const path = _path.resolve(this.dest, this.courseData.slug);
    if (!_fs.existsSync(path)) _mkdirp.sync(path);
    return read.pipe(_fs.createWriteStream(_path.resolve(path, filename)));
  }

  formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

}

module.exports = Client;
