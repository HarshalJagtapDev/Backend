require("dotenv").config();

module.exports = {
  organizationId: process.env.UDEMY_ORGANIZATION_ID,
  clientId: process.env.UDEMY_CLIENT_ID,
  clientSecret: process.env.UDEMY_CLIENT_SECRET,
  subdomain: process.env.UDEMY_SUBDOMAIN,
};