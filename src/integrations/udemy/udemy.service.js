const axios = require("axios");
const https = require("https");
const {
  organizationId,
  clientId,
  clientSecret,
  subdomain,
} = require("../../config/udemy.config");



async function getAllUserPathActivities() {
  let page = 1;

  let allRecords = [];
  try {

    while (true) {
      console.log(
        `Fetching page ${page}`
      );
      const url =
        `https://${subdomain}.udemy.com/api-2.0/organizations/` +
        `${organizationId}/analytics/user-path-activity/`;

      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
        auth: {
          username: clientId,
          password: clientSecret,
        },
        params: {
          page,
          page_size: 1000,
        },
      });
      console.log(
        `Page ${page} records:`, response.data.results.length
      );
      console.log(
        `Next`, response.data.next
      );
      const data = response.data;
      allRecords.push(...data.results);

      if (!data.next) {
        break;
      }

      page++;
    }

    return allRecords;
  } catch (error) {
    console.log("Stringified Error", JSON.stringify(error, null, 4));
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("MESSAGE:", error.message);

    throw error;
  }

}


module.exports = {
  getAllUserPathActivities,
};
