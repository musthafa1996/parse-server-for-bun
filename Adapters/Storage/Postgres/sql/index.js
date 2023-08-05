'use strict';

var QueryFile = require('pg-promise').QueryFile;
var path = require('path');
module.exports = {
  array: {
    add: sql('array/add.sql'),
    addUnique: sql('array/add-unique.sql'),
    contains: sql('array/contains.sql'),
    containsAll: sql('array/contains-all.sql'),
    containsAllRegex: sql('array/contains-all-regex.sql'),
    remove: sql('array/remove.sql')
  },
  misc: {
    jsonObjectSetKeys: sql('misc/json-object-set-keys.sql')
  }
};

///////////////////////////////////////////////
// Helper for linking to external query files;
function sql(file) {
  var fullPath = path.join(__dirname, file); // generating full path;

  var qf = new QueryFile(fullPath, {
    minify: true
  });
  if (qf.error) {
    throw qf.error;
  }
  return qf;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWVyeUZpbGUiLCJyZXF1aXJlIiwicGF0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJhcnJheSIsImFkZCIsInNxbCIsImFkZFVuaXF1ZSIsImNvbnRhaW5zIiwiY29udGFpbnNBbGwiLCJjb250YWluc0FsbFJlZ2V4IiwicmVtb3ZlIiwibWlzYyIsImpzb25PYmplY3RTZXRLZXlzIiwiZmlsZSIsImZ1bGxQYXRoIiwiam9pbiIsIl9fZGlybmFtZSIsInFmIiwibWluaWZ5IiwiZXJyb3IiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvQWRhcHRlcnMvU3RvcmFnZS9Qb3N0Z3Jlcy9zcWwvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUXVlcnlGaWxlID0gcmVxdWlyZSgncGctcHJvbWlzZScpLlF1ZXJ5RmlsZTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IHtcbiAgICBhZGQ6IHNxbCgnYXJyYXkvYWRkLnNxbCcpLFxuICAgIGFkZFVuaXF1ZTogc3FsKCdhcnJheS9hZGQtdW5pcXVlLnNxbCcpLFxuICAgIGNvbnRhaW5zOiBzcWwoJ2FycmF5L2NvbnRhaW5zLnNxbCcpLFxuICAgIGNvbnRhaW5zQWxsOiBzcWwoJ2FycmF5L2NvbnRhaW5zLWFsbC5zcWwnKSxcbiAgICBjb250YWluc0FsbFJlZ2V4OiBzcWwoJ2FycmF5L2NvbnRhaW5zLWFsbC1yZWdleC5zcWwnKSxcbiAgICByZW1vdmU6IHNxbCgnYXJyYXkvcmVtb3ZlLnNxbCcpLFxuICB9LFxuICBtaXNjOiB7XG4gICAganNvbk9iamVjdFNldEtleXM6IHNxbCgnbWlzYy9qc29uLW9iamVjdC1zZXQta2V5cy5zcWwnKSxcbiAgfSxcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIZWxwZXIgZm9yIGxpbmtpbmcgdG8gZXh0ZXJuYWwgcXVlcnkgZmlsZXM7XG5mdW5jdGlvbiBzcWwoZmlsZSkge1xuICB2YXIgZnVsbFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBmaWxlKTsgLy8gZ2VuZXJhdGluZyBmdWxsIHBhdGg7XG5cbiAgdmFyIHFmID0gbmV3IFF1ZXJ5RmlsZShmdWxsUGF0aCwgeyBtaW5pZnk6IHRydWUgfSk7XG5cbiAgaWYgKHFmLmVycm9yKSB7XG4gICAgdGhyb3cgcWYuZXJyb3I7XG4gIH1cblxuICByZXR1cm4gcWY7XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFlBQVk7O0FBRVosSUFBSUEsU0FBUyxHQUFHQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUNELFNBQVM7QUFDL0MsSUFBSUUsSUFBSSxHQUFHRCxPQUFPLENBQUMsTUFBTSxDQUFDO0FBRTFCRSxNQUFNLENBQUNDLE9BQU8sR0FBRztFQUNmQyxLQUFLLEVBQUU7SUFDTEMsR0FBRyxFQUFFQyxHQUFHLENBQUMsZUFBZSxDQUFDO0lBQ3pCQyxTQUFTLEVBQUVELEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztJQUN0Q0UsUUFBUSxFQUFFRixHQUFHLENBQUMsb0JBQW9CLENBQUM7SUFDbkNHLFdBQVcsRUFBRUgsR0FBRyxDQUFDLHdCQUF3QixDQUFDO0lBQzFDSSxnQkFBZ0IsRUFBRUosR0FBRyxDQUFDLDhCQUE4QixDQUFDO0lBQ3JESyxNQUFNLEVBQUVMLEdBQUcsQ0FBQyxrQkFBa0I7RUFDaEMsQ0FBQztFQUNETSxJQUFJLEVBQUU7SUFDSkMsaUJBQWlCLEVBQUVQLEdBQUcsQ0FBQywrQkFBK0I7RUFDeEQ7QUFDRixDQUFDOztBQUVEO0FBQ0E7QUFDQSxTQUFTQSxHQUFHLENBQUNRLElBQUksRUFBRTtFQUNqQixJQUFJQyxRQUFRLEdBQUdkLElBQUksQ0FBQ2UsSUFBSSxDQUFDQyxTQUFTLEVBQUVILElBQUksQ0FBQyxDQUFDLENBQUM7O0VBRTNDLElBQUlJLEVBQUUsR0FBRyxJQUFJbkIsU0FBUyxDQUFDZ0IsUUFBUSxFQUFFO0lBQUVJLE1BQU0sRUFBRTtFQUFLLENBQUMsQ0FBQztFQUVsRCxJQUFJRCxFQUFFLENBQUNFLEtBQUssRUFBRTtJQUNaLE1BQU1GLEVBQUUsQ0FBQ0UsS0FBSztFQUNoQjtFQUVBLE9BQU9GLEVBQUU7QUFDWCJ9