"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SubCache = exports.CacheController = void 0;
var _AdaptableController = _interopRequireDefault(require("./AdaptableController"));
var _CacheAdapter = _interopRequireDefault(require("../Adapters/Cache/CacheAdapter"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const KEY_SEPARATOR_CHAR = ':';
function joinKeys(...keys) {
  return keys.join(KEY_SEPARATOR_CHAR);
}

/**
 * Prefix all calls to the cache via a prefix string, useful when grouping Cache by object type.
 *
 * eg "Role" or "Session"
 */
class SubCache {
  constructor(prefix, cacheController, ttl) {
    this.prefix = prefix;
    this.cache = cacheController;
    this.ttl = ttl;
  }
  get(key) {
    const cacheKey = joinKeys(this.prefix, key);
    return this.cache.get(cacheKey);
  }
  put(key, value, ttl) {
    const cacheKey = joinKeys(this.prefix, key);
    return this.cache.put(cacheKey, value, ttl);
  }
  del(key) {
    const cacheKey = joinKeys(this.prefix, key);
    return this.cache.del(cacheKey);
  }
  clear() {
    return this.cache.clear();
  }
}
exports.SubCache = SubCache;
class CacheController extends _AdaptableController.default {
  constructor(adapter, appId, options = {}) {
    super(adapter, appId, options);
    this.role = new SubCache('role', this);
    this.user = new SubCache('user', this);
    this.graphQL = new SubCache('graphQL', this);
  }
  get(key) {
    const cacheKey = joinKeys(this.appId, key);
    return this.adapter.get(cacheKey).then(null, () => Promise.resolve(null));
  }
  put(key, value, ttl) {
    const cacheKey = joinKeys(this.appId, key);
    return this.adapter.put(cacheKey, value, ttl);
  }
  del(key) {
    const cacheKey = joinKeys(this.appId, key);
    return this.adapter.del(cacheKey);
  }
  clear() {
    return this.adapter.clear();
  }
  expectedAdapterType() {
    return _CacheAdapter.default;
  }
}
exports.CacheController = CacheController;
var _default = CacheController;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLRVlfU0VQQVJBVE9SX0NIQVIiLCJqb2luS2V5cyIsImtleXMiLCJqb2luIiwiU3ViQ2FjaGUiLCJjb25zdHJ1Y3RvciIsInByZWZpeCIsImNhY2hlQ29udHJvbGxlciIsInR0bCIsImNhY2hlIiwiZ2V0Iiwia2V5IiwiY2FjaGVLZXkiLCJwdXQiLCJ2YWx1ZSIsImRlbCIsImNsZWFyIiwiQ2FjaGVDb250cm9sbGVyIiwiQWRhcHRhYmxlQ29udHJvbGxlciIsImFkYXB0ZXIiLCJhcHBJZCIsIm9wdGlvbnMiLCJyb2xlIiwidXNlciIsImdyYXBoUUwiLCJ0aGVuIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleHBlY3RlZEFkYXB0ZXJUeXBlIiwiQ2FjaGVBZGFwdGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL0NvbnRyb2xsZXJzL0NhY2hlQ29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWRhcHRhYmxlQ29udHJvbGxlciBmcm9tICcuL0FkYXB0YWJsZUNvbnRyb2xsZXInO1xuaW1wb3J0IENhY2hlQWRhcHRlciBmcm9tICcuLi9BZGFwdGVycy9DYWNoZS9DYWNoZUFkYXB0ZXInO1xuXG5jb25zdCBLRVlfU0VQQVJBVE9SX0NIQVIgPSAnOic7XG5cbmZ1bmN0aW9uIGpvaW5LZXlzKC4uLmtleXMpIHtcbiAgcmV0dXJuIGtleXMuam9pbihLRVlfU0VQQVJBVE9SX0NIQVIpO1xufVxuXG4vKipcbiAqIFByZWZpeCBhbGwgY2FsbHMgdG8gdGhlIGNhY2hlIHZpYSBhIHByZWZpeCBzdHJpbmcsIHVzZWZ1bCB3aGVuIGdyb3VwaW5nIENhY2hlIGJ5IG9iamVjdCB0eXBlLlxuICpcbiAqIGVnIFwiUm9sZVwiIG9yIFwiU2Vzc2lvblwiXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJDYWNoZSB7XG4gIGNvbnN0cnVjdG9yKHByZWZpeCwgY2FjaGVDb250cm9sbGVyLCB0dGwpIHtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmNhY2hlID0gY2FjaGVDb250cm9sbGVyO1xuICAgIHRoaXMudHRsID0gdHRsO1xuICB9XG5cbiAgZ2V0KGtleSkge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gam9pbktleXModGhpcy5wcmVmaXgsIGtleSk7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgfVxuXG4gIHB1dChrZXksIHZhbHVlLCB0dGwpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGpvaW5LZXlzKHRoaXMucHJlZml4LCBrZXkpO1xuICAgIHJldHVybiB0aGlzLmNhY2hlLnB1dChjYWNoZUtleSwgdmFsdWUsIHR0bCk7XG4gIH1cblxuICBkZWwoa2V5KSB7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBqb2luS2V5cyh0aGlzLnByZWZpeCwga2V5KTtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5kZWwoY2FjaGVLZXkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FjaGVDb250cm9sbGVyIGV4dGVuZHMgQWRhcHRhYmxlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKGFkYXB0ZXIsIGFwcElkLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihhZGFwdGVyLCBhcHBJZCwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnJvbGUgPSBuZXcgU3ViQ2FjaGUoJ3JvbGUnLCB0aGlzKTtcbiAgICB0aGlzLnVzZXIgPSBuZXcgU3ViQ2FjaGUoJ3VzZXInLCB0aGlzKTtcbiAgICB0aGlzLmdyYXBoUUwgPSBuZXcgU3ViQ2FjaGUoJ2dyYXBoUUwnLCB0aGlzKTtcbiAgfVxuXG4gIGdldChrZXkpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGpvaW5LZXlzKHRoaXMuYXBwSWQsIGtleSk7XG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5nZXQoY2FjaGVLZXkpLnRoZW4obnVsbCwgKCkgPT4gUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgfVxuXG4gIHB1dChrZXksIHZhbHVlLCB0dGwpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGpvaW5LZXlzKHRoaXMuYXBwSWQsIGtleSk7XG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5wdXQoY2FjaGVLZXksIHZhbHVlLCB0dGwpO1xuICB9XG5cbiAgZGVsKGtleSkge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gam9pbktleXModGhpcy5hcHBJZCwga2V5KTtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmRlbChjYWNoZUtleSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmNsZWFyKCk7XG4gIH1cblxuICBleHBlY3RlZEFkYXB0ZXJUeXBlKCkge1xuICAgIHJldHVybiBDYWNoZUFkYXB0ZXI7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FjaGVDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQTBEO0FBRTFELE1BQU1BLGtCQUFrQixHQUFHLEdBQUc7QUFFOUIsU0FBU0MsUUFBUSxDQUFDLEdBQUdDLElBQUksRUFBRTtFQUN6QixPQUFPQSxJQUFJLENBQUNDLElBQUksQ0FBQ0gsa0JBQWtCLENBQUM7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1JLFFBQVEsQ0FBQztFQUNwQkMsV0FBVyxDQUFDQyxNQUFNLEVBQUVDLGVBQWUsRUFBRUMsR0FBRyxFQUFFO0lBQ3hDLElBQUksQ0FBQ0YsTUFBTSxHQUFHQSxNQUFNO0lBQ3BCLElBQUksQ0FBQ0csS0FBSyxHQUFHRixlQUFlO0lBQzVCLElBQUksQ0FBQ0MsR0FBRyxHQUFHQSxHQUFHO0VBQ2hCO0VBRUFFLEdBQUcsQ0FBQ0MsR0FBRyxFQUFFO0lBQ1AsTUFBTUMsUUFBUSxHQUFHWCxRQUFRLENBQUMsSUFBSSxDQUFDSyxNQUFNLEVBQUVLLEdBQUcsQ0FBQztJQUMzQyxPQUFPLElBQUksQ0FBQ0YsS0FBSyxDQUFDQyxHQUFHLENBQUNFLFFBQVEsQ0FBQztFQUNqQztFQUVBQyxHQUFHLENBQUNGLEdBQUcsRUFBRUcsS0FBSyxFQUFFTixHQUFHLEVBQUU7SUFDbkIsTUFBTUksUUFBUSxHQUFHWCxRQUFRLENBQUMsSUFBSSxDQUFDSyxNQUFNLEVBQUVLLEdBQUcsQ0FBQztJQUMzQyxPQUFPLElBQUksQ0FBQ0YsS0FBSyxDQUFDSSxHQUFHLENBQUNELFFBQVEsRUFBRUUsS0FBSyxFQUFFTixHQUFHLENBQUM7RUFDN0M7RUFFQU8sR0FBRyxDQUFDSixHQUFHLEVBQUU7SUFDUCxNQUFNQyxRQUFRLEdBQUdYLFFBQVEsQ0FBQyxJQUFJLENBQUNLLE1BQU0sRUFBRUssR0FBRyxDQUFDO0lBQzNDLE9BQU8sSUFBSSxDQUFDRixLQUFLLENBQUNNLEdBQUcsQ0FBQ0gsUUFBUSxDQUFDO0VBQ2pDO0VBRUFJLEtBQUssR0FBRztJQUNOLE9BQU8sSUFBSSxDQUFDUCxLQUFLLENBQUNPLEtBQUssRUFBRTtFQUMzQjtBQUNGO0FBQUM7QUFFTSxNQUFNQyxlQUFlLFNBQVNDLDRCQUFtQixDQUFDO0VBQ3ZEYixXQUFXLENBQUNjLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDeEMsS0FBSyxDQUFDRixPQUFPLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxDQUFDO0lBRTlCLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUlsQixRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztJQUN0QyxJQUFJLENBQUNtQixJQUFJLEdBQUcsSUFBSW5CLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO0lBQ3RDLElBQUksQ0FBQ29CLE9BQU8sR0FBRyxJQUFJcEIsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7RUFDOUM7RUFFQU0sR0FBRyxDQUFDQyxHQUFHLEVBQUU7SUFDUCxNQUFNQyxRQUFRLEdBQUdYLFFBQVEsQ0FBQyxJQUFJLENBQUNtQixLQUFLLEVBQUVULEdBQUcsQ0FBQztJQUMxQyxPQUFPLElBQUksQ0FBQ1EsT0FBTyxDQUFDVCxHQUFHLENBQUNFLFFBQVEsQ0FBQyxDQUFDYSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU1DLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzNFO0VBRUFkLEdBQUcsQ0FBQ0YsR0FBRyxFQUFFRyxLQUFLLEVBQUVOLEdBQUcsRUFBRTtJQUNuQixNQUFNSSxRQUFRLEdBQUdYLFFBQVEsQ0FBQyxJQUFJLENBQUNtQixLQUFLLEVBQUVULEdBQUcsQ0FBQztJQUMxQyxPQUFPLElBQUksQ0FBQ1EsT0FBTyxDQUFDTixHQUFHLENBQUNELFFBQVEsRUFBRUUsS0FBSyxFQUFFTixHQUFHLENBQUM7RUFDL0M7RUFFQU8sR0FBRyxDQUFDSixHQUFHLEVBQUU7SUFDUCxNQUFNQyxRQUFRLEdBQUdYLFFBQVEsQ0FBQyxJQUFJLENBQUNtQixLQUFLLEVBQUVULEdBQUcsQ0FBQztJQUMxQyxPQUFPLElBQUksQ0FBQ1EsT0FBTyxDQUFDSixHQUFHLENBQUNILFFBQVEsQ0FBQztFQUNuQztFQUVBSSxLQUFLLEdBQUc7SUFDTixPQUFPLElBQUksQ0FBQ0csT0FBTyxDQUFDSCxLQUFLLEVBQUU7RUFDN0I7RUFFQVksbUJBQW1CLEdBQUc7SUFDcEIsT0FBT0MscUJBQVk7RUFDckI7QUFDRjtBQUFDO0FBQUEsZUFFY1osZUFBZTtBQUFBIn0=