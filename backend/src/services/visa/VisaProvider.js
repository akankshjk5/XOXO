class VisaProvider {
  get name() {
    return "base";
  }

  isLive() {
    return false;
  }

  async list() {
    throw new Error("VisaProvider.list not implemented");
  }

  async getByCountry(_country) {
    throw new Error("VisaProvider.getByCountry not implemented");
  }

  async submitInquiry(_payload) {
    throw new Error("VisaProvider.submitInquiry not implemented");
  }
}

module.exports = { VisaProvider };
