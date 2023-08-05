"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GridFSBucketAdapter = void 0;
var _mongodb = require("mongodb");
var _FilesAdapter = require("./FilesAdapter");
var _defaults = _interopRequireDefault(require("../../defaults"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 GridFSBucketAdapter
 Stores files in Mongo using GridFS
 Requires the database adapter to be based on mongoclient

 
 */

// -disable-next

const crypto = require('crypto');
class GridFSBucketAdapter extends _FilesAdapter.FilesAdapter {
  constructor(mongoDatabaseURI = _defaults.default.DefaultMongoURI, mongoOptions = {}, encryptionKey = undefined) {
    super();
    this._databaseURI = mongoDatabaseURI;
    this._algorithm = 'aes-256-gcm';
    this._encryptionKey = encryptionKey !== undefined ? crypto.createHash('sha256').update(String(encryptionKey)).digest('base64').substring(0, 32) : null;
    const defaultMongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    const _mongoOptions = Object.assign(defaultMongoOptions, mongoOptions);
    for (const key of ['enableSchemaHooks', 'schemaCacheTtl', 'maxTimeMS']) {
      delete _mongoOptions[key];
    }
    this._mongoOptions = _mongoOptions;
  }
  _connect() {
    if (!this._connectionPromise) {
      this._connectionPromise = _mongodb.MongoClient.connect(this._databaseURI, this._mongoOptions).then(client => {
        this._client = client;
        return client.db(client.s.options.dbName);
      });
    }
    return this._connectionPromise;
  }
  _getBucket() {
    return this._connect().then(database => new _mongodb.GridFSBucket(database));
  }

  // For a given config object, filename, and data, store a file
  // Returns a promise
  async createFile(filename, data, contentType, options = {}) {
    const bucket = await this._getBucket();
    const stream = await bucket.openUploadStream(filename, {
      metadata: options.metadata
    });
    if (this._encryptionKey !== null) {
      try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this._algorithm, this._encryptionKey, iv);
        const encryptedResult = Buffer.concat([cipher.update(data), cipher.final(), iv, cipher.getAuthTag()]);
        await stream.write(encryptedResult);
      } catch (err) {
        return new Promise((resolve, reject) => {
          return reject(err);
        });
      }
    } else {
      await stream.write(data);
    }
    stream.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
  async deleteFile(filename) {
    const bucket = await this._getBucket();
    const documents = await bucket.find({
      filename
    }).toArray();
    if (documents.length === 0) {
      throw new Error('FileNotFound');
    }
    return Promise.all(documents.map(doc => {
      return bucket.delete(doc._id);
    }));
  }
  async getFileData(filename) {
    const bucket = await this._getBucket();
    const stream = bucket.openDownloadStreamByName(filename);
    stream.read();
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', data => {
        chunks.push(data);
      });
      stream.on('end', () => {
        const data = Buffer.concat(chunks);
        if (this._encryptionKey !== null) {
          try {
            const authTagLocation = data.length - 16;
            const ivLocation = data.length - 32;
            const authTag = data.slice(authTagLocation);
            const iv = data.slice(ivLocation, authTagLocation);
            const encrypted = data.slice(0, ivLocation);
            const decipher = crypto.createDecipheriv(this._algorithm, this._encryptionKey, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return resolve(decrypted);
          } catch (err) {
            return reject(err);
          }
        }
        resolve(data);
      });
      stream.on('error', err => {
        reject(err);
      });
    });
  }
  async rotateEncryptionKey(options = {}) {
    let fileNames = [];
    let oldKeyFileAdapter = {};
    const bucket = await this._getBucket();
    if (options.oldKey !== undefined) {
      oldKeyFileAdapter = new GridFSBucketAdapter(this._databaseURI, this._mongoOptions, options.oldKey);
    } else {
      oldKeyFileAdapter = new GridFSBucketAdapter(this._databaseURI, this._mongoOptions);
    }
    if (options.fileNames !== undefined) {
      fileNames = options.fileNames;
    } else {
      const fileNamesIterator = await bucket.find().toArray();
      fileNamesIterator.forEach(file => {
        fileNames.push(file.filename);
      });
    }
    let fileNamesNotRotated = fileNames;
    const fileNamesRotated = [];
    for (const fileName of fileNames) {
      try {
        const plainTextData = await oldKeyFileAdapter.getFileData(fileName);
        // Overwrite file with data encrypted with new key
        await this.createFile(fileName, plainTextData);
        fileNamesRotated.push(fileName);
        fileNamesNotRotated = fileNamesNotRotated.filter(function (value) {
          return value !== fileName;
        });
      } catch (err) {
        continue;
      }
    }
    return {
      rotated: fileNamesRotated,
      notRotated: fileNamesNotRotated
    };
  }
  getFileLocation(config, filename) {
    return config.mount + '/files/' + config.applicationId + '/' + encodeURIComponent(filename);
  }
  async getMetadata(filename) {
    const bucket = await this._getBucket();
    const files = await bucket.find({
      filename
    }).toArray();
    if (files.length === 0) {
      return {};
    }
    const {
      metadata
    } = files[0];
    return {
      metadata
    };
  }
  async handleFileStream(filename, req, res, contentType) {
    const bucket = await this._getBucket();
    const files = await bucket.find({
      filename
    }).toArray();
    if (files.length === 0) {
      throw new Error('FileNotFound');
    }
    const parts = req.get('Range').replace(/bytes=/, '').split('-');
    const partialstart = parts[0];
    const partialend = parts[1];
    const fileLength = files[0].length;
    const fileStart = parseInt(partialstart, 10);
    const fileEnd = partialend ? parseInt(partialend, 10) : fileLength;
    let start = Math.min(fileStart || 0, fileEnd, fileLength);
    let end = Math.max(fileStart || 0, fileEnd) + 1 || fileLength;
    if (isNaN(fileStart)) {
      start = fileLength - end + 1;
      end = fileLength;
    }
    end = Math.min(end, fileLength);
    start = Math.max(start, 0);
    res.status(206);
    res.header('Accept-Ranges', 'bytes');
    res.header('Content-Length', end - start);
    res.header('Content-Range', 'bytes ' + start + '-' + end + '/' + fileLength);
    res.header('Content-Type', contentType);
    const stream = bucket.openDownloadStreamByName(filename);
    stream.start(start);
    if (end) {
      stream.end(end);
    }
    stream.on('data', chunk => {
      res.write(chunk);
    });
    stream.on('error', e => {
      res.status(404);
      res.send(e.message);
    });
    stream.on('end', () => {
      res.end();
    });
  }
  handleShutdown() {
    if (!this._client) {
      return Promise.resolve();
    }
    return this._client.close(false);
  }
  validateFilename(filename) {
    return (0, _FilesAdapter.validateFilename)(filename);
  }
}
exports.GridFSBucketAdapter = GridFSBucketAdapter;
var _default = GridFSBucketAdapter;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcnlwdG8iLCJyZXF1aXJlIiwiR3JpZEZTQnVja2V0QWRhcHRlciIsIkZpbGVzQWRhcHRlciIsImNvbnN0cnVjdG9yIiwibW9uZ29EYXRhYmFzZVVSSSIsImRlZmF1bHRzIiwiRGVmYXVsdE1vbmdvVVJJIiwibW9uZ29PcHRpb25zIiwiZW5jcnlwdGlvbktleSIsInVuZGVmaW5lZCIsIl9kYXRhYmFzZVVSSSIsIl9hbGdvcml0aG0iLCJfZW5jcnlwdGlvbktleSIsImNyZWF0ZUhhc2giLCJ1cGRhdGUiLCJTdHJpbmciLCJkaWdlc3QiLCJzdWJzdHJpbmciLCJkZWZhdWx0TW9uZ29PcHRpb25zIiwidXNlTmV3VXJsUGFyc2VyIiwidXNlVW5pZmllZFRvcG9sb2d5IiwiX21vbmdvT3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImtleSIsIl9jb25uZWN0IiwiX2Nvbm5lY3Rpb25Qcm9taXNlIiwiTW9uZ29DbGllbnQiLCJjb25uZWN0IiwidGhlbiIsImNsaWVudCIsIl9jbGllbnQiLCJkYiIsInMiLCJvcHRpb25zIiwiZGJOYW1lIiwiX2dldEJ1Y2tldCIsImRhdGFiYXNlIiwiR3JpZEZTQnVja2V0IiwiY3JlYXRlRmlsZSIsImZpbGVuYW1lIiwiZGF0YSIsImNvbnRlbnRUeXBlIiwiYnVja2V0Iiwic3RyZWFtIiwib3BlblVwbG9hZFN0cmVhbSIsIm1ldGFkYXRhIiwiaXYiLCJyYW5kb21CeXRlcyIsImNpcGhlciIsImNyZWF0ZUNpcGhlcml2IiwiZW5jcnlwdGVkUmVzdWx0IiwiQnVmZmVyIiwiY29uY2F0IiwiZmluYWwiLCJnZXRBdXRoVGFnIiwid3JpdGUiLCJlcnIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImVuZCIsIm9uIiwiZGVsZXRlRmlsZSIsImRvY3VtZW50cyIsImZpbmQiLCJ0b0FycmF5IiwibGVuZ3RoIiwiRXJyb3IiLCJhbGwiLCJtYXAiLCJkb2MiLCJkZWxldGUiLCJfaWQiLCJnZXRGaWxlRGF0YSIsIm9wZW5Eb3dubG9hZFN0cmVhbUJ5TmFtZSIsInJlYWQiLCJjaHVua3MiLCJwdXNoIiwiYXV0aFRhZ0xvY2F0aW9uIiwiaXZMb2NhdGlvbiIsImF1dGhUYWciLCJzbGljZSIsImVuY3J5cHRlZCIsImRlY2lwaGVyIiwiY3JlYXRlRGVjaXBoZXJpdiIsInNldEF1dGhUYWciLCJkZWNyeXB0ZWQiLCJyb3RhdGVFbmNyeXB0aW9uS2V5IiwiZmlsZU5hbWVzIiwib2xkS2V5RmlsZUFkYXB0ZXIiLCJvbGRLZXkiLCJmaWxlTmFtZXNJdGVyYXRvciIsImZvckVhY2giLCJmaWxlIiwiZmlsZU5hbWVzTm90Um90YXRlZCIsImZpbGVOYW1lc1JvdGF0ZWQiLCJmaWxlTmFtZSIsInBsYWluVGV4dERhdGEiLCJmaWx0ZXIiLCJ2YWx1ZSIsInJvdGF0ZWQiLCJub3RSb3RhdGVkIiwiZ2V0RmlsZUxvY2F0aW9uIiwiY29uZmlnIiwibW91bnQiLCJhcHBsaWNhdGlvbklkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZ2V0TWV0YWRhdGEiLCJmaWxlcyIsImhhbmRsZUZpbGVTdHJlYW0iLCJyZXEiLCJyZXMiLCJwYXJ0cyIsImdldCIsInJlcGxhY2UiLCJzcGxpdCIsInBhcnRpYWxzdGFydCIsInBhcnRpYWxlbmQiLCJmaWxlTGVuZ3RoIiwiZmlsZVN0YXJ0IiwicGFyc2VJbnQiLCJmaWxlRW5kIiwic3RhcnQiLCJNYXRoIiwibWluIiwibWF4IiwiaXNOYU4iLCJzdGF0dXMiLCJoZWFkZXIiLCJjaHVuayIsImUiLCJzZW5kIiwibWVzc2FnZSIsImhhbmRsZVNodXRkb3duIiwiY2xvc2UiLCJ2YWxpZGF0ZUZpbGVuYW1lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0FkYXB0ZXJzL0ZpbGVzL0dyaWRGU0J1Y2tldEFkYXB0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gR3JpZEZTQnVja2V0QWRhcHRlclxuIFN0b3JlcyBmaWxlcyBpbiBNb25nbyB1c2luZyBHcmlkRlNcbiBSZXF1aXJlcyB0aGUgZGF0YWJhc2UgYWRhcHRlciB0byBiZSBiYXNlZCBvbiBtb25nb2NsaWVudFxuXG4gQGZsb3cgd2Vha1xuICovXG5cbi8vIEBmbG93LWRpc2FibGUtbmV4dFxuaW1wb3J0IHsgTW9uZ29DbGllbnQsIEdyaWRGU0J1Y2tldCwgRGIgfSBmcm9tICdtb25nb2RiJztcbmltcG9ydCB7IEZpbGVzQWRhcHRlciwgdmFsaWRhdGVGaWxlbmFtZSB9IGZyb20gJy4vRmlsZXNBZGFwdGVyJztcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuLi8uLi9kZWZhdWx0cyc7XG5jb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuZXhwb3J0IGNsYXNzIEdyaWRGU0J1Y2tldEFkYXB0ZXIgZXh0ZW5kcyBGaWxlc0FkYXB0ZXIge1xuICBfZGF0YWJhc2VVUkk6IHN0cmluZztcbiAgX2Nvbm5lY3Rpb25Qcm9taXNlOiBQcm9taXNlPERiPjtcbiAgX21vbmdvT3B0aW9uczogT2JqZWN0O1xuICBfYWxnb3JpdGhtOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbW9uZ29EYXRhYmFzZVVSSSA9IGRlZmF1bHRzLkRlZmF1bHRNb25nb1VSSSxcbiAgICBtb25nb09wdGlvbnMgPSB7fSxcbiAgICBlbmNyeXB0aW9uS2V5ID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZGF0YWJhc2VVUkkgPSBtb25nb0RhdGFiYXNlVVJJO1xuICAgIHRoaXMuX2FsZ29yaXRobSA9ICdhZXMtMjU2LWdjbSc7XG4gICAgdGhpcy5fZW5jcnlwdGlvbktleSA9XG4gICAgICBlbmNyeXB0aW9uS2V5ICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBjcnlwdG9cbiAgICAgICAgICAuY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICAgICAgICAudXBkYXRlKFN0cmluZyhlbmNyeXB0aW9uS2V5KSlcbiAgICAgICAgICAuZGlnZXN0KCdiYXNlNjQnKVxuICAgICAgICAgIC5zdWJzdHJpbmcoMCwgMzIpXG4gICAgICAgIDogbnVsbDtcbiAgICBjb25zdCBkZWZhdWx0TW9uZ29PcHRpb25zID0ge1xuICAgICAgdXNlTmV3VXJsUGFyc2VyOiB0cnVlLFxuICAgICAgdXNlVW5pZmllZFRvcG9sb2d5OiB0cnVlLFxuICAgIH07XG4gICAgY29uc3QgX21vbmdvT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdE1vbmdvT3B0aW9ucywgbW9uZ29PcHRpb25zKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2VuYWJsZVNjaGVtYUhvb2tzJywgJ3NjaGVtYUNhY2hlVHRsJywgJ21heFRpbWVNUyddKSB7XG4gICAgICBkZWxldGUgX21vbmdvT3B0aW9uc1trZXldO1xuICAgIH1cbiAgICB0aGlzLl9tb25nb09wdGlvbnMgPSBfbW9uZ29PcHRpb25zO1xuICB9XG5cbiAgX2Nvbm5lY3QoKSB7XG4gICAgaWYgKCF0aGlzLl9jb25uZWN0aW9uUHJvbWlzZSkge1xuICAgICAgdGhpcy5fY29ubmVjdGlvblByb21pc2UgPSBNb25nb0NsaWVudC5jb25uZWN0KHRoaXMuX2RhdGFiYXNlVVJJLCB0aGlzLl9tb25nb09wdGlvbnMpLnRoZW4oXG4gICAgICAgIGNsaWVudCA9PiB7XG4gICAgICAgICAgdGhpcy5fY2xpZW50ID0gY2xpZW50O1xuICAgICAgICAgIHJldHVybiBjbGllbnQuZGIoY2xpZW50LnMub3B0aW9ucy5kYk5hbWUpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvblByb21pc2U7XG4gIH1cblxuICBfZ2V0QnVja2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0KCkudGhlbihkYXRhYmFzZSA9PiBuZXcgR3JpZEZTQnVja2V0KGRhdGFiYXNlKSk7XG4gIH1cblxuICAvLyBGb3IgYSBnaXZlbiBjb25maWcgb2JqZWN0LCBmaWxlbmFtZSwgYW5kIGRhdGEsIHN0b3JlIGEgZmlsZVxuICAvLyBSZXR1cm5zIGEgcHJvbWlzZVxuICBhc3luYyBjcmVhdGVGaWxlKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGEsIGNvbnRlbnRUeXBlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBidWNrZXQgPSBhd2FpdCB0aGlzLl9nZXRCdWNrZXQoKTtcbiAgICBjb25zdCBzdHJlYW0gPSBhd2FpdCBidWNrZXQub3BlblVwbG9hZFN0cmVhbShmaWxlbmFtZSwge1xuICAgICAgbWV0YWRhdGE6IG9wdGlvbnMubWV0YWRhdGEsXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuX2VuY3J5cHRpb25LZXkgIT09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGl2ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDE2KTtcbiAgICAgICAgY29uc3QgY2lwaGVyID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KHRoaXMuX2FsZ29yaXRobSwgdGhpcy5fZW5jcnlwdGlvbktleSwgaXYpO1xuICAgICAgICBjb25zdCBlbmNyeXB0ZWRSZXN1bHQgPSBCdWZmZXIuY29uY2F0KFtcbiAgICAgICAgICBjaXBoZXIudXBkYXRlKGRhdGEpLFxuICAgICAgICAgIGNpcGhlci5maW5hbCgpLFxuICAgICAgICAgIGl2LFxuICAgICAgICAgIGNpcGhlci5nZXRBdXRoVGFnKCksXG4gICAgICAgIF0pO1xuICAgICAgICBhd2FpdCBzdHJlYW0ud3JpdGUoZW5jcnlwdGVkUmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHN0cmVhbS53cml0ZShkYXRhKTtcbiAgICB9XG4gICAgc3RyZWFtLmVuZCgpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzdHJlYW0ub24oJ2ZpbmlzaCcsIHJlc29sdmUpO1xuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVGaWxlKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBidWNrZXQgPSBhd2FpdCB0aGlzLl9nZXRCdWNrZXQoKTtcbiAgICBjb25zdCBkb2N1bWVudHMgPSBhd2FpdCBidWNrZXQuZmluZCh7IGZpbGVuYW1lIH0pLnRvQXJyYXkoKTtcbiAgICBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlTm90Rm91bmQnKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgZG9jdW1lbnRzLm1hcChkb2MgPT4ge1xuICAgICAgICByZXR1cm4gYnVja2V0LmRlbGV0ZShkb2MuX2lkKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGdldEZpbGVEYXRhKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBidWNrZXQgPSBhd2FpdCB0aGlzLl9nZXRCdWNrZXQoKTtcbiAgICBjb25zdCBzdHJlYW0gPSBidWNrZXQub3BlbkRvd25sb2FkU3RyZWFtQnlOYW1lKGZpbGVuYW1lKTtcbiAgICBzdHJlYW0ucmVhZCgpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICAgIHN0cmVhbS5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBjaHVua3MucHVzaChkYXRhKTtcbiAgICAgIH0pO1xuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBCdWZmZXIuY29uY2F0KGNodW5rcyk7XG4gICAgICAgIGlmICh0aGlzLl9lbmNyeXB0aW9uS2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhUYWdMb2NhdGlvbiA9IGRhdGEubGVuZ3RoIC0gMTY7XG4gICAgICAgICAgICBjb25zdCBpdkxvY2F0aW9uID0gZGF0YS5sZW5ndGggLSAzMjtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhUYWcgPSBkYXRhLnNsaWNlKGF1dGhUYWdMb2NhdGlvbik7XG4gICAgICAgICAgICBjb25zdCBpdiA9IGRhdGEuc2xpY2UoaXZMb2NhdGlvbiwgYXV0aFRhZ0xvY2F0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGRhdGEuc2xpY2UoMCwgaXZMb2NhdGlvbik7XG4gICAgICAgICAgICBjb25zdCBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KHRoaXMuX2FsZ29yaXRobSwgdGhpcy5fZW5jcnlwdGlvbktleSwgaXYpO1xuICAgICAgICAgICAgZGVjaXBoZXIuc2V0QXV0aFRhZyhhdXRoVGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGRlY3J5cHRlZCA9IEJ1ZmZlci5jb25jYXQoW2RlY2lwaGVyLnVwZGF0ZShlbmNyeXB0ZWQpLCBkZWNpcGhlci5maW5hbCgpXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkZWNyeXB0ZWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHJvdGF0ZUVuY3J5cHRpb25LZXkob3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGZpbGVOYW1lcyA9IFtdO1xuICAgIGxldCBvbGRLZXlGaWxlQWRhcHRlciA9IHt9O1xuICAgIGNvbnN0IGJ1Y2tldCA9IGF3YWl0IHRoaXMuX2dldEJ1Y2tldCgpO1xuICAgIGlmIChvcHRpb25zLm9sZEtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvbGRLZXlGaWxlQWRhcHRlciA9IG5ldyBHcmlkRlNCdWNrZXRBZGFwdGVyKFxuICAgICAgICB0aGlzLl9kYXRhYmFzZVVSSSxcbiAgICAgICAgdGhpcy5fbW9uZ29PcHRpb25zLFxuICAgICAgICBvcHRpb25zLm9sZEtleVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkS2V5RmlsZUFkYXB0ZXIgPSBuZXcgR3JpZEZTQnVja2V0QWRhcHRlcih0aGlzLl9kYXRhYmFzZVVSSSwgdGhpcy5fbW9uZ29PcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZmlsZU5hbWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpbGVOYW1lcyA9IG9wdGlvbnMuZmlsZU5hbWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaWxlTmFtZXNJdGVyYXRvciA9IGF3YWl0IGJ1Y2tldC5maW5kKCkudG9BcnJheSgpO1xuICAgICAgZmlsZU5hbWVzSXRlcmF0b3IuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgZmlsZU5hbWVzLnB1c2goZmlsZS5maWxlbmFtZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgbGV0IGZpbGVOYW1lc05vdFJvdGF0ZWQgPSBmaWxlTmFtZXM7XG4gICAgY29uc3QgZmlsZU5hbWVzUm90YXRlZCA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgZmlsZU5hbWVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwbGFpblRleHREYXRhID0gYXdhaXQgb2xkS2V5RmlsZUFkYXB0ZXIuZ2V0RmlsZURhdGEoZmlsZU5hbWUpO1xuICAgICAgICAvLyBPdmVyd3JpdGUgZmlsZSB3aXRoIGRhdGEgZW5jcnlwdGVkIHdpdGggbmV3IGtleVxuICAgICAgICBhd2FpdCB0aGlzLmNyZWF0ZUZpbGUoZmlsZU5hbWUsIHBsYWluVGV4dERhdGEpO1xuICAgICAgICBmaWxlTmFtZXNSb3RhdGVkLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICBmaWxlTmFtZXNOb3RSb3RhdGVkID0gZmlsZU5hbWVzTm90Um90YXRlZC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBmaWxlTmFtZTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJvdGF0ZWQ6IGZpbGVOYW1lc1JvdGF0ZWQsIG5vdFJvdGF0ZWQ6IGZpbGVOYW1lc05vdFJvdGF0ZWQgfTtcbiAgfVxuXG4gIGdldEZpbGVMb2NhdGlvbihjb25maWcsIGZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5tb3VudCArICcvZmlsZXMvJyArIGNvbmZpZy5hcHBsaWNhdGlvbklkICsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGdldE1ldGFkYXRhKGZpbGVuYW1lKSB7XG4gICAgY29uc3QgYnVja2V0ID0gYXdhaXQgdGhpcy5fZ2V0QnVja2V0KCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBidWNrZXQuZmluZCh7IGZpbGVuYW1lIH0pLnRvQXJyYXkoKTtcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHsgbWV0YWRhdGEgfSA9IGZpbGVzWzBdO1xuICAgIHJldHVybiB7IG1ldGFkYXRhIH07XG4gIH1cblxuICBhc3luYyBoYW5kbGVGaWxlU3RyZWFtKGZpbGVuYW1lOiBzdHJpbmcsIHJlcSwgcmVzLCBjb250ZW50VHlwZSkge1xuICAgIGNvbnN0IGJ1Y2tldCA9IGF3YWl0IHRoaXMuX2dldEJ1Y2tldCgpO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgYnVja2V0LmZpbmQoeyBmaWxlbmFtZSB9KS50b0FycmF5KCk7XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlTm90Rm91bmQnKTtcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSByZXFcbiAgICAgIC5nZXQoJ1JhbmdlJylcbiAgICAgIC5yZXBsYWNlKC9ieXRlcz0vLCAnJylcbiAgICAgIC5zcGxpdCgnLScpO1xuICAgIGNvbnN0IHBhcnRpYWxzdGFydCA9IHBhcnRzWzBdO1xuICAgIGNvbnN0IHBhcnRpYWxlbmQgPSBwYXJ0c1sxXTtcblxuICAgIGNvbnN0IGZpbGVMZW5ndGggPSBmaWxlc1swXS5sZW5ndGg7XG4gICAgY29uc3QgZmlsZVN0YXJ0ID0gcGFyc2VJbnQocGFydGlhbHN0YXJ0LCAxMCk7XG4gICAgY29uc3QgZmlsZUVuZCA9IHBhcnRpYWxlbmQgPyBwYXJzZUludChwYXJ0aWFsZW5kLCAxMCkgOiBmaWxlTGVuZ3RoO1xuXG4gICAgbGV0IHN0YXJ0ID0gTWF0aC5taW4oZmlsZVN0YXJ0IHx8IDAsIGZpbGVFbmQsIGZpbGVMZW5ndGgpO1xuICAgIGxldCBlbmQgPSBNYXRoLm1heChmaWxlU3RhcnQgfHwgMCwgZmlsZUVuZCkgKyAxIHx8IGZpbGVMZW5ndGg7XG4gICAgaWYgKGlzTmFOKGZpbGVTdGFydCkpIHtcbiAgICAgIHN0YXJ0ID0gZmlsZUxlbmd0aCAtIGVuZCArIDE7XG4gICAgICBlbmQgPSBmaWxlTGVuZ3RoO1xuICAgIH1cbiAgICBlbmQgPSBNYXRoLm1pbihlbmQsIGZpbGVMZW5ndGgpO1xuICAgIHN0YXJ0ID0gTWF0aC5tYXgoc3RhcnQsIDApO1xuXG4gICAgcmVzLnN0YXR1cygyMDYpO1xuICAgIHJlcy5oZWFkZXIoJ0FjY2VwdC1SYW5nZXMnLCAnYnl0ZXMnKTtcbiAgICByZXMuaGVhZGVyKCdDb250ZW50LUxlbmd0aCcsIGVuZCAtIHN0YXJ0KTtcbiAgICByZXMuaGVhZGVyKCdDb250ZW50LVJhbmdlJywgJ2J5dGVzICcgKyBzdGFydCArICctJyArIGVuZCArICcvJyArIGZpbGVMZW5ndGgpO1xuICAgIHJlcy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsIGNvbnRlbnRUeXBlKTtcbiAgICBjb25zdCBzdHJlYW0gPSBidWNrZXQub3BlbkRvd25sb2FkU3RyZWFtQnlOYW1lKGZpbGVuYW1lKTtcbiAgICBzdHJlYW0uc3RhcnQoc3RhcnQpO1xuICAgIGlmIChlbmQpIHtcbiAgICAgIHN0cmVhbS5lbmQoZW5kKTtcbiAgICB9XG4gICAgc3RyZWFtLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgcmVzLndyaXRlKGNodW5rKTtcbiAgICB9KTtcbiAgICBzdHJlYW0ub24oJ2Vycm9yJywgZSA9PiB7XG4gICAgICByZXMuc3RhdHVzKDQwNCk7XG4gICAgICByZXMuc2VuZChlLm1lc3NhZ2UpO1xuICAgIH0pO1xuICAgIHN0cmVhbS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgcmVzLmVuZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlU2h1dGRvd24oKSB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5jbG9zZShmYWxzZSk7XG4gIH1cblxuICB2YWxpZGF0ZUZpbGVuYW1lKGZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIHZhbGlkYXRlRmlsZW5hbWUoZmlsZW5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyaWRGU0J1Y2tldEFkYXB0ZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQVNBO0FBQ0E7QUFDQTtBQUFzQztBQVh0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFJQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFFekIsTUFBTUMsbUJBQW1CLFNBQVNDLDBCQUFZLENBQUM7RUFNcERDLFdBQVcsQ0FDVEMsZ0JBQWdCLEdBQUdDLGlCQUFRLENBQUNDLGVBQWUsRUFDM0NDLFlBQVksR0FBRyxDQUFDLENBQUMsRUFDakJDLGFBQWEsR0FBR0MsU0FBUyxFQUN6QjtJQUNBLEtBQUssRUFBRTtJQUNQLElBQUksQ0FBQ0MsWUFBWSxHQUFHTixn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