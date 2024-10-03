class ApiResponse {
  constructor(statuscode, data, isAdmin = false) {
    this.statuscode = statuscode;
    this.data = data;
    this.success = statuscode < 400;
    this.isAdmin = isAdmin;
  }
}
export { ApiResponse };
